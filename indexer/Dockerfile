# ChainEquity Indexer Dockerfile
# Build context is repo root, Dockerfile path is indexer/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files first (for better layer caching)
COPY indexer/package*.json ./

# Install all dependencies (needed for TypeScript build)
RUN npm ci

# Copy rest of source files (excluding node_modules via .dockerignore if present)
COPY indexer/ ./

# Build TypeScript and copy necessary files
RUN npm run build

# Expose port (if needed in future)
# EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]

