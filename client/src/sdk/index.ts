
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { 
  User, 
  UserRole, 
  MaturityModel, 
  Measurement, 
  EvidenceType,
  Service,
  ServiceType,
  Activity,
  Journey,
  Campaign,
  MeasurementEvaluation,
  EvaluationStatus,
  MaturityLevel
} from '../models';

/**
 * SDK Error class to normalize error handling
 */
export class SDKError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'SDKError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Authentication class to handle login/token management
 */
export class AuthAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Login to the API
   */
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const response = await this.client.post<{ token: string; user: User }>('/auth/login', { 
        username, 
        password 
      });
      
      // Set the token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error; // This line is unreachable, but TypeScript doesn't know that
    }
  }

  /**
   * Register a new user
   */
  async register(userData: { 
    username: string; 
    password: string; 
    name: string; 
    email?: string; 
    role?: UserRole 
  }): Promise<{ message: string; user: User }> {
    try {
      const response = await this.client.post<{ message: string; user: User }>('/auth/register', userData);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Validate the current token
   */
  async validate(): Promise<boolean> {
    try {
      await this.client.get('/auth/validate');
      return true;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  }

  /**
   * Logout (client-side only)
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'Authentication error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

/**
 * Users API with fluent interface
 */
export class UsersAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    try {
      const response = await this.client.get<User[]>('/admin/users');
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    try {
      const response = await this.client.get<User>(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Fluent builder for creating a user
   */
  create() {
    const userData: Partial<User> & { password?: string } = {};
    
    return {
      withUsername: (username: string) => {
        userData.username = username;
        return this;
      },
      withPassword: (password: string) => {
        userData.password = password;
        return this;
      },
      withName: (name: string) => {
        userData.name = name;
        return this;
      },
      withEmail: (email: string) => {
        userData.email = email;
        return this;
      },
      withRole: (role: UserRole) => {
        userData.role = role;
        return this;
      },
      execute: async (): Promise<User> => {
        if (!userData.username || !userData.password || !userData.name) {
          throw new Error('Username, password, and name are required');
        }
        
        try {
          const response = await this.client.post<User>('/admin/users', userData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Fluent builder for updating a user
   */
  update(id: string) {
    const userData: Partial<User> = {};
    
    return {
      withUsername: (username: string) => {
        userData.username = username;
        return this;
      },
      withName: (name: string) => {
        userData.name = name;
        return this;
      },
      withEmail: (email: string) => {
        userData.email = email;
        return this;
      },
      withRole: (role: UserRole) => {
        userData.role = role;
        return this;
      },
      execute: async (): Promise<User> => {
        if (Object.keys(userData).length === 0) {
          throw new Error('At least one field must be updated');
        }
        
        try {
          const response = await this.client.put<User>(`/admin/users/${id}`, userData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`/admin/users/${id}`);
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'User API error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

/**
 * Maturity Models API with fluent interface
 */
export class MaturityModelsAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get all maturity models
   */
  async getAll(): Promise<MaturityModel[]> {
    try {
      const response = await this.client.get<MaturityModel[]>('/maturity-models');
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get maturity model by ID
   */
  async getById(id: string): Promise<MaturityModel> {
    try {
      const response = await this.client.get<MaturityModel>(`/maturity-models/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get maturity levels for a model
   */
  async getLevels(modelId: string): Promise<MaturityLevel[]> {
    try {
      const response = await this.client.get<MaturityLevel[]>(`/maturity-models/${modelId}/levels`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get campaigns for a model
   */
  async getCampaigns(modelId: string): Promise<Campaign[]> {
    try {
      const response = await this.client.get<Campaign[]>(`/maturity-models/${modelId}/campaigns`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Fluent builder for creating a maturity model
   */
  create() {
    const modelData: Partial<MaturityModel> = {};
    const measurements: Partial<Measurement>[] = [];
    
    return {
      withName: (name: string) => {
        modelData.name = name;
        return this;
      },
      withOwner: (owner: string) => {
        modelData.owner = owner;
        return this;
      },
      withDescription: (description: string) => {
        modelData.description = description;
        return this;
      },
      addMeasurement: (measurement: Partial<Measurement>) => {
        measurements.push(measurement);
        return this;
      },
      execute: async (): Promise<MaturityModel> => {
        if (!modelData.name || !modelData.owner || !modelData.description) {
          throw new Error('Name, owner, and description are required');
        }
        
        try {
          const response = await this.client.post<MaturityModel>('/maturity-models', {
            ...modelData,
            measurements
          });
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Fluent builder for updating a maturity model
   */
  update(id: string) {
    const modelData: Partial<MaturityModel> = {};
    
    return {
      withName: (name: string) => {
        modelData.name = name;
        return this;
      },
      withOwner: (owner: string) => {
        modelData.owner = owner;
        return this;
      },
      withDescription: (description: string) => {
        modelData.description = description;
        return this;
      },
      execute: async (): Promise<MaturityModel> => {
        if (Object.keys(modelData).length === 0) {
          throw new Error('At least one field must be updated');
        }
        
        try {
          const response = await this.client.put<MaturityModel>(`/maturity-models/${id}`, modelData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Delete a maturity model
   */
  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`/maturity-models/${id}`);
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'Maturity Model API error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

/**
 * Measurements API with fluent interface
 */
export class MeasurementsAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Fluent builder for creating a measurement
   */
  create() {
    const measurementData: Partial<Measurement> = {};
    
    return {
      withName: (name: string) => {
        measurementData.name = name;
        return this;
      },
      withDescription: (description: string) => {
        measurementData.description = description;
        return this;
      },
      withEvidenceType: (evidenceType: EvidenceType) => {
        measurementData.evidenceType = evidenceType;
        return this;
      },
      withSampleEvidence: (sampleEvidence: string) => {
        measurementData.sampleEvidence = sampleEvidence;
        return this;
      },
      forMaturityModel: (maturityModelId: string) => {
        measurementData.maturityModelId = maturityModelId;
        return this;
      },
      execute: async (): Promise<Measurement> => {
        if (!measurementData.name || !measurementData.description || !measurementData.evidenceType || !measurementData.maturityModelId) {
          throw new Error('Name, description, evidenceType, and maturityModelId are required');
        }
        
        try {
          const response = await this.client.post<Measurement>('/measurements', measurementData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Fluent builder for updating a measurement
   */
  update(id: string) {
    const measurementData: Partial<Measurement> = {};
    
    return {
      withName: (name: string) => {
        measurementData.name = name;
        return this;
      },
      withDescription: (description: string) => {
        measurementData.description = description;
        return this;
      },
      withEvidenceType: (evidenceType: EvidenceType) => {
        measurementData.evidenceType = evidenceType;
        return this;
      },
      withSampleEvidence: (sampleEvidence: string) => {
        measurementData.sampleEvidence = sampleEvidence;
        return this;
      },
      execute: async (): Promise<Measurement> => {
        if (Object.keys(measurementData).length === 0) {
          throw new Error('At least one field must be updated');
        }
        
        try {
          const response = await this.client.put<Measurement>(`/measurements/${id}`, measurementData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Delete a measurement
   */
  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`/measurements/${id}`);
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'Measurement API error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

/**
 * Services API with fluent interface
 */
export class ServicesAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get all services
   */
  async getAll(): Promise<Service[]> {
    try {
      const response = await this.client.get<Service[]>('/services');
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get service by ID
   */
  async getById(id: string): Promise<Service> {
    try {
      const response = await this.client.get<Service>(`/services/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get service campaigns
   */
  async getCampaigns(id: string): Promise<any[]> {
    try {
      const response = await this.client.get<any[]>(`/services/${id}/campaigns`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Fluent builder for creating a service
   */
  create() {
    const serviceData: Partial<Service> = {};
    
    return {
      withName: (name: string) => {
        serviceData.name = name;
        return this;
      },
      withOwner: (owner: string) => {
        serviceData.owner = owner;
        return this;
      },
      withDescription: (description: string) => {
        serviceData.description = description;
        return this;
      },
      withType: (serviceType: ServiceType) => {
        serviceData.serviceType = serviceType;
        return this;
      },
      withResourceLocation: (resourceLocation: string) => {
        serviceData.resourceLocation = resourceLocation;
        return this;
      },
      forActivity: (activityId: string | undefined) => {
        serviceData.activityId = activityId;
        return this;
      },
      execute: async (): Promise<Service> => {
        if (!serviceData.name || !serviceData.owner || !serviceData.description || !serviceData.serviceType) {
          throw new Error('Name, owner, description, and serviceType are required');
        }
        
        try {
          const response = await this.client.post<Service>('/services', serviceData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Fluent builder for updating a service
   */
  update(id: string) {
    const serviceData: Partial<Service> = {};
    
    return {
      withName: (name: string) => {
        serviceData.name = name;
        return this;
      },
      withOwner: (owner: string) => {
        serviceData.owner = owner;
        return this;
      },
      withDescription: (description: string) => {
        serviceData.description = description;
        return this;
      },
      withType: (serviceType: ServiceType) => {
        serviceData.serviceType = serviceType;
        return this;
      },
      withResourceLocation: (resourceLocation: string) => {
        serviceData.resourceLocation = resourceLocation;
        return this;
      },
      forActivity: (activityId: string | undefined) => {
        serviceData.activityId = activityId;
        return this;
      },
      execute: async (): Promise<Service> => {
        if (Object.keys(serviceData).length === 0) {
          throw new Error('At least one field must be updated');
        }
        
        try {
          const response = await this.client.put<Service>(`/services/${id}`, serviceData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Delete a service
   */
  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`/services/${id}`);
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'Service API error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

/**
 * Activities API with fluent interface
 */
export class ActivitiesAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get all activities
   */
  async getAll(): Promise<Activity[]> {
    try {
      const response = await this.client.get<Activity[]>('/activities');
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get activity by ID
   */
  async getById(id: string): Promise<Activity> {
    try {
      const response = await this.client.get<Activity>(`/activities/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get activity services
   */
  async getServices(id: string): Promise<Service[]> {
    try {
      const response = await this.client.get<Service[]>(`/activities/${id}/services`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get activity journey
   */
  async getJourney(id: string): Promise<Journey | null> {
    try {
      const response = await this.client.get<Journey>(`/activities/${id}/journey`);
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get activity maturity summaries
   */
  async getMaturitySummaries(id: string): Promise<any[]> {
    try {
      const response = await this.client.get<any[]>(`/activities/${id}/maturity-summaries`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Fluent builder for creating an activity
   */
  create() {
    const activityData: Partial<Activity> & { dependencyGraph?: object } = {};
    
    return {
      withName: (name: string) => {
        activityData.name = name;
        return this;
      },
      withOwner: (owner: string) => {
        activityData.owner = owner;
        return this;
      },
      withDescription: (description: string) => {
        activityData.description = description;
        return this;
      },
      withDependencyGraph: (dependencyGraph: object) => {
        activityData.dependencyGraph = dependencyGraph;
        return this;
      },
      forJourney: (journeyId: string | undefined) => {
        activityData.journeyId = journeyId;
        return this;
      },
      execute: async (): Promise<Activity> => {
        if (!activityData.name || !activityData.owner || !activityData.description) {
          throw new Error('Name, owner, and description are required');
        }
        
        try {
          const response = await this.client.post<Activity>('/activities', activityData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Fluent builder for updating an activity
   */
  update(id: string) {
    const activityData: Partial<Activity> & { dependencyGraph?: object } = {};
    
    return {
      withName: (name: string) => {
        activityData.name = name;
        return this;
      },
      withOwner: (owner: string) => {
        activityData.owner = owner;
        return this;
      },
      withDescription: (description: string) => {
        activityData.description = description;
        return this;
      },
      withDependencyGraph: (dependencyGraph: object) => {
        activityData.dependencyGraph = dependencyGraph;
        return this;
      },
      forJourney: (journeyId: string | undefined) => {
        activityData.journeyId = journeyId;
        return this;
      },
      execute: async (): Promise<Activity> => {
        if (Object.keys(activityData).length === 0) {
          throw new Error('At least one field must be updated');
        }
        
        try {
          const response = await this.client.put<Activity>(`/activities/${id}`, activityData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Delete an activity
   */
  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`/activities/${id}`);
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'Activity API error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

/**
 * Journeys API with fluent interface
 */
export class JourneysAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get all journeys
   */
  async getAll(): Promise<Journey[]> {
    try {
      const response = await this.client.get<Journey[]>('/journeys');
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get journey by ID
   */
  async getById(id: string): Promise<Journey> {
    try {
      const response = await this.client.get<Journey>(`/journeys/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get journey activities
   */
  async getActivities(id: string): Promise<ActivityWithServices[]> {
    try {
      const response = await this.client.get<ActivityWithServices[]>(`/journeys/${id}/activities`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get journey maturity summaries
   */
  async getMaturitySummaries(id: string): Promise<any[]> {
    try {
      const response = await this.client.get<any[]>(`/journeys/${id}/maturity-summaries`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Fluent builder for creating a journey
   */
  create() {
    const journeyData: Partial<Journey> & { dependencyGraph?: object } = {};
    
    return {
      withName: (name: string) => {
        journeyData.name = name;
        return this;
      },
      withOwner: (owner: string) => {
        journeyData.owner = owner;
        return this;
      },
      withDescription: (description: string) => {
        journeyData.description = description;
        return this;
      },
      withDependencyGraph: (dependencyGraph: object) => {
        journeyData.dependencyGraph = dependencyGraph;
        return this;
      },
      execute: async (): Promise<Journey> => {
        if (!journeyData.name || !journeyData.owner || !journeyData.description) {
          throw new Error('Name, owner, and description are required');
        }
        
        try {
          const response = await this.client.post<Journey>('/journeys', journeyData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Fluent builder for updating a journey
   */
  update(id: string) {
    const journeyData: Partial<Journey> & { dependencyGraph?: object } = {};
    
    return {
      withName: (name: string) => {
        journeyData.name = name;
        return this;
      },
      withOwner: (owner: string) => {
        journeyData.owner = owner;
        return this;
      },
      withDescription: (description: string) => {
        journeyData.description = description;
        return this;
      },
      withDependencyGraph: (dependencyGraph: object) => {
        journeyData.dependencyGraph = dependencyGraph;
        return this;
      },
      execute: async (): Promise<Journey> => {
        if (Object.keys(journeyData).length === 0) {
          throw new Error('At least one field must be updated');
        }
        
        try {
          const response = await this.client.put<Journey>(`/journeys/${id}`, journeyData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Delete a journey
   */
  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`/journeys/${id}`);
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'Journey API error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

/**
 * Campaigns API with fluent interface
 */
export class CampaignsAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get all campaigns
   */
  async getAll(): Promise<Campaign[]> {
    try {
      const response = await this.client.get<Campaign[]>('/campaigns');
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get campaign by ID
   */
  async getById(id: string): Promise<{ campaign: Campaign; maturityModel: MaturityModel }> {
    try {
      const response = await this.client.get<{ campaign: Campaign; maturityModel: MaturityModel }>(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get campaign results
   */
  async getResults(id: string): Promise<any> {
    try {
      const response = await this.client.get<any>(`/campaigns/${id}/results`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Fluent builder for creating a campaign
   */
  create() {
    const campaignData: Partial<Campaign> = {};
    
    return {
      withName: (name: string) => {
        campaignData.name = name;
        return this;
      },
      withDescription: (description: string) => {
        campaignData.description = description;
        return this;
      },
      withStartDate: (startDate: string) => {
        campaignData.startDate = startDate;
        return this;
      },
      withEndDate: (endDate: string | undefined) => {
        if (endDate !== null) {
          campaignData.endDate = endDate;
        }
        return this;
      },
      forMaturityModel: (maturityModelId: string) => {
        campaignData.maturityModelId = maturityModelId;
        return this;
      },
      execute: async (): Promise<Campaign> => {
        if (!campaignData.name || !campaignData.description || !campaignData.startDate || !campaignData.maturityModelId) {
          throw new Error('Name, description, startDate, and maturityModelId are required');
        }
        
        try {
          const response = await this.client.post<Campaign>('/campaigns', campaignData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Fluent builder for updating a campaign
   */
  update(id: string) {
    const campaignData: Partial<Campaign> = {};
    
    return {
      withName: (name: string) => {
        campaignData.name = name;
        return this;
      },
      withDescription: (description: string) => {
        campaignData.description = description;
        return this;
      },
      withStartDate: (startDate: string) => {
        campaignData.startDate = startDate;
        return this;
      },
      withEndDate: (endDate: string | null) => {
        if (endDate !== null) {
          campaignData.endDate = endDate;
        }
        return this;
      },
      forMaturityModel: (maturityModelId: string) => {
        campaignData.maturityModelId = maturityModelId;
        return this;
      },
      execute: async (): Promise<Campaign> => {
        if (Object.keys(campaignData).length === 0) {
          throw new Error('At least one field must be updated');
        }
        
        try {
          const response = await this.client.put<Campaign>(`/campaigns/${id}`, campaignData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Delete a campaign
   */
  async delete(id: string): Promise<void> {
    try {
      await this.client.delete(`/campaigns/${id}`);
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'Campaign API error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

/**
 * Evaluations API with fluent interface
 */
export class EvaluationsAPI {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Get maturity level distribution
   */
  async getDistribution(): Promise<any[]> {
    try {
      const response = await this.client.get<any[]>('/evaluations/distribution');
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get evaluation by ID
   */
  async getById(id: string): Promise<MeasurementEvaluation> {
    try {
      const response = await this.client.get<MeasurementEvaluation>(`/evaluations/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Fluent builder for submitting evidence
   */
  submitEvidence() {
    const evidenceData: {
      serviceId?: string;
      measurementId?: string;
      campaignId?: string;
      evidenceLocation?: string;
      notes?: string;
      status?: EvaluationStatus;
    } = {
      status: EvaluationStatus.EVIDENCE_SUBMITTED
    };
    
    return {
      forService: (serviceId: string) => {
        evidenceData.serviceId = serviceId;
        return this;
      },
      forMeasurement: (measurementId: string) => {
        evidenceData.measurementId = measurementId;
        return this;
      },
      inCampaign: (campaignId: string) => {
        evidenceData.campaignId = campaignId;
        return this;
      },
      withEvidenceLocation: (evidenceLocation: string) => {
        evidenceData.evidenceLocation = evidenceLocation;
        return this;
      },
      withNotes: (notes: string) => {
        evidenceData.notes = notes;
        return this;
      },
      execute: async (): Promise<MeasurementEvaluation> => {
        if (!evidenceData.serviceId || !evidenceData.measurementId || !evidenceData.campaignId || !evidenceData.evidenceLocation) {
          throw new Error('ServiceId, measurementId, campaignId, and evidenceLocation are required');
        }
        
        try {
          const response = await this.client.post<MeasurementEvaluation>('/evaluations', evidenceData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  /**
   * Fluent builder for updating evaluation status
   */
  updateStatus(id: string) {
    const statusData: {
      status?: EvaluationStatus;
      notes?: string;
    } = {};
    
    return {
      withStatus: (status: EvaluationStatus) => {
        statusData.status = status;
        return this;
      },
      withNotes: (notes: string) => {
        statusData.notes = notes;
        return this;
      },
      execute: async (): Promise<MeasurementEvaluation> => {
        if (!statusData.status) {
          throw new Error('Status is required');
        }
        
        try {
          const response = await this.client.put<MeasurementEvaluation>(`/evaluations/${id}/status`, statusData);
          return response.data;
        } catch (error) {
          this.handleError(error as AxiosError);
          throw error;
        }
      }
    };
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      throw new SDKError(
        (error.response.data as { message?: string })?.message || 'Evaluation API error',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new SDKError('No response from server', 500);
    } else {
      throw new SDKError(error.message, 500);
    }
  }
}

// Helper type for the journey activities response
interface ActivityWithServices extends Activity {
  services: Service[];
}

/**
 * Main SDK class that provides access to all API services
 */
export class MaturityModelSDK {
  private client: AxiosInstance;
  public auth: AuthAPI;
  public users: UsersAPI;
  public maturityModels: MaturityModelsAPI;
  public measurements: MeasurementsAPI;
  public services: ServicesAPI;
  public activities: ActivitiesAPI;
  public journeys: JourneysAPI;
  public campaigns: CampaignsAPI;
  public evaluations: EvaluationsAPI;
  
  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add auth token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Initialize service classes
    this.auth = new AuthAPI(this.client);
    this.users = new UsersAPI(this.client);
    this.maturityModels = new MaturityModelsAPI(this.client);
    this.measurements = new MeasurementsAPI(this.client);
    this.services = new ServicesAPI(this.client);
    this.activities = new ActivitiesAPI(this.client);
    this.journeys = new JourneysAPI(this.client);
    this.campaigns = new CampaignsAPI(this.client);
    this.evaluations = new EvaluationsAPI(this.client);
  }
}

// Export a singleton instance
export const sdk = new MaturityModelSDK();

// Default export for convenience
export default sdk;
