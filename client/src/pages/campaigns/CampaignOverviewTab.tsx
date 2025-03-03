import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Flex,
  Badge,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Campaign, 
  MaturityModel, 
  JourneyMaturityResult, 
  ActivityMaturityResult, 
  ServiceMaturityResult 
} from '../../models';

interface CampaignOverviewTabProps {
  campaign: Campaign;
  maturityModel: MaturityModel;
  results: {
    journeyResults: JourneyMaturityResult[];
    activityResults: ActivityMaturityResult[];
    serviceResults: ServiceMaturityResult[];
    overallLevel: number;
    overallPercentage: number;
  };
  getMaturityLevelColor: (level: number) => string;
}

const CampaignOverviewTab: React.FC<CampaignOverviewTabProps> = ({
  campaign,
  maturityModel,
  results,
  getMaturityLevelColor
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Create data for maturity level distribution pie chart
  const distributionData = [0, 0, 0, 0, 0]; // Level 0-4 counts
  results.serviceResults.forEach(result => {
    distributionData[result.maturityLevel]++;
  });
  
  const pieData = distributionData.map((count, index) => ({
    name: `Level ${index}`,
    value: count
  })).filter(item => item.value > 0);
  
  // Create data for journey maturity bar chart
  const journeyBarData = results.journeyResults.map(journey => ({
    name: journey.journeyName,
    maturityLevel: journey.maturityLevel,
    percentage: results.serviceResults
      .filter(s => results.activityResults
        .filter(a => journey.activityResults.some(ja => ja.activityId === a.activityId))
        .some(a => a.serviceResults.some(sr => sr.serviceId === s.serviceId)))
      .reduce((sum, s) => sum + s.percentage, 0) / 
      results.serviceResults
        .filter(s => results.activityResults
          .filter(a => journey.activityResults.some(ja => ja.activityId === a.activityId))
          .some(a => a.serviceResults.some(sr => sr.serviceId === s.serviceId)))
        .length || 0
  }));
  
  const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884D8'];
  
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Stat
          p={4}
          shadow="sm"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={cardBg}
        >
          <StatLabel>Overall Maturity</StatLabel>
          <StatNumber>Level {results.overallLevel}</StatNumber>
          <StatHelpText>{results.overallPercentage.toFixed(1)}% Complete</StatHelpText>
          <Progress 
            value={results.overallPercentage} 
            colorScheme={getMaturityLevelColor(results.overallLevel)}
            size="sm"
            mt={2}
          />
        </Stat>
        
        <Stat
          p={4}
          shadow="sm"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={cardBg}
        >
          <StatLabel>Services Evaluated</StatLabel>
          <StatNumber>{results.serviceResults.length}</StatNumber>
          <StatHelpText>Across {results.journeyResults.length} Journeys</StatHelpText>
        </Stat>
        
        <Stat
          p={4}
          shadow="sm"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={cardBg}
        >
          <StatLabel>Top Maturity Level</StatLabel>
          <Flex align="center">
            <Badge 
              colorScheme={getMaturityLevelColor(Math.max(...results.serviceResults.map(s => s.maturityLevel)))}
              fontSize="xl"
              px={2}
              py={0.5}
            >
              Level {Math.max(...results.serviceResults.map(s => s.maturityLevel))}
            </Badge>
          </Flex>
          <StatHelpText>
            {results.serviceResults.filter(s => s.maturityLevel === Math.max(...results.serviceResults.map(s => s.maturityLevel))).length} Services
          </StatHelpText>
        </Stat>
        
        <Stat
          p={4}
          shadow="sm"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={cardBg}
        >
          <StatLabel>Bottom Maturity Level</StatLabel>
          <Flex align="center">
            <Badge 
              colorScheme={getMaturityLevelColor(Math.min(...results.serviceResults.map(s => s.maturityLevel)))}
              fontSize="xl"
              px={2}
              py={0.5}
            >
              Level {Math.min(...results.serviceResults.map(s => s.maturityLevel))}
            </Badge>
          </Flex>
          <StatHelpText>
            {results.serviceResults.filter(s => s.maturityLevel === Math.min(...results.serviceResults.map(s => s.maturityLevel))).length} Services
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        <GridItem>
          <Box
            p={4}
            shadow="sm"
            border="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={cardBg}
            height="100%"
          >
            <Heading size="md" mb={4}>Maturity Level Distribution</Heading>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[parseInt(entry.name.split(' ')[1])]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box
            p={4}
            shadow="sm"
            border="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={cardBg}
            height="100%"
          >
            <Heading size="md" mb={4}>Journey Maturity Levels</Heading>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={journeyBarData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 4]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip 
                    formatter={(value, name) => [`Level ${value}`, 'Maturity Level']}
                  />
                  <Bar 
                    dataKey="maturityLevel" 
                    fill="#8884d8" 
                    name="Maturity Level"
                    label={{ position: 'right', formatter: (val: number) => `Level ${val}` }}
                  >
                    {journeyBarData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.maturityLevel]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default CampaignOverviewTab;

