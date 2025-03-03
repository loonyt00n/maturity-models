// client/src/pages/catalog/ActivitiesTab.tsx

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
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  useEffect(() => {
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
  
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Activity[]>('/activities');
      setActivities(response.data);
      setFilteredActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
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
    setFormLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const activityData = {
      name: formData.get('name') as string,
      owner: formData.get('owner') as string,
      description: formData.get('description') as string,
      journeyId: formData.get('journeyId') as string || undefined
    };
    
    try {
      let response: { data: Activity };
      
      if (selectedActivity) {
        // Update existing activity
        response = await api.put<Activity>(`/activities/${selectedActivity.id}`, activityData);
        
        setActivities(prevActivities => 
          prevActivities.map(activity => 
            activity.id === selectedActivity.id ? response.data : activity
          )
        );
        
        toast({
          title: 'Activity updated',
          description: `${activityData.name} has been updated successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new activity
        response = await api.post<Activity>('/activities', activityData);
        
        setActivities(prevActivities => [...prevActivities, response.data]);
        
        toast({
          title: 'Activity created',
          description: `${activityData.name} has been created successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving activity:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save activity. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading activities...</Text>
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
        <Button onClick={fetchActivities}>Try Again</Button>
      </Box>
    );
  }
  
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
                    name="name"
                    defaultValue={selectedActivity?.name || ''}
                    placeholder="Enter activity name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Owner</FormLabel>
                  <Input 
                    name="owner"
                    defaultValue={selectedActivity?.owner || ''}
                    placeholder="Enter owner name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    name="description"
                    defaultValue={selectedActivity?.description || ''}
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormControl>
                
                {/* Journey selection would go here with an API call to fetch journeys */}
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} isDisabled={formLoading}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit" isLoading={formLoading}>
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
