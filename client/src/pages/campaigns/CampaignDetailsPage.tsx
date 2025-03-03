
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
  useToast,
  Spinner,
  Alert,
  AlertIcon
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
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      
      try {
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
        console.error('Error fetching campaign data:', error);
        setError('Failed to load campaign details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading campaign details...</Text>
      </Box>
    );
  }
  
  if (error || !campaign || !maturityModel || !results) {
    return (
      <Box p={4}>
        <Flex align="center" mb={4}>
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
        
        <Alert status="error">
          <AlertIcon />
          {error || "Couldn't load campaign details. Please try again."}
        </Alert>
        
        <Button mt={4} onClick={() => window.location.reload()}>
          Retry
        </Button>
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
                  <StatNumber>{results.overallPercentage.toFixed(1)}%</StatNumber>
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
