
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Flex,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiArrowLeft, FiEye } from 'react-icons/fi';
import api from '../../api/api';
import { MeasurementEvaluation, EvaluationStatus } from '../../models';

// Helper function to parse query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ServiceEvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<MeasurementEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState<string>('');
  const [campaignName, setCampaignName] = useState<string>('');
  
  const query = useQuery();
  const navigate = useNavigate();
  
  const serviceId = query.get('serviceId');
  const campaignId = query.get('campaignId');
  
  const bgColor = useColorModeValue('white', 'gray.700');
  
  useEffect(() => {
    if (!serviceId || !campaignId) {
      setError('Service ID and Campaign ID are required');
      setLoading(false);
      return;
    }
    
    const fetchEvaluations = async () => {
      try {
        // Fetch all evaluations for this service in this campaign
        const [serviceRes, campaignRes, evaluationsRes] = await Promise.all([
          api.get(`/services/${serviceId}`),
          api.get(`/campaigns/${campaignId}`),
          api.get(`/services/${serviceId}/campaigns`),
        ]);
        
        setServiceName(serviceRes.data.name);
        setCampaignName(campaignRes.data.campaign.name);
        
        // Find the right campaign and get its evaluations
        const campaignData = evaluationsRes.data.find(
          (c: any) => c.campaign.id === campaignId
        );
        
        if (campaignData && campaignData.evaluations) {
          setEvaluations(campaignData.evaluations);
        } else {
          setEvaluations([]);
        }
      } catch (error) {
        console.error('Error fetching evaluations:', error);
        setError('Failed to load evaluations. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvaluations();
  }, [serviceId, campaignId]);
  
  const getStatusBadge = (status: EvaluationStatus) => {
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
  
  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading evaluations...</Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Heading mb={6}>Service Evaluations</Heading>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
        <Button
          leftIcon={<FiArrowLeft />}
          onClick={() => navigate(-1)}
          variant="outline"
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Flex align="center" mb={4}>
        <Button
          onClick={() => navigate(-1)}
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          size="sm"
          mr={4}
        >
          Back
        </Button>
        
        <Box>
          <Heading size="lg">Service Evaluations</Heading>
          <Text color="gray.500">
            {serviceName} • {campaignName}
          </Text>
        </Box>
      </Flex>
      
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        shadow="md"
      >
        {evaluations.length > 0 ? (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Measurement</Th>
                <Th>Status</Th>
                <Th>Evidence</Th>
                <Th>Updated At</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {evaluations.map((evaluation) => (
                <Tr key={evaluation.id}>
                  <Td fontWeight="medium">
                    {evaluation.measurement?.name || 'Unknown Measurement'}
                  </Td>
                  <Td>{getStatusBadge(evaluation.status)}</Td>
                  <Td>
                    {evaluation.evidenceLocation ? (
                      <Text noOfLines={1}>{evaluation.evidenceLocation}</Text>
                    ) : (
                      <Text color="gray.500">No evidence provided</Text>
                    )}
                  </Td>
                  <Td>
                    {new Date(evaluation.updatedAt).toLocaleDateString()}
                  </Td>
                  <Td>
                    <Button
                      as={RouterLink}
                      to={`/evaluations/${evaluation.id}`}
                      size="sm"
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
          <Alert status="info">
            <AlertIcon />
            No evaluations found for this service in this campaign.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default ServiceEvaluationsPage;
