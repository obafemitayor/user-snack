import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Text,
  Select,
  Badge,
  List,
  ListItem,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useIntl } from 'react-intl';
import { useOrder, Extra } from '../contexts/OrderContext';

interface OrderFormProps {
  extras: Extra[];
  pizza: any;
  total: number;
  messages: any;
  calculateTotal: () => number;
}

const OrderForm: React.FC<OrderFormProps> = ({
  extras,
  pizza,
  total,
  messages,
  calculateTotal,
}) => {
  const intl = useIntl();
  const {
    orderForm,
    selectedExtraId,
    orderLoading,
    orderErrors,
    handleInputChange,
    setSelectedExtraId,
    handleAddExtra,
    handleRemoveExtra,
    handlePlaceOrder,
  } = useOrder();

  return (
    <Card>
      <CardBody>
        <Heading size="lg" mb={6}>
          {intl.formatMessage(messages.orderForm)}
        </Heading>
        
        <VStack spacing={6} align="stretch">
          <HStack spacing={4}>
            <FormControl isRequired isInvalid={!!orderErrors.customer_name}>
              <FormLabel>
                {intl.formatMessage(messages.customerName)}
              </FormLabel>
              <Input
                value={orderForm.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="Enter your full name"
              />
              {orderErrors.customer_name && (
                <FormErrorMessage>{orderErrors.customer_name}</FormErrorMessage>
              )}
            </FormControl>
            
            <FormControl isRequired isInvalid={!!orderErrors.customer_email}>
              <FormLabel>
                {intl.formatMessage(messages.email)}
              </FormLabel>
              <Input
                type="email"
                value={orderForm.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                placeholder="Enter your email address"
              />
              {orderErrors.customer_email && (
                <FormErrorMessage>{orderErrors.customer_email}</FormErrorMessage>
              )}
            </FormControl>
          </HStack>

          <HStack spacing={4}>
            <FormControl isInvalid={!!orderErrors.customer_phone}>
              <FormLabel>
                {intl.formatMessage(messages.phone)}
              </FormLabel>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="\\d*"
                minLength={10}
                maxLength={20}
                title="Enter 10 to 20 digits"
                value={orderForm.customer_phone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  handleInputChange('customer_phone', digitsOnly);
                }}
                placeholder="Enter your phone number"
              />
              {orderErrors.customer_phone && (
                <FormErrorMessage>{orderErrors.customer_phone}</FormErrorMessage>
              )}
            </FormControl>
            
            <FormControl isInvalid={!!orderErrors.quantity}>
              <FormLabel>
                {intl.formatMessage(messages.quantity)}
              </FormLabel>
              <NumberInput
                value={orderForm.quantity}
                onChange={(value) => handleInputChange('quantity', parseInt(value) || 1)}
                min={1}
                max={10}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {orderErrors.quantity && (
                <FormErrorMessage>{orderErrors.quantity}</FormErrorMessage>
              )}
            </FormControl>
          </HStack>

          <FormControl isRequired isInvalid={!!orderErrors.customer_address}>
            <FormLabel>
              {intl.formatMessage(messages.address)}
            </FormLabel>
            <Textarea
              value={orderForm.customer_address}
              onChange={(e) => handleInputChange('customer_address', e.target.value)}
              placeholder="Enter your delivery address"
            />
            {orderErrors.customer_address && (
              <FormErrorMessage>{orderErrors.customer_address}</FormErrorMessage>
            )}
          </FormControl>

          {extras.length > 0 && (
            <FormControl>
              <FormLabel>
                {intl.formatMessage(messages.extras)}
              </FormLabel>
              <HStack spacing={3}>
                <Select
                  placeholder={intl.formatMessage(messages.selectExtraPlaceholder)}
                  value={selectedExtraId}
                  onChange={(e) => setSelectedExtraId(e.target.value)}
                  flex={1}
                >
                  {extras
                    .filter(extra => !orderForm.selected_extras.includes(extra._id))
                    .map((extra) => (
                      <option key={extra._id} value={extra._id}>
                        {extra.name} (+${extra.price})
                      </option>
                    ))}
                </Select>
                <Button
                  onClick={handleAddExtra}
                  colorScheme="orange"
                  isDisabled={!selectedExtraId}
                  size="md"
                >
                  {intl.formatMessage(messages.addExtra)}
                </Button>
              </HStack>
              
              {orderForm.selected_extras.length > 0 && (
                <Box mt={4}>
                  <Text fontWeight="bold" mb={2}>{intl.formatMessage(messages.selectedExtras)}</Text>
                  <List spacing={2}>
                    {orderForm.selected_extras.map((extraId) => {
                      const extra = extras.find(e => e._id === extraId);
                      return extra ? (
                        <ListItem key={extraId}>
                          <HStack justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <HStack>
                              <Text>{extra.name}</Text>
                              <Badge colorScheme="green">+${extra.price}</Badge>
                            </HStack>
                            <IconButton
                              aria-label="Remove extra"
                              icon={<DeleteIcon aria-hidden />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveExtra(extraId)}
                            />
                          </HStack>
                        </ListItem>
                      ) : null;
                    })}
                  </List>
                </Box>
              )}
            </FormControl>
          )}
          <Divider />
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="bold">
              {intl.formatMessage(messages.total, {
                total: intl.formatNumber(total, {
                  style: 'currency',
                  currency: 'USD'
                })
              })}
            </Text>
            <Button
              colorScheme="orange"
              size="lg"
              onClick={() => handlePlaceOrder(pizza, extras, calculateTotal)}
              isLoading={orderLoading}
              loadingText="Placing Order..."
            >
              {intl.formatMessage(messages.placeOrder)}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderForm;
