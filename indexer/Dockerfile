# ChainEquity Indexer Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for TypeScript build)
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript and copy necessary files
RUN npm run build

# Expose port (if needed in future)
# EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]

