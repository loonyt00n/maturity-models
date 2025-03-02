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
  Tooltip,
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
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiPlus, FiEdit2, FiEye } from 'react-icons/fi';
import api from '../../api/api';
import { MaturityModel } from '../../models';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

interface MaturityModelsTabProps {
  searchTerm: string;
  refreshTrigger: number;
}

const MaturityModelsTab: React.FC<MaturityModelsTabProps> = ({ 
  searchTerm, 
  refreshTrigger 
}) => {
  const [maturityModels, setMaturityModels] = useState<MaturityModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<MaturityModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<MaturityModel | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isAdmin = hasRole([UserRole.ADMIN]);
  
  useEffect(() => {
    const fetchMaturityModels = async () => {
      setLoading(true);
      try {
        const response = await api.get<MaturityModel[]>('/maturity-models');
        setMaturityModels(response.data);
      } catch (error) {
        console.error('Error fetching maturity models:', error);
        // Use mock data for the prototype
        setMaturityModels([
          {
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
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaturityModels();
  }, [refreshTrigger]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredModels(maturityModels);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredModels(
        maturityModels.filter(
          model => 
            model.name.toLowerCase().includes(term) || 
            model.description.toLowerCase().includes(term) ||
            model.owner.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, maturityModels]);
  
  const handleAddNewClick = () => {
    setSelectedModel(null);
    onOpen();
  };
  
  const handleEditClick = (model: MaturityModel) => {
    setSelectedModel(model);
    onOpen();
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data and submit to API
    // In a real app, this would save the model
    
    toast({
      title: selectedModel ? 'Maturity Model updated' : 'Maturity Model created',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    onClose();
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Maturity Models
        </Text>
        
        {isAdmin && (
          <Button 
            leftIcon={<FiPlus />} 
            colorScheme="blue"
            onClick={handleAddNewClick}
          >
            Add New
          </Button>
        )}
      </Flex>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Owner</Th>
            <Th>Measurements</Th>
            <Th>Last Updated</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredModels.map((model) => (
            <Tr key={model.id}>
              <Td>
                <Link 
                  as={RouterLink} 
                  to={`/maturity-models/${model.id}`} 
                  color="blue.500" 
                  fontWeight="medium"
                >
                  {model.name}
                </Link>
              </Td>
              <Td>{model.owner}</Td>
              <Td>
                <Badge>{model.measurements?.length || 0}</Badge>
              </Td>
              <Td>{new Date(model.updatedAt).toLocaleDateString()}</Td>
              <Td>
                <Flex>
                  <Tooltip label="View Details">
                    <Link as={RouterLink} to={`/maturity-models/${model.id}`} mr={2}>
                      <Button size="sm" leftIcon={<FiEye />} variant="ghost">
                        View
                      </Button>
                    </Link>
                  </Tooltip>
                  
                  {isAdmin && (
                    <Tooltip label="Edit">
                      <Button 
                        size="sm" 
                        leftIcon={<FiEdit2 />} 
                        variant="ghost"
                        onClick={() => handleEditClick(model)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
          
          {filteredModels.length === 0 && (
            <Tr>
              <Td colSpan={5} textAlign="center" py={4}>
                No maturity models found
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      
      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedModel ? 'Edit Maturity Model' : 'Add New Maturity Model'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    defaultValue={selectedModel?.name || ''}
                    placeholder="Enter maturity model name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Owner</FormLabel>
                  <Input 
                    defaultValue={selectedModel?.owner || ''}
                    placeholder="Enter owner name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    defaultValue={selectedModel?.description || ''}
                    placeholder="Enter description"
                    rows={4}
                  />
                </FormControl>
                
                {/* In a real app, you would add controls for measurements here */}
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                {selectedModel ? 'Save Changes' : 'Create'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MaturityModelsTab;

