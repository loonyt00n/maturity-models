
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../../api/api';
import EvaluationDetails from '../../components/evaluation/EvaluationDetails';

const EvaluationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.700');
  
  // We're just checking if the evaluation exists
  // The actual loading happens in the EvaluationDetails component
  useEffect(() => {
    const checkEvaluation = async () => {
      if (!id) {
        setError('No evaluation ID provided');
        setLoading(false);
        return;
      }
      
      try {
        await api.get(`/evaluations/${id}`);
        setLoading(false);
      } catch (error) {
        console.error('Error checking evaluation:', error);
        setError('Failed to load evaluation. Please try again.');
        setLoading(false);
      }
    };
    
    checkEvaluation();
  }, [id]);
  
  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
      </Box>
    );
  }
  
  if (error || !id) {
    return (
      <Box>
        <Heading mb={6}>Evaluation Details</Heading>
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error || 'Invalid evaluation ID'}
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
      <Heading mb={6}>Evaluation Details</Heading>
      
      <Button
        leftIcon={<FiArrowLeft />}
        onClick={() => navigate(-1)}
        variant="ghost"
        size="sm"
        mb={4}
      >
        Back
      </Button>
      
      <Box
        bg={bgColor}
        borderRadius="lg"
        shadow="md"
        overflow="hidden"
      >
        <EvaluationDetails evaluationId={id} />
      </Box>
    </Box>
  );
};

export default EvaluationDetailsPage;
