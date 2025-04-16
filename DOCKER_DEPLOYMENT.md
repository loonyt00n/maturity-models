# Docker Deployment Guide for Maturity Models Management Platform

This guide explains how to deploy the Maturity Models Management Platform using Docker containers.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Docker (20.10.x or later)
- Docker Compose (2.x or later)
- Git

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/loonyt00n/maturity-models.git
   cd maturity-models
   ```

2. Build the Docker images:
   ```
   make build
   ```
   or
   ```
   docker-compose build
   ```

3. Start the containers:
   ```
   make up
   ```
   or
   ```
   docker-compose up -d
   ```

4. Seed the database with initial data:
   ```
   make seed
   ```
   or
   ```
   docker-compose exec server yarn seed
   ```

5. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/api-docs

## Default Credentials

After seeding the database, the following default users are available:

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | Admin |
| editor   | editor123 | Editor |
| viewer   | viewer123 | Viewer |

## Environment Variables

You can customize the deployment by modifying the environment variables in the `docker-compose.yml` file:

- `NODE_ENV`: Set to `production` for production deployment
- `JWT_SECRET`: Secret key for JWT token generation (change this for security)

## Container Architecture

The deployment consists of two main containers:

1. **server**: Node.js backend API
   - Exposes port 5000
   - Manages database and business logic

2. **client**: React frontend served through Nginx
   - Exposes port 80
   - Proxies API calls to the backend service

## Data Persistence

The application data is stored in a Docker volume named `server-data`, which persists across container restarts.

## Common Commands

Use the following commands to manage your deployment:

- `make dev`: Start containers in development mode (with logs)
- `make logs`: View container logs
- `make down`: Stop containers
- `make clean`: Remove containers, volumes, and images

## Troubleshooting

1. **Database connection issues**: 
   - Check if the server container is running: `docker-compose ps`
   - Inspect server logs: `docker-compose logs server`

2. **Frontend not loading**:
   - Check if the client container is running: `docker-compose ps`
   - Inspect client logs: `docker-compose logs client`
   - Verify that the server container is accessible from the client container

3. **API not responding**:
   - Check if the server is properly started: `docker-compose logs server`
   - Ensure the JWT_SECRET environment variable is set correctly

## Production Deployment Considerations

For production deployment, consider the following additional steps:

1. Set a strong value for `JWT_SECRET` in the `docker-compose.yml` file
2. Set up proper TLS/SSL termination using a reverse proxy like Nginx or Traefik
3. Configure a production-grade database instead of the built-in SQLite
4. Implement proper monitoring and logging solutions
5. Set up automatic backups for the data volume
