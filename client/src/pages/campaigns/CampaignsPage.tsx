import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Link,
  Text,
  Flex,
  Heading,
  Progress,
  InputGroup,
  InputLeftElement,
  Input,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiPlus, FiSearch, FiRefreshCw, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import api from '../../api/api';
import { Campaign, MaturityModel } from '../../models';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [maturityModels, setMaturityModels] = useState<MaturityModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be actual API endpoints
        const [campaignsRes, modelsRes] = await Promise.all([
          api.get<Campaign[]>('/campaigns'),
          api.get<MaturityModel[]>('/maturity-models')
        ]);
        
        setCampaigns(campaignsRes.data);
        setMaturityModels(modelsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data for the prototype
        setCampaigns([
          {
            id: '1',
            name: 'Q1 2023 Operational Excellence Assessment',
            description: 'Quarterly assessment of operational excellence across all services',
            startDate: '2023-01-01',
            endDate: '2023-03-31',
            maturityModelId: '1',
            createdAt: '2022-12-15',
            updatedAt: '2023-01-01'
          },
          {
            id: '2',
            name: 'Security Assessment 2023',
            description: 'Annual security assessment for all services',
            startDate: '2023-02-01',
            endDate: null,
            maturityModelId: '1',
            createdAt: '2023-01-15',
            updatedAt: '2023-01-15'
          }
        ]);
        
        setMaturityModels([
          {
            id: '1',
            name: 'Operational Excellence Maturity Model',
            owner: 'Administrator',
            description: 'A model to assess operational excellence capabilities',
            measurements: [],
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCampaigns(campaigns);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredCampaigns(
        campaigns.filter(
          campaign => 
            campaign.name.toLowerCase().includes(term) || 
            campaign.description.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, campaigns]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await api.get<Campaign[]>('/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh campaigns',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateCampaign = async (formData: any) => {
    try {
      // In a real app, this would submit to the API
      // const response = await api.post('/campaigns', formData);
      
      toast({
        title: 'Campaign created',
        description: 'The campaign has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      handleRefresh();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const getStatusBadge = (campaign: Campaign) => {
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
  
  const getCampaignProgress = (campaign: Campaign) => {
    // In a real app, this would calculate actual progress
    return {
      percentage: 65,
      completedServices: 7,
      totalServices: 12
    };
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Campaigns</Heading>
        
        <Flex>
          <InputGroup maxW="300px" mr={2}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          
          <IconButton
            aria-label="Refresh"
            icon={<FiRefreshCw />}
            onClick={handleRefresh}
            mr={2}
          />
          
          {isEditor && (
            <Button 
              leftIcon={<FiPlus />} 
              colorScheme="blue"
              onClick={onOpen}
            >
              Create Campaign
            </Button>
          )}
        </Flex>
      </Flex>
      
      <Box
        bg={bgColor}
        p={4}
        borderRadius="lg"
        shadow="md"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Campaign Name</Th>
              <Th>Maturity Model</Th>
              <Th>Date Range</Th>
              <Th>Status</Th>
              <Th>Progress</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCampaigns.map((campaign) => {
              const progress = getCampaignProgress(campaign);
              const model = maturityModels.find(m => m.id === campaign.maturityModelId);
              
              return (
                <Tr key={campaign.id}>
                  <Td>
                    <Link
                      as={RouterLink}
                      to={`/campaigns/${campaign.id}`}
                      color="blue.500"
                      fontWeight="medium"
                    >
                      {campaign.name}
                    </Link>
                    <Text fontSize="sm" color="gray.500">{campaign.description}</Text>
                  </Td>
                  <Td>
                    {model ? (
                      <Link 
                        as={RouterLink} 
                        to={`/maturity-models/${model.id}`}
                        color="blue.500"
                      >
                        {model.name}
                      </Link>
                    ) : (
                      <Text>Unknown Model</Text>
                    )}
                  </Td>
                  <Td>
                    <Flex align="center">
                      <FiCalendar style={{ marginRight: '6px' }} />
                      <Text>
                        {new Date(campaign.startDate).toLocaleDateString()} - 
                        {campaign.endDate 
                          ? new Date(campaign.endDate).toLocaleDateString()
                          : ' Ongoing'}
                      </Text>
                    </Flex>
                  </Td>
                  <Td>{getStatusBadge(campaign)}</Td>
                  <Td>
                    <Box>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm">{progress.percentage}%</Text>
                        <Text fontSize="sm">
                          {progress.completedServices}/{progress.totalServices} Services
                        </Text>
                      </Flex>
                      <Progress value={progress.percentage} size="sm" colorScheme="blue" />
                    </Box>
                  </Td>
                  <Td>
                    <Link as={RouterLink} to={`/campaigns/${campaign.id}`}>
                      <Button 
                        size="sm" 
                        leftIcon={<FiBarChart2 />} 
                        colorScheme="blue" 
                        variant="outline"
                      >
                        View Results
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              );
            })}
            
            {filteredCampaigns.length === 0 && (
              <Tr>
                <Td colSpan={6} textAlign="center" py={4}>
                  No campaigns found
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* Create Campaign Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Campaign</ModalHeader>
          <ModalCloseButton />
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get('name'),
                description: formData.get('description'),
                maturityModelId: formData.get('maturityModelId'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate') || null
              };
              handleCreateCampaign(data);
            }}
          >
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Campaign Name</FormLabel>
                  <Input 
                    name="name"
                    placeholder="Enter campaign name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    name="description"
                    placeholder="Enter campaign description"
                    rows={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Maturity Model</FormLabel>
                  <Select 
                    name="maturityModelId"
                    placeholder="Select maturity model"
                  >
                    {maturityModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input 
                    name="startDate"
                    type="date"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>End Date (optional)</FormLabel>
                  <Input 
                    name="endDate"
                    type="date"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Create Campaign
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CampaignsPage;

