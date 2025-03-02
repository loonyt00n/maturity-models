import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, Flex, Heading, Image } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Flex minH="100vh" bg="gray.50">
      <Flex 
        flex="1" 
        maxW="1200px" 
        mx="auto" 
        alignItems="center" 
        justifyContent="center"
      >
        <Box 
          w="full" 
          maxW="md" 
          p={8} 
          borderWidth={1} 
          borderRadius="lg" 
          boxShadow="lg" 
          bg="white"
        >
          <Box textAlign="center" mb={8}>
            <Heading>Maturity Model Platform</Heading>
          </Box>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default AuthLayout;

