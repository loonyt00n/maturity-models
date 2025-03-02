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
  Stat,
  StatLabel,
  StatNumber,
  Progress,
  Link,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { Activity, Service, ServiceType, Journey } from '../../models';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

interface MaturitySummary {
  maturityModelId: string;
  maturityModelName: string;
  maturityLevel: number;
  percentage: number;
}

const ActivityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [journey, setJourney] = useState<Journey | null>(null);
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
        const [activityRes, servicesRes, journeyRes, summariesRes] = await Promise.all([
          api.get<Activity>(`/activities/${id}`),
          api.get<Service[]>(`/activities/${id}/services`),
          api.get<Journey | null>(`/activities/${id}/journey`),
          api.get<MaturitySummary[]>(`/activities/${id}/maturity-summaries`)
        ]);
        
        setActivity(activityRes.data);
        setServices(servicesRes.data);
        setJourney(journeyRes.data);
        setMaturitySummaries(summariesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data for the prototype
        setActivity({
          id: '1',
          name: 'User Management',
          owner: 'Identity Team',
          description: 'Manage user accounts and authentication',
          services: [],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        });
        
        setServices([
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
        ]);
        
        setJourney({
          id: '1',
          name: 'User Registration',
          owner: 'Customer Experience Team',
          description: 'End-to-end user registration process',
          activities: [],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        });
        
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
  
  if (loading || !activity) {
    return (
      <Box p={4}>
        <Text>Loading activity details...</Text>
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
          to="/activities"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="sm"
        >
          Back to Activities
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
            <Heading size="lg" mb={2}>{activity.name}</Heading>
            <Text color="gray.500" mb={4}>{activity.description}</Text>
            
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" mr={2}>Owner:</Text>
              <Text>{activity.owner}</Text>
            </Flex>
            
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" mr={2}>Services:</Text>
              <Text>{services.length}</Text>
            </Flex>
            
            <Flex align="center">
              <Text fontWeight="bold" mr={2}>Last Updated:</Text>
              <Text>{new Date(activity.updatedAt).toLocaleDateString()}</Text>
            </Flex>
          </Box>
          
          {isEditor && (
            <Button
              leftIcon={<FiEdit2 />}
              colorScheme="blue"
              variant="outline"
            >
              Edit Activity
            </Button>
          )}
        </Flex>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Box
          bg={bgColor}
          p={4}
          shadow="md"
          borderRadius="lg"
        >
          <Heading size="md" mb={4}>Journey</Heading>
          
          {journey ? (
            <Box>
              <Text fontWeight="medium" mb={2}>{journey.name}</Text>
              <Text fontSize="sm" mb={3}>{journey.description}</Text>
              <Link 
                as={RouterLink} 
                to={`/journeys/${journey.id}`}
                color="blue.500"
              >
                View Journey Details
              </Link>
            </Box>
          ) : (
            <Text>This activity is not assigned to any journey</Text>
          )}
        </Box>
        
        <Box
          bg={bgColor}
          p={4}
          shadow="md"
          borderRadius="lg"
        >
          <Heading size="md" mb={4}>Maturity Assessment</Heading>
          
          {maturitySummaries.length > 0 ? (
            <SimpleGrid columns={1} spacing={4}>
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
          <Heading size="md">Services ({services.length})</Heading>
          
          {isEditor && (
            <Button
              colorScheme="blue"
              size="sm"
            >
              Add Service
            </Button>
          )}
        </Flex>
        
        <Divider />
        
        <Box p={6}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Owner</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {services.map((service) => (
                <Tr key={service.id}>
                  <Td fontWeight="medium">{service.name}</Td>
                  <Td>{getServiceTypeBadge(service.serviceType)}</Td>
                  <Td>{service.owner}</Td>
                  <Td>
                    <Button
                      as={RouterLink}
                      to={`/services/${service.id}`}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                    >
                      View Service
                    </Button>
                  </Td>
                </Tr>
              ))}
              
              {services.length === 0 && (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={4}>
                    No services assigned to this activity
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default ActivityDetailsPage;

