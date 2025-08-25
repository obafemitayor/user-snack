import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';

import CartPage from '../CartPage';

jest.mock('../../../contexts/CartContext', () => ({
  useCart: jest.fn(),
}));

const { useCart } = jest.requireMock('../../../contexts/CartContext');

jest.mock('@chakra-ui/react', () => {
  const React = require('react');
  const Pass = ({ children }: any) => React.createElement('div', null, children);
  const TextPass = ({ children }: any) => React.createElement('span', null, children);
  const HeadingPass = ({ children }: any) => React.createElement('h2', null, children);
  const ButtonPass = ({ children, isDisabled, isLoading, onClick }: any) =>
    React.createElement('button', { disabled: !!isDisabled || !!isLoading, onClick }, children);
  const InputPass = (props: any) => React.createElement('input', props);
  const NumberInputField = (props: any) => React.createElement('input', { type: 'number', ...props });
  const NumberInputPass = ({ children, value, onChange, min, max }: any) => {
    const enhancedChildren = React.Children.map(children, (child: any) => {
      if (child && child.type === NumberInputField) {
        return React.cloneElement(child, {
          value,
          min,
          max,
          onChange: (e: any) => onChange && onChange(e.target.value, Number(e.target.value)),
        });
      }
      return child;
    });
    return React.createElement(
      'div',
      null,
      React.createElement('input', {
        type: 'number',
        value,
        min,
        max,
        onChange: (e: any) => onChange && onChange(e.target.value, Number(e.target.value)),
      }),
      enhancedChildren
    );
  };
  const IconButton = ({ 'aria-label': ariaLabel, onClick }: any) =>
    React.createElement('button', { 'aria-label': ariaLabel, onClick });
  return {
    __esModule: true,
    ChakraProvider: Pass,
    Container: Pass,
    VStack: Pass,
    Heading: HeadingPass,
    Box: Pass,
    Stack: Pass,
    HStack: Pass,
    Card: Pass,
    CardBody: Pass,
    Table: Pass,
    Thead: Pass,
    Tbody: Pass,
    Tr: Pass,
    Th: Pass,
    Td: Pass,
    Text: TextPass,
    FormControl: Pass,
    FormErrorMessage: TextPass,
    Button: ButtonPass,
    IconButton,
    Input: InputPass,
    NumberInput: NumberInputPass,
    NumberInputField,
    NumberInputStepper: Pass,
    NumberIncrementStepper: Pass,
    NumberDecrementStepper: Pass,
  };
});

jest.mock('@chakra-ui/icons', () => ({
  __esModule: true,
  DeleteIcon: () => null,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    <BrowserRouter>{children}</BrowserRouter>
  </IntlProvider>
);

describe('CartPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    (console.error as unknown as jest.Mock).mockRestore?.();
  });

  it('renders empty state', () => {
    useCart.mockReturnValue({
      items: [],
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      getSubtotal: () => 0,
      placeOrder: jest.fn(),
    });

    render(
      <TestWrapper>
        <CartPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: /Your Cart/i })).toBeInTheDocument();
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to Menu/i })).toBeInTheDocument();
  });

  it('shows items and allows quantity change and removal', async () => {
    const removeItem = jest.fn();
    const updateQuantity = jest.fn();

    useCart.mockReturnValue({
      items: [
        {
          id: 'line1',
          pizzaId: '1',
          name: 'Margherita',
          price: 10,
          quantity: 2,
          extras: [{ _id: 'e1', name: 'Cheese', price: 2 }],
        },
      ],
      removeItem,
      updateQuantity,
      getSubtotal: () => 24,
      placeOrder: jest.fn(),
    });

    render(
      <TestWrapper>
        <CartPage />
      </TestWrapper>
    );

    expect(screen.getByText('Margherita')).toBeInTheDocument();
    expect(screen.getByText(/each/i)).toBeInTheDocument();

    // change quantity
    const qtyInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(qtyInputs[0], { target: { value: '3' } });
    expect(updateQuantity).toHaveBeenCalledWith('line1', 3);

    // remove item
    const removeBtn = screen.getByRole('button', { name: /Remove/i });
    await userEvent.click(removeBtn);
    expect(removeItem).toHaveBeenCalledWith('line1');

    // subtotal visible
    expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
  });

  it('submits order from cart with customer details', async () => {
    const placeOrder = jest.fn();

    useCart.mockReturnValue({
      items: [
        { id: 'l1', pizzaId: '1', name: 'Pepperoni', price: 12, quantity: 1, extras: [] },
      ],
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      getSubtotal: () => 12,
      placeOrder,
    });

    render(
      <TestWrapper>
        <CartPage />
      </TestWrapper>
    );

    await userEvent.type(screen.getByPlaceholderText(/Full Name/i), 'Jane');
    await userEvent.type(screen.getByPlaceholderText(/Email/i), 'jane@example.com');
    await userEvent.type(screen.getByPlaceholderText(/Phone/i), '1234567890');
    await userEvent.type(screen.getByPlaceholderText(/Address/i), '123 St');

    await userEvent.click(screen.getByRole('button', { name: /Place Order/i }));

    expect(placeOrder).toHaveBeenCalledWith({
      customer_name: 'Jane',
      customer_email: 'jane@example.com',
      customer_phone: '1234567890',
      customer_address: '123 St',
    });
  });
});
