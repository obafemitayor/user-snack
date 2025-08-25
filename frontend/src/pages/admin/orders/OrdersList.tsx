import {
  Box,
  Container,
  Heading,
  Card,
  CardBody,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  useToast,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { messages } from './messages';
import LogoutButton from '../../../components/LogoutButton';
import Pagination from '../../../components/Pagination';
import { ordersAPI, TOKEN_KEY } from '../../../services/api';
import { getStatusColor, formatDate } from '../../../utils/orderUtils';

interface Order {
  _id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  pizza_id: string;
  quantity: number;
  extras: string[];
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      
      const response = await ordersAPI.getAll(page, 10);
      setOrders(response.data.items);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.pages);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/login', { state: { from: '/admin/orders' } });
      return;
    }
    fetchOrders();
  }, [navigate]);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
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
        <HStack justify="space-between" align="center">
          <Box textAlign="left">
            <Heading as="h1" size="xl" mb={2}>
              {intl.formatMessage(messages.listTitle)}
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={2}>
              {intl.formatMessage(messages.listSubtitle)}
            </Text>
          </Box>
          <LogoutButton />
        </HStack>

        {orders.length === 0 ? (
          <Center h="200px">
            <Text fontSize="lg" textAlign="center">
            {intl.formatMessage(messages.listEmpty)}
          </Text>
            <Button
                colorScheme="orange"
                onClick={() => navigate('/pizzas')}
              >
                {intl.formatMessage(messages.browseMenu)}
              </Button>
          </Center>
        ) : (
          <>
            <Card>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>{intl.formatMessage(messages.tableHeaderOrderId)}</Th>
                        <Th>{intl.formatMessage(messages.tableHeaderCustomer)}</Th>
                        <Th>{intl.formatMessage(messages.tableHeaderItems)}</Th>
                        <Th>{intl.formatMessage(messages.tableHeaderTotal)}</Th>
                        <Th>{intl.formatMessage(messages.tableHeaderStatus)}</Th>
                        <Th>{intl.formatMessage(messages.tableHeaderDate)}</Th>
                        <Th>{intl.formatMessage(messages.tableHeaderActions)}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orders.map((order) => (
                        <Tr key={order._id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <Text fontFamily="mono" fontSize="sm">
                              {order._id.slice(-8)}
                            </Text>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold">{order.customer_name}</Text>
                              <Text fontWeight="bold" color="gray.700">
                                {intl.formatMessage(messages.customer, { name: order.customer_name })}
                              </Text>
                              <Text color="gray.600" fontSize="sm">
                                {order.customer_email}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text>
                              {order.items?.length || 0} item(s)
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="green" fontSize="md" p={2}>
                              ${order.total_amount}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(order.status)}
                              textTransform="capitalize"
                            >
                              {order.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {formatDate(order.created_at)}
                            </Text>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="orange"
                              variant="outline"
                              onClick={() => handleOrderClick(order._id)}
                            >
                              <Center>
                                <Text>{intl.formatMessage(messages.viewDetails)}</Text>
                              </Center>
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>

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

export default OrdersList;
