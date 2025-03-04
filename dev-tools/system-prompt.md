Create a react app using typescript to manage one or more Maturity Models for a catalog of Service, Activity and Journey. 

# Overview
Below are the high-level concepts and their relationships
- Maturity Models define one or more Measurements
- Measurements can be evaluated based on Evidence
- Service participates in one or more evaluations of Maturity Models
- Service is evaluated for a Maturity Model based on the Evidence provided for every Measurement as required by Maturity Model
- Measurement Evaluation results are aggregated to arrive at a Maturity Level for a Maturity Model for the participating Service
- Services can be grouped into Activity representing their dependencies and sequencing
- Activity can be grouped into Journey representing their dependencies and sequencing
- Maturity Levels identified for Services can be rolled up to arrive at Maturity Levels for Activity and Journey 
- Multiple Maturity Models can exist, available in a Catalog, each represent a specific functional domain
- Multiple Service, Activity and Journey can exist, available in a Catalog, representing their associations, dependencies and sequencing

Below are more details of the concepts expressed above.

# Journey
Represents a business function which is composed of multiple Activities. Journey typically sequences one or more Activities indicating their dependencies. Each Journey should have the below 
- Name
- Owner
- Description 
- Dependency graph of Activities

# Activity
Represents a specific business function which is implemented by one or more Services. Activity typically sequences one or more Services indicating their dependencies. Each Activity should have the below 
- Name
- Owner
- Description 
- Dependency graph of Services

# Service
Represents an implementation of a business functionality. Each Service should have the below
- Name
- Owner
- Description 
- Service Type
   - API Service
   - UI Application
   - Workflow
   - Application Module
- Resource Location

Each Service can participate in one or more Maturity Models. Evaluation of measurements pertaining to each of these Maturity Models should be associated with the Service.

# Maturity Model
Represents a list of measurements describing the Maturity Model. Each Maturity Model will have 
- Name
- Owner
- Description 
- List of Measurements

Each Maturity Model can be applied on one or more Services. The Evaluation of measurements result in a Maturity Level for each Service based on evaluation rules mentioned below under Maturity Level Evaluation Rules header

# Measurement
Represents a request for evidence for a well-defined and specific measurable fact. For example, evidence can provide location of existence of a process, image, document or a url resource. Each Measurement will have 
- Name
- Description
- Evidence
   - Type [URL, Document, Image, Text]
   - Location
- Sample Evidence

# Measurement Evaluation
There must be a mechanism to validate the Evidence provided. Based on the validity of the Evidence provided, the measurement should be marked as either 
- Not Implemented
- Evidence Submitted
- Validating Evidence
- Evidence Rejected
- Implemented 

Implemented is the only satisfactory end state while all other states are intermediate states.
The specific methods used to do the actual Evaluation can be varied and is specific to the type of Evidence and the specific Measurement. 
There must be a way to allow for multiple evaluation methods allowed by the system.

# Maturity Level
Based on the Measurement Evaluation, the Service participating in the Maturity Model evaluation will be rated at one of the below Maturity Level.
- Level 0 
- Level 1
- Level 2
- Level 3
- Level 4

There must be a way to allow for adding or removing Maturity Levels for each Maturity Model by the system.
The rules for rating the Maturity Levels are listed in the section Maturity Level Rating Rules.

# Maturity Level Rating Rules
Rules for Rating the Maturity Level of a Service participating in a Maturity Model evaluation can be like below. Only satisfactory states of Measurement Evaluation like "Implemented" are considered in aggregate across all the Measurements of the Maturity Model to count the percentages. 
Below is an example of the Maturity Level Rating Rules
- Level 4 when 100% of Measurement Evaluations are Implemented
- Level 3 from 75% to 99% 
- Level 2 from 50% to 74% 
- Level 1 from 25% to 49% 
- Level 0 less than 25%

There must be a way to allow for modifying these rules of Maturity Level Rating for each Maturity Model by the system

# Example
Below is an illustrative example 
- there exists a Maturity Model Model1 with name "Operational Excellence Maturity Model" 
- Model1 maturity model defines two measurements M1 with name "Has centralized logging" and M2 with name "Has infrastructure metrics published"
- there exists Services S1 and S2 that are part of Activity A1 and A2 respectively
- there exists Journey J1 which uses Activities A1 and A2 
- Services S1 and S2 participate in evaluation for Maturity Model Model1 
- S1 is rated as Level 2 as M1 is Implemented and M2 is Evidence Rejected
- S2 is rated as Level 4 as both M1 and M2 are Implemented
- Rolling up the Maturity Rating, A1 is at Level 2 and A2 is at Level 4
- Rolling up the Maturity Rating, J1 is at Level 2 as it is the least of the ratings of its activities


Below are the system requirements pertaining to users of the system

# User Roles
Provide an ability for the React application to allow users with 3 roles. 
- Admin
   - Will be allowed to 
       - create Maturity Models with Measurements in Catalog
       - create Rating Rules 
       - create Services in Catalog
       - compose Activities with Services in Catalog
       - compose Journeys with Activities in Catalog
       - compose Maturity Model Evaluations by adding participating Services
       - compose Campaigns to execute Maturity Model Evaluations
       - view Catalog
       - view Campaign Evaluation Results
- Editor
   - Will be allowed to 
       - create Services in Catalog
       - compose Activities with Services in Catalog
       - compose Journeys with Activities in Catalog
       - compose Maturity Model Evaluations by adding participating Services
       - compose Campaigns to execute Maturity Model Evaluations
       - view Catalog
       - view Campaign Evaluation Results
- Viewer
   - Will be allowed to 
       - view Catalog
       - view Campaign Evaluation Results

Specific application requirements are listed below
# Application Requirements
- The generated React app should have a backend and a frontend module
- Use best practices for both frontend and backend development
- Use SQLite local database for all persistence. 
- Include an Admin dashboard to manage users and roles. 
- Include a fantastic user-friendly interface for the Catalog to easily list and search for Maturity Models, Services, Activities and Journeys. 
- Provide Admins the ability to create Campaign for a Maturity Model
- Provide Admins and Editors the ability to register their Services for the Campaign
- Provide Admins and Editors the ability to provide Evidence for Service Evaluations in a Campaign
- Include a dashboard for the Campaign with Services, Activity and Journey to show the Levels in different visualizations


Below is a follow up requirement

# Evaluation
Add an ability to manage and view the lifecycle of an Evaluation. 
- The system should provide an ability to track the history of Evaluation changes including state changes both in backend and frontend. 
- Evaluation Status should be only editable by Admin. 
- The system should provide an backend process which triggers when state changes to run checks to evaluate the validity of the evidence provided.
- The system should provide a few standard Evidence Evaluators which can 
    - check if a URL is valid
    - check if the provided URL resource contains some content
    - checks if notes provided are of good quality