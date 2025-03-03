import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useColorModeValue,
  Stack
} from '@chakra-ui/react';
import { 
  FiClock, 
  FiEdit, 
  FiFile, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiArrowDown 
} from 'react-icons/fi';
import api from '../../api/api';

interface HistoryEntry {
  id: string;
  changeType: string;
  previousStatus: string | null;
  newStatus: string | null;
  previousValue: string | null;
  newValue: string | null;
  changeReason: string | null;
  validationResults: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    name: string;
    username: string;
  } | null;
}

interface EvaluationHistoryProps {
  evaluationId: string;
}

const EvaluationHistory: React.FC<EvaluationHistoryProps> = ({ evaluationId }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    fetchEvaluationHistory();
  }, [evaluationId]);
  
  const fetchEvaluationHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/evaluations/${evaluationId}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching evaluation history:', error);
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
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
  
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'status_change':
        return <FiClock />;
      case 'evidence_update':
        return <FiFile />;
      case 'notes_update':
        return <FiMessageSquare />;
      case 'validation_result':
        return <FiCheckCircle />;
      default:
        return <FiEdit />;
    }
  };
  
  const formatChangeType = (changeType: string) => {
    switch (changeType) {
      case 'status_change':
        return 'Status Change';
      case 'evidence_update':
        return 'Evidence Update';
      case 'notes_update':
        return 'Notes Update';
      case 'validation_result':
        return 'Validation Results';
      default:
        return changeType.replace('_', ' ');
    }
  };
  
  const displayValidationResults = (validationResultsJson: string) => {
    try {
      const results = JSON.parse(validationResultsJson);
      
      return (
        <Box mt={2} p={3} borderWidth="1px" borderRadius="md" fontSize="sm">
          <Text fontWeight="bold" mb={2}>
            Validation Result: {results.valid ? 'Passed' : 'Failed'}
          </Text>
          <Text mb={2}>{results.message}</Text>
          
          {results.checks && results.checks.length > 0 && (
            <Stack spacing={2} mt={2}>
              {results.checks.map((check: any, index: number) => (
                <Flex key={index} alignItems="center">
                  <Badge colorScheme={check.valid ? 'green' : 'red'} mr={2}>
                    {check.name}
                  </Badge>
                  <Text fontSize="xs">{check.message}</Text>
                </Flex>
              ))}
            </Stack>
          )}
        </Box>
      );
    } catch (e) {
      return <Text mt={2} fontSize="sm">Invalid validation results format</Text>;
    }
  };
  
  if (loading) {
    return (
      <Flex justify="center" align="center" p={6}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  if (history.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        No history records available for this evaluation.
      </Alert>
    );
  }
  
  // Display only the 5 most recent entries unless showMore is true
  const displayHistory = showMore ? history : history.slice(0, 5);
  
  return (
    <Box>
      <Heading size="md" mb={4}>Evaluation History</Heading>
      
      <Stack spacing={4}>
        {displayHistory.map((entry, index) => (
          <Box 
            key={entry.id} 
            p={4} 
            borderWidth="1px" 
            borderRadius="md" 
            bg={bgColor}
            position="relative"
          >
            <Flex align="center" mb={2}>
              <Box mr={3} color="blue.500">
                {getChangeIcon(entry.changeType)}
              </Box>
              <Text fontWeight="bold">
                {formatChangeType(entry.changeType)}
              </Text>
              <Text fontSize="sm" color="gray.500" ml="auto">
                {new Date(entry.createdAt).toLocaleString()}
              </Text>
            </Flex>
            
            {entry.changeType === 'status_change' && (
              <Flex align="center" mt={2}>
                <Text mr={2}>Status changed from</Text>
                {getStatusBadge(entry.previousStatus)}
                <Text mx={2}>to</Text>
                {getStatusBadge(entry.newStatus)}
              </Flex>
            )}
            
            {entry.changeType === 'evidence_update' && (
              <Box mt={2}>
                <Text>Evidence location updated:</Text>
                <Text fontSize="sm" mt={1} fontFamily="monospace" p={2} bg="gray.100" borderRadius="md">
                  {entry.newValue || 'None'}
                </Text>
              </Box>
            )}
            
            {entry.changeType === 'notes_update' && (
              <Box mt={2}>
                <Text>Notes updated:</Text>
                <Text fontSize="sm" mt={1} p={2} bg="gray.100" borderRadius="md">
                  {entry.newValue || 'None'}
                </Text>
              </Box>
            )}
            
            {entry.changeType === 'validation_result' && entry.validationResults && (
              displayValidationResults(entry.validationResults)
            )}
            
            {entry.changeReason && (
              <Text mt={2} fontSize="sm" fontStyle="italic">
                Reason: {entry.changeReason}
              </Text>
            )}
            
            {entry.changedBy && (
              <Text mt={2} fontSize="sm" color="gray.500">
                Changed by {entry.changedBy.name} ({entry.changedBy.username})
              </Text>
            )}
            
            {index < displayHistory.length - 1 && (
              <Flex justify="center" my={2} position="relative">
                <FiArrowDown color="gray" />
              </Flex>
            )}
          </Box>
        ))}
      </Stack>
      
      {history.length > 5 && (
        <Button 
          mt={4} 
          size="sm" 
          variant="outline" 
          onClick={() => setShowMore(!showMore)}
          width="100%"
        >
          {showMore ? 'Show Less' : `Show More (${history.length - 5} more entries)`}
        </Button>
      )}
    </Box>
  );
};

export default EvaluationHistory;
