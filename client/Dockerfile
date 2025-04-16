# client/Dockerfile
FROM node:16-alpine as build

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

# Copy all files
COPY . .

# Build the app
RUN if [ -f yarn.lock ]; then \
        yarn build; \
    else \
        npm run build; \
    fi

# Show the contents of the build directory to verify it exists
RUN ls -la build

# Production environment
FROM nginx:alpine

# Copy build files from build stage to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Show the contents of the html directory to verify copying worked
RUN ls -la /usr/share/nginx/html

# Copy custom nginx config to serve React app correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]