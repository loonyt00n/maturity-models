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
  StatHelpText,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Link,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiExternalLink } from 'react-icons/fi';
import api from '../../api/api';
import { Service, ServiceType, Campaign, MaturityModel, MeasurementEvaluation, EvaluationStatus } from '../../models';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

interface CampaignParticipation {
  campaign: Campaign;
  maturityModel: MaturityModel;
  maturityLevel: number;
  percentage: number;
  evaluations: MeasurementEvaluation[];
}

const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [campaignParticipations, setCampaignParticipations] = useState<CampaignParticipation[]>([]);
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
        const [serviceRes, participationsRes] = await Promise.all([
          api.get<Service>(`/services/${id}`),
          api.get<CampaignParticipation[]>(`/services/${id}/campaigns`)
        ]);
        
        setService(serviceRes.data);
        setCampaignParticipations(participationsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data for the prototype
        setService({
          id: '1',
          name: 'User Authentication Service',
          owner: 'Identity Team',
          description: 'Handles user authentication and authorization',
          serviceType: ServiceType.API_SERVICE,
          resourceLocation: 'https://github.com/example/auth-service',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        });
        
        setCampaignParticipations([
          {
            campaign: {
              id: '1',
              name: 'Q1 2023 Operational Excellence Assessment',
              description: 'Quarterly assessment of operational excellence across all services',
              startDate: '2023-01-01',
              endDate: '2023-03-31',
              maturityModelId: '1',
              createdAt: '2022-12-15T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z'
            },
            maturityModel: {
              id: '1',
              name: 'Operational Excellence Maturity Model',
              owner: 'Administrator',
              description: 'A model to assess operational excellence capabilities',
              measurements: [],
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z'
            },
            maturityLevel: 2,
            percentage: 65,
            evaluations: [
              {
                id: '1',
                measurementId: '1',
                serviceId: '1',
                campaignId: '1',
                status: EvaluationStatus.IMPLEMENTED,
                evidenceLocation: 'https://logs.example.com/service-1',
                notes: 'All components are sending logs to the central logging system',
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: '2023-01-20T00:00:00.000Z'
              },
              {
                id: '2',
                measurementId: '2',
                serviceId: '1',
                campaignId: '1',
                status: EvaluationStatus.EVIDENCE_REJECTED,
                evidenceLocation: 'https://metrics.example.com/service-1',
                notes: 'Only partial metrics are being published',
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: '2023-01-22T00:00:00.000Z'
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading || !service) {
    return (
      <Box p={4}>
        <Text>Loading service details...</Text>
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
  
  const getStatusBadge = (status: EvaluationStatus) => {
    const colorSchemes = {
      [EvaluationStatus.NOT_IMPLEMENTED]: 'red',
      [EvaluationStatus.EVIDENCE_SUBMITTED]: 'yellow',
      [EvaluationStatus.VALIDATING_EVIDENCE]: 'orange',
      [EvaluationStatus.EVIDENCE_REJECTED]: 'red',
      [EvaluationStatus.IMPLEMENTED]: 'green'
    };
    
    return (
      <Badge colorScheme={colorSchemes[status]}>
        {status.replace('_', ' ')}
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
          to="/services"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="sm"
        >
          Back to Services
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
            <Flex align="center" mb={2}>
              <Heading size="lg" mr={3}>{service.name}</Heading>
              {getServiceTypeBadge(service.serviceType)}
            </Flex>
            
            <Text color="gray.500" mb={4}>{service.description}</Text>
            
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" mr={2}>Owner:</Text>
              <Text>{service.owner}</Text>
            </Flex>
            
            {service.resourceLocation && (
              <Flex align="center" mb={2}>
                <Text fontWeight="bold" mr={2}>Resource:</Text>
                <Link href={service.resourceLocation} isExternal color="blue.500">
                  {service.resourceLocation} <FiExternalLink style={{ display: 'inline' }} />
                </Link>
              </Flex>
            )}
            
            <Flex align="center">
              <Text fontWeight="bold" mr={2}>Last Updated:</Text>
              <Text>{new Date(service.updatedAt).toLocaleDateString()}</Text>
            </Flex>
          </Box>
          
          {isEditor && (
            <Button
              leftIcon={<FiEdit2 />}
              colorScheme="blue"
              variant="outline"
            >
              Edit Service
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
          <Heading size="md" mb={4}>Activity</Heading>
          
          {service.activityId ? (
            <Link 
              as={RouterLink} 
              to={`/activities/${service.activityId}`}
              color="blue.500"
            >
              View Parent Activity
            </Link>
          ) : (
            <Text>This service is not assigned to any activity</Text>
          )}
        </Box>
        
        <Box
          bg={bgColor}
          p={4}
          shadow="md"
          borderRadius="lg"
        >
          <Heading size="md" mb={4}>Maturity Assessment</Heading>
          
          {campaignParticipations.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {campaignParticipations.slice(0, 1).map((participation) => (
                <Box 
                  key={participation.campaign.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                >
                  <Text fontWeight="medium" mb={1}>
                    {participation.maturityModel.name}
                  </Text>
                  
                  <Flex align="center" mb={2}>
                    <Badge 
                      colorScheme={getMaturityLevelColor(participation.maturityLevel)}
                      mr={2}
                    >
                      Level {participation.maturityLevel}
                    </Badge>
                    <Text fontSize="sm">{participation.percentage}% Complete</Text>
                  </Flex>
                  
                  <Progress 
                    value={participation.percentage} 
                    size="xs" 
                    colorScheme={getMaturityLevelColor(participation.maturityLevel)}
                    mb={2}
                  />
                  
                  <Link 
                    as={RouterLink} 
                    to={`/campaigns/${participation.campaign.id}`}
                    color="blue.500"
                    fontSize="sm"
                  >
                    View in {participation.campaign.name}
                  </Link>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text>This service has not participated in any maturity assessments</Text>
          )}
        </Box>
      </SimpleGrid>
      
      {campaignParticipations.length > 0 && (
        <Box
          bg={bgColor}
          borderRadius="lg"
          shadow="md"
        >
          <Tabs colorScheme="blue">
            <TabList px={4} pt={4}>
              <Tab>Campaign Participations ({campaignParticipations.length})</Tab>
            </TabList>
            
            <Divider mt={4} />
            
            <TabPanels>
              <TabPanel>
                <Heading size="md" mb={4}>Campaign Evaluations</Heading>
                
                {campaignParticipations.map((participation) => (
                  <Box 
                    key={participation.campaign.id}
                    mb={6}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={borderColor}
                  >
                    <Flex justify="space-between" align="center" mb={4}>
                      <Box>
                        <Heading size="sm">{participation.campaign.name}</Heading>
                        <Text fontSize="sm">{participation.maturityModel.name}</Text>
                      </Box>
                      
                      <Flex align="center">
                        <Badge 
                          colorScheme={getMaturityLevelColor(participation.maturityLevel)}
                          mr={3}
                          px={2}
                          py={1}
                        >
                          Level {participation.maturityLevel}
                        </Badge>
                        
                        <Link 
                          as={RouterLink} 
                          to={`/campaigns/${participation.campaign.id}`}
                        >
                          <Button size="sm" colorScheme="blue" variant="outline">
                            View Campaign
                          </Button>
                        </Link>
                      </Flex>
                    </Flex>
                    
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Measurement</Th>
                          <Th>Status</Th>
                          <Th>Evidence</Th>
                          <Th>Notes</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {participation.evaluations.map((evaluation) => (
                          <Tr key={evaluation.id}>
                            <Td fontWeight="medium">
                              {/* In a real app, this would show the measurement name */}
                              {evaluation.measurementId === '1' 
                                ? 'Has centralized logging' 
                                : 'Has infrastructure metrics published'}
                            </Td>
                            <Td>{getStatusBadge(evaluation.status)}</Td>
                            <Td>
                              {evaluation.evidenceLocation && (
                                <Link href={evaluation.evidenceLocation} isExternal color="blue.500">
                                  Evidence <FiExternalLink style={{ display: 'inline' }} />
                                </Link>
                              )}
                            </Td>
                            <Td>{evaluation.notes}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                ))}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Box>
  );
};

export default ServiceDetailsPage;

