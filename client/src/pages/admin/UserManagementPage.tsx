import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  VStack,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiMoreVertical, FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import api from '../../api/api';
import { User, UserRole } from '../../models';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          user => 
            user.name.toLowerCase().includes(term) || 
            user.username.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get<User[]>('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock data for the prototype
      setUsers([
        {
          id: '1',
          username: 'admin',
          name: 'Administrator',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        },
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
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddUser = () => {
    setSelectedUser(null);
    onOpen();
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };
  
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // In a real app, this would call the API
      // await api.delete(`/admin/users/${selectedUser.id}`);
      
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      toast({
        title: 'User deleted',
        description: `${selectedUser.name} has been removed.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsDeleteAlertOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const userData = {
      username: formData.get('username') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      ...(selectedUser ? {} : { password: formData.get('password') as string })
    };
    
    try {
      if (selectedUser) {
        // Update existing user
        // In a real app, this would call the API
        // const response = await api.put(`/admin/users/${selectedUser.id}`, userData);
        
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...userData, updatedAt: new Date().toISOString() } 
            : user
        ));
        
        toast({
          title: 'User updated',
          description: `${userData.name} has been updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new user
        // In a real app, this would call the API
        // const response = await api.post('/admin/users', userData);
        const now = new Date().toISOString();
        
        setUsers([
          ...users,
          {
            id: `temp-${Date.now()}`,
            ...userData,
            createdAt: now,
            updatedAt: now
          }
        ]);
        
        toast({
          title: 'User created',
          description: `${userData.name} has been added.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const getRoleBadge = (role: UserRole) => {
    const colorSchemes = {
      [UserRole.ADMIN]: 'purple',
      [UserRole.EDITOR]: 'blue',
      [UserRole.VIEWER]: 'gray'
    };
    
    return (
      <Badge colorScheme={colorSchemes[role]}>
        {role}
      </Badge>
    );
  };
  
  return (
    <Box>
      <Heading mb={6}>User Management</Heading>
      
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        shadow="md"
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Flex>
            <InputGroup maxW="300px" mr={2}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Button leftIcon={<FiFilter />} variant="outline" mr={2}>
              Filter
            </Button>
            
            <IconButton
              aria-label="Refresh"
              icon={<FiRefreshCw />}
              onClick={fetchUsers}
            />
          </Flex>
          
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Flex>
        
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map((user) => (
              <Tr key={user.id}>
                <Td fontWeight="medium">{user.name}</Td>
                <Td>{user.username}</Td>
                <Td>{user.email}</Td>
                <Td>{getRoleBadge(user.role)}</Td>
                <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                <Td>
                  <Flex>
                    <IconButton
                      aria-label="Edit user"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      mr={2}
                      onClick={() => handleEditUser(user)}
                    />
                    
                    <IconButton
                      aria-label="Delete user"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteUser(user)}
                      isDisabled={user.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
            
            {filteredUsers.length === 0 && (
              <Tr>
                <Td colSpan={6} textAlign="center" py={4}>
                  No users found
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* Add/Edit User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleFormSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    name="name"
                    defaultValue={selectedUser?.name || ''}
                    placeholder="Enter full name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input 
                    name="username"
                    defaultValue={selectedUser?.username || ''}
                    placeholder="Enter username"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    name="email"
                    type="email"
                    defaultValue={selectedUser?.email || ''}
                    placeholder="Enter email address"
                  />
                </FormControl>
                
                {!selectedUser && (
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input 
                      name="password"
                      type="password"
                      placeholder="Enter password"
                    />
                  </FormControl>
                )}
                
                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    name="role"
                    defaultValue={selectedUser?.role || ''}
                  >
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.EDITOR}>Editor</option>
                    <option value={UserRole.VIEWER}>Viewer</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                {selectedUser ? 'Save Changes' : 'Add User'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteUser} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UserManagementPage;
