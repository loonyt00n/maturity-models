import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Link,
  useColorModeValue,
  Divider,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiCalendar, FiUsers, FiLayers, FiArrowLeft } from 'react-icons/fi';
import api from '../../api/api';
import { 
  Campaign, 
  MaturityModel, 
  Service, 
  JourneyMaturityResult, 
  ActivityMaturityResult,
  ServiceMaturityResult,
  EvidenceType 
} from '../../models';
import CampaignOverviewTab from './CampaignOverviewTab';
import CampaignServicesTab from './CampaignServicesTab';
import CampaignActivitiesTab from './CampaignActivitiesTab';
import CampaignJourneysTab from './CampaignJourneysTab';

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [maturityModel, setMaturityModel] = useState<MaturityModel | null>(null);
  const [results, setResults] = useState<{
    journeyResults: JourneyMaturityResult[];
    activityResults: ActivityMaturityResult[];
    serviceResults: ServiceMaturityResult[];
    overallLevel: number;
    overallPercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be actual API endpoints
        const [campaignRes, resultsRes] = await Promise.all([
          api.get<{ campaign: Campaign; maturityModel: MaturityModel }>(`/campaigns/${id}`),
          api.get<{
            journeyResults: JourneyMaturityResult[];
            activityResults: ActivityMaturityResult[];
            serviceResults: ServiceMaturityResult[];
            overallLevel: number;
            overallPercentage: number;
          }>(`/campaigns/${id}/results`)
        ]);
        
        setCampaign(campaignRes.data.campaign);
        setMaturityModel(campaignRes.data.maturityModel);
        setResults(resultsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data for the prototype
        setCampaign({
          id: '1',
          name: 'Q1 2023 Operational Excellence Assessment',
          description: 'Quarterly assessment of operational excellence across all services',
          startDate: '2023-01-01',
          endDate: '2023-03-31',
          maturityModelId: '1',
          createdAt: '2022-12-15',
          updatedAt: '2023-01-01'
        });
        
        setMaturityModel({
          id: '1',
          name: 'Operational Excellence Maturity Model',
          owner: 'Administrator',
          description: 'A model to assess operational excellence capabilities',
          measurements: [
            {
              id: '1',
              name: 'Has centralized logging',
              description: 'The service must implement centralized logging for all components',
              evidenceType: EvidenceType.URL,
              sampleEvidence: 'https://logs.example.com/dashboard',
              maturityModelId: '1'
            },
            {
              id: '2',
              name: 'Has infrastructure metrics published',
              description: 'The service must publish infrastructure metrics to central monitoring',
              evidenceType: EvidenceType.URL,
              sampleEvidence: 'https://metrics.example.com/dashboard',
              maturityModelId: '1'
            }
          ],
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01'
        });
        
        // Mock results data
        setResults({
          journeyResults: [
            {
              journeyId: '1',
              journeyName: 'User Registration',
              maturityLevel: 2,
              activityResults: [
                {
                  activityId: '1',
                  activityName: 'User Management',
                  maturityLevel: 2,
                  serviceResults: [
                    {
                      serviceId: '1',
                      serviceName: 'User Authentication Service',
                      maturityLevel: 2,
                      percentage: 50
                    }
                  ]
                }
              ]
            },
            {
              journeyId: '2',
              journeyName: 'Shopping Experience',
              maturityLevel: 3,
              activityResults: [
                {
                  activityId: '2',
                  activityName: 'Product Browsing',
                  maturityLevel: 3,
                  serviceResults: [
                    {
                      serviceId: '2',
                      serviceName: 'Product Catalog UI',
                      maturityLevel: 3,
                      percentage: 75
                    }
                  ]
                }
              ]
            }
          ],
          activityResults: [
            {
              activityId: '1',
              activityName: 'User Management',
              maturityLevel: 2,
              serviceResults: [
                {
                  serviceId: '1',
                  serviceName: 'User Authentication Service',
                  maturityLevel: 2,
                  percentage: 50
                }
              ]
            },
            {
              activityId: '2',
              activityName: 'Product Browsing',
              maturityLevel: 3,
              serviceResults: [
                {
                  serviceId: '2',
                  serviceName: 'Product Catalog UI',
                  maturityLevel: 3,
                  percentage: 75
                }
              ]
            }
          ],
          serviceResults: [
            {
              serviceId: '1',
              serviceName: 'User Authentication Service',
              maturityLevel: 2,
              percentage: 50
            },
            {
              serviceId: '2',
              serviceName: 'Product Catalog UI',
              maturityLevel: 3,
              percentage: 75
            }
          ],
          overallLevel: 2,
          overallPercentage: 65
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading || !campaign || !maturityModel || !results) {
    return (
      <Box p={4}>
        <Text>Loading campaign details...</Text>
      </Box>
    );
  }
  
  const getMaturityLevelColor = (level: number) => {
    const colors = {
      0: 'red',
      1: 'orange',
      2: 'yellow',
      3: 'blue',
      4: 'green'
    };
    return colors[level as keyof typeof colors] || 'gray';
  };
  
  const getStatusBadge = () => {
    const today = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
    
    if (startDate > today) {
      return <Badge colorScheme="purple">Upcoming</Badge>;
    } else if (endDate && endDate < today) {
      return <Badge colorScheme="gray">Completed</Badge>;
    } else {
      return <Badge colorScheme="green">Active</Badge>;
    }
  };
  
  return (
    <Box>
      <Flex align="center" mb={2}>
        <Button
          as={RouterLink}
          to="/campaigns"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="sm"
        >
          Back to Campaigns
        </Button>
      </Flex>
      
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        shadow="md"
        mb={6}
      >
        <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
          <GridItem>
            <Heading size="lg" mb={2}>{campaign.name}</Heading>
            <Text color="gray.500" mb={4}>{campaign.description}</Text>
            
            <Flex wrap="wrap" gap={4} mb={4}>
              <Flex align="center">
                <FiCalendar style={{ marginRight: '8px' }} />
                <Text>
                  {new Date(campaign.startDate).toLocaleDateString()} - 
                  {campaign.endDate 
                    ? new Date(campaign.endDate).toLocaleDateString()
                    : ' Ongoing'}
                </Text>
              </Flex>
              
              <Flex align="center">
                <FiLayers style={{ marginRight: '8px' }} />
                <Link as={RouterLink} to={`/maturity-models/${maturityModel.id}`}>
                  {maturityModel.name}
                </Link>
              </Flex>
              
              <Flex align="center">
                <FiUsers style={{ marginRight: '8px' }} />
                <Text>{results.serviceResults.length} Services</Text>
              </Flex>
              
              {getStatusBadge()}
            </Flex>
          </GridItem>
          
          <GridItem>
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              borderColor={borderColor}
            >
              <Heading size="md" mb={4}>Overall Maturity</Heading>
              
              <Stat mb={4}>
                <StatLabel>Maturity Level</StatLabel>
                <Flex align="center">
                  <Badge 
                    colorScheme={getMaturityLevelColor(results.overallLevel)}
                    fontSize="2xl"
                    px={2}
                    py={1}
                    mr={2}
                  >
                    Level {results.overallLevel}
                  </Badge>
                  <StatNumber>{results.overallPercentage}%</StatNumber>
                </Flex>
                <StatHelpText>
                  {results.serviceResults.length} Services Evaluated
                </StatHelpText>
              </Stat>
              
              <Progress 
                value={results.overallPercentage} 
                colorScheme={getMaturityLevelColor(results.overallLevel)}
                size="lg"
                borderRadius="md"
              />
            </Box>
          </GridItem>
        </Grid>
      </Box>
      
      <Box
        bg={bgColor}
        borderRadius="lg"
        shadow="md"
      >
        <Tabs colorScheme="blue">
          <TabList px={4} pt={4}>
            <Tab>Overview</Tab>
            <Tab>Services ({results.serviceResults.length})</Tab>
            <Tab>Activities ({results.activityResults.length})</Tab>
            <Tab>Journeys ({results.journeyResults.length})</Tab>
          </TabList>
          
          <Divider />
          
          <TabPanels>
            <TabPanel>
              <CampaignOverviewTab 
                campaign={campaign}
                maturityModel={maturityModel}
                results={results}
                getMaturityLevelColor={getMaturityLevelColor}
              />
            </TabPanel>
            
            <TabPanel>
              <CampaignServicesTab 
                serviceResults={results.serviceResults}
                getMaturityLevelColor={getMaturityLevelColor}
              />
            </TabPanel>
            
            <TabPanel>
              <CampaignActivitiesTab 
                activityResults={results.activityResults}
                getMaturityLevelColor={getMaturityLevelColor}
              />
            </TabPanel>
            
            <TabPanel>
              <CampaignJourneysTab 
                journeyResults={results.journeyResults}
                getMaturityLevelColor={getMaturityLevelColor}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default CampaignDetailsPage;

