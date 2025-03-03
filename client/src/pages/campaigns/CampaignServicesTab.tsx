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
  Icon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiSearch, FiFilter, FiUpload, FiCheckCircle } from 'react-icons/fi';
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
  
  const handleEvidenceSubmit = (serviceId: string) => {
    const service = serviceResults.find(s => s.serviceId === serviceId);
    if (service) {
      setSelectedService(service);
      onOpen();
    }
  };
  
  const handleSubmitEvidence = async (formData: any) => {
    try {
      // In a real app, this would submit to the API
      toast({
        title: 'Evidence submitted',
        description: 'Your evidence has been submitted for review',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting evidence:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit evidence',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const getMeasurementStatus = (serviceId: string, measurementId: string) => {
    // In a real app, this would fetch the actual status
    return EvaluationStatus.EVIDENCE_SUBMITTED;
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
                    {service.percentage}% Complete
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
                  onClick={() => handleEvidenceSubmit(service.serviceId)}
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
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSubmitEvidence(formData);
            }}>
              <ModalBody>
                <Heading size="sm" mb={4}>
                  Current Maturity: Level {selectedService.maturityLevel} ({selectedService.percentage}%)
                </Heading>
                
                <Box mb={6}>
                  <Heading size="xs" mb={2}>Measurement 1: Has centralized logging</Heading>
                  <Flex mb={4} align="center">
                    <Badge colorScheme="yellow" mr={2}>
                      {getMeasurementStatus(selectedService.serviceId, '1')}
                    </Badge>
                    <Text fontSize="sm">Last updated: 12/15/2022</Text>
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
                  
                  <FormControl mb={4}>
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
                
                <Box>
                  <Heading size="xs" mb={2}>Measurement 2: Has infrastructure metrics published</Heading>
                  <Flex mb={4} align="center">
                    <Badge colorScheme="green" mr={2}>
                      IMPLEMENTED
                    </Badge>
                    <Text fontSize="sm">Last updated: 1/5/2023</Text>
                    <Icon as={FiCheckCircle} color="green.500" ml={2} />
                  </Flex>
                  
                  <Text fontSize="sm" color="gray.500">
                    Evidence: https://metrics.example.com/dashboard
                  </Text>
                </Box>
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit">
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

