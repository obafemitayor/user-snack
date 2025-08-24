import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  IconButton,
  Input,
  FormControl,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  VStack,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useCart } from '../../contexts/CartContext';
import { Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { messages } from './messages';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, getSubtotal, placeOrder } = useCart();
  const intl = useIntl();
  const [customer, setCustomer] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
  });
  const [touched, setTouched] = useState({
    customer_name: false,
    customer_email: false,
    customer_phone: false,
    customer_address: false,
  });

  const isEmpty = (v: string) => v.trim().length === 0;
  const isValidEmail = (v: string) => /.+@.+\..+/.test(v.trim());
  const isValidPhone = (v: string) => /^\+?\d+$/.test(v.trim());
  const isValid =
    !isEmpty(customer.customer_name) &&
    !isEmpty(customer.customer_email) && isValidEmail(customer.customer_email) &&
    !isEmpty(customer.customer_phone) && isValidPhone(customer.customer_phone) &&
    !isEmpty(customer.customer_address);

  const subtotal = getSubtotal();

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg">{intl.formatMessage(messages.title)}</Heading>

        <Card>
          <CardBody>
            {items.length === 0 ? (
              <VStack spacing={4} align="start">
                <Text>{intl.formatMessage(messages.empty)}</Text>
                <Button as={RouterLink} to="/pizzas" colorScheme="orange">{intl.formatMessage(messages.goToMenu)}</Button>
              </VStack>
            ) : (
              <Stack spacing={6}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{intl.formatMessage(messages.tableItem)}</Th>
                      <Th>{intl.formatMessage(messages.tableExtras)}</Th>
                      <Th isNumeric>{intl.formatMessage(messages.tableQty)}</Th>
                      <Th isNumeric>{intl.formatMessage(messages.tablePrice)}</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map(item => {
                      const extrasCost = item.extras.reduce((sum, e) => sum + e.price, 0);
                      const unit = item.price + extrasCost;
                      const total = unit * item.quantity;
                      return (
                        <Tr key={item.id}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{item.name}</Text>
                              <Text fontSize="sm" color="gray.500">{intl.formatMessage(messages.each, { price: intl.formatNumber(unit, { style: 'currency', currency: 'USD' }) })}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            {item.extras.length > 0 ? item.extras.map(e => e.name).join(', ') : '-'}
                          </Td>
                          <Td isNumeric>
                            <NumberInput value={item.quantity} min={1} max={10} size="sm" width="90px"
                              onChange={(v) => updateQuantity(item.id, parseInt(v) || 1)}>
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </Td>
                          <Td isNumeric>{intl.formatNumber(total, { style: 'currency', currency: 'USD' })}</Td>
                          <Td>
                            <IconButton aria-label={intl.formatMessage(messages.remove)} icon={<DeleteIcon aria-hidden/>} size="sm" onClick={() => removeItem(item.id)} />
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>

                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="bold">{intl.formatMessage(messages.subtotal, { price: intl.formatNumber(subtotal, { style: 'currency', currency: 'USD' }) })}</Text>
                  <Button as={RouterLink} to="/pizzas" variant="ghost">{intl.formatMessage(messages.addMore)}</Button>
                </HStack>

                <Box>
                  <Heading size="md" mb={4}>{intl.formatMessage(messages.deliveryDetails)}</Heading>
                  <Stack spacing={3}>
                    <FormControl isInvalid={touched.customer_name && isEmpty(customer.customer_name)}>
                      <Input
                        placeholder={intl.formatMessage(messages.namePlaceholder)}
                        value={customer.customer_name}
                        onChange={(e) => setCustomer(c => ({ ...c, customer_name: e.target.value }))}
                        onBlur={() => setTouched(t => ({ ...t, customer_name: true }))}
                      />
                      <FormErrorMessage>{intl.formatMessage(messages.required)}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={touched.customer_email && (isEmpty(customer.customer_email) || !isValidEmail(customer.customer_email))}>
                      <Input
                        placeholder={intl.formatMessage(messages.emailPlaceholder)}
                        type="email"
                        value={customer.customer_email}
                        onChange={(e) => setCustomer(c => ({ ...c, customer_email: e.target.value }))}
                        onBlur={() => setTouched(t => ({ ...t, customer_email: true }))}
                      />
                      <FormErrorMessage>
                        {isEmpty(customer.customer_email)
                          ? intl.formatMessage(messages.required)
                          : intl.formatMessage(messages.invalidEmail)}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={touched.customer_phone && (isEmpty(customer.customer_phone) || !isValidPhone(customer.customer_phone))}>
                      <Input
                        placeholder={intl.formatMessage(messages.phonePlaceholder)}
                        type="text"
                        inputMode="numeric"
                        value={customer.customer_phone}
                        onChange={(e) => setCustomer(c => ({ ...c, customer_phone: e.target.value }))}
                        onBlur={() => setTouched(t => ({ ...t, customer_phone: true }))}
                      />
                      <FormErrorMessage>
                        {isEmpty(customer.customer_phone)
                          ? intl.formatMessage(messages.required)
                          : intl.formatMessage(messages.invalidPhone)}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={touched.customer_address && isEmpty(customer.customer_address)}>
                      <Input
                        placeholder={intl.formatMessage(messages.addressPlaceholder)}
                        value={customer.customer_address}
                        onChange={(e) => setCustomer(c => ({ ...c, customer_address: e.target.value }))}
                        onBlur={() => setTouched(t => ({ ...t, customer_address: true }))}
                      />
                      <FormErrorMessage>{intl.formatMessage(messages.required)}</FormErrorMessage>
                    </FormControl>
                  </Stack>
                </Box>

                <HStack justify="flex-end">
                  <Button
                    colorScheme="orange"
                    isDisabled={!isValid}
                    onClick={() => {
                      if (!isValid) {
                        setTouched({
                          customer_name: true,
                          customer_email: true,
                          customer_phone: true,
                          customer_address: true,
                        });
                        return;
                      }
                      placeOrder(customer);
                    }}
                  >
                    {intl.formatMessage(messages.placeOrder)}
                  </Button>
                </HStack>
              </Stack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default CartPage;
