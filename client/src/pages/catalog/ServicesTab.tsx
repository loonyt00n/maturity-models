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
  useToast
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
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await api.get<Service[]>('/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Use mock data for the prototype
        setServices([
          {
            id: '1',
            name: 'User Authentication Service',
            owner: 'Identity Team',
            description: 'Handles user authentication and authorization',
            serviceType: ServiceType.API_SERVICE,
            resourceLocation: 'https://github.com/example/auth-service',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          },
          {
            id: '2',
            name: 'Product Catalog UI',
            owner: 'Frontend Team',
            description: 'User interface for browsing products',
            serviceType: ServiceType.UI_APPLICATION,
            resourceLocation: 'https://github.com/example/product-ui',
            createdAt: '2023-01-15T00:00:00.000Z',
            updatedAt: '2023-01-15T00:00:00.000Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
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
    
    // Get form data and submit to API
    // In a real app, this would save the service
    
    toast({
      title: selectedService ? 'Service updated' : 'Service created',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    onClose();
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
                    View Activity
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
                    defaultValue={selectedService?.name || ''}
                    placeholder="Enter service name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Owner</FormLabel>
                  <Input 
                    defaultValue={selectedService?.owner || ''}
                    placeholder="Enter owner name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    defaultValue={selectedService?.description || ''}
                    placeholder="Enter description"
                    rows={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Service Type</FormLabel>
                  <Select 
                    defaultValue={selectedService?.serviceType || ''}
                    placeholder="Select service type"
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
                    defaultValue={selectedService?.resourceLocation || ''}
                    placeholder="Enter resource location (URL, path, etc.)"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
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

