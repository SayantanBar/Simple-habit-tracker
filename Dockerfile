# Multi-Stage Production Dockerfile for Simple Habit Tracker
# Base image: Official lightweight Node.js 22 LTS on Alpine Linux with built-in SQLite engine
# Fully compatible with Ubuntu Linux and Google Cloud / Firebase

# --- Stage 1: Build Frontend Assets ---
FROM node:22-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package.json ./
RUN npm install

# Copy application source code
COPY . .

# Compile TypeScript and Vite production bundle
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data
ENV DB_PATH=/app/data/tracker.sqlite

# Install SQLite CLI tool for database inspection and debugging
RUN apk add --no-cache sqlite

# Copy package metadata and install production dependencies
COPY package.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copy compiled frontend from builder
COPY --from=builder /app/dist ./dist
# Copy backend SQLite server
COPY server.ts ./

# Create persistent data directory for SQLite database file
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to non-root node user
USER node

# Declare volume for tracker.sqlite persistence on Ubuntu host
VOLUME ["/app/data"]

EXPOSE 3000

CMD ["tsx", "server.ts"]
