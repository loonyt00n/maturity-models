import React, { useState } from 'react';
import {
  Box,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useColorModeValue,
  Flex
} from '@chakra-ui/react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import JourneysTab from './JourneysTab';

const JourneysPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Journeys</Heading>
        
        <Flex>
          <InputGroup maxW="300px" mr={2}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search journeys..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          
          <IconButton
            aria-label="Refresh"
            icon={<FiRefreshCw />}
            onClick={handleRefresh}
          />
        </Flex>
      </Flex>
      
      <Box
        bg={bgColor}
        p={4}
        borderRadius="lg"
        shadow="md"
      >
        <JourneysTab searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
      </Box>
    </Box>
  );
};

export default JourneysPage;
