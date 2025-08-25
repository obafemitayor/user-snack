import {
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Select,
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
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useParams, useNavigate } from 'react-router-dom';

import { messages } from './messages';
import LogoutButton from '../../../components/LogoutButton';
import { ordersAPI, TOKEN_KEY } from '../../../services/api';
import { getStatusColor, formatDate } from '../../../utils/orderUtils';

type Extra = string | { name: string };

interface OrderItem {
  pizza_id: string;
  pizza_name?: string;
  pizza_price?: number;
  pizza?: {
    name: string;
    price: number;
  };
  quantity: number;
  extras: Extra[];
  item_total?: number;
  price?: number;
}

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
  special_instructions?: string;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const intl = useIntl();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('');

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/login', { state: { from: `/admin/orders/${id}` } });
      return;
    }
    fetchOrderDetails();
  }, [id, navigate]);

  const fetchOrderDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await ordersAPI.getById(id);
        setOrder(response.data);
        setNewStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
      setLoading(false);
      }
    };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order || !id || newStatus === order.status) {
      toast({
        title: 'No Change',
        description: 'Status is already set to this value',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUpdating(true);
      await ordersAPI.updateStatus(id, newStatus);
      
      setOrder(prev => prev ? {
        ...prev,
        status: newStatus
      } : null);
      
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update order status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };


  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="orange.500" />
      </Center>
    );
  }

  if (!order) {
    return (
      <Center h="400px">
        <Text fontSize="lg" color="gray.500">
          Order not found
        </Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Button
            variant="ghost"
            alignSelf="flex-start"
            onClick={() => navigate('/admin/orders')}
          >
            {intl.formatMessage(messages.backToOrders)}
          </Button>
          <LogoutButton />
        </HStack>

        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="xl" fontWeight="bold">
                  {intl.formatMessage(messages.orderTotal, {
                    total: intl.formatNumber(order.total_amount, {
                      style: 'currency',
                      currency: 'USD'
                    })
                  })}
                </Text>
                <Badge
                  colorScheme={getStatusColor(order.status)}
                  fontSize="lg"
                  p={3}
                  textTransform="capitalize"
                >
                  {order.status}
                </Badge>
              </HStack>

              <HStack spacing={8} align="start">
                <VStack align="start" spacing={2} flex={1}>
                  <Text fontWeight="bold">{intl.formatMessage(messages.orderIdLabel)}</Text>
                  <Text fontFamily="mono">{order._id}</Text>
                </VStack>
                <VStack align="start" spacing={2} flex={1}>
                  <Text fontWeight="bold">{intl.formatMessage(messages.orderDateLabel)}</Text>
                  <Text>{formatDate(order.created_at)}</Text>
                </VStack>
                <VStack align="start" spacing={2} flex={1}>
                  <Text fontWeight="bold">{intl.formatMessage(messages.totalAmountLabel)}</Text>
                  <Badge colorScheme="green" fontSize="lg" p={2}>
                    ${order.total_amount}
                  </Badge>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="lg" mb={4}>
              {intl.formatMessage(messages.customerInfo)}
            </Heading>
            <VStack spacing={4} align="stretch">
              <HStack spacing={8}>
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="bold">{intl.formatMessage(messages.nameLabel)}</Text>
                  <Text>
                    {intl.formatMessage(messages.name, { name: order.customer_name })}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="bold">{intl.formatMessage(messages.emailLabel)}</Text>
                  <Text>
                    {intl.formatMessage(messages.email, { email: order.customer_email })}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="bold">{intl.formatMessage(messages.phoneLabel)}</Text>
                  <Text>
                    {intl.formatMessage(messages.phone, { phone: order.customer_phone })}
                  </Text>
                </VStack>
              </HStack>
              
              {order.delivery_address && (
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{intl.formatMessage(messages.deliveryAddressLabel)}</Text>
                  <Text>
                    {intl.formatMessage(messages.address, { address: order.delivery_address })}
                  </Text>
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {order.items && order.items.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="lg" mb={4}>
                {intl.formatMessage(messages.orderItems)}
              </Heading>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{intl.formatMessage(messages.tableHeaderItem)}</Th>
                      <Th>{intl.formatMessage(messages.tableHeaderQuantity)}</Th>
                      <Th>{intl.formatMessage(messages.tableHeaderExtras)}</Th>
                      <Th>{intl.formatMessage(messages.tableHeaderPrice)}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {order.items.map((item, index) => (
                      <Tr key={index}>
                        <Td>
                          <Text fontWeight="bold">
                            {intl.formatMessage(messages.pizza, { name: item.pizza_name || item.pizza?.name || intl.formatMessage(messages.unknownPizza) })}
                          </Text>
                        </Td>
                        <Td>
                          <Text>
                            {intl.formatMessage(messages.quantity, { quantity: item.quantity })}
                          </Text>
                        </Td>
                        <Td>
                          {item.extras && item.extras.length > 0 ? (
                            <Text>
                              {intl.formatMessage(messages.extras, {
                                extras: item.extras
                                  .map((extra: Extra) =>
                                    typeof extra === 'string' ? extra : extra.name
                                  )
                                  .filter(Boolean)
                                  .join(', '),
                              })}
                            </Text>
                          ) : (
                            <Text>
                              {intl.formatMessage(messages.noExtras)}
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <Text fontWeight="bold">
                            ${item.item_total ?? item.price ?? intl.formatMessage(messages.priceNotAvailable)}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            <Heading size="lg" mb={4}>
              {intl.formatMessage(messages.orderManagement)}
            </Heading>
            
            {order.status === 'delivered' ? (
              <Alert status="success">
                <AlertIcon aria-hidden />
                {intl.formatMessage(messages.orderDelivered)}
              </Alert>
            ) : order.status === 'cancelled' ? (
              <Alert status="error">
                <AlertIcon aria-hidden />
                {intl.formatMessage(messages.orderCancelled)}
              </Alert>
            ) : (
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <Text fontWeight="bold" mb={2}>
                    {intl.formatMessage(messages.status)}
                  </Text>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    maxW="200px"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <Button
                    colorScheme="orange"
                    onClick={() => handleStatusUpdate(newStatus)}
                    isLoading={updating}
                    loadingText="Updating..."
                    isDisabled={newStatus === order.status}
                  >
                    {intl.formatMessage(messages.updateStatus)}
                  </Button>
                </HStack>
                
                <Text fontSize="sm" color="gray.600">
                  <Text color="green.500" mr={2}>✓</Text>
                  {intl.formatMessage(messages.statusUpdateHelp)}
                </Text>
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default OrderDetails;
