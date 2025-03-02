// server/src/utils/seedDatabase.ts
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { MaturityModel } from '../entities/MaturityModel';
import { Measurement, EvidenceType } from '../entities/Measurement';
import { MaturityLevel } from '../entities/MaturityLevel';
import { Service, ServiceType } from '../entities/Service';
import { Activity } from '../entities/Activity';
import { Journey } from '../entities/Journey';
import { Campaign } from '../entities/Campaign';
import { MeasurementEvaluation, EvaluationStatus } from '../entities/MeasurementEvaluation';

export const seedDatabase = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const modelRepository = AppDataSource.getRepository(MaturityModel);
  const measurementRepository = AppDataSource.getRepository(Measurement);
  const levelRepository = AppDataSource.getRepository(MaturityLevel);
  const serviceRepository = AppDataSource.getRepository(Service);
  const activityRepository = AppDataSource.getRepository(Activity);
  const journeyRepository = AppDataSource.getRepository(Journey);
  const campaignRepository = AppDataSource.getRepository(Campaign);
  const evaluationRepository = AppDataSource.getRepository(MeasurementEvaluation);
  
  // Count existing users to check if seeding is necessary
  const userCount = await userRepository.count();
  
  if (userCount === 0) {
    console.log('Seeding database with initial data...');
    
    // Create users with different roles
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedEditorPassword = await bcrypt.hash('editor123', 10);
    const hashedViewerPassword = await bcrypt.hash('viewer123', 10);
    
    const adminUser = userRepository.create({
      username: 'admin',
      password: hashedAdminPassword,
      name: 'Administrator',
      email: 'admin@example.com',
      role: UserRole.ADMIN
    });
    
    const editorUser = userRepository.create({
      username: 'editor',
      password: hashedEditorPassword,
      name: 'Editor User',
      email: 'editor@example.com',
      role: UserRole.EDITOR
    });
    
    const viewerUser = userRepository.create({
      username: 'viewer',
      password: hashedViewerPassword,
      name: 'Viewer User',
      email: 'viewer@example.com',
      role: UserRole.VIEWER
    });
    
    await userRepository.save([adminUser, editorUser, viewerUser]);
    console.log('Users created');
    
    // Create maturity models
    const operationalExcellenceModel = modelRepository.create({
      name: 'Operational Excellence Maturity Model',
      owner: 'Administrator',
      description: 'A model to assess operational excellence capabilities'
    });
    
    const securityModel = modelRepository.create({
      name: 'Security Maturity Model',
      owner: 'Security Team',
      description: 'A model to assess security capabilities and practices'
    });
    
    const qualityModel = modelRepository.create({
      name: 'Quality Assurance Maturity Model',
      owner: 'QA Team',
      description: 'A model to assess quality assurance practices'
    });
    
    await modelRepository.save([operationalExcellenceModel, securityModel, qualityModel]);
    console.log('Maturity models created');
    
    // Create measurements for Operational Excellence
    const opsExMeasurements = [
      measurementRepository.create({
        name: 'Has centralized logging',
        description: 'The service must implement centralized logging for all components',
        evidenceType: EvidenceType.URL,
        sampleEvidence: 'https://logs.example.com/dashboard',
        maturityModel: operationalExcellenceModel
      }),
      measurementRepository.create({
        name: 'Has infrastructure metrics published',
        description: 'The service must publish infrastructure metrics to central monitoring',
        evidenceType: EvidenceType.URL,
        sampleEvidence: 'https://metrics.example.com/dashboard',
        maturityModel: operationalExcellenceModel
      }),
      measurementRepository.create({
        name: 'Has automated deployment pipeline',
        description: 'The service must have a fully automated CI/CD pipeline',
        evidenceType: EvidenceType.URL,
        sampleEvidence: 'https://ci.example.com/pipeline',
        maturityModel: operationalExcellenceModel
      }),
      measurementRepository.create({
        name: 'Has automated testing',
        description: 'The service must have automated unit, integration, and end-to-end tests',
        evidenceType: EvidenceType.URL,
        sampleEvidence: 'https://tests.example.com/results',
        maturityModel: operationalExcellenceModel
      })
    ];
    
    // Create measurements for Security
    const securityMeasurements = [
      measurementRepository.create({
        name: 'Has security scanning',
        description: 'The service must have automated security vulnerability scanning',
        evidenceType: EvidenceType.URL,
        sampleEvidence: 'https://security.example.com/scans',
        maturityModel: securityModel
      }),
      measurementRepository.create({
        name: 'Implements secure authentication',
        description: 'The service must implement secure authentication mechanisms',
        evidenceType: EvidenceType.DOCUMENT,
        sampleEvidence: 'Auth architecture document',
        maturityModel: securityModel
      }),
      measurementRepository.create({
        name: 'Has data encryption',
        description: 'The service must encrypt sensitive data at rest and in transit',
        evidenceType: EvidenceType.TEXT,
        sampleEvidence: 'All sensitive data is encrypted using AES-256',
        maturityModel: securityModel
      })
    ];
    
    // Create measurements for Quality
    const qualityMeasurements = [
      measurementRepository.create({
        name: 'Has code reviews',
        description: 'All code changes must be reviewed by at least one other developer',
        evidenceType: EvidenceType.URL,
        sampleEvidence: 'https://github.com/example/pull/123',
        maturityModel: qualityModel
      }),
      measurementRepository.create({
        name: 'Has code coverage',
        description: 'Code coverage must be at least 80%',
        evidenceType: EvidenceType.URL,
        sampleEvidence: 'https://coverage.example.com/report',
        maturityModel: qualityModel
      }),
      measurementRepository.create({
        name: 'Has static code analysis',
        description: 'Static code analysis tools must be configured and used',
        evidenceType: EvidenceType.URL,
        sampleEvidence: 'https://sonar.example.com/dashboard',
        maturityModel: qualityModel
      })
    ];
    
    const allMeasurements = [
      ...opsExMeasurements,
      ...securityMeasurements,
      ...qualityMeasurements
    ];
    
    await measurementRepository.save(allMeasurements);
    console.log('Measurements created');
    
    // Create maturity levels for each model
    const modelMaturityLevels = [];
    
    for (const model of [operationalExcellenceModel, securityModel, qualityModel]) {
      modelMaturityLevels.push(
        levelRepository.create({
          level: 0,
          name: 'Level 0',
          description: 'Initial level, less than 25% implemented',
          minPercentage: 0,
          maxPercentage: 24.99,
          maturityModel: model
        }),
        levelRepository.create({
          level: 1,
          name: 'Level 1',
          description: 'Basic level, 25% to 49% implemented',
          minPercentage: 25,
          maxPercentage: 49.99,
          maturityModel: model
        }),
        levelRepository.create({
          level: 2,
          name: 'Level 2',
          description: 'Intermediate level, 50% to 74% implemented',
          minPercentage: 50,
          maxPercentage: 74.99,
          maturityModel: model
        }),
        levelRepository.create({
          level: 3,
          name: 'Level 3',
          description: 'Advanced level, 75% to 99% implemented',
          minPercentage: 75,
          maxPercentage: 99.99,
          maturityModel: model
        }),
        levelRepository.create({
          level: 4,
          name: 'Level 4',
          description: 'Optimized level, 100% implemented',
          minPercentage: 100,
          maxPercentage: 100,
          maturityModel: model
        })
      );
    }
    
    await levelRepository.save(modelMaturityLevels);
    console.log('Maturity levels created');
    
    // Create journeys
    const userJourney = journeyRepository.create({
      name: 'User Registration',
      owner: 'Customer Experience Team',
      description: 'End-to-end user registration process',
      dependencyGraph: JSON.stringify({
        nodes: [
          { id: 'signup', name: 'Sign Up' },
          { id: 'email', name: 'Email Verification' },
          { id: 'profile', name: 'Profile Setup' }
        ],
        edges: [
          { source: 'signup', target: 'email' },
          { source: 'email', target: 'profile' }
        ]
      })
    });
    
    const shoppingJourney = journeyRepository.create({
      name: 'Shopping Experience',
      owner: 'Product Team',
      description: 'End-to-end shopping experience from discovery to checkout',
      dependencyGraph: JSON.stringify({
        nodes: [
          { id: 'browse', name: 'Browse Products' },
          { id: 'cart', name: 'Shopping Cart' },
          { id: 'checkout', name: 'Checkout' },
          { id: 'payment', name: 'Payment' }
        ],
        edges: [
          { source: 'browse', target: 'cart' },
          { source: 'cart', target: 'checkout' },
          { source: 'checkout', target: 'payment' }
        ]
      })
    });
    
    await journeyRepository.save([userJourney, shoppingJourney]);
    console.log('Journeys created');
    
    // Create activities
    const userManagementActivity = activityRepository.create({
      name: 'User Management',
      owner: 'Identity Team',
      description: 'Manage user accounts and authentication',
      journey: userJourney
    });
    
    const emailVerificationActivity = activityRepository.create({
      name: 'Email Verification',
      owner: 'Messaging Team',
      description: 'Handle email verification for new accounts',
      journey: userJourney
    });
    
    const productBrowsingActivity = activityRepository.create({
      name: 'Product Browsing',
      owner: 'Frontend Team',
      description: 'Allow users to browse and search products',
      journey: shoppingJourney
    });
    
    const checkoutActivity = activityRepository.create({
      name: 'Checkout Process',
      owner: 'Payments Team',
      description: 'Handle the checkout and payment process',
      journey: shoppingJourney
    });
    
    await activityRepository.save([
      userManagementActivity, 
      emailVerificationActivity,
      productBrowsingActivity,
      checkoutActivity
    ]);
    console.log('Activities created');
    
    // Create services
    const authService = serviceRepository.create({
      name: 'User Authentication Service',
      owner: 'Identity Team',
      description: 'Handles user authentication and authorization',
      serviceType: ServiceType.API_SERVICE,
      resourceLocation: 'https://github.com/example/auth-service',
      activity: userManagementActivity
    });
    
    const profileService = serviceRepository.create({
      name: 'User Profile Service',
      owner: 'Identity Team',
      description: 'Manages user profile data',
      serviceType: ServiceType.API_SERVICE,
      resourceLocation: 'https://github.com/example/profile-service',
      activity: userManagementActivity
    });
    
    const emailService = serviceRepository.create({
      name: 'Email Service',
      owner: 'Messaging Team',
      description: 'Handles sending and tracking emails',
      serviceType: ServiceType.API_SERVICE,
      resourceLocation: 'https://github.com/example/email-service',
      activity: emailVerificationActivity
    });
    
    const productCatalogUI = serviceRepository.create({
      name: 'Product Catalog UI',
      owner: 'Frontend Team',
      description: 'User interface for browsing products',
      serviceType: ServiceType.UI_APPLICATION,
      resourceLocation: 'https://github.com/example/product-ui',
      activity: productBrowsingActivity
    });
    
    const productSearchService = serviceRepository.create({
      name: 'Product Search Service',
      owner: 'Backend Team',
      description: 'API for searching and filtering products',
      serviceType: ServiceType.API_SERVICE,
      resourceLocation: 'https://github.com/example/search-service',
      activity: productBrowsingActivity
    });
    
    const checkoutService = serviceRepository.create({
      name: 'Checkout Service',
      owner: 'Payments Team',
      description: 'Handles the checkout process',
      serviceType: ServiceType.API_SERVICE,
      resourceLocation: 'https://github.com/example/checkout-service',
      activity: checkoutActivity
    });
    
    const paymentService = serviceRepository.create({
      name: 'Payment Processing Service',
      owner: 'Payments Team',
      description: 'Processes payment transactions',
      serviceType: ServiceType.API_SERVICE,
      resourceLocation: 'https://github.com/example/payment-service',
      activity: checkoutActivity
    });
    
    await serviceRepository.save([
      authService,
      profileService,
      emailService,
      productCatalogUI,
      productSearchService,
      checkoutService,
      paymentService
    ]);
    console.log('Services created');
    
    // Create campaigns
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfQ1 = new Date(now.getFullYear(), 2, 31);
    
    // Use a future date instead of null for endDate
    const nextYearEnd = new Date(now.getFullYear() + 1, 11, 31);
    
    const q1OpsExCampaign = campaignRepository.create({
      name: `Q1 ${now.getFullYear()} Operational Excellence Assessment`,
      description: 'Quarterly assessment of operational excellence across all services',
      startDate: startOfYear,
      endDate: endOfQ1,
      maturityModel: operationalExcellenceModel
    });
    
    const securityCampaign = campaignRepository.create({
      name: `Annual Security Assessment ${now.getFullYear()}`,
      description: 'Annual security assessment for all services',
      startDate: startOfYear,
      endDate: nextYearEnd, // Use a future date instead of null
      maturityModel: securityModel
    });
    
    const savedCampaigns = await campaignRepository.save([q1OpsExCampaign, securityCampaign]);
    console.log('Campaigns created');
    
    // Retrieve the saved campaigns with their IDs
    const savedOpsExCampaign = savedCampaigns[0];
    const savedSecurityCampaign = savedCampaigns[1];
    
    // Get the measurements for each model
    const opsExMeasurementsData = await measurementRepository.find({
      where: { maturityModel: { id: operationalExcellenceModel.id } }
    });
    
    const securityMeasurementsData = await measurementRepository.find({
      where: { maturityModel: { id: securityModel.id } }
    });
    
    const services = [
      authService,
      profileService,
      emailService,
      productCatalogUI,
      productSearchService,
      checkoutService,
      paymentService
    ];
    
    // Create and save evaluations for each campaign separately
    for (const service of services) {
      // Create for operational excellence campaign
      for (const measurement of opsExMeasurementsData) {
        // Randomize evaluation status
        let status: EvaluationStatus;
        const rand = Math.random();
        
        if (rand < 0.2) {
          status = EvaluationStatus.NOT_IMPLEMENTED;
        } else if (rand < 0.3) {
          status = EvaluationStatus.EVIDENCE_SUBMITTED;
        } else if (rand < 0.4) {
          status = EvaluationStatus.VALIDATING_EVIDENCE;
        } else if (rand < 0.5) {
          status = EvaluationStatus.EVIDENCE_REJECTED;
        } else {
          status = EvaluationStatus.IMPLEMENTED;
        }
        
        const evidenceLocation = status !== EvaluationStatus.NOT_IMPLEMENTED 
          ? `https://evidence.example.com/${service.id}/${measurement.id}` 
          : null;
          
        const notes = status === EvaluationStatus.EVIDENCE_REJECTED 
          ? 'Evidence does not meet requirements' 
          : status === EvaluationStatus.IMPLEMENTED 
            ? 'Fully implemented and verified' 
            : null;
            
        // Create a new evaluation instance
        const evaluation = new MeasurementEvaluation();
        evaluation.service = service;
        evaluation.measurement = measurement;
        evaluation.campaign = savedOpsExCampaign;
        evaluation.status = status;
        evaluation.evidenceLocation = evidenceLocation || '';
        evaluation.notes = notes || '';
        
        // Save it immediately
        await evaluationRepository.save(evaluation);
      }
    }
    
    // Create and save evaluations for security campaign
    for (const service of services) {
      for (const measurement of securityMeasurementsData) {
        // Randomize evaluation status
        let status: EvaluationStatus;
        const rand = Math.random();
        
        if (rand < 0.3) {
          status = EvaluationStatus.NOT_IMPLEMENTED;
        } else if (rand < 0.4) {
          status = EvaluationStatus.EVIDENCE_SUBMITTED;
        } else if (rand < 0.5) {
          status = EvaluationStatus.VALIDATING_EVIDENCE;
        } else if (rand < 0.6) {
          status = EvaluationStatus.EVIDENCE_REJECTED;
        } else {
          status = EvaluationStatus.IMPLEMENTED;
        }
        
        const evidenceLocation = status !== EvaluationStatus.NOT_IMPLEMENTED 
          ? `https://evidence.example.com/${service.id}/${measurement.id}` 
          : null;
          
        const notes = status === EvaluationStatus.EVIDENCE_REJECTED 
          ? 'Evidence does not meet security requirements' 
          : status === EvaluationStatus.IMPLEMENTED 
            ? 'Security measures fully implemented and verified' 
            : null;
            
        // Create a new evaluation instance
        const evaluation = new MeasurementEvaluation();
        evaluation.service = service;
        evaluation.measurement = measurement;
        evaluation.campaign = savedSecurityCampaign;
        evaluation.status = status;
        evaluation.evidenceLocation = evidenceLocation || '';
        evaluation.notes = notes || '';
        
        // Save it immediately
        await evaluationRepository.save(evaluation);
      }
    }
    
    console.log('Evaluations created');
    console.log('Database seeded successfully');
  } else {
    console.log('Database already contains data, skipping seed');
  }
};