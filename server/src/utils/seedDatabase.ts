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
    
    const adminUser = new User();
    adminUser.username = 'admin';
    adminUser.password = hashedAdminPassword;
    adminUser.name = 'Administrator';
    adminUser.email = 'admin@example.com';
    adminUser.role = UserRole.ADMIN;
    
    const editorUser = new User();
    editorUser.username = 'editor';
    editorUser.password = hashedEditorPassword;
    editorUser.name = 'Editor User';
    editorUser.email = 'editor@example.com';
    editorUser.role = UserRole.EDITOR;
    
    const viewerUser = new User();
    viewerUser.username = 'viewer';
    viewerUser.password = hashedViewerPassword;
    viewerUser.name = 'Viewer User';
    viewerUser.email = 'viewer@example.com';
    viewerUser.role = UserRole.VIEWER;
    
    await userRepository.save([adminUser, editorUser, viewerUser]);
    console.log('Users created');
    
    // Create maturity models
    const operationalExcellenceModel = new MaturityModel();
    operationalExcellenceModel.name = 'Operational Excellence Maturity Model';
    operationalExcellenceModel.owner = 'Administrator';
    operationalExcellenceModel.description = 'A model to assess operational excellence capabilities';
    
    const securityModel = new MaturityModel();
    securityModel.name = 'Security Maturity Model';
    securityModel.owner = 'Security Team';
    securityModel.description = 'A model to assess security capabilities and practices';
    
    const qualityModel = new MaturityModel();
    qualityModel.name = 'Quality Assurance Maturity Model';
    qualityModel.owner = 'QA Team';
    qualityModel.description = 'A model to assess quality assurance practices';
    
    await modelRepository.save([operationalExcellenceModel, securityModel, qualityModel]);
    console.log('Maturity models created');
    
    // Create measurements for Operational Excellence
    const centrLogging = new Measurement();
    centrLogging.name = 'Has centralized logging';
    centrLogging.description = 'The service must implement centralized logging for all components';
    centrLogging.evidenceType = EvidenceType.URL;
    centrLogging.sampleEvidence = 'https://logs.example.com/dashboard';
    centrLogging.maturityModel = operationalExcellenceModel;
    
    const infraMetrics = new Measurement();
    infraMetrics.name = 'Has infrastructure metrics published';
    infraMetrics.description = 'The service must publish infrastructure metrics to central monitoring';
    infraMetrics.evidenceType = EvidenceType.URL;
    infraMetrics.sampleEvidence = 'https://metrics.example.com/dashboard';
    infraMetrics.maturityModel = operationalExcellenceModel;
    
    const autoPipeline = new Measurement();
    autoPipeline.name = 'Has automated deployment pipeline';
    autoPipeline.description = 'The service must have a fully automated CI/CD pipeline';
    autoPipeline.evidenceType = EvidenceType.URL;
    autoPipeline.sampleEvidence = 'https://ci.example.com/pipeline';
    autoPipeline.maturityModel = operationalExcellenceModel;
    
    const autoTest = new Measurement();
    autoTest.name = 'Has automated testing';
    autoTest.description = 'The service must have automated unit, integration, and end-to-end tests';
    autoTest.evidenceType = EvidenceType.URL;
    autoTest.sampleEvidence = 'https://tests.example.com/results';
    autoTest.maturityModel = operationalExcellenceModel;
    
    // Create measurements for Security
    const secScanning = new Measurement();
    secScanning.name = 'Has security scanning';
    secScanning.description = 'The service must have automated security vulnerability scanning';
    secScanning.evidenceType = EvidenceType.URL;
    secScanning.sampleEvidence = 'https://security.example.com/scans';
    secScanning.maturityModel = securityModel;
    
    const secAuth = new Measurement();
    secAuth.name = 'Implements secure authentication';
    secAuth.description = 'The service must implement secure authentication mechanisms';
    secAuth.evidenceType = EvidenceType.DOCUMENT;
    secAuth.sampleEvidence = 'Auth architecture document';
    secAuth.maturityModel = securityModel;
    
    const dataEncryption = new Measurement();
    dataEncryption.name = 'Has data encryption';
    dataEncryption.description = 'The service must encrypt sensitive data at rest and in transit';
    dataEncryption.evidenceType = EvidenceType.TEXT;
    dataEncryption.sampleEvidence = 'All sensitive data is encrypted using AES-256';
    dataEncryption.maturityModel = securityModel;
    
    // Create measurements for Quality
    const codeReviews = new Measurement();
    codeReviews.name = 'Has code reviews';
    codeReviews.description = 'All code changes must be reviewed by at least one other developer';
    codeReviews.evidenceType = EvidenceType.URL;
    codeReviews.sampleEvidence = 'https://github.com/example/pull/123';
    codeReviews.maturityModel = qualityModel;
    
    const codeCoverage = new Measurement();
    codeCoverage.name = 'Has code coverage';
    codeCoverage.description = 'Code coverage must be at least 80%';
    codeCoverage.evidenceType = EvidenceType.URL;
    codeCoverage.sampleEvidence = 'https://coverage.example.com/report';
    codeCoverage.maturityModel = qualityModel;
    
    const staticAnalysis = new Measurement();
    staticAnalysis.name = 'Has static code analysis';
    staticAnalysis.description = 'Static code analysis tools must be configured and used';
    staticAnalysis.evidenceType = EvidenceType.URL;
    staticAnalysis.sampleEvidence = 'https://sonar.example.com/dashboard';
    staticAnalysis.maturityModel = qualityModel;
    
    const allMeasurements = [
      centrLogging,
      infraMetrics,
      autoPipeline,
      autoTest,
      secScanning,
      secAuth,
      dataEncryption,
      codeReviews,
      codeCoverage,
      staticAnalysis
    ];
    
    await measurementRepository.save(allMeasurements);
    console.log('Measurements created');
    
    // Create maturity levels for each model
    const modelMaturityLevels = [];
    
    for (const model of [operationalExcellenceModel, securityModel, qualityModel]) {
      const level0 = new MaturityLevel();
      level0.level = 0;
      level0.name = 'Level 0';
      level0.description = 'Initial level, less than 25% implemented';
      level0.minPercentage = 0;
      level0.maxPercentage = 24.99;
      level0.maturityModel = model;
      modelMaturityLevels.push(level0);
      
      const level1 = new MaturityLevel();
      level1.level = 1;
      level1.name = 'Level 1';
      level1.description = 'Basic level, 25% to 49% implemented';
      level1.minPercentage = 25;
      level1.maxPercentage = 49.99;
      level1.maturityModel = model;
      modelMaturityLevels.push(level1);
      
      const level2 = new MaturityLevel();
      level2.level = 2;
      level2.name = 'Level 2';
      level2.description = 'Intermediate level, 50% to 74% implemented';
      level2.minPercentage = 50;
      level2.maxPercentage = 74.99;
      level2.maturityModel = model;
      modelMaturityLevels.push(level2);
      
      const level3 = new MaturityLevel();
      level3.level = 3;
      level3.name = 'Level 3';
      level3.description = 'Advanced level, 75% to 99% implemented';
      level3.minPercentage = 75;
      level3.maxPercentage = 99.99;
      level3.maturityModel = model;
      modelMaturityLevels.push(level3);
      
      const level4 = new MaturityLevel();
      level4.level = 4;
      level4.name = 'Level 4';
      level4.description = 'Optimized level, 100% implemented';
      level4.minPercentage = 100;
      level4.maxPercentage = 100;
      level4.maturityModel = model;
      modelMaturityLevels.push(level4);
    }
    
    await levelRepository.save(modelMaturityLevels);
    console.log('Maturity levels created');
    
    // Create journeys
    const userJourney = new Journey();
    userJourney.name = 'User Registration';
    userJourney.owner = 'Customer Experience Team';
    userJourney.description = 'End-to-end user registration process';
    userJourney.dependencyGraph = JSON.stringify({
      nodes: [
        { id: 'signup', name: 'Sign Up' },
        { id: 'email', name: 'Email Verification' },
        { id: 'profile', name: 'Profile Setup' }
      ],
      edges: [
        { source: 'signup', target: 'email' },
        { source: 'email', target: 'profile' }
      ]
    });
    
    const shoppingJourney = new Journey();
    shoppingJourney.name = 'Shopping Experience';
    shoppingJourney.owner = 'Product Team';
    shoppingJourney.description = 'End-to-end shopping experience from discovery to checkout';
    shoppingJourney.dependencyGraph = JSON.stringify({
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
    });
    
    await journeyRepository.save([userJourney, shoppingJourney]);
    console.log('Journeys created');
    
    // Create activities
    const userManagementActivity = new Activity();
    userManagementActivity.name = 'User Management';
    userManagementActivity.owner = 'Identity Team';
    userManagementActivity.description = 'Manage user accounts and authentication';
    userManagementActivity.journey = userJourney;
    
    const emailVerificationActivity = new Activity();
    emailVerificationActivity.name = 'Email Verification';
    emailVerificationActivity.owner = 'Messaging Team';
    emailVerificationActivity.description = 'Handle email verification for new accounts';
    emailVerificationActivity.journey = userJourney;
    
    const productBrowsingActivity = new Activity();
    productBrowsingActivity.name = 'Product Browsing';
    productBrowsingActivity.owner = 'Frontend Team';
    productBrowsingActivity.description = 'Allow users to browse and search products';
    productBrowsingActivity.journey = shoppingJourney;
    
    const checkoutActivity = new Activity();
    checkoutActivity.name = 'Checkout Process';
    checkoutActivity.owner = 'Payments Team';
    checkoutActivity.description = 'Handle the checkout and payment process';
    checkoutActivity.journey = shoppingJourney;
    
    await activityRepository.save([
      userManagementActivity, 
      emailVerificationActivity,
      productBrowsingActivity,
      checkoutActivity
    ]);
    console.log('Activities created');
    
    // Create services
    const authService = new Service();
    authService.name = 'User Authentication Service';
    authService.owner = 'Identity Team';
    authService.description = 'Handles user authentication and authorization';
    authService.serviceType = ServiceType.API_SERVICE;
    authService.resourceLocation = 'https://github.com/example/auth-service';
    authService.activity = userManagementActivity;
    
    const profileService = new Service();
    profileService.name = 'User Profile Service';
    profileService.owner = 'Identity Team';
    profileService.description = 'Manages user profile data';
    profileService.serviceType = ServiceType.API_SERVICE;
    profileService.resourceLocation = 'https://github.com/example/profile-service';
    profileService.activity = userManagementActivity;
    
    const emailService = new Service();
    emailService.name = 'Email Service';
    emailService.owner = 'Messaging Team';
    emailService.description = 'Handles sending and tracking emails';
    emailService.serviceType = ServiceType.API_SERVICE;
    emailService.resourceLocation = 'https://github.com/example/email-service';
    emailService.activity = emailVerificationActivity;
    
    const productCatalogUI = new Service();
    productCatalogUI.name = 'Product Catalog UI';
    productCatalogUI.owner = 'Frontend Team';
    productCatalogUI.description = 'User interface for browsing products';
    productCatalogUI.serviceType = ServiceType.UI_APPLICATION;
    productCatalogUI.resourceLocation = 'https://github.com/example/product-ui';
    productCatalogUI.activity = productBrowsingActivity;
    
    const productSearchService = new Service();
    productSearchService.name = 'Product Search Service';
    productSearchService.owner = 'Backend Team';
    productSearchService.description = 'API for searching and filtering products';
    productSearchService.serviceType = ServiceType.API_SERVICE;
    productSearchService.resourceLocation = 'https://github.com/example/search-service';
    productSearchService.activity = productBrowsingActivity;
    
    const checkoutService = new Service();
    checkoutService.name = 'Checkout Service';
    checkoutService.owner = 'Payments Team';
    checkoutService.description = 'Handles the checkout process';
    checkoutService.serviceType = ServiceType.API_SERVICE;
    checkoutService.resourceLocation = 'https://github.com/example/checkout-service';
    checkoutService.activity = checkoutActivity;
    
    const paymentService = new Service();
    paymentService.name = 'Payment Processing Service';
    paymentService.owner = 'Payments Team';
    paymentService.description = 'Processes payment transactions';
    paymentService.serviceType = ServiceType.API_SERVICE;
    paymentService.resourceLocation = 'https://github.com/example/payment-service';
    paymentService.activity = checkoutActivity;
    
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
    
    const q1OpsExCampaign = new Campaign();
    q1OpsExCampaign.name = `Q1 ${now.getFullYear()} Operational Excellence Assessment`;
    q1OpsExCampaign.description = 'Quarterly assessment of operational excellence across all services';
    q1OpsExCampaign.startDate = startOfYear;
    q1OpsExCampaign.endDate = endOfQ1;
    q1OpsExCampaign.maturityModel = operationalExcellenceModel;
    
    const securityCampaign = new Campaign();
    securityCampaign.name = `Annual Security Assessment ${now.getFullYear()}`;
    securityCampaign.description = 'Annual security assessment for all services';
    securityCampaign.startDate = startOfYear;
    securityCampaign.endDate = nextYearEnd; // Use a future date instead of null
    securityCampaign.maturityModel = securityModel;
    
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
