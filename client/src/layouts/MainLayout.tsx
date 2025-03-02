import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const MainLayout: React.FC = () => {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Flex flex="1" direction="column" overflow="auto">
        <Header />
        <Box p={4} flex="1">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default MainLayout;

