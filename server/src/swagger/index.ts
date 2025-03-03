import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Load YAML files
const loadYamlFile = (filePath: string) => {
  const fullPath = path.resolve(__dirname, filePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(fileContents);
};

// Define paths to YAML files
const schemaFiles = [
  'schemas/user.yaml',
  'schemas/maturityModel.yaml',
  'schemas/measurement.yaml',
  'schemas/service.yaml',
  'schemas/activity.yaml',
  'schemas/journey.yaml',
  'schemas/campaign.yaml',
  'schemas/evaluation.yaml',
  'schemas/auth.yaml',
  'schemas/error.yaml'
];

const pathFiles = [
  'paths/auth.yaml',
  'paths/users.yaml',
  'paths/maturityModels.yaml',
  'paths/services.yaml',
  'paths/activities.yaml',
  'paths/journeys.yaml',
  'paths/campaigns.yaml',
  'paths/evaluations.yaml'
];

const componentFiles = [
  'components/securitySchemes.yaml',
  'components/responses.yaml'
];

// Load and merge schema definitions
const schemas: Record<string, any> = {};
schemaFiles.forEach((file) => {
  const schemaData = loadYamlFile(file);
  Object.assign(schemas, schemaData);
});

// Load and merge path definitions
const paths: Record<string, any> = {};
pathFiles.forEach((file) => {
  const pathData = loadYamlFile(file);
  Object.assign(paths, pathData);
});

// Load and merge component definitions
const components: Record<string, any> = {
  schemas,
  securitySchemes: {},
  responses: {}
};

componentFiles.forEach((file) => {
  const componentData = loadYamlFile(file);
  
  if (file.includes('securitySchemes')) {
    components.securitySchemes = componentData;
  } else if (file.includes('responses')) {
    components.responses = componentData;
  }
});

// Define the main Swagger document
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Maturity Models Management Platform API',
    version: '1.0.0',
    description: 'API documentation for the Maturity Models Management Platform',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'API Support',
      url: 'https://maturity-models.example.com',
      email: 'support@maturity-models.example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development server',
    },
  ],
  components,
  paths,
  security: [
    {
      BearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Maturity Models',
      description: 'Maturity model management endpoints',
    },
    {
      name: 'Services',
      description: 'Service management endpoints',
    },
    {
      name: 'Activities',
      description: 'Activity management endpoints',
    },
    {
      name: 'Journeys',
      description: 'Journey management endpoints',
    },
    {
      name: 'Campaigns',
      description: 'Campaign management endpoints',
    },
    {
      name: 'Evaluations',
      description: 'Measurement evaluation endpoints',
    },
  ],
};
