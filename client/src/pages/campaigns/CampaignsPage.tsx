
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
  useToast,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiPlus, FiSearch, FiRefreshCw, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import api from '../../api/api';
import { Campaign, MaturityModel } from '../../models';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

interface CampaignProgress {
  percentage: number;
  completedServices: number;
  totalServices: number;
}

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [maturityModels, setMaturityModels] = useState<MaturityModel[]>([]);
  const [campaignProgress, setCampaignProgress] = useState<Record<string, CampaignProgress>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  useEffect(() => {
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
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaignsRes, modelsRes] = await Promise.all([
        api.get<Campaign[]>('/campaigns'),
        api.get<MaturityModel[]>('/maturity-models')
      ]);
      
      setCampaigns(campaignsRes.data);
      setMaturityModels(modelsRes.data);
      
      // Fetch progress for each campaign
      const progressPromises = campaignsRes.data.map(campaign => 
        fetchCampaignProgress(campaign.id)
      );
      
      await Promise.all(progressPromises);
    } catch (error) {
      console.error('Error fetching campaigns data:', error);
      setError('Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCampaignProgress = async (campaignId: string) => {
    try {
      const response = await api.get<{overallPercentage: number; serviceResults: any[]}>(`/campaigns/${campaignId}/results`);
      
      setCampaignProgress(prev => ({
        ...prev,
        [campaignId]: {
          percentage: response.data.overallPercentage,
          completedServices: response.data.serviceResults.filter(s => s.percentage === 100).length,
          totalServices: response.data.serviceResults.length
        }
      }));
    } catch (error) {
      console.error(`Error fetching progress for campaign ${campaignId}:`, error);
      setCampaignProgress(prev => ({
        ...prev,
        [campaignId]: {
          percentage: 0,
          completedServices: 0,
          totalServices: 0
        }
      }));
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRefresh = () => {
    fetchData();
  };
  
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      maturityModelId: formData.get('maturityModelId') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || undefined
    };
    
    try {
      await api.post('/campaigns', data);
      
      toast({
        title: 'Campaign created',
        description: 'The campaign has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      fetchData();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create campaign',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
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
    return campaignProgress[campaign.id] || {
      percentage: 0,
      completedServices: 0,
      totalServices: 0
    };
  };
  
  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading campaigns...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Heading mb={6}>Campaigns</Heading>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
        <Button leftIcon={<FiRefreshCw />} onClick={handleRefresh}>
          Try Again
        </Button>
      </Box>
    );
  }
  
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
                        <Text fontSize="sm">{progress.percentage.toFixed(1)}%</Text>
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
          
          <form onSubmit={handleCreateCampaign}>
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
              <Button variant="ghost" mr={3} onClick={onClose} isDisabled={formLoading}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit" isLoading={formLoading}>
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
