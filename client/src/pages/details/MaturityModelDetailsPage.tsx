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
  useToast
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
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isAdmin = hasRole([UserRole.ADMIN]);
  const bgColor = useColorModeValue('white', 'gray.700');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be actual API endpoints
        const [modelRes, levelsRes, campaignsRes] = await Promise.all([
          api.get<MaturityModel>(`/maturity-models/${id}`),
          api.get<MaturityLevel[]>(`/maturity-models/${id}/levels`),
          api.get<Campaign[]>(`/maturity-models/${id}/campaigns`)
        ]);
        
        setMaturityModel(modelRes.data);
        setMaturityLevels(levelsRes.data);
        setCampaigns(campaignsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data for the prototype
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
              evidenceType: 'url',
              sampleEvidence: 'https://logs.example.com/dashboard',
              maturityModelId: '1'
            },
            {
              id: '2',
              name: 'Has infrastructure metrics published',
              description: 'The service must publish infrastructure metrics to central monitoring',
              evidenceType: 'url',
              sampleEvidence: 'https://metrics.example.com/dashboard',
              maturityModelId: '1'
            }
          ],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        });
        
        setMaturityLevels([
          {
            id: '1',
            level: 0,
            name: 'Level 0',
            description: 'Initial level, less than 25% implemented',
            minPercentage: 0,
            maxPercentage: 24.99,
            maturityModelId: '1'
          },
          {
            id: '2',
            level: 1,
            name: 'Level 1',
            description: 'Basic level, 25% to 49% implemented',
            minPercentage: 25,
            maxPercentage: 49.99,
            maturityModelId: '1'
          },
          {
            id: '3',
            level: 2,
            name: 'Level 2',
            description: 'Intermediate level, 50% to 74% implemented',
            minPercentage: 50,
            maxPercentage: 74.99,
            maturityModelId: '1'
          },
          {
            id: '4',
            level: 3,
            name: 'Level 3',
            description: 'Advanced level, 75% to 99% implemented',
            minPercentage: 75,
            maxPercentage: 99.99,
            maturityModelId: '1'
          },
          {
            id: '5',
            level: 4,
            name: 'Level 4',
            description: 'Optimized level, 100% implemented',
            minPercentage: 100,
            maxPercentage: 100,
            maturityModelId: '1'
          }
        ]);
        
        setCampaigns([
          {
            id: '1',
            name: 'Q1 2023 Operational Excellence Assessment',
            description: 'Quarterly assessment of operational excellence across all services',
            startDate: '2023-01-01',
            endDate: '2023-03-31',
            maturityModelId: '1',
            createdAt: '2022-12-15T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading || !maturityModel) {
    return (
      <Box p={4}>
        <Text>Loading maturity model details...</Text>
      </Box>
    );
  }
  
  const handleAddMeasurement = () => {
    setSelectedMeasurement(null);
    onOpen();
  };
  
  const handleEditMeasurement = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    onOpen();
  };
  
  const handleSaveMeasurement = async (formData: any) => {
    try {
      // In a real app, this would submit to the API
      toast({
        title: selectedMeasurement ? 'Measurement updated' : 'Measurement added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving measurement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save measurement',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
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
                            />
                            <IconButton
                              aria-label="Delete level"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                            />
                          </Flex>
                        </Td>
                      )}
                    </Tr>
                  ))}
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
                  {campaigns.map((campaign) => (
                    <Tr key={campaign.id}>
                      <Td fontWeight="medium">{campaign.name}</Td>
                      <Td>
                        {new Date(campaign.startDate).toLocaleDateString()} - 
                        {campaign.endDate 
                          ? new Date(campaign.endDate).toLocaleDateString()
                          : ' Ongoing'}
                      </Td>
                      <Td>
                        <Badge colorScheme={
                          new Date(campaign.endDate || '') < new Date() 
                            ? 'gray' 
                            : 'green'
                        }>
                          {new Date(campaign.endDate || '') < new Date() 
                            ? 'Completed' 
                            : 'Active'}
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
                  ))}
                  
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
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSaveMeasurement(formData);
          }}>
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
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
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

