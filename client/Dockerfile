

# Production environment
FROM --platform=linux/amd64 nginx:alpine

COPY build /usr/share/nginx/html
#ENV PUBLIC_URL "http://localhost:3010/maturity-models"
# Show the contents of the html directory to verify copying worked
RUN ls -la /usr/share/nginx/html

# Copy custom nginx config to serve React app correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]