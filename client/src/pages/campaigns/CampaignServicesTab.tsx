// client/src/pages/campaigns/CampaignServicesTab.tsx

import React, { useState, useEffect } from 'react';
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
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiSearch, FiFilter, FiUpload, FiCheckCircle, FiEye, FiList } from 'react-icons/fi';
import api from '../../api/api';
import { ServiceMaturityResult, EvaluationStatus, Measurement, MeasurementEvaluation } from '../../models';

interface CampaignServicesTabProps {
  serviceResults: ServiceMaturityResult[];
  getMaturityLevelColor: (level: number) => string;
  campaignId: string;
}

const CampaignServicesTab: React.FC<CampaignServicesTabProps> = ({
  serviceResults,
  getMaturityLevelColor,
  campaignId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState(serviceResults);
  const [selectedService, setSelectedService] = useState<ServiceMaturityResult | null>(null);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceEvaluations, setServiceEvaluations] = useState<Record<string, MeasurementEvaluation[]>>({});
  const [expandedService, setExpandedService] = useState<string | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Fetch measurements for the campaign's maturity model
  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        // Need to fetch the campaign first to get its maturity model ID
        const campaignResponse = await api.get(`/campaigns/${campaignId}`);
        const maturityModelId = campaignResponse.data.maturityModel.id;
        
        // Then fetch measurements for that maturity model
        const measurementsResponse = await api.get(`/maturity-models/${maturityModelId}`);
        setMeasurements(measurementsResponse.data.measurements || []);
      } catch (error) {
        console.error('Error fetching measurements:', error);
        toast({
          title: 'Error',
          description: 'Failed to load measurements',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    
    if (campaignId) {
      fetchMeasurements();
    }
  }, [campaignId, toast]);
  
  useEffect(() => {
    setFilteredServices(serviceResults);
  }, [serviceResults]);
  
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
      // Default to first measurement if available
      setSelectedMeasurementId(measurements.length > 0 ? measurements[0].id : null);
      onOpen();
    }
  };
  
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedMeasurementId || !campaignId) {
      setError('Missing required information (service, measurement, or campaign)');
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const evidenceData = {
      serviceId: selectedService.serviceId,
      measurementId: selectedMeasurementId,
      campaignId: campaignId,
      evidenceLocation: formData.get('evidenceLocation') as string,
      notes: formData.get('notes') as string || '',
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
      
      // Refresh the evaluations for this service
      if (expandedService === selectedService.serviceId) {
        fetchServiceEvaluations(selectedService.serviceId);
      }
    } catch (error: any) {
      console.error('Error submitting evidence:', error);
      setError(error.response?.data?.message || 'Failed to submit evidence. Please ensure all required fields are provided.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchServiceEvaluations = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${serviceId}/campaigns`);
      const campaignData = response.data.find((c: any) => c.campaign.id === campaignId);
      
      if (campaignData && campaignData.evaluations) {
        setServiceEvaluations({
          ...serviceEvaluations,
          [serviceId]: campaignData.evaluations
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching service evaluations:', error);
      setLoading(false);
    }
  };
  
  const toggleServiceExpansion = (serviceId: string) => {
    if (expandedService === serviceId) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceId);
      if (!serviceEvaluations[serviceId]) {
        fetchServiceEvaluations(serviceId);
      }
    }
  };
  
  const getStatusBadge = (status: string) => {
    const colorSchemes: Record<string, string> = {
      'not_implemented': 'red',
      'evidence_submitted': 'yellow',
      'validating_evidence': 'orange',
      'evidence_rejected': 'red',
      'implemented': 'green'
    };
    
    const statusLabels: Record<string, string> = {
      'not_implemented': 'Not Implemented',
      'evidence_submitted': 'Evidence Submitted',
      'validating_evidence': 'Validating Evidence',
      'evidence_rejected': 'Evidence Rejected',
      'implemented': 'Implemented'
    };
    
    return (
      <Badge colorScheme={colorSchemes[status]}>
        {statusLabels[status] || status}
      </Badge>
    );
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
      
      <Accordion allowToggle>
        {filteredServices.map((service) => (
          <AccordionItem key={service.serviceId}>
            <h2>
              <AccordionButton onClick={() => toggleServiceExpansion(service.serviceId)}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="medium">{service.serviceName}</Text>
                </Box>
                <Badge 
                  colorScheme={getMaturityLevelColor(service.maturityLevel)} 
                  mr={4}
                >
                  Level {service.maturityLevel}
                </Badge>
                <Progress 
                  value={service.percentage} 
                  size="sm" 
                  width="100px"
                  maxWidth="100px"
                  colorScheme={getMaturityLevelColor(service.maturityLevel)} 
                  mr={4}
                />
                <Text fontSize="sm" mr={4}>{service.percentage.toFixed(1)}%</Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Flex justify="space-between" mb={4}>
                <Heading size="sm">Evaluations</Heading>
                <Button
                  size="sm"
                  leftIcon={<FiUpload />}
                  colorScheme="blue"
                  onClick={() => handleEvidenceSubmit(service.serviceId)}
                  isDisabled={measurements.length === 0}
                >
                  Submit Evidence
                </Button>
              </Flex>
              
              {loading ? (
                <Flex justify="center" p={4}>
                  <Spinner />
                </Flex>
              ) : serviceEvaluations[service.serviceId] ? (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Measurement</Th>
                      <Th>Status</Th>
                      <Th>Evidence</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {serviceEvaluations[service.serviceId].map((evaluation: any) => (
                      <Tr key={evaluation.id}>
                        <Td>{evaluation.measurement?.name || 'Unknown Measurement'}</Td>
                        <Td>{getStatusBadge(evaluation.status)}</Td>
                        <Td>
                          {evaluation.evidenceLocation ? (
                            <Text isTruncated maxWidth="200px">
                              {evaluation.evidenceLocation}
                            </Text>
                          ) : (
                            <Text color="gray.500">No evidence submitted</Text>
                          )}
                        </Td>
                        <Td>
                          <Button
                            as={RouterLink}
                            to={`/evaluations/${evaluation.id}`}
                            size="xs"
                            leftIcon={<FiEye />}
                            colorScheme="blue"
                            variant="outline"
                          >
                            View Details
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text>No evaluations found for this service</Text>
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
        
        {filteredServices.length === 0 && (
          <Text textAlign="center" py={4}>No services found</Text>
        )}
      </Accordion>
      
      {/* Evidence Submission Modal */}
      {selectedService && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Submit Evidence for {selectedService.serviceName}</ModalHeader>
            <ModalCloseButton />
            
            <form onSubmit={handleSubmitEvidence}>
              <ModalBody>
                {measurements.length === 0 ? (
                  <Alert status="warning">
                    <AlertIcon />
                    No measurements available for this campaign's maturity model.
                  </Alert>
                ) : (
                  <>
                    <Heading size="sm" mb={4}>
                      Current Maturity: Level {selectedService.maturityLevel} ({selectedService.percentage.toFixed(1)}%)
                    </Heading>
                    
                    {error && (
                      <Alert status="error" mb={4}>
                        <AlertIcon />
                        {error}
                      </Alert>
                    )}
                    
                    <FormControl mb={4} isRequired>
                      <FormLabel>Measurement</FormLabel>
                      <Select 
                        name="measurementId" 
                        value={selectedMeasurementId || ''}
                        onChange={(e) => setSelectedMeasurementId(e.target.value)}
                        isRequired
                      >
                        {measurements.map(measurement => (
                          <option key={measurement.id} value={measurement.id}>
                            {measurement.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
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
                      <Input name="evidenceLocation" isRequired />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Notes</FormLabel>
                      <Textarea 
                        name="notes"
                        placeholder="Add any additional notes or context..."
                        rows={3}
                      />
                    </FormControl>
                  </>
                )}
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  type="submit" 
                  isLoading={loading}
                  isDisabled={measurements.length === 0}
                >
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