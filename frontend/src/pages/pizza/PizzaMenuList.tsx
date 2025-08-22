import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { pizzaAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import { messages } from './messages';

interface Pizza {
  _id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  ingredients?: string[];
}

interface PaginationData {
  items: Pizza[];
  page: number;
  pages: number;
  total: number;
}

const PizzaMenuList: React.FC = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();

  const fetchPizzas = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await pizzaAPI.getAll(page, 9);
      setPizzas(response.data.items);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pizzas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  const handlePageChange = (page: number) => {
    fetchPizzas(page);
  };

  const handlePizzaClick = (pizzaId: string) => {
    navigate(`/pizzas/${pizzaId}`);
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="orange.500" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" textAlign="center" mb={2}>
          {intl.formatMessage(messages.menuTitle)}
        </Heading>
        <Text fontSize="lg" color="gray.600" textAlign="center" mb={8}>
          {intl.formatMessage(messages.menuSubtitle)}
        </Text>
        </Box>

        {pizzas.length === 0 ? (
          <Center h="200px">
            <Text fontSize="lg" color="gray.500">
              {intl.formatMessage(messages.menuEmpty)}
            </Text>
          </Center>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {pizzas.map((pizza: Pizza) => (
                <Card
                  key={pizza._id}
                  cursor="pointer"
                  transition="transform 0.2s"
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                  onClick={() => handlePizzaClick(pizza._id)}
                >
                  <CardBody>
                    <Image
                      src={pizza.image_url}
                      alt={pizza.name}
                      borderRadius="md"
                      h="200px"
                      w="100%"
                      objectFit="cover"
                      mb={4}
                    />
                    <VStack align="start" spacing={3}>
                      <HStack justify="space-between" w="100%">
                        <Heading size="md" color="gray.800">
                          {pizza.name}
                        </Heading>
                        <Badge colorScheme="orange" fontSize="md" p={2}>
                          {intl.formatNumber(pizza.price, {
                            style: 'currency',
                            currency: 'USD'
                          })}
                        </Badge>
                      </HStack>
                      <Text color="gray.600" noOfLines={2}>
                        {pizza.description}
                      </Text>
                      {pizza.ingredients && pizza.ingredients.length > 0 && (
                        <Text fontSize="sm" color="gray.500">
                          {intl.formatMessage(messages.ingredients, { 
                            ingredients: pizza.ingredients.join(', ') 
                          })}
                        </Text>
                      )}
                      <Button
                        colorScheme="orange"
                        size="sm"
                        w="100%"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handlePizzaClick(pizza._id);
                        }}
                      >
                        {intl.formatMessage(messages.viewDetails)}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </VStack>
    </Container>
  );
};

export default PizzaMenuList;
