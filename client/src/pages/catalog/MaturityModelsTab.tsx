// client/src/pages/catalog/MaturityModelsTab.tsx

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
  useToast,
  Spinner,
  Alert,
  AlertIcon
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
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<MaturityModel | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isAdmin = hasRole([UserRole.ADMIN]);
  
  useEffect(() => {
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
  
  const fetchMaturityModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<MaturityModel[]>('/maturity-models');
      setMaturityModels(response.data);
      setFilteredModels(response.data);
    } catch (error: any) {
      console.error('Error fetching maturity models:', error);
      setError(error.response?.data?.message || 'Failed to fetch maturity models. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
    setFormLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      const modelData = {
        name: formData.get('name') as string,
        owner: formData.get('owner') as string,
        description: formData.get('description') as string
      };
      
      if (selectedModel) {
        // Update existing model
        const response = await api.put<MaturityModel>(`/maturity-models/${selectedModel.id}`, modelData);
        
        setMaturityModels(prevModels =>
          prevModels.map(model => model.id === selectedModel.id ? response.data : model)
        );
        
        toast({
          title: 'Maturity Model updated',
          description: `${modelData.name} has been updated successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new model
        const response = await api.post<MaturityModel>('/maturity-models', modelData);
        
        setMaturityModels(prevModels => [...prevModels, response.data]);
        
        toast({
          title: 'Maturity Model created',
          description: `${modelData.name} has been created successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving maturity model:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save maturity model. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading maturity models...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
        <Button onClick={fetchMaturityModels}>Try Again</Button>
      </Box>
    );
  }
  
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
              {formLoading && (
                <Alert status="info" mb={4}>
                  <Spinner size="sm" mr={2} />
                  {selectedModel ? 'Updating maturity model...' : 'Creating maturity model...'}
                </Alert>
              )}
              
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    name="name"
                    defaultValue={selectedModel?.name || ''}
                    placeholder="Enter maturity model name"
                    isDisabled={formLoading}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Owner</FormLabel>
                  <Input 
                    name="owner"
                    defaultValue={selectedModel?.owner || ''}
                    placeholder="Enter owner name"
                    isDisabled={formLoading}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    name="description"
                    defaultValue={selectedModel?.description || ''}
                    placeholder="Enter description"
                    rows={4}
                    isDisabled={formLoading}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                variant="ghost" 
                mr={3} 
                onClick={onClose}
                isDisabled={formLoading}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                type="submit"
                isLoading={formLoading}
              >
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
