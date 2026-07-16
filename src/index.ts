#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import PocketBase from "pocketbase";
import dotenv from "dotenv";

dotenv.config();

const pbUrl = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const pb = new PocketBase(pbUrl);

// Authenticate on startup if credentials are provided
async function initializeAuth() {
  try {
    if (process.env.POCKETBASE_AUTH_TOKEN) {
      // Load existing auth token
      pb.authStore.save(process.env.POCKETBASE_AUTH_TOKEN, null);
      console.error("Authenticated using POCKETBASE_AUTH_TOKEN");
    } else if (
      process.env.POCKETBASE_ADMIN_EMAIL &&
      process.env.POCKETBASE_ADMIN_PASSWORD
    ) {
      // Authenticate as admin
      await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD
      );
      console.error("Authenticated successfully as admin");
    } else {
      console.error("No authentication credentials provided. Operating in public/guest mode.");
    }
  } catch (error: any) {
    console.error("Failed to authenticate with PocketBase:", error.message || error);
  }
}

const server = new Server(
  {
    name: "pocketbase-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tool schema
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "pb_list_collections",
        description: "List all collections in the PocketBase database",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "pb_get_collection",
        description: "Get schema details and metadata of a specific collection by its name or ID",
        inputSchema: {
          type: "object",
          properties: {
            collectionIdOrName: {
              type: "string",
              description: "The name or ID of the collection to inspect",
            },
          },
          required: ["collectionIdOrName"],
        },
      },
      {
        name: "pb_list_records",
        description: "Retrieve a paginated list of records from a collection with optional filtering, sorting, and relations expansion",
        inputSchema: {
          type: "object",
          properties: {
            collectionIdOrName: {
              type: "string",
              description: "The name or ID of the collection",
            },
            page: {
              type: "integer",
              description: "The page number to fetch (1-indexed)",
              default: 1,
            },
            perPage: {
              type: "integer",
              description: "Number of records per page",
              default: 30,
            },
            filter: {
              type: "string",
              description: "PocketBase filter expression (e.g. 'status = \"active\" && created > \"2022-01-01\"')",
            },
            sort: {
              type: "string",
              description: "PocketBase sort expression (e.g. '-created,id')",
            },
            expand: {
              type: "string",
              description: "Comma-separated relations to expand (e.g. 'user,category')",
            },
          },
          required: ["collectionIdOrName"],
        },
      },
      {
        name: "pb_view_record",
        description: "Retrieve a single record from a collection by its ID",
        inputSchema: {
          type: "object",
          properties: {
            collectionIdOrName: {
              type: "string",
              description: "The name or ID of the collection",
            },
            recordId: {
              type: "string",
              description: "The ID of the record to retrieve",
            },
            expand: {
              type: "string",
              description: "Comma-separated relations to expand",
            },
          },
          required: ["collectionIdOrName", "recordId"],
        },
      },
      {
        name: "pb_create_record",
        description: "Create a new record in a collection",
        inputSchema: {
          type: "object",
          properties: {
            collectionIdOrName: {
              type: "string",
              description: "The name or ID of the collection",
            },
            data: {
              type: "object",
              description: "Key-value pairs representing the record fields",
            },
          },
          required: ["collectionIdOrName", "data"],
        },
      },
      {
        name: "pb_update_record",
        description: "Update an existing record in a collection",
        inputSchema: {
          type: "object",
          properties: {
            collectionIdOrName: {
              type: "string",
              description: "The name or ID of the collection",
            },
            recordId: {
              type: "string",
              description: "The ID of the record to update",
            },
            data: {
              type: "object",
              description: "Key-value pairs representing the fields to update",
            },
          },
          required: ["collectionIdOrName", "recordId", "data"],
        },
      },
      {
        name: "pb_delete_record",
        description: "Delete a record from a collection",
        inputSchema: {
          type: "object",
          properties: {
            collectionIdOrName: {
              type: "string",
              description: "The name or ID of the collection",
            },
            recordId: {
              type: "string",
              description: "The ID of the record to delete",
            },
          },
          required: ["collectionIdOrName", "recordId"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "pb_list_collections": {
        const collections = await pb.collections.getFullList();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(collections, null, 2),
            },
          ],
        };
      }

      case "pb_get_collection": {
        const { collectionIdOrName } = args as { collectionIdOrName: string };
        const collection = await pb.collections.getOne(collectionIdOrName);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(collection, null, 2),
            },
          ],
        };
      }

      case "pb_list_records": {
        const { collectionIdOrName, page, perPage, filter, sort, expand } = args as {
          collectionIdOrName: string;
          page?: number;
          perPage?: number;
          filter?: string;
          sort?: string;
          expand?: string;
        };

        const options: Record<string, any> = {};
        if (filter) options.filter = filter;
        if (sort) options.sort = sort;
        if (expand) options.expand = expand;

        const records = await pb
          .collection(collectionIdOrName)
          .getList(page || 1, perPage || 30, options);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(records, null, 2),
            },
          ],
        };
      }

      case "pb_view_record": {
        const { collectionIdOrName, recordId, expand } = args as {
          collectionIdOrName: string;
          recordId: string;
          expand?: string;
        };

        const options: Record<string, any> = {};
        if (expand) options.expand = expand;

        const record = await pb
          .collection(collectionIdOrName)
          .getOne(recordId, options);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(record, null, 2),
            },
          ],
        };
      }

      case "pb_create_record": {
        const { collectionIdOrName, data } = args as {
          collectionIdOrName: string;
          data: any;
        };

        const record = await pb.collection(collectionIdOrName).create(data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(record, null, 2),
            },
          ],
        };
      }

      case "pb_update_record": {
        const { collectionIdOrName, recordId, data } = args as {
          collectionIdOrName: string;
          recordId: string;
          data: any;
        };

        const record = await pb
          .collection(collectionIdOrName)
          .update(recordId, data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(record, null, 2),
            },
          ],
        };
      }

      case "pb_delete_record": {
        const { collectionIdOrName, recordId } = args as {
          collectionIdOrName: string;
          recordId: string;
        };

        await pb.collection(collectionIdOrName).delete(recordId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, message: `Record ${recordId} deleted successfully` }, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `PocketBase Error: ${error.message || JSON.stringify(error)}`,
        },
      ],
    };
  }
});

// Run server
async function run() {
  await initializeAuth();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PocketBase MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
