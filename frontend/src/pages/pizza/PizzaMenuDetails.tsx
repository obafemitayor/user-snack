import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Container,
  Heading,
  Image,
  Text,
  Button,
  VStack,

  Stack,
  Badge,
  Card,
  CardBody,
  useToast,
  Spinner,
  Center,
  
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useParams, useNavigate } from 'react-router-dom';

import { messages } from './messages';
import AddToCart from '../../components/AddToCart';
import { pizzaAPI, extrasAPI } from '../../services/api';

interface Pizza {
  _id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

interface Extra {
  _id: string;
  name: string;
  price: number;
}


const PizzaMenuDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();
  
  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchPizza(), fetchExtras()]);
    };
    fetchData();
  }, [id]);

  const fetchPizza = async () => {
    if (!id) {
      console.error('Pizza ID is required');
      return;
    }
    
    try {
      const response = await pizzaAPI.getById(id);
      setPizza(response.data);
    } catch (error) {
      console.error('Error fetching pizza details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pizza details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/pizzas');
    } finally {
      setLoading(false);
    }
  };

  const fetchExtras = async () => {
    try {
      const response = await extrasAPI.getAll();
      setExtras(response.data.items || response.data);
    } catch (error) {
      console.error('Error fetching extras:', error);
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="orange.500" />
      </Center>
    );
  }

  if (!pizza) {
    return (
      <Center h="400px">
        <Text fontSize="lg" color="gray.500">
          Pizza not found
        </Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Button
          leftIcon={<ArrowBackIcon aria-hidden />}
          onClick={() => navigate('/pizzas')}
          variant="ghost"
          mb={4}
        >
          {intl.formatMessage(messages.backToMenu)}
        </Button>

        <Card>
          <CardBody>
            <Stack spacing={{ base: 4, md: 8 }} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'start' }}>
              <Image
                src={pizza.image_url}
                alt={pizza.name}
                borderRadius="md"
                w={{ base: '100%', md: 'auto' }}
                maxW={{ base: '100%', md: '400px' }}
                h={{ base: '200px', md: '300px' }}
                objectFit="cover"
              />

              <VStack align="start" spacing={4} flex={1}>
                <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" w="100%" align={{ base: 'flex-start', md: 'center' }}>
                  <Heading size={{ base: 'lg', md: 'xl' }} color="gray.800">
                    {pizza.name}
                  </Heading>
                  <Badge colorScheme="orange" fontSize={{ base: 'md', md: 'lg' }} p={{ base: 2, md: 3 }}>
                    {intl.formatMessage(messages.menuPrice, {
                      price: intl.formatNumber(pizza.price, {
                        style: 'currency',
                        currency: 'USD'
                      })
                    })}
                  </Badge>
                </Stack>

                <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
                  {pizza.description}
                </Text>
              </VStack>
            </Stack>
          </CardBody>
        </Card>

        <AddToCart pizza={pizza} extras={extras} />
      </VStack>
    </Container>
  );
};

export default PizzaMenuDetails;
