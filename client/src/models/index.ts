export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer'
  }
  
  export enum ServiceType {
    API_SERVICE = 'api_service',
    UI_APPLICATION = 'ui_application',
    WORKFLOW = 'workflow',
    APPLICATION_MODULE = 'application_module'
  }
  
  export enum EvidenceType {
    URL = 'url',
    DOCUMENT = 'document',
    IMAGE = 'image',
    TEXT = 'text'
  }
  
  export enum EvaluationStatus {
    NOT_IMPLEMENTED = 'not_implemented',
    EVIDENCE_SUBMITTED = 'evidence_submitted',
    VALIDATING_EVIDENCE = 'validating_evidence',
    EVIDENCE_REJECTED = 'evidence_rejected',
    IMPLEMENTED = 'implemented'
  }
  
  export interface User {
    id: string;
    username: string;
    name: string;
    email?: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Measurement {
    id: string;
    name: string;
    description: string;
    evidenceType: EvidenceType;
    sampleEvidence?: string;
    maturityModelId: string;
  }
  
  export interface MaturityModel {
    id: string;
    name: string;
    owner: string;
    description: string;
    measurements: Measurement[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Service {
    id: string;
    name: string;
    owner: string;
    description: string;
    serviceType: ServiceType;
    resourceLocation?: string;
    activityId?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Activity {
    id: string;
    name: string;
    owner: string;
    description: string;
    dependencyGraph?: any;
    journeyId?: string;
    services: Service[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Journey {
    id: string;
    name: string;
    owner: string;
    description: string;
    dependencyGraph?: any;
    activities: Activity[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MeasurementEvaluation {
    id: string;
    measurementId: string;
    serviceId: string;
    campaignId: string;
    status: EvaluationStatus;
    evidenceLocation?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Campaign {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    maturityModelId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MaturityLevel {
    id: string;
    level: number;
    name: string;
    description?: string;
    minPercentage: number;
    maxPercentage: number;
    maturityModelId: string;
  }
  
  // Aggregated maturity result interfaces for visualization
  export interface ServiceMaturityResult {
    serviceId: string;
    serviceName: string;
    maturityLevel: number;
    percentage: number;
  }
  
  export interface ActivityMaturityResult {
    activityId: string;
    activityName: string;
    maturityLevel: number;
    serviceResults: ServiceMaturityResult[];
  }
  
  export interface JourneyMaturityResult {
    journeyId: string;
    journeyName: string;
    maturityLevel: number;
    activityResults: ActivityMaturityResult[];
  }
  
  export interface CampaignResult {
    campaignId: string;
    campaignName: string;
    maturityModelId: string;
    maturityModelName: string;
    journeyResults: JourneyMaturityResult[];
  }