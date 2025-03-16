# Maturity Models Management Platform

A comprehensive React and TypeScript application to manage Maturity Models for Services, Activities, and Journeys. This platform allows organizations to track and improve the maturity level of their services across different functional domains.

## Features

- **Maturity Model Management**: Create and manage maturity models with customizable measurements
- **Service Catalog**: Maintain a catalog of services with comprehensive metadata
- **Hierarchical Structure**: Organize services into activities and journeys
- **Campaigns**: Run evaluation campaigns to assess maturity levels across services
- **Visualization**: View maturity progress through intuitive dashboards and reports
- **Role-Based Access**: Admin, Editor, and Viewer roles with appropriate permissions

## Architecture

The application is built as a full-stack solution with:

- **Frontend**: React with TypeScript, Chakra UI for components, and Recharts for visualizations
- **Backend**: Node.js with Express and TypeORM
- **Database**: SQLite (can be configured for other databases in production)
- **Authentication**: JWT-based authentication system

## Project Structure

```
maturity-models/
├── client/                   # Frontend React app
│   ├── public/
│   ├── src/
│   │   ├── api/              # API client services
│   │   ├── assets/           # Static assets 
│   │   ├── components/       # Reusable components
│   │   │   ├── common/       # Shared UI components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── catalog/      # Catalog components
│   │   │   ├── dashboard/    # Dashboard & visualization components
│   │   │   └── evaluation/   # Evaluation & campaign components
│   │   ├── contexts/         # React contexts (auth, etc.)
│   │   ├── hooks/            # Custom hooks
│   │   ├── layouts/          # Page layouts
│   │   ├── models/           # TypeScript interfaces/types
│   │   ├── pages/            # Page components
│   │   ├── routes/           # Routing configuration
│   │   ├── services/         # Frontend services
│   │   ├── store/            # State management
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main app component
│   │   ├── index.tsx         # Entry point
│   │   └── theme.ts          # Theme configuration
│   ├── package.json
│   └── tsconfig.json
│
├── server/                   # Backend Node.js app
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # API controllers
│   │   ├── db/               # Database setup & migrations
│   │   ├── entities/         # TypeORM entities
│   │   ├── middlewares/      # Express middlewares
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic services
│   │   ├── swagger/          # API Documentation
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utility functions
│   │   ├── app.ts            # Express app setup
│   │   └── index.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── README.md
└── package.json              # Root package.json for scripts
```

## Prerequisites

- Node.js (v14 or later)
- Yarn package manager
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/loonyt00n/maturity-models.git
   cd maturity-models
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Initialize the database and seed with initial data:
   ```
   yarn seed
   ```

## Running the Application

1. Start both frontend and backend in development mode:
   ```
   yarn start
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Backend API Documentation: http://localhost:5000/api-docs

## Default Users

After seeding the database, the following users are available:

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | Admin |

## Domain Model

### Key Concepts

- **Maturity Model**: Defines a set of measurements for evaluating service maturity
- **Measurement**: A specific capability or practice that can be evaluated with evidence
- **Service**: An implementation of business functionality
- **Activity**: A business function composed of multiple services
- **Journey**: A business function composed of multiple activities
- **Campaign**: An evaluation of services against a maturity model
- **Maturity Level**: The rating (0-4) based on the percentage of implemented measurements

### Relationships

- **Maturity Models** define one or more **Measurements**
- **Measurements** can be evaluated based on **Evidence**
- **Services** participate in one or more evaluations of **Maturity Models**
- **Services** can be grouped into **Activities**
- **Activities** can be grouped into **Journeys**
- **Maturity Levels** for Services can be rolled up to **Activities** and **Journeys**

## Building for Production

To build the application for production:

```
yarn build
```

This will:
1. Compile the TypeScript server code to JavaScript
2. Create an optimized production build of the React frontend

## User Roles and Permissions

The platform implements three user roles:

1. **Admin**:
   - Create maturity models and measurements
   - Create services, activities, and journeys
   - Manage user accounts
   - Create and manage campaigns
   - View all content

2. **Editor**:
   - Create services, activities, and journeys
   - Submit evidence for evaluations
   - Create campaigns
   - View all content

3. **Viewer**:
   - View maturity models, services, activities, and journeys
   - View campaign results

## License

This project is licensed under the MIT License - see the LICENSE file for details.
