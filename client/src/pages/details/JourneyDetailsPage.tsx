import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  SimpleGrid,
  Progress,
  Link,
  useColorModeValue,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { Journey, Activity, Service, ServiceType } from '../../models';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

interface MaturitySummary {
  maturityModelId: string;
  maturityModelName: string;
  maturityLevel: number;
  percentage: number;
}

interface ActivityWithServices extends Activity {
  services: Service[];
}

const JourneyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [activities, setActivities] = useState<ActivityWithServices[]>([]);
  const [maturitySummaries, setMaturitySummaries] = useState<MaturitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { hasRole } = useAuth();
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be actual API endpoints
        const [journeyRes, activitiesRes, summariesRes] = await Promise.all([
          api.get<Journey>(`/journeys/${id}`),
          api.get<ActivityWithServices[]>(`/journeys/${id}/activities`),
          api.get<MaturitySummary[]>(`/journeys/${id}/maturity-summaries`)
        ]);
        
        setJourney(journeyRes.data);
        setActivities(activitiesRes.data);
        setMaturitySummaries(summariesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data for the prototype
        setJourney({
          id: '1',
          name: 'User Registration',
          owner: 'Customer Experience Team',
          description: 'End-to-end user registration process',
          activities: [],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        });
        
        setActivities([
          {
            id: '1',
            name: 'User Management',
            owner: 'Identity Team',
            description: 'Manage user accounts and authentication',
            journeyId: '1',
            services: [
              {
                id: '1',
                name: 'User Authentication Service',
                owner: 'Identity Team',
                description: 'Handles user authentication and authorization',
                serviceType: ServiceType.API_SERVICE,
                resourceLocation: 'https://github.com/example/auth-service',
                activityId: '1',
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z'
              },
              {
                id: '3',
                name: 'User Profile Service',
                owner: 'Identity Team',
                description: 'Manages user profile data',
                serviceType: ServiceType.API_SERVICE,
                resourceLocation: 'https://github.com/example/profile-service',
                activityId: '1',
                createdAt: '2023-01-05T00:00:00.000Z',
                updatedAt: '2023-01-05T00:00:00.000Z'
              }
            ],
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          },
          {
            id: '4',
            name: 'Email Verification',
            owner: 'Messaging Team',
            description: 'Handle email verification for new accounts',
            journeyId: '1',
            services: [
              {
                id: '5',
                name: 'Email Service',
                owner: 'Messaging Team',
                description: 'Handles sending and tracking emails',
                serviceType: ServiceType.API_SERVICE,
                resourceLocation: 'https://github.com/example/email-service',
                activityId: '4',
                createdAt: '2023-01-07T00:00:00.000Z',
                updatedAt: '2023-01-07T00:00:00.000Z'
              }
            ],
            createdAt: '2023-01-07T00:00:00.000Z',
            updatedAt: '2023-01-07T00:00:00.000Z'
          }
        ]);
        
        setMaturitySummaries([
          {
            maturityModelId: '1',
            maturityModelName: 'Operational Excellence Maturity Model',
            maturityLevel: 2,
            percentage: 65
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading || !journey) {
    return (
      <Box p={4}>
        <Text>Loading journey details...</Text>
      </Box>
    );
  }
  
  const getServiceTypeBadge = (type: ServiceType) => {
    const colorSchemes = {
      [ServiceType.API_SERVICE]: 'green',
      [ServiceType.UI_APPLICATION]: 'blue',
      [ServiceType.WORKFLOW]: 'purple',
      [ServiceType.APPLICATION_MODULE]: 'orange'
    };
    
    return (
      <Badge colorScheme={colorSchemes[type]}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };
  
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
  
  return (
    <Box>
      <Flex align="center" mb={2}>
        <Button
          as={RouterLink}
          to="/journeys"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="sm"
        >
          Back to Journeys
        </Button>
      </Flex>
      
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        shadow="md"
        mb={6}
      >
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Heading size="lg" mb={2}>{journey.name}</Heading>
            <Text color="gray.500" mb={4}>{journey.description}</Text>
            
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" mr={2}>Owner:</Text>
              <Text>{journey.owner}</Text>
            </Flex>
            
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" mr={2}>Activities:</Text>
              <Text>{activities.length}</Text>
            </Flex>
            
            <Flex align="center">
              <Text fontWeight="bold" mr={2}>Last Updated:</Text>
              <Text>{new Date(journey.updatedAt).toLocaleDateString()}</Text>
            </Flex>
          </Box>
          
          {isEditor && (
            <Button
              leftIcon={<FiEdit2 />}
              colorScheme="blue"
              variant="outline"
            >
              Edit Journey
            </Button>
          )}
        </Flex>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6} mb={6}>
        <Box
          bg={bgColor}
          p={4}
          shadow="md"
          borderRadius="lg"
        >
          <Heading size="md" mb={4}>Maturity Assessment</Heading>
          
          {maturitySummaries.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {maturitySummaries.map((summary) => (
                <Box 
                  key={summary.maturityModelId}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                >
                  <Text fontWeight="medium" mb={1}>
                    {summary.maturityModelName}
                  </Text>
                  
                  <Flex align="center" mb={2}>
                    <Badge 
                      colorScheme={getMaturityLevelColor(summary.maturityLevel)}
                      mr={2}
                    >
                      Level {summary.maturityLevel}
                    </Badge>
                    <Text fontSize="sm">{summary.percentage}% Complete</Text>
                  </Flex>
                  
                  <Progress 
                    value={summary.percentage} 
                    size="xs" 
                    colorScheme={getMaturityLevelColor(summary.maturityLevel)}
                  />
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text>No maturity assessments available</Text>
          )}
        </Box>
      </SimpleGrid>
      
      <Box
        bg={bgColor}
        borderRadius="lg"
        shadow="md"
      >
        <Flex px={6} py={4} justify="space-between" align="center">
          <Heading size="md">Activities & Services</Heading>
          
          {isEditor && (
            <Button
              colorScheme="blue"
              size="sm"
            >
              Add Activity
            </Button>
          )}
        </Flex>
        
        <Divider />
        
        <Box p={6}>
          <Accordion allowMultiple>
            {activities.map((activity) => (
              <AccordionItem key={activity.id}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Text fontWeight="bold">{activity.name}</Text>
                    </Box>
                    <Text mr={2} color="gray.500">
                      {activity.services.length} Services
                    </Text>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Box mb={4}>
                    <Text mb={2}>{activity.description}</Text>
                    <Text fontWeight="bold" mb={1}>Owner: {activity.owner}</Text>
                    <Link 
                      as={RouterLink} 
                      to={`/activities/${activity.id}`}
                      color="blue.500"
                    >
                      View Activity Details
                    </Link>
                  </Box>
                  
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Service</Th>
                        <Th>Type</Th>
                        <Th>Owner</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {activity.services.map((service) => (
                        <Tr key={service.id}>
                          <Td>{service.name}</Td>
                          <Td>{getServiceTypeBadge(service.serviceType)}</Td>
                          <Td>{service.owner}</Td>
                          <Td>
                            <Button
                              as={RouterLink}
                              to={`/services/${service.id}`}
                              size="xs"
                              colorScheme="blue"
                              variant="outline"
                            >
                              View Service
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                      
                      {activity.services.length === 0 && (
                        <Tr>
                          <Td colSpan={4} textAlign="center">
                            No services assigned to this activity
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </AccordionPanel>
              </AccordionItem>
            ))}
            
            {activities.length === 0 && (
              <Box p={4} textAlign="center">
                <Text>No activities assigned to this journey</Text>
              </Box>
            )}
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

export default JourneyDetailsPage;
