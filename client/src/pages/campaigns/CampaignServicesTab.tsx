
import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Link,
  Progress,
  Button,
  Flex,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  InputGroup,
  InputLeftElement,
  Icon,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiSearch, FiFilter, FiUpload, FiCheckCircle } from 'react-icons/fi';
import api from '../../api/api';
import { ServiceMaturityResult, EvaluationStatus } from '../../models';

interface CampaignServicesTabProps {
  serviceResults: ServiceMaturityResult[];
  getMaturityLevelColor: (level: number) => string;
}

const CampaignServicesTab: React.FC<CampaignServicesTabProps> = ({
  serviceResults,
  getMaturityLevelColor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState(serviceResults);
  const [selectedService, setSelectedService] = useState<ServiceMaturityResult | null>(null);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredServices(serviceResults);
    } else {
      setFilteredServices(
        serviceResults.filter(service => 
          service.serviceName.toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  };
  
  const handleEvidenceSubmit = (serviceId: string, measurementId: string) => {
    const service = serviceResults.find(s => s.serviceId === serviceId);
    if (service) {
      setSelectedService(service);
      setSelectedMeasurementId(measurementId);
      onOpen();
    }
  };
  
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedMeasurementId) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const evidenceData = {
      serviceId: selectedService.serviceId,
      measurementId: selectedMeasurementId,
      evidenceLocation: formData.get('evidenceLocation') as string,
      notes: formData.get('notes') as string,
      status: EvaluationStatus.EVIDENCE_SUBMITTED
    };
    
    setLoading(true);
    setError(null);
    
    try {
      // Submit to the API
      await api.post('/evaluations', evidenceData);
      
      toast({
        title: 'Evidence submitted',
        description: 'Your evidence has been submitted for review',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error submitting evidence:', error);
      setError(error.response?.data?.message || 'Failed to submit evidence. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getMeasurementStatus = async (serviceId: string, measurementId: string) => {
    try {
      const response = await api.get(`/evaluations/status`, {
        params: { serviceId, measurementId }
      });
      return response.data.status;
    } catch (error) {
      console.error('Error fetching evaluation status:', error);
      return EvaluationStatus.NOT_IMPLEMENTED;
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </InputGroup>
        
        <Button leftIcon={<FiFilter />} variant="outline">
          Filter
        </Button>
      </Flex>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Service</Th>
            <Th>Maturity Level</Th>
            <Th>Progress</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredServices.map((service) => (
            <Tr key={service.serviceId}>
              <Td>
                <Link 
                  as={RouterLink} 
                  to={`/services/${service.serviceId}`} 
                  color="blue.500" 
                  fontWeight="medium"
                >
                  {service.serviceName}
                </Link>
              </Td>
              <Td>
                <Badge colorScheme={getMaturityLevelColor(service.maturityLevel)}>
                  Level {service.maturityLevel}
                </Badge>
              </Td>
              <Td>
                <Flex direction="column">
                  <Text fontSize="sm" mb={1}>
                    {service.percentage.toFixed(1)}% Complete
                  </Text>
                  <Progress 
                    value={service.percentage} 
                    size="sm" 
                    colorScheme={getMaturityLevelColor(service.maturityLevel)} 
                  />
                </Flex>
              </Td>
              <Td>
                <Button
                  size="sm"
                  leftIcon={<FiUpload />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => handleEvidenceSubmit(service.serviceId, '1')} // Just an example measurement ID
                >
                  Submit Evidence
                </Button>
              </Td>
            </Tr>
          ))}
          
          {filteredServices.length === 0 && (
            <Tr>
              <Td colSpan={4} textAlign="center" py={4}>
                No services found
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      
      {/* Evidence Submission Modal */}
      {selectedService && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Submit Evidence for {selectedService.serviceName}</ModalHeader>
            <ModalCloseButton />
            
            <form onSubmit={handleSubmitEvidence}>
              <ModalBody>
                <Heading size="sm" mb={4}>
                  Current Maturity: Level {selectedService.maturityLevel} ({selectedService.percentage.toFixed(1)}%)
                </Heading>
                
                {error && (
                  <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                
                <Box mb={6}>
                  <Heading size="xs" mb={2}>Measurement: Has centralized logging</Heading>
                  <Flex mb={4} align="center">
                    <Badge colorScheme="yellow" mr={2}>
                      {EvaluationStatus.EVIDENCE_SUBMITTED}
                    </Badge>
                    <Text fontSize="sm">Last updated: {new Date().toLocaleDateString()}</Text>
                    <Icon as={FiCheckCircle} color="green.500" ml={2} />
                  </Flex>
                  
                  <FormControl mb={4}>
                    <FormLabel>Evidence Type</FormLabel>
                    <Select name="evidenceType">
                      <option value="url">URL</option>
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="text">Text</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl mb={4} isRequired>
                    <FormLabel>Evidence Location/URL</FormLabel>
                    <Input name="evidenceLocation" />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea 
                      name="notes"
                      placeholder="Add any additional notes or context..."
                      rows={3}
                    />
                  </FormControl>
                </Box>
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit" isLoading={loading}>
                  Submit Evidence
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default CampaignServicesTab;
