import React from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Badge,
  Progress,
  useColorModeValue
} from '@chakra-ui/react';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  status: 'complete' | 'in-progress' | 'planned' | 'failed';
  percentage?: number;
}

interface ProgressTimelineProps {
  title: string;
  events: TimelineEvent[];
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  title,
  events
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <FiCheck color="green" />;
      case 'failed':
        return <FiX color="red" />;
      case 'in-progress':
      case 'planned':
      default:
        return <FiClock />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    const props = {
      complete: { colorScheme: 'green', text: 'Complete' },
      'in-progress': { colorScheme: 'blue', text: 'In Progress' },
      planned: { colorScheme: 'gray', text: 'Planned' },
      failed: { colorScheme: 'red', text: 'Failed' }
    };
    
    const statusProps = props[status as keyof typeof props];
    
    return (
      <Badge colorScheme={statusProps.colorScheme}>
        {statusProps.text}
      </Badge>
    );
  };
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
    >
      <Heading size="md" mb={4}>{title}</Heading>
      
      <Box>
        {sortedEvents.map((event, index) => (
          <Flex key={event.id} mb={4}>
            <Box
              borderRadius="full"
              bg={
                event.status === 'complete' ? 'green.500' :
                event.status === 'in-progress' ? 'blue.500' :
                event.status === 'failed' ? 'red.500' : 'gray.400'
              }
              p={2}
              color="white"
              mr={4}
            >
              {getStatusIcon(event.status)}
            </Box>
            
            <Box flex="1">
              <Flex justify="space-between" align="flex-start" mb={1}>
                <Box>
                  <Text fontWeight="bold">{event.title}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(event.date).toLocaleDateString()}
                  </Text>
                </Box>
                
                {getStatusBadge(event.status)}
              </Flex>
              
              <Text fontSize="sm" mb={2}>{event.description}</Text>
              
              {event.status === 'in-progress' && event.percentage !== undefined && (
                <Progress value={event.percentage} size="sm" colorScheme="blue" />
              )}
              
              {index < sortedEvents.length - 1 && (
                <Box
                  position="relative"
                  ml="-24px"
                  pl="24px"
                  height="20px"
                  borderLeft="2px"
                  borderColor={
                    event.status === 'complete' ? 'green.500' :
                    event.status === 'in-progress' ? 'blue.500' :
                    event.status === 'failed' ? 'red.500' : 'gray.400'
                  }
                />
              )}
            </Box>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};

export default ProgressTimeline;

