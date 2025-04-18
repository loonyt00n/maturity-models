

# Production environment
FROM --platform=linux/amd64 nginx:alpine
ENV PUBLIC_URL="/maturity-models"
COPY build /usr/share/nginx/html
# Show the contents of the html directory to verify copying worked
RUN ls -la /usr/share/nginx/html

# Copy custom nginx config to serve React app correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]