import React from 'react';
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
  Text,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ActivityMaturityResult } from '../../models';

interface CampaignActivitiesTabProps {
  activityResults: ActivityMaturityResult[];
  getMaturityLevelColor: (level: number) => string;
}

const CampaignActivitiesTab: React.FC<CampaignActivitiesTabProps> = ({
  activityResults,
  getMaturityLevelColor
}) => {
  return (
    <Box>
      <Accordion allowMultiple>
        {activityResults.map((activity) => (
          <AccordionItem key={activity.activityId}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Flex align="center">
                    <Text fontWeight="bold" mr={2}>{activity.activityName}</Text>
                    <Badge colorScheme={getMaturityLevelColor(activity.maturityLevel)}>
                      Level {activity.maturityLevel}
                    </Badge>
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Box mb={4}>
                <Link 
                  as={RouterLink} 
                  to={`/activities/${activity.activityId}`} 
                  color="blue.500"
                >
                  View Activity Details
                </Link>
              </Box>
              
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Service</Th>
                    <Th>Maturity Level</Th>
                    <Th>Progress</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activity.serviceResults.map((service) => (
                    <Tr key={service.serviceId}>
                      <Td>
                        <Link 
                          as={RouterLink} 
                          to={`/services/${service.serviceId}`} 
                          color="blue.500"
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
                        <Flex direction="column" width="200px">
                          <Text fontSize="xs" mb={1}>
                            {service.percentage}% Complete
                          </Text>
                          <Progress 
                            value={service.percentage} 
                            size="xs" 
                            colorScheme={getMaturityLevelColor(service.maturityLevel)} 
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default CampaignActivitiesTab;

