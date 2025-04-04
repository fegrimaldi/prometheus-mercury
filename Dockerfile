# Use official Node LTS base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json, package-lock.json and source files
COPY package*.json ./
COPY .env ./
COPY app/src/ ./src/
COPY app/config/ ./config/

# Install wget
RUN apk add --no-cache wget

# Install dependencies
RUN npm ci --omit=dev


# Set environment variables
ENV NODE_ENV=production
ENV PORT=9502

# Expose port
EXPOSE 9502

# Run the app
CMD ["node", "src/index.mjs"]

# Define health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:9502/health || exit 1