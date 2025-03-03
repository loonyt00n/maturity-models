import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Stack,
  Divider,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FiEdit, FiCheck, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { EvaluationStatus, UserRole } from '../../models';
import EvaluationHistory from './EvaluationHistory';

interface Evaluation {
  id: string;
  status: string;
  evidenceLocation: string;
  notes: string;
  validationReport: string;
  service: {
    id: string;
    name: string;
  };
  measurement: {
    id: string;
    name: string;
    description: string;
    evidenceType: string;
  };
  campaign: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EvaluationDetailsProps {
  evaluationId: string;
}

const EvaluationDetails: React.FC<EvaluationDetailsProps> = ({ evaluationId }) => {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evidenceLocation, setEvidenceLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasRole } = useAuth();
  const toast = useToast();
  
  const isAdmin = hasRole([UserRole.ADMIN]);
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    fetchEvaluation();
  }, [evaluationId]);
  
  const fetchEvaluation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/evaluations/${evaluationId}`);
      setEvaluation(response.data);
      setEvidenceLocation(response.data.evidenceLocation || '');
      setNotes(response.data.notes || '');
      setNewStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      setError('Failed to load evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEvidenceSubmit = async () => {
    if (!evidenceLocation.trim()) {
      toast({
        title: 'Error',
        description: 'Evidence location is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await api.post(`/evaluations/${evaluationId}/evidence`, {
        evidenceLocation,
        notes
      });
      
      setEvaluation(response.data);
      
      toast({
        title: 'Evidence submitted',
        description: 'Your evidence has been submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting evidence:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit evidence',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleStatusChange = async () => {
    if (!newStatus) {
      toast({
        title: 'Error',
        description: 'Status is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await api.put(`/evaluations/${evaluationId}/status`, {
        status: newStatus,
        changeReason: statusChangeReason
      });
      
      setEvaluation(response.data);
      onClose();
      
      toast({
        title: 'Status updated',
        description: 'Evaluation status has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
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
      <Badge colorScheme={colorSchemes[status]} size="lg" px={2} py={1} fontSize="md">
        {statusLabels[status] || status}
      </Badge>
    );
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <FiCheck color="green" />;
      case 'not_implemented':
      case 'evidence_rejected':
        return <FiX color="red" />;
      case 'validating_evidence':
        return <FiClock color="orange" />;
      case 'evidence_submitted':
        return <FiAlertTriangle color="yellow" />;
      default:
        return null;
    }
  };
  
  const renderValidationReport = () => {
    if (!evaluation?.validationReport) {
      return (
        <Text>No validation has been performed yet.</Text>
      );
    }
    
    try {
      const report = JSON.parse(evaluation.validationReport);
      
      return (
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Flex align="center" mb={3}>
            <Text fontWeight="bold" fontSize="lg" mr={2}>
              Validation Result:
            </Text>
            <Badge colorScheme={report.valid ? 'green' : 'red'} px={2} py={1}>
              {report.valid ? 'PASSED' : 'FAILED'}
            </Badge>
          </Flex>
          
          <Text mb={4}>{report.message}</Text>
          
          <Heading size="sm" mb={2}>Detailed Checks:</Heading>
          <Stack spacing={3} mt={2}>
            {report.checks && report.checks.map((check: any, index: number) => (
              <Box key={index} p={3} borderWidth="1px" borderRadius="md" bg={check.valid ? 'green.50' : 'red.50'}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">{check.name}</Text>
                  <Badge colorScheme={check.valid ? 'green' : 'red'}>
                    {check.valid ? 'Passed' : 'Failed'}
                  </Badge>
                </Flex>
                <Text mt={1}>{check.message}</Text>
              </Box>
            ))}
          </Stack>
        </Box>
      );
    } catch (e) {
      return (
        <Alert status="error">
          <AlertIcon />
          Failed to parse validation report
        </Alert>
      );
    }
  };
  
  if (loading) {
    return (
      <Flex justify="center" align="center" p={6}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (error || !evaluation) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error || 'Failed to load evaluation'}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex 
        justify="space-between" 
        align="center" 
        mb={6} 
        p={4} 
        borderWidth="1px" 
        borderRadius="md" 
        bg={bgColor}
      >
        <Box>
          <Heading size="md">{evaluation.measurement.name}</Heading>
          <Text color="gray.600" mt={1}>
            {evaluation.service.name} - {evaluation.campaign.name}
          </Text>
        </Box>
        
        <Flex align="center">
          {getStatusIcon(evaluation.status)}
          <Box ml={2}>
            {getStatusBadge(evaluation.status)}
          </Box>
          {isAdmin && (
            <Button 
              size="sm" 
              ml={4} 
              colorScheme="blue" 
              leftIcon={<FiEdit />}
              onClick={onOpen}
            >
              Change Status
            </Button>
          )}
        </Flex>
      </Flex>
      
      <Tabs variant="enclosed" colorScheme="blue" mb={6}>
        <TabList>
          <Tab>Details</Tab>
          <Tab>Evidence</Tab>
          <Tab>Validation</Tab>
          <Tab>History</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={bgColor}
            >
              <Stack spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={1}>Service:</Text>
                  <Text>{evaluation.service.name}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Measurement:</Text>
                  <Text>{evaluation.measurement.name}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Description:</Text>
                  <Text>{evaluation.measurement.description}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Evidence Type:</Text>
                  <Badge>{evaluation.measurement.evidenceType.toUpperCase()}</Badge>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Campaign:</Text>
                  <Text>{evaluation.campaign.name}</Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={1}>Last Updated:</Text>
                  <Text>{new Date(evaluation.updatedAt).toLocaleString()}</Text>
                </Box>
              </Stack>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={bgColor}
            >
              <FormControl mb={4}>
                <FormLabel>Evidence Location</FormLabel>
                <Input 
                  value={evidenceLocation} 
                  onChange={(e) => setEvidenceLocation(e.target.value)}
                  placeholder="Enter URL or location of evidence"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Notes</FormLabel>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter additional notes or context"
                  rows={5}
                />
              </FormControl>
              
              {evaluation.evidenceLocation && (
                <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Text fontWeight="bold" mb={1}>Current Evidence:</Text>
                  <Link href={evaluation.evidenceLocation} isExternal color="blue.500">
                    {evaluation.evidenceLocation} <ExternalLinkIcon mx="2px" />
                  </Link>
                  
                  {evaluation.notes && (
                    <Box mt={3}>
                      <Text fontWeight="bold" mb={1}>Current Notes:</Text>
                      <Text>{evaluation.notes}</Text>
                    </Box>
                  )}
                </Box>
              )}
              
              <Button 
                colorScheme="blue"
                onClick={handleEvidenceSubmit}
                isLoading={submitting}
                isDisabled={!evidenceLocation.trim()}
              >
                Submit Evidence
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg={bgColor}
            >
              {renderValidationReport()}
              
              {isAdmin && evaluation.status !== EvaluationStatus.VALIDATING_EVIDENCE && (
                <Button 
                  mt={4} 
                  colorScheme="blue"
                  onClick={() => {
                    setNewStatus(EvaluationStatus.VALIDATING_EVIDENCE);
                    setStatusChangeReason('Initiating validation');
                    onOpen();
                  }}
                >
                  Start Validation
                </Button>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel>
            <EvaluationHistory evaluationId={evaluationId} />
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Status Change Modal (Admin only) */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Evaluation Status</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Status</FormLabel>
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value={EvaluationStatus.NOT_IMPLEMENTED}>Not Implemented</option>
                <option value={EvaluationStatus.EVIDENCE_SUBMITTED}>Evidence Submitted</option>
                <option value={EvaluationStatus.VALIDATING_EVIDENCE}>Validating Evidence</option>
                <option value={EvaluationStatus.EVIDENCE_REJECTED}>Evidence Rejected</option>
                <option value={EvaluationStatus.IMPLEMENTED}>Implemented</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Reason for Change</FormLabel>
              <Textarea
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder="Provide a reason for this status change"
                rows={3}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleStatusChange}
              isLoading={submitting}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EvaluationDetails;
