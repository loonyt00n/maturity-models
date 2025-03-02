import React, { useState } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useColorModeValue,
  Flex,
  Text
} from '@chakra-ui/react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import MaturityModelsTab from './MaturityModelsTab';
import ServicesTab from './ServicesTab';
import ActivitiesTab from './ActivitiesTab';
import JourneysTab from './JourneysTab';

const CatalogPage: React.FC = () => {
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
        <Heading>Catalog</Heading>
        
        <Flex>
          <InputGroup maxW="300px" mr={2}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search catalog..."
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
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Maturity Models</Tab>
            <Tab>Services</Tab>
            <Tab>Activities</Tab>
            <Tab>Journeys</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <MaturityModelsTab searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
            </TabPanel>
            <TabPanel>
              <ServicesTab searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
            </TabPanel>
            <TabPanel>
              <ActivitiesTab searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
            </TabPanel>
            <TabPanel>
              <JourneysTab searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default CatalogPage;

