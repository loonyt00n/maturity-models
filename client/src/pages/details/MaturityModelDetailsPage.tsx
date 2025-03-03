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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
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
  Input,
  Select,
  Textarea,
  VStack,
  Divider,
  IconButton,
  useToast,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiPlus, FiEdit2, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import api from '../../api/api';
import { MaturityModel, Measurement, EvidenceType, MaturityLevel, Campaign } from '../../models';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

const MaturityModelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [maturityModel, setMaturityModel] = useState<MaturityModel | null>(null);
  const [maturityLevels, setMaturityLevels] = useState<MaturityLevel[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isAdmin = hasRole([UserRole.ADMIN]);
  const bgColor = useColorModeValue('white', 'gray.700');
  
  useEffect(() => {
    fetchData();
  }, [id]);
  
  const fetchData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [modelRes, levelsRes, campaignsRes] = await Promise.all([
        api.get<MaturityModel>(`/maturity-models/${id}`),
        api.get<MaturityLevel[]>(`/maturity-models/${id}/levels`),
        api.get<Campaign[]>(`/maturity-models/${id}/campaigns`)
      ]);
      
      setMaturityModel(modelRes.data);
      setMaturityLevels(levelsRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Error fetching maturity model data:', error);
      setError('Failed to load maturity model details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMeasurement = () => {
    setSelectedMeasurement(null);
    onOpen();
  };
  
  const handleEditMeasurement = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    onOpen();
  };
  
  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast({
        title: 'Error',
        description: 'Missing model ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setFormLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const measurementData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      evidenceType: formData.get('evidenceType') as EvidenceType,
      sampleEvidence: formData.get('sampleEvidence') as string,
      maturityModelId: id
    };
    
    try {
      if (selectedMeasurement) {
        // Update existing measurement
        await api.put(`/measurements/${selectedMeasurement.id}`, measurementData);
        
        // Update the local state
        if (maturityModel) {
          const updatedMeasurements = maturityModel.measurements.map(m => {
            if (m.id === selectedMeasurement.id) {
              return {
                ...m, // Keep all existing properties including maturityModelId
                name: measurementData.name,
                description: measurementData.description,
                evidenceType: measurementData.evidenceType,
                sampleEvidence: measurementData.sampleEvidence
              };
            }
            return m;
          });
          
          setMaturityModel({
            ...maturityModel,
            measurements: updatedMeasurements
          });
        }
        
        toast({
          title: 'Measurement updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new measurement
        const response = await api.post<Measurement>('/measurements', measurementData);
        
        // Update the local state
        if (maturityModel) {
          setMaturityModel({
            ...maturityModel,
            measurements: [...maturityModel.measurements, response.data]
          });
        }
        
        toast({
          title: 'Measurement added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving measurement:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save measurement',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDeleteMeasurement = async (measurementId: string) => {
    if (!window.confirm('Are you sure you want to delete this measurement?')) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      await api.delete(`/measurements/${measurementId}`);
      
      // Update the local state
      if (maturityModel) {
        const updatedMeasurements = maturityModel.measurements.filter(m => m.id !== measurementId);
        
        setMaturityModel({
          ...maturityModel,
          measurements: updatedMeasurements
        });
      }
      
      toast({
        title: 'Measurement deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete measurement',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading maturity model details...</Text>
      </Box>
    );
  }
  
  if (error || !maturityModel) {
    return (
      <Box>
        <Flex align="center" mb={4}>
          <Button
            as={RouterLink}
            to="/maturity-models"
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            size="sm"
          >
            Back to Maturity Models
          </Button>
        </Flex>
        
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error || "Couldn't load maturity model details"}
        </Alert>
        
        <Button onClick={fetchData}>
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
          to="/maturity-models"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="sm"
        >
          Back to Maturity Models
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
            <Heading size="lg" mb={2}>{maturityModel.name}</Heading>
            <Text color="gray.500" mb={4}>{maturityModel.description}</Text>
            
            <Flex align="center" mb={2}>
              <Text fontWeight="bold" mr={2}>Owner:</Text>
              <Text>{maturityModel.owner}</Text>
            </Flex>
            
            <Flex align="center">
              <Text fontWeight="bold" mr={2}>Last Updated:</Text>
              <Text>{new Date(maturityModel.updatedAt).toLocaleDateString()}</Text>
            </Flex>
          </Box>
          
          {isAdmin && (
            <Button
              leftIcon={<FiEdit2 />}
              colorScheme="blue"
              variant="outline"
              onClick={() => toast({
                title: 'Not implemented',
                description: 'Edit model functionality is not yet implemented',
                status: 'info',
                duration: 3000,
                isClosable: true,
              })}
            >
              Edit Model
            </Button>
          )}
        </Flex>
      </Box>
      
      <Box
        bg={bgColor}
        borderRadius="lg"
        shadow="md"
        mb={6}
      >
        <Tabs colorScheme="blue">
          <TabList px={4} pt={4}>
            <Tab>Measurements ({maturityModel.measurements.length})</Tab>
            <Tab>Maturity Levels ({maturityLevels.length})</Tab>
            <Tab>Campaigns ({campaigns.length})</Tab>
          </TabList>
          
          <Divider mt={4} />
          
          <TabPanels>
            <TabPanel>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Measurements</Heading>
                
                {isAdmin && (
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={handleAddMeasurement}
                  >
                    Add Measurement
                  </Button>
                )}
              </Flex>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Evidence Type</Th>
                    <Th>Sample Evidence</Th>
                    {isAdmin && <Th>Actions</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {maturityModel.measurements.map((measurement) => (
                    <Tr key={measurement.id}>
                      <Td fontWeight="medium">{measurement.name}</Td>
                      <Td>{measurement.description}</Td>
                      <Td>
                        <Badge>{measurement.evidenceType.toUpperCase()}</Badge>
                      </Td>
                      <Td>
                        {measurement.sampleEvidence}
                      </Td>
                      {isAdmin && (
                        <Td>
                          <Flex>
                            <IconButton
                              aria-label="Edit measurement"
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="ghost"
                              mr={2}
                              onClick={() => handleEditMeasurement(measurement)}
                            />
                            
                            <IconButton
                              aria-label="Delete measurement"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              isLoading={deleteLoading}
                              onClick={() => handleDeleteMeasurement(measurement.id)}
                            />
                          </Flex>
                        </Td>
                      )}
                    </Tr>
                  ))}
                  
                  {maturityModel.measurements.length === 0 && (
                    <Tr>
                      <Td colSpan={isAdmin ? 5 : 4} textAlign="center" py={4}>
                        No measurements defined
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TabPanel>
            
            <TabPanel>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Maturity Levels</Heading>
                
                {isAdmin && (
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => toast({
                      title: 'Not implemented',
                      description: 'Add level functionality is not yet implemented',
                      status: 'info',
                      duration: 3000,
                      isClosable: true,
                    })}
                  >
                    Add Level
                  </Button>
                )}
              </Flex>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Level</Th>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Percentage Range</Th>
                    {isAdmin && <Th>Actions</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {maturityLevels.map((level) => (
                    <Tr key={level.id}>
                      <Td fontWeight="medium">Level {level.level}</Td>
                      <Td>{level.name}</Td>
                      <Td>{level.description}</Td>
                      <Td>
                        {level.minPercentage}% to {level.maxPercentage}%
                      </Td>
                      {isAdmin && (
                        <Td>
                          <Flex>
                            <IconButton
                              aria-label="Edit level"
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="ghost"
                              mr={2}
                              onClick={() => toast({
                                title: 'Not implemented',
                                description: 'Edit level functionality is not yet implemented',
                                status: 'info',
                                duration: 3000,
                                isClosable: true,
                              })}
                            />
                            <IconButton
                              aria-label="Delete level"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => toast({
                                title: 'Not implemented',
                                description: 'Delete level functionality is not yet implemented',
                                status: 'info',
                                duration: 3000,
                                isClosable: true,
                              })}
                            />
                          </Flex>
                        </Td>
                      )}
                    </Tr>
                  ))}
                  
                  {maturityLevels.length === 0 && (
                    <Tr>
                      <Td colSpan={isAdmin ? 5 : 4} textAlign="center" py={4}>
                        No maturity levels defined
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TabPanel>
            
            <TabPanel>
              <Heading size="md" mb={4}>Campaigns</Heading>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Date Range</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {campaigns.map((campaign) => {
                    const today = new Date();
                    const startDate = new Date(campaign.startDate);
                    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
                    
                    let status = 'Active';
                    let colorScheme = 'green';
                    
                    if (startDate > today) {
                      status = 'Upcoming';
                      colorScheme = 'purple';
                    } else if (endDate && endDate < today) {
                      status = 'Completed';
                      colorScheme = 'gray';
                    }
                    
                    return (
                      <Tr key={campaign.id}>
                        <Td fontWeight="medium">{campaign.name}</Td>
                        <Td>
                          {new Date(campaign.startDate).toLocaleDateString()} - 
                          {campaign.endDate 
                            ? new Date(campaign.endDate).toLocaleDateString()
                            : ' Ongoing'}
                        </Td>
                        <Td>
                          <Badge colorScheme={colorScheme}>
                            {status}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            as={RouterLink}
                            to={`/campaigns/${campaign.id}`}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                          >
                            View Campaign
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                  
                  {campaigns.length === 0 && (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={4}>
                        No campaigns found
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      
      {/* Add/Edit Measurement Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedMeasurement ? 'Edit Measurement' : 'Add Measurement'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleSaveMeasurement}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    name="name"
                    defaultValue={selectedMeasurement?.name || ''}
                    placeholder="Enter measurement name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    name="description"
                    defaultValue={selectedMeasurement?.description || ''}
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Evidence Type</FormLabel>
                  <Select 
                    name="evidenceType"
                    defaultValue={selectedMeasurement?.evidenceType || ''}
                  >
                    <option value={EvidenceType.URL}>URL</option>
                    <option value={EvidenceType.DOCUMENT}>Document</option>
                    <option value={EvidenceType.IMAGE}>Image</option>
                    <option value={EvidenceType.TEXT}>Text</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Sample Evidence</FormLabel>
                  <Input 
                    name="sampleEvidence"
                    defaultValue={selectedMeasurement?.sampleEvidence || ''}
                    placeholder="Enter sample evidence"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} isDisabled={formLoading}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit" isLoading={formLoading}>
                {selectedMeasurement ? 'Save Changes' : 'Add Measurement'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MaturityModelDetailsPage;