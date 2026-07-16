# PocketBase MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/pocketbase-mcp-server.svg)](https://www.npmjs.com/package/pocketbase-mcp-server)

A Model Context Protocol (MCP) server for interacting with PocketBase databases.

This server allows you to inspect collections and query, create, update, and delete records inside a PocketBase instance.

## Installation & Usage

You can use this server directly via `npx` (recommended) or install it globally.

### Option 1: Run via npx
To run the server without installing it locally, configure your MCP client to use:
```bash
npx pocketbase-mcp-server
```

### Option 2: Global Installation
```bash
npm install -g pocketbase-mcp-server
```
Then run the command:
```bash
pocketbase-mcp-server
```

---

## Configuration for Claude Desktop or MCP Clients

To register the server, add the following to your MCP client settings file (e.g., `claude_desktop_config.json`):

### Using `npx` (Recommended)
Using admin email & password:
```json
{
  "mcpServers": {
    "pocketbase-mcp-server": {
      "command": "npx",
      "args": ["-y", "pocketbase-mcp-server"],
      "env": {
        "POCKETBASE_URL": "http://127.0.0.1:8090",
        "POCKETBASE_ADMIN_EMAIL": "your_email@example.com",
        "POCKETBASE_ADMIN_PASSWORD": "your_password"
      }
    }
  }
}
```

Using an auth token:
```json
{
  "mcpServers": {
    "pocketbase-mcp-server": {
      "command": "npx",
      "args": ["-y", "pocketbase-mcp-server"],
      "env": {
        "POCKETBASE_URL": "http://127.0.0.1:8090",
        "POCKETBASE_AUTH_TOKEN": "your_auth_token_here"
      }
    }
  }
}
```

### Using Local Build (For Development)
If you are developing locally, run `npm run build` and use:
```json
{
  "mcpServers": {
    "pocketbase-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/pocketbase-mcp-server/dist/index.js"],
      "env": {
        "POCKETBASE_URL": "http://127.0.0.1:8090",
        "POCKETBASE_ADMIN_EMAIL": "your_email@example.com",
        "POCKETBASE_ADMIN_PASSWORD": "your_password"
      }
    }
  }
}
```

---

## Local Setup (Development)

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Configure environment variables in a `.env` file:
   ```bash
   POCKETBASE_URL=http://127.0.0.1:8090
   POCKETBASE_ADMIN_EMAIL=your_email@example.com
   POCKETBASE_ADMIN_PASSWORD=your_password
   ```

---

## Available Tools

- `pb_list_collections`: List all collections in the PocketBase database.
- `pb_get_collection`: Get schema details of a specific collection.
- `pb_list_records`: Retrieve paginated, filtered, and sorted records from a collection.
- `pb_view_record`: Retrieve a single record by its ID.
- `pb_create_record`: Create a new record in a collection.
- `pb_update_record`: Update an existing record in a collection.
- `pb_delete_record`: Delete a record from a collection.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
