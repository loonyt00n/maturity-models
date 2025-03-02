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
import { Activity } from '../../models';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

interface ActivitiesTabProps {
  searchTerm: string;
  refreshTrigger: number;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ 
  searchTerm, 
  refreshTrigger 
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const response = await api.get<Activity[]>('/activities');
        setActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Use mock data for the prototype
        setActivities([
          {
            id: '1',
            name: 'User Management',
            owner: 'Identity Team',
            description: 'Manage user accounts and authentication',
            services: [],
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          },
          {
            id: '2',
            name: 'Product Browsing',
            owner: 'Frontend Team',
            description: 'Allow users to browse and search products',
            services: [],
            createdAt: '2023-01-15T00:00:00.000Z',
            updatedAt: '2023-01-15T00:00:00.000Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [refreshTrigger]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredActivities(activities);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredActivities(
        activities.filter(
          activity => 
            activity.name.toLowerCase().includes(term) || 
            activity.description.toLowerCase().includes(term) ||
            activity.owner.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, activities]);
  
  const handleAddNewClick = () => {
    setSelectedActivity(null);
    onOpen();
  };
  
  const handleEditClick = (activity: Activity) => {
    setSelectedActivity(activity);
    onOpen();
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data and submit to API
    // In a real app, this would save the activity
    
    toast({
      title: selectedActivity ? 'Activity updated' : 'Activity created',
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
          Activities
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
            <Th>Services</Th>
            <Th>Journey</Th>
            <Th>Last Updated</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredActivities.map((activity) => (
            <Tr key={activity.id}>
              <Td>
                <Link 
                  as={RouterLink} 
                  to={`/activities/${activity.id}`} 
                  color="blue.500" 
                  fontWeight="medium"
                >
                  {activity.name}
                </Link>
              </Td>
              <Td>{activity.owner}</Td>
              <Td>
                <Badge>{activity.services?.length || 0}</Badge>
              </Td>
              <Td>
                {activity.journeyId ? (
                  <Link as={RouterLink} to={`/journeys/${activity.journeyId}`}>
                    View Journey
                  </Link>
                ) : (
                  <Text color="gray.500">Not assigned</Text>
                )}
              </Td>
              <Td>{new Date(activity.updatedAt).toLocaleDateString()}</Td>
              <Td>
                <Flex>
                  <Tooltip label="View Details">
                    <Link as={RouterLink} to={`/activities/${activity.id}`} mr={2}>
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
                        onClick={() => handleEditClick(activity)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
          
          {filteredActivities.length === 0 && (
            <Tr>
              <Td colSpan={6} textAlign="center" py={4}>
                No activities found
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
            {selectedActivity ? 'Edit Activity' : 'Add New Activity'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    defaultValue={selectedActivity?.name || ''}
                    placeholder="Enter activity name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Owner</FormLabel>
                  <Input 
                    defaultValue={selectedActivity?.owner || ''}
                    placeholder="Enter owner name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    defaultValue={selectedActivity?.description || ''}
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormControl>
                
                {/* In a real app, you would add controls for dependency graph and services here */}
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                {selectedActivity ? 'Save Changes' : 'Create'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ActivitiesTab;

