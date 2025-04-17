# server/Dockerfile
FROM --platform=linux/amd64 node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json (and yarn.lock if it exists)
COPY package.json ./
COPY yarn.lock* ./

RUN cat /etc/ssl/certs/ca-certificates.crt

RUN apk add --no-check-certificate  --update --no-cache python3 && ln -sf python3 /usr/bin/python
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
# Install dependencies - use npm if yarn.lock doesn't exist
RUN if [ -f yarn.lock ]; then \
        yarn config set strict-ssl false; \
        yarn install --frozen-lockfile; \
    else \
        npm config set strict-ssl false; \
        npm install; \
    fi

# Copy application code
COPY . .

# Build TypeScript to JavaScript
RUN if [ -f yarn.lock ]; then \
        yarn config set strict-ssl false; \
        yarn build; \
    else \
        npm config set strict-ssl false; \
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
