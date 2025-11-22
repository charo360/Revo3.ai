# Multi-stage build for Vite + React application (Revo3.ai)
# Using Node 20 to match package requirements (@google/genai, react-router-dom, etc.)
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files and configuration
COPY . .

# Build the application (creates dist/ folder with static assets)
# Vite will output to dist/ directory
RUN npm run build

# Production stage - serve static files
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install serve globally to serve static files
RUN npm install -g serve

# Copy built static files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose port 3000 (matches vite.config.ts server port)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check to verify the server is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the server to serve static files
# -s: single-page application mode (serve index.html for all routes)
# -l: listen on all network interfaces
# -p: port number
CMD ["serve", "-s", "dist", "-l", "3000"]

