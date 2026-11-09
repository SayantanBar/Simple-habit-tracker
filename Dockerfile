# Multi-Stage Production Dockerfile for Simple Habit Tracker
# Base image: Official Node.js 22 LTS on Alpine Linux with built-in SQLite engine
# Fully compatible with Ubuntu Linux and Google Cloud / Firebase

# --- Stage 1: Build Frontend & Backend Bundles ---
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies with resilient peer resolution
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . .

# Compile Vite client bundle to /app/dist and server.js to /app/server.js
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

# Copy production package metadata and install only production dependencies
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled frontend from builder
COPY --from=builder /app/dist ./dist
# Copy pre-compiled backend server.js from builder
COPY --from=builder /app/server.js ./server.js

# Create persistent data directory for SQLite database file
RUN mkdir -p /app/data && chmod 777 /app/data

# Declare volume for tracker.sqlite persistence on Ubuntu host
VOLUME ["/app/data"]

EXPOSE 3000

# Run native pre-compiled Node.js server
CMD ["node", "server.js"]
