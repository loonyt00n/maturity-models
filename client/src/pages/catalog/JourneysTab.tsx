// client/src/pages/catalog/JourneysTab.tsx

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
import { Journey } from '../../models';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

interface JourneysTabProps {
  searchTerm: string;
  refreshTrigger: number;
}

const JourneysTab: React.FC<JourneysTabProps> = ({ 
  searchTerm, 
  refreshTrigger 
}) => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [filteredJourneys, setFilteredJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  useEffect(() => {
    fetchJourneys();
  }, [refreshTrigger]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJourneys(journeys);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredJourneys(
        journeys.filter(
          journey => 
            journey.name.toLowerCase().includes(term) || 
            journey.description.toLowerCase().includes(term) ||
            journey.owner.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, journeys]);
  
  const fetchJourneys = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Journey[]>('/journeys');
      setJourneys(response.data);
      setFilteredJourneys(response.data);
    } catch (error) {
      console.error('Error fetching journeys:', error);
      setError('Failed to load journeys. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddNewClick = () => {
    setSelectedJourney(null);
    onOpen();
  };
  
  const handleEditClick = (journey: Journey) => {
    setSelectedJourney(journey);
    onOpen();
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const journeyData = {
      name: formData.get('name') as string,
      owner: formData.get('owner') as string,
      description: formData.get('description') as string,
      dependencyGraph: formData.get('dependencyGraph') 
        ? JSON.parse(formData.get('dependencyGraph') as string) 
        : null
    };
    
    try {
      if (selectedJourney) {
        // Update existing journey
        const response = await api.put<Journey>(`/journeys/${selectedJourney.id}`, journeyData);
        
        setJourneys(prev => prev.map(journey => 
          journey.id === selectedJourney.id ? response.data : journey
        ));
        
        toast({
          title: 'Journey updated',
          description: `${journeyData.name} has been updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new journey
        const response = await api.post<Journey>('/journeys', journeyData);
        
        setJourneys(prev => [...prev, response.data]);
        
        toast({
          title: 'Journey created',
          description: `${journeyData.name} has been created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving journey:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save journey.',
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
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading journeys...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" mb={4}>
        <AlertIcon />
        {error}
        <Button ml={4} size="sm" onClick={fetchJourneys}>
          Retry
        </Button>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Journeys
        </Text>
        
        {isEditor && (
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
            <Th>Activities</Th>
            <Th>Last Updated</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredJourneys.map((journey) => (
            <Tr key={journey.id}>
              <Td>
                <Link 
                  as={RouterLink} 
                  to={`/journeys/${journey.id}`} 
                  color="blue.500" 
                  fontWeight="medium"
                >
                  {journey.name}
                </Link>
              </Td>
              <Td>{journey.owner}</Td>
              <Td>
                <Badge>{journey.activities?.length || 0}</Badge>
              </Td>
              <Td>{new Date(journey.updatedAt).toLocaleDateString()}</Td>
              <Td>
                <Flex>
                  <Tooltip label="View Details">
                    <Link as={RouterLink} to={`/journeys/${journey.id}`} mr={2}>
                      <Button size="sm" leftIcon={<FiEye />} variant="ghost">
                        View
                      </Button>
                    </Link>
                  </Tooltip>
                  
                  {isEditor && (
                    <Tooltip label="Edit">
                      <Button 
                        size="sm" 
                        leftIcon={<FiEdit2 />} 
                        variant="ghost"
                        onClick={() => handleEditClick(journey)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
          
          {filteredJourneys.length === 0 && (
            <Tr>
              <Td colSpan={5} textAlign="center" py={4}>
                No journeys found
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
            {selectedJourney ? 'Edit Journey' : 'Add New Journey'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              {formLoading && (
                <Flex justify="center" mb={4}>
                  <Spinner />
                </Flex>
              )}
              
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    name="name"
                    defaultValue={selectedJourney?.name || ''}
                    placeholder="Enter journey name"
                    isDisabled={formLoading}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Owner</FormLabel>
                  <Input 
                    name="owner"
                    defaultValue={selectedJourney?.owner || ''}
                    placeholder="Enter owner name"
                    isDisabled={formLoading}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    name="description"
                    defaultValue={selectedJourney?.description || ''}
                    placeholder="Enter description"
                    rows={3}
                    isDisabled={formLoading}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Dependency Graph (JSON)</FormLabel>
                  <Textarea 
                    name="dependencyGraph"
                    defaultValue={selectedJourney?.dependencyGraph 
                      ? JSON.stringify(selectedJourney.dependencyGraph, null, 2) 
                      : ''}
                    placeholder="Enter dependency graph as JSON (optional)"
                    rows={5}
                    isDisabled={formLoading}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} isDisabled={formLoading}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                type="submit" 
                isLoading={formLoading}
              >
                {selectedJourney ? 'Save Changes' : 'Create'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default JourneysTab;
