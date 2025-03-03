import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Link,
  Icon,
  Divider,
  useColorModeValue,
  Button,
  Badge  // Added Badge import
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiUsers, FiLayers, FiServer, FiMap, FiClipboard, FiBarChart2 } from 'react-icons/fi';
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
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole } from '../../models';

interface SystemStats {
  userCount: number;
  maturityModelCount: number;
  serviceCount: number;
  activityCount: number;
  journeyCount: number;
  campaignCount: number;
}

interface RoleDistribution {
  name: string;
  value: number;
}

interface MaturityDistribution {
  level: number;
  count: number;
  percentage: number;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    userCount: 0,
    maturityModelCount: 0,
    serviceCount: 0,
    activityCount: 0,
    journeyCount: 0,
    campaignCount: 0
  });
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [maturityDistribution, setMaturityDistribution] = useState<MaturityDistribution[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be actual API endpoints
        const [statsRes, usersRes, distributionRes] = await Promise.all([
          api.get<SystemStats>('/admin/stats'),
          api.get<User[]>('/admin/recent-users'),
          api.get<{
            roleDistribution: RoleDistribution[];
            maturityDistribution: MaturityDistribution[];
          }>('/admin/distributions')
        ]);
        
        setStats(statsRes.data);
        setRecentUsers(usersRes.data);
        setRoleDistribution(distributionRes.data.roleDistribution);
        setMaturityDistribution(distributionRes.data.maturityDistribution);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Use mock data for the prototype
        setStats({
          userCount: 15,
          maturityModelCount: 3,
          serviceCount: 22,
          activityCount: 8,
          journeyCount: 4,
          campaignCount: 5
        });
        
        setRecentUsers([
          {
            id: '2',
            username: 'editor1',
            name: 'Editor User',
            email: 'editor@example.com',
            role: UserRole.EDITOR,
            createdAt: '2023-01-15T10:00:00.000Z',
            updatedAt: '2023-01-15T10:00:00.000Z'
          },
          {
            id: '3',
            username: 'viewer1',
            name: 'Viewer User',
            email: 'viewer@example.com',
            role: UserRole.VIEWER,
            createdAt: '2023-01-20T10:00:00.000Z',
            updatedAt: '2023-01-20T10:00:00.000Z'
          }
        ]);
        
        setRoleDistribution([
          { name: 'Admin', value: 1 },
          { name: 'Editor', value: 4 },
          { name: 'Viewer', value: 10 }
        ]);
        
        setMaturityDistribution([
          { level: 0, count: 5, percentage: 20 },
          { level: 1, count: 6, percentage: 25 },
          { level: 2, count: 8, percentage: 35 },
          { level: 3, count: 3, percentage: 15 },
          { level: 4, count: 1, percentage: 5 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <Box>
      <Heading mb={6}>Admin Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <Stat
          p={4}
          shadow="md"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Flex align="center">
            <Box
              mr={4}
              bg="blue.500"
              p={2}
              borderRadius="md"
              color="white"
            >
              <Icon as={FiUsers} boxSize={6} />
            </Box>
            <Box>
              <StatLabel>Users</StatLabel>
              <StatNumber>{stats.userCount}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/admin/users" color="blue.500">
                  Manage Users
                </Link>
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
        
        <Stat
          p={4}
          shadow="md"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Flex align="center">
            <Box
              mr={4}
              bg="green.500"
              p={2}
              borderRadius="md"
              color="white"
            >
              <Icon as={FiLayers} boxSize={6} />
            </Box>
            <Box>
              <StatLabel>Maturity Models</StatLabel>
              <StatNumber>{stats.maturityModelCount}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/maturity-models" color="blue.500">
                  View All
                </Link>
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
        
        <Stat
          p={4}
          shadow="md"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Flex align="center">
            <Box
              mr={4}
              bg="purple.500"
              p={2}
              borderRadius="md"
              color="white"
            >
              <Icon as={FiClipboard} boxSize={6} />
            </Box>
            <Box>
              <StatLabel>Campaigns</StatLabel>
              <StatNumber>{stats.campaignCount}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/campaigns" color="blue.500">
                  View All
                </Link>
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
        
        <Stat
          p={4}
          shadow="md"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Flex align="center">
            <Box
              mr={4}
              bg="orange.500"
              p={2}
              borderRadius="md"
              color="white"
            >
              <Icon as={FiServer} boxSize={6} />
            </Box>
            <Box>
              <StatLabel>Services</StatLabel>
              <StatNumber>{stats.serviceCount}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/services" color="blue.500">
                  View All
                </Link>
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
        
        <Stat
          p={4}
          shadow="md"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Flex align="center">
            <Box
              mr={4}
              bg="cyan.500"
              p={2}
              borderRadius="md"
              color="white"
            >
              <Icon as={FiMap} boxSize={6} />
            </Box>
            <Box>
              <StatLabel>Activities</StatLabel>
              <StatNumber>{stats.activityCount}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/activities" color="blue.500">
                  View All
                </Link>
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
        
        <Stat
          p={4}
          shadow="md"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Flex align="center">
            <Box
              mr={4}
              bg="red.500"
              p={2}
              borderRadius="md"
              color="white"
            >
              <Icon as={FiBarChart2} boxSize={6} />
            </Box>
            <Box>
              <StatLabel>Journeys</StatLabel>
              <StatNumber>{stats.journeyCount}</StatNumber>
              <StatHelpText>
                <Link as={RouterLink} to="/journeys" color="blue.500">
                  View All
                </Link>
              </StatHelpText>
            </Box>
          </Flex>
        </Stat>
      </SimpleGrid>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        <Box
          p={6}
          shadow="md"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Heading size="md" mb={4}>
            User Role Distribution
          </Heading>
          
          <Box height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        
        <Box
          p={6}
          shadow="md"
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Heading size="md" mb={4}>
            Maturity Level Distribution
          </Heading>
          
          <Box height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={maturityDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" name="Level" label={{ value: 'Maturity Level', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" orientation="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Percentage', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="Service Count" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="percentage" name="Percentage" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SimpleGrid>
      
      <Box
        p={6}
        shadow="md"
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        bg={bgColor}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">
            Recently Added Users
          </Heading>
          
          <Button
            as={RouterLink}
            to="/admin/users"
            colorScheme="blue"
            size="sm"
          >
            View All Users
          </Button>
        </Flex>
        
        <Divider mb={4} />
        
        {recentUsers.map((user, index) => (
          <React.Fragment key={user.id}>
            <Flex justify="space-between" align="center" py={3}>
              <Box>
                <Text fontWeight="bold">{user.name}</Text>
                <Text fontSize="sm" color="gray.500">{user.email}</Text>
              </Box>
              
              <Flex align="center">
                <Badge 
                  colorScheme={
                    user.role === UserRole.ADMIN ? 'purple' :
                    user.role === UserRole.EDITOR ? 'blue' : 'gray'
                  }
                  mr={3}
                >
                  {user.role}
                </Badge>
                
                <Text fontSize="sm" color="gray.500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </Flex>
            </Flex>
            
            {index < recentUsers.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        
        {recentUsers.length === 0 && (
          <Text textAlign="center" py={4}>
            No users found
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;

