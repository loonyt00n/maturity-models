import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  FormErrorMessage, 
  Stack, 
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
  Icon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { username?: string; password?: string } = {};
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid username or password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box>
      <Heading size="md" mb={6} textAlign="center">
        Sign In
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement width="3rem">
                <Button
                  h="1.5rem"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon as={showPassword ? FiEyeOff : FiEye} />
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={isLoading}
            mt={4}
          >
            Sign In
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default LoginPage;

