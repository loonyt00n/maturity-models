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
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  useEffect(() => {
    const fetchJourneys = async () => {
      setLoading(true);
      try {
        const response = await api.get<Journey[]>('/journeys');
        setJourneys(response.data);
      } catch (error) {
        console.error('Error fetching journeys:', error);
        // Use mock data for the prototype
        setJourneys([
          {
            id: '1',
            name: 'User Registration',
            owner: 'Customer Experience Team',
            description: 'End-to-end user registration process',
            activities: [],
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          },
          {
            id: '2',
            name: 'Shopping Experience',
            owner: 'Product Team',
            description: 'End-to-end shopping experience from discovery to checkout',
            activities: [],
            createdAt: '2023-01-15T00:00:00.000Z',
            updatedAt: '2023-01-15T00:00:00.000Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
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
    
    // Get form data and submit to API
    // In a real app, this would save the journey
    
    toast({
      title: selectedJourney ? 'Journey updated' : 'Journey created',
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
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    defaultValue={selectedJourney?.name || ''}
                    placeholder="Enter journey name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Owner</FormLabel>
                  <Input 
                    defaultValue={selectedJourney?.owner || ''}
                    placeholder="Enter owner name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    defaultValue={selectedJourney?.description || ''}
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormControl>
                
                {/* In a real app, you would add controls for dependency graph and activities here */}
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
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
