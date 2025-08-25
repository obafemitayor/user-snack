import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useNavigate, useLocation } from 'react-router-dom';

import { messages } from './messages';
import { authAPI, TOKEN_KEY } from '../../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useIntl();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await authAPI.login(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      toast({ title: intl.formatMessage(messages.loggedIn), status: 'success', duration: 2000, isClosable: true });
      const redirectTo = (location.state as any)?.from || '/admin/orders';
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || intl.formatMessage(messages.invalidCredentials);
      toast({ title: intl.formatMessage(messages.loginFailed), description: msg, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" minH="70vh">
      <Center>
        <Box w="full" mt={20}>
          <Heading textAlign="center" mb={8}>
            <FormattedMessage {...messages.title} />
          </Heading>
          <Card>
            <CardBody>
              <form onSubmit={handleLogin}>
                <FormControl mb={4} isRequired>
                  <FormLabel>
                    <FormattedMessage {...messages.emailLabel} />
                  </FormLabel>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={intl.formatMessage(messages.emailPlaceholder)} />
                </FormControl>
                <FormControl mb={6} isRequired>
                  <FormLabel>
                    <FormattedMessage {...messages.passwordLabel} />
                  </FormLabel>
                  <InputGroup>
                    <Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={intl.formatMessage(messages.passwordPlaceholder)} />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                        {show ? intl.formatMessage(messages.hide) : intl.formatMessage(messages.show)}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <Button colorScheme="orange" type="submit" isLoading={loading} w="full">
                  <FormattedMessage {...messages.loginButton} />
                </Button>
                <Text mt={4} color="gray.600" fontSize="sm">
                  <FormattedMessage {...messages.helperText} />
                </Text>
              </form>
            </CardBody>
          </Card>
        </Box>
      </Center>
    </Container>
  );
};

export default Login;
