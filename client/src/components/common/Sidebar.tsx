import React from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  Text, 
  Icon, 
  Divider,
  useColorModeValue 
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../models';
import { 
  FiHome, 
  FiDatabase, 
  FiServer, 
  FiLayers, 
  FiMap,
  FiClipboard, 
  FiSettings,
  FiUsers
} from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { hasRole } = useAuth();
  
  const isAdmin = hasRole([UserRole.ADMIN]);
  const isEditor = hasRole([UserRole.ADMIN, UserRole.EDITOR]);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  
  const NavItem = ({ icon, label, to }: { icon: any; label: string; to: string }) => {
    const isActive = pathname === to || pathname.startsWith(`${to}/`);
    
    return (
      <Flex
        as={RouterLink}
        to={to}
        p={3}
        borderRadius="md"
        alignItems="center"
        cursor="pointer"
        color={isActive ? activeColor : 'inherit'}
        bg={isActive ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
        _hover={{
          bg: useColorModeValue('gray.100', 'gray.700'),
        }}
      >
        <Icon as={icon} fontSize="18px" mr={3} />
        <Text fontWeight={isActive ? 'bold' : 'normal'}>{label}</Text>
      </Flex>
    );
  };
  
  return (
    <Box
      w="250px"
      bg={bgColor}
      borderRightWidth="1px"
      overflowY="auto"
      h="100vh"
      py={4}
      px={3}
    >
      <Box mx={3} mb={6}>
        <Text fontSize="xl" fontWeight="bold">Maturity Models</Text>
      </Box>
      
      <VStack spacing={1} align="stretch">
        <NavItem icon={FiHome} label="Dashboard" to="/dashboard" />
        
        <Box mt={4} mb={2}>
          <Text fontWeight="bold" fontSize="sm" px={3} color="gray.500">
            CATALOG
          </Text>
        </Box>
        
        <NavItem icon={FiDatabase} label="All Catalog" to="/catalog" />
        <NavItem icon={FiLayers} label="Maturity Models" to="/maturity-models" />
        <NavItem icon={FiServer} label="Services" to="/services" />
        <NavItem icon={FiMap} label="Activities" to="/activities" />
        <NavItem icon={FiMap} label="Journeys" to="/journeys" />
        
        <Box mt={4} mb={2}>
          <Text fontWeight="bold" fontSize="sm" px={3} color="gray.500">
            CAMPAIGNS
          </Text>
        </Box>
        
        <NavItem icon={FiClipboard} label="Campaigns" to="/campaigns" />
        
        {isAdmin && (
          <>
            <Box mt={4} mb={2}>
              <Text fontWeight="bold" fontSize="sm" px={3} color="gray.500">
                ADMIN
              </Text>
            </Box>
            
            <NavItem icon={FiSettings} label="Admin Dashboard" to="/admin" />
            <NavItem icon={FiUsers} label="User Management" to="/admin/users" />
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;

