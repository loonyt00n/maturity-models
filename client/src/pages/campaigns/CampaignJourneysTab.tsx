import React from 'react';
import {
  Box,
  Link,
  Badge,
  Progress,
  Text,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { JourneyMaturityResult } from '../../models';

interface CampaignJourneysTabProps {
  journeyResults: JourneyMaturityResult[];
  getMaturityLevelColor: (level: number) => string;
}

const CampaignJourneysTab: React.FC<CampaignJourneysTabProps> = ({
  journeyResults,
  getMaturityLevelColor
}) => {
  return (
    <Box>
      <Accordion allowMultiple>
        {journeyResults.map((journey) => (
          <AccordionItem key={journey.journeyId}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Flex align="center">
                    <Text fontWeight="bold" mr={2}>{journey.journeyName}</Text>
                    <Badge colorScheme={getMaturityLevelColor(journey.maturityLevel)}>
                      Level {journey.maturityLevel}
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
                  to={`/journeys/${journey.journeyId}`} 
                  color="blue.500"
                >
                  View Journey Details
                </Link>
              </Box>
              
              <Accordion allowMultiple>
                {journey.activityResults.map((activity) => (
                  <AccordionItem key={activity.activityId}>
                    <h3>
                      <AccordionButton pl={4}>
                        <Box flex="1" textAlign="left">
                          <Flex align="center">
                            <Text fontWeight="medium" mr={2}>{activity.activityName}</Text>
                            <Badge colorScheme={getMaturityLevelColor(activity.maturityLevel)}>
                              Level {activity.maturityLevel}
                            </Badge>
                          </Flex>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h3>
                    <AccordionPanel pb={4} pl={8}>
                      <Box mb={2}>
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
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default CampaignJourneysTab;
