// client/src/pages/catalog/ServicesTab.tsx

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
  Select,
  VStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiPlus, FiEdit2, FiEye } from 'react-icons/fi';
import api from '../../api/api';
import { Service, ServiceType } from '../../models';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';

interface ServicesTabProps {
  searchTerm: string;
  refreshTrigger: number;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ 
  searchTerm, 
  refreshTrigger 
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [activities, setActivities] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  useEffect(() => {
    fetchServices();
  }, [refreshTrigger]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServices(services);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredServices(
        services.filter(
          service => 
            service.name.toLowerCase().includes(term) || 
            service.description.toLowerCase().includes(term) ||
            service.owner.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, services]);
  
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesRes, activitiesRes] = await Promise.all([
        api.get<Service[]>('/services'),
        api.get<{id: string, name: string}[]>('/activities')
      ]);
      
      setServices(servicesRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddNewClick = () => {
    setSelectedService(null);
    onOpen();
  };
  
  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    onOpen();
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const serviceData = {
      name: formData.get('name') as string,
      owner: formData.get('owner') as string,
      description: formData.get('description') as string,
      serviceType: formData.get('serviceType') as ServiceType,
      resourceLocation: formData.get('resourceLocation') as string || null,
      activityId: formData.get('activityId') as string || null
    };
    
    try {
      let response: { data: Service };
      
      if (selectedService) {
        // Update existing service
        response = await api.put<Service>(`/services/${selectedService.id}`, serviceData);
        
        setServices(prevServices => 
          prevServices.map(service => 
            service.id === selectedService.id ? response.data : service
          )
        );
        
        toast({
          title: 'Service updated',
          description: `${serviceData.name} has been updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new service
        response = await api.post<Service>('/services', serviceData);
        
        setServices(prevServices => [...prevServices, response.data]);
        
        toast({
          title: 'Service created',
          description: `${serviceData.name} has been added.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save service.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  const getServiceTypeBadge = (type: ServiceType) => {
    const colorSchemes = {
      [ServiceType.API_SERVICE]: 'green',
      [ServiceType.UI_APPLICATION]: 'blue',
      [ServiceType.WORKFLOW]: 'purple',
      [ServiceType.APPLICATION_MODULE]: 'orange'
    };
    
    return (
      <Badge colorScheme={colorSchemes[type]}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };
  
  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <Spinner size="lg" />
        <Text mt={2}>Loading services...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" mb={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Services
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
            <Th>Type</Th>
            <Th>Activity</Th>
            <Th>Last Updated</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredServices.map((service) => (
            <Tr key={service.id}>
              <Td>
                <Link 
                  as={RouterLink} 
                  to={`/services/${service.id}`} 
                  color="blue.500" 
                  fontWeight="medium"
                >
                  {service.name}
                </Link>
              </Td>
              <Td>{service.owner}</Td>
              <Td>{getServiceTypeBadge(service.serviceType)}</Td>
              <Td>
                {service.activityId ? (
                  <Link as={RouterLink} to={`/activities/${service.activityId}`}>
                    {activities.find(a => a.id === service.activityId)?.name || 'View Activity'}
                  </Link>
                ) : (
                  <Text color="gray.500">Not assigned</Text>
                )}
              </Td>
              <Td>{new Date(service.updatedAt).toLocaleDateString()}</Td>
              <Td>
                <Flex>
                  <Tooltip label="View Details">
                    <Link as={RouterLink} to={`/services/${service.id}`} mr={2}>
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
                        onClick={() => handleEditClick(service)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
          
          {filteredServices.length === 0 && (
            <Tr>
              <Td colSpan={6} textAlign="center" py={4}>
                No services found
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
            {selectedService ? 'Edit Service' : 'Add New Service'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    name="name"
                    defaultValue={selectedService?.name || ''}
                    placeholder="Enter service name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Owner</FormLabel>
                  <Input 
                    name="owner"
                    defaultValue={selectedService?.owner || ''}
                    placeholder="Enter owner name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    name="description"
                    defaultValue={selectedService?.description || ''}
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Service Type</FormLabel>
                  <Select 
                    name="serviceType"
                    defaultValue={selectedService?.serviceType || ''}
                  >
                    <option value={ServiceType.API_SERVICE}>API Service</option>
                    <option value={ServiceType.UI_APPLICATION}>UI Application</option>
                    <option value={ServiceType.WORKFLOW}>Workflow</option>
                    <option value={ServiceType.APPLICATION_MODULE}>Application Module</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Resource Location</FormLabel>
                  <Input 
                    name="resourceLocation"
                    defaultValue={selectedService?.resourceLocation || ''}
                    placeholder="Enter resource location (URL, path, etc.)"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Activity</FormLabel>
                  <Select 
                    name="activityId"
                    defaultValue={selectedService?.activityId || ''}
                  >
                    <option value="">-- None --</option>
                    {activities.map(activity => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose} isDisabled={formLoading}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit" isLoading={formLoading}>
                {selectedService ? 'Save Changes' : 'Create'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ServicesTab;
