# server/Dockerfile
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json (and yarn.lock if it exists)
COPY package.json ./
COPY yarn.lock* ./

# Install dependencies - use npm if yarn.lock doesn't exist
RUN if [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile; \
    else \
        npm install; \
    fi

# Copy application code
COPY . .

# Build TypeScript to JavaScript
RUN if [ -f yarn.lock ]; then \
        yarn build; \
    else \
        npm run build; \
    fi

# Copy YAML files to the dist directory
RUN mkdir -p dist/swagger/schemas dist/swagger/paths dist/swagger/components && \
    cp -r src/swagger/schemas/* dist/swagger/schemas/ && \
    cp -r src/swagger/paths/* dist/swagger/paths/ && \
    cp -r src/swagger/components/* dist/swagger/components/ && \
    cp ./database.sqlite dist/database.sqlite

# Expose API port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.js"]
