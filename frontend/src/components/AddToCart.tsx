import { DeleteIcon } from '@chakra-ui/icons';
import {
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Heading,
  Select,
  List,
  ListItem,
  IconButton,
  Divider,
  Badge,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../contexts/CartContext';
import { messages } from '../pages/pizza/messages';

interface Extra {
  _id: string;
  name: string;
  price: number;
}

interface Pizza {
  _id: string;
  name: string;
  price: number;
}

interface AddToCartProps {
  pizza: Pizza;
  extras: Extra[];
}

const AddToCart: React.FC<AddToCartProps> = ({ pizza, extras }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [selectedExtraId, setSelectedExtraId] = useState<string>('');
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  const total = (() => {
    const extrasSum = selectedExtraIds.reduce((sum, id) => {
      const ex = extras.find((e) => e._id === id);
      return sum + (ex ? ex.price : 0);
    }, 0);
    return (pizza.price + extrasSum) * quantity;
  })();

  return (
    <>
      {/* Quantity and total */}
      <Card>
        <CardBody>
          <HStack justify="space-between" align="center">
            <HStack>
              <Text fontWeight="semibold">{intl.formatMessage(messages.quantity)}</Text>
              <NumberInput
                size="md"
                min={1}
                value={quantity}
                onChange={(_, val) => setQuantity(Math.max(1, Number.isNaN(val) ? 1 : val))}
                maxW="120px"
              >
                <NumberInputField aria-label={intl.formatMessage(messages.quantity)} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
            <Text fontSize="lg" fontWeight="bold">
              {intl.formatMessage(messages.total, {
                total: intl.formatNumber(total, { style: 'currency', currency: 'USD' })
              })}
            </Text>
          </HStack>
        </CardBody>
      </Card>

      {/* Extras selection */}
      <Card>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">{intl.formatMessage(messages.extras)}</Heading>
            <HStack>
              <Select
                placeholder={intl.formatMessage(messages.selectExtraPlaceholder)}
                value={selectedExtraId}
                onChange={(e) => setSelectedExtraId(e.target.value)}
              >
                {extras.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {`${ex.name} (+${intl.formatNumber(ex.price, { style: 'currency', currency: 'USD' })})`}
                  </option>
                ))}
              </Select>
              <Button
                onClick={() => {
                  if (selectedExtraId && !selectedExtraIds.includes(selectedExtraId)) {
                    setSelectedExtraIds((prev) => [...prev, selectedExtraId]);
                    setSelectedExtraId('');
                  }
                }}
              >
                {intl.formatMessage(messages.addExtra)}
              </Button>
            </HStack>

            {selectedExtraIds.length > 0 && (
              <>
                <Divider />
                <Text fontWeight="semibold">{intl.formatMessage(messages.selectedExtras)}</Text>
                <List spacing={2}>
                  {selectedExtraIds.map((id) => {
                    const ex = extras.find((e) => e._id === id);
                    if (!ex) {
                      return null;
                    }
                    return (
                      <ListItem key={id}>
                        <HStack justify="space-between">
                          <Text>
                            {ex.name}{' '}
                            <Badge colorScheme="green">+{intl.formatNumber(ex.price, { style: 'currency', currency: 'USD' })}</Badge>
                          </Text>
                          <IconButton
                            aria-label={intl.formatMessage(messages.removeExtra)}
                            size="sm"
                            icon={<DeleteIcon />}
                            onClick={() => setSelectedExtraIds((prev) => prev.filter((x) => x !== id))}
                          />
                        </HStack>
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      <HStack justify="flex-end" spacing={4}>
        <Button
          colorScheme="orange"
          onClick={() => {
            addItem({
              pizzaId: pizza._id,
              name: pizza.name,
              price: pizza.price,
              quantity,
              selectedExtraIds,
              extrasCatalog: extras,
            });
          }}
        >
          {intl.formatMessage(messages.addToCart)}
        </Button>
        <Button variant="outline" onClick={() => navigate('/cart')}>
          {intl.formatMessage(messages.goToCart)}
        </Button>
      </HStack>
    </>
  );
};

export default AddToCart;
