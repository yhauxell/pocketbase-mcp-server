# Contributing to pocketbase-mcp-server

Thank you for your interest in contributing to `pocketbase-mcp-server`! Contributions from the community help make this tool better for everyone.

This document outlines the guidelines and steps to help you get started with contributing.

## Setup Instructions

1. **Fork the Repository**: Fork the repository on GitHub and clone it to your local machine.
2. **Install Dependencies**: Run the following command inside the repository to install dependencies:
   ```bash
   npm install
   ```
3. **Configure Environment**: Copy `.env.example` to `.env` and configure the settings to point to your PocketBase instance:
   ```bash
   cp .env.example .env
   ```

## Development Workflow

- **Build the Server**: Run the build script to compile the TypeScript files to JS:
   ```bash
   npm run build
   ```
- **Watch Mode**: For development, you can run TypeScript in watch mode so it recompiles automatically when you save changes:
   ```bash
   npm run watch
   ```
- **Testing**: Test your server with your local PocketBase instance or standard MCP inspector.

## Submitting Pull Requests

1. **Create a Branch**: Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Implement Changes**: Write clean, commented, and well-structured TypeScript.
3. **Build and Test**: Run `npm run build` to ensure there are no compilation errors.
4. **Commit Changes**: Use descriptive commit messages.
5. **Push and Open PR**: Push your branch to GitHub and open a Pull Request against the `main` branch.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
