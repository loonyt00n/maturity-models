
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Stack, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Link,
  useColorModeValue,
  Flex,
  Progress,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import api from '../../api/api';
import { MaturityModel, Service, Activity, Journey, Campaign } from '../../models';

interface DashboardStats {
  maturityModels: number;
  services: number;
  activities: number;
  journeys: number;
  activeCampaigns: number;
}

interface MaturityDistribution {
  level: string;
  count: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    maturityModels: 0,
    services: 0,
    activities: 0,
    journeys: 0,
    activeCampaigns: 0
  });
  const [maturityDistribution, setMaturityDistribution] = useState<MaturityDistribution[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const statBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setError(null);
      try {
        const [
          maturityModelsRes,
          servicesRes,
          activitiesRes,
          journeysRes,
          campaignsRes,
          distributionRes
        ] = await Promise.all([
          api.get<MaturityModel[]>('/maturity-models'),
          api.get<Service[]>('/services'),
          api.get<Activity[]>('/activities'),
          api.get<Journey[]>('/journeys'),
          api.get<Campaign[]>('/campaigns'),
          api.get<MaturityDistribution[]>('/evaluations/distribution')
        ]);
        
        setStats({
          maturityModels: maturityModelsRes.data.length,
          services: servicesRes.data.length,
          activities: activitiesRes.data.length,
          journeys: journeysRes.data.length,
          activeCampaigns: campaignsRes.data.filter(c => !c.endDate).length
        });
        
        setRecentCampaigns(campaignsRes.data.slice(0, 5));
        setMaturityDistribution(distributionRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (error) {
    return (
      <Box>
        <Heading mb={6}>Dashboard</Heading>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      
      {loading ? (
        <Text>Loading dashboard data...</Text>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} mb={8}>
            <Stat
              p={4}
              shadow="md"
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={statBg}
            >
              <StatLabel>Maturity Models</StatLabel>
              <StatNumber>{stats.maturityModels}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/maturity-models" color="blue.500">
                  View all
                </Link>
              </StatHelpText>
            </Stat>
            
            <Stat
              p={4}
              shadow="md"
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={statBg}
            >
              <StatLabel>Services</StatLabel>
              <StatNumber>{stats.services}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/services" color="blue.500">
                  View all
                </Link>
              </StatHelpText>
            </Stat>
            
            <Stat
              p={4}
              shadow="md"
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={statBg}
            >
              <StatLabel>Activities</StatLabel>
              <StatNumber>{stats.activities}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/activities" color="blue.500">
                  View all
                </Link>
              </StatHelpText>
            </Stat>
            
            <Stat
              p={4}
              shadow="md"
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={statBg}
            >
              <StatLabel>Journeys</StatLabel>
              <StatNumber>{stats.journeys}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/journeys" color="blue.500">
                  View all
                </Link>
              </StatHelpText>
            </Stat>
            
            <Stat
              p={4}
              shadow="md"
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={statBg}
            >
              <StatLabel>Active Campaigns</StatLabel>
              <StatNumber>{stats.activeCampaigns}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/campaigns" color="blue.500">
                  View all
                </Link>
              </StatHelpText>
            </Stat>
          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
            <Box
              p={6}
              shadow="md"
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={statBg}
            >
              <Heading size="md" mb={4}>
                Maturity Level Distribution
              </Heading>
              
              <Box height="300px">
                {maturityDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={maturityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#4299E1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex justify="center" align="center" height="100%">
                    <Text>No maturity data available</Text>
                  </Flex>
                )}
              </Box>
            </Box>
            
            <Box
              p={6}
              shadow="md"
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={statBg}
            >
              <Heading size="md" mb={4}>
                Recent Campaigns
              </Heading>
              
              {recentCampaigns.length > 0 ? (
                <Stack spacing={4}>
                  {recentCampaigns.map((campaign) => (
                    <Box key={campaign.id} p={4} borderWidth="1px" borderRadius="md">
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Link 
                            as={RouterLink} 
                            to={`/campaigns/${campaign.id}`} 
                            fontWeight="bold"
                          >
                            {campaign.name}
                          </Link>
                          <Text fontSize="sm">{campaign.description}</Text>
                        </Box>
                        <Box textAlign="right">
                          <Text fontSize="sm">
                            {new Date(campaign.startDate).toLocaleDateString()} - 
                            {campaign.endDate 
                              ? new Date(campaign.endDate).toLocaleDateString()
                              : ' Ongoing'}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text>No recent campaigns found.</Text>
              )}
            </Box>
          </SimpleGrid>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
