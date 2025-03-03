// client/src/pages/details/ActivityDetailsPage.tsx

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
  Divider,
  Spinner,
  Alert,
  AlertIcon
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
  const [error, setError] = useState<string | null>(null);
  
  const { hasRole } = useAuth();
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!id) {
          throw new Error('Activity ID is missing');
        }
        
        // Fetch main activity data
        const activityRes = await api.get<Activity>(`/activities/${id}`);
        setActivity(activityRes.data);
        
        // Fetch activity services
        const servicesRes = await api.get<Service[]>(`/activities/${id}/services`);
        setServices(servicesRes.data);
        
        // Fetch journey if it exists
        try {
          const journeyRes = await api.get<Journey>(`/activities/${id}/journey`);
          setJourney(journeyRes.data);
        } catch (journeyError) {
          // It's okay if the activity doesn't have a journey
          console.log('No journey found for this activity');
          setJourney(null);
        }
        
        // Fetch maturity summaries
        const summariesRes = await api.get<MaturitySummary[]>(`/activities/${id}/maturity-summaries`);
        setMaturitySummaries(summariesRes.data);
        
      } catch (error: any) {
        console.error('Error fetching activity data:', error);
        setError(error.response?.data?.message || 'Failed to load activity details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
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
  
  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading activity details...</Text>
      </Box>
    );
  }
  
  if (error || !activity) {
    return (
      <Box>
        <Flex align="center" mb={4}>
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
        
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error || "Failed to load activity details"}
        </Alert>
        
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }
  
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
              as={RouterLink}
              to={`/activities/edit/${activity.id}`}
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
                    <Text fontSize="sm">{summary.percentage.toFixed(1)}% Complete</Text>
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
              as={RouterLink}
              to={`/services/new?activityId=${activity.id}`}
            >
              Add Service
            </Button>
          )}
        </Flex>
        
        <Divider />
        
        <Box p={6}>
          {services.length > 0 ? (
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
              </Tbody>
            </Table>
          ) : (
            <Box textAlign="center" py={4}>
              <Text>No services assigned to this activity</Text>
              {isEditor && (
                <Button
                  mt={4}
                  size="sm"
                  colorScheme="blue"
                  as={RouterLink}
                  to={`/services/new?activityId=${activity.id}`}
                >
                  Add First Service
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ActivityDetailsPage;
