import React from 'react';
import { 
  Box, 
  Flex, 
  HStack, 
  Icon, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Button, 
  Avatar, 
  Text, 
  useColorModeValue 
} from '@chakra-ui/react';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box 
      as="header" 
      bg={bgColor} 
      borderBottomWidth="1px" 
      py={3} 
      px={6}
      position="sticky"
      top="0"
      zIndex="10"
    >
      <Flex justify="space-between" align="center">
        <Text fontWeight="bold" fontSize="lg">
          Maturity Model Platform
        </Text>
        
        <HStack spacing={3}>
          <Menu>
            <MenuButton 
              as={Button} 
              variant="ghost" 
              rightIcon={<Icon as={FiChevronDown} />}
            >
              <Flex align="center">
                <Avatar size="sm" name={user?.name} mr={2} />
                <Text>{user?.name}</Text>
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Icon as={FiUser} />}>
                Profile
              </MenuItem>
              <MenuItem 
                icon={<Icon as={FiLogOut} />} 
                onClick={logout}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;

