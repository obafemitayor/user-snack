import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { pizzaAPI, extrasAPI, ordersAPI } from '../../../services/api';
import { messages } from '../../../locales/en';
import PizzaMenuDetails from '../PizzaMenuDetails';

jest.mock('../../../services/api', () => ({
  pizzaAPI: {
    getById: jest.fn(),
  },
  extrasAPI: {
    getAll: jest.fn(),
  },
  ordersAPI: {
    create: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

jest.mock('@chakra-ui/react', () => {
  const React = require('react');
  const Pass = ({ children }: any) => React.createElement('div', null, children);
  const TextPass = ({ children }: any) => React.createElement('span', null, children);
  const InputPass = (props: any) => React.createElement('input', props);
  const TextareaPass = (props: any) => React.createElement('textarea', props);
  const SelectPass = (props: any) => React.createElement('select', props);
  const ButtonPass = ({ children, isDisabled, isLoading, onClick, ...rest }: any) =>
    React.createElement('button', { disabled: !!isDisabled || !!isLoading, onClick, ...rest }, children);
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
    return React.createElement('div', null,
      React.createElement('input', {
        type: 'number', value, min, max,
        onChange: (e: any) => onChange && onChange(e.target.value, Number(e.target.value))
      }),
      enhancedChildren
    );
  };
  const NumberInputField = (props: any) => React.createElement('input', { type: 'number', ...props });
  const IconButton = ({ 'aria-label': ariaLabel, onClick }: any) =>
    React.createElement('button', { 'aria-label': ariaLabel, onClick });
  const useToast = () => () => {};
  return {
    ChakraProvider: Pass,
    Box: Pass,
    Container: Pass,
    Heading: TextPass,
    Text: TextPass,
    Button: ButtonPass,
    VStack: Pass,
    HStack: Pass,
    Badge: TextPass,
    Card: Pass,
    CardBody: Pass,
    useToast,
    Spinner: () => React.createElement('div', { role: 'status' }),
    Center: Pass,
    Image: (props: any) => React.createElement('img', props),
    Select: SelectPass,
    Input: InputPass,
    Textarea: TextareaPass,
    FormControl: Pass,
    FormLabel: ({ children, htmlFor, ...rest }: any) =>
      React.createElement('label', { htmlFor, ...rest }, children),
    NumberInput: NumberInputPass,
    NumberInputField,
    NumberInputStepper: Pass,
    NumberIncrementStepper: Pass,
    NumberDecrementStepper: Pass,
    List: Pass,
    ListItem: Pass,
    IconButton,
    Divider: Pass,
  };
});

const mockPizza = {
  data: {
    _id: '1',
    name: 'Margherita',
    description: 'Classic pizza with tomato and mozzarella',
    price: 12.99,
    image_url: 'https://example.com/margherita.jpg'
  }
};

const mockExtras = {
  data: [
    {
      _id: 'extra1',
      name: 'Extra Cheese',
      price: 2.5
    },
    {
      _id: 'extra2',
      name: 'Mushrooms',
      price: 1.99
    }
  ]
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IntlProvider locale="en" messages={messages}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </IntlProvider>
);

describe('PizzaMenuDetails (real component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading spinner initially', () => {
    (pizzaAPI.getById as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (extrasAPI.getAll as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('retrieves and displays pizza details', async () => {
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Margherita')).toBeInTheDocument();
    });

    expect(screen.getByText('Classic pizza with tomato and mozzarella')).toBeInTheDocument();
    expect(screen.getAllByText(/\$?12\.99/)[0]).toBeInTheDocument();
    expect(screen.getByAltText('Margherita')).toBeInTheDocument();
  });

  it('displays order form with customer fields', async () => {
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Place Your Order')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your delivery address')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('displays available extras', async () => {
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Extras')).toBeInTheDocument();
    });

    const extraSelect = screen.getByRole('combobox');

    await waitFor(() => {
      expect(screen.getByText('Extra Cheese (+$2.5)')).toBeInTheDocument();
      expect(screen.getByText('Mushrooms (+$1.99)')).toBeInTheDocument();
    });
  });

  it('allows adding and removing extras', async () => {
    const user = userEvent.setup();
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Extras')).toBeInTheDocument();
    });

    // Add an extra
    const extraSelect = screen.getByRole('combobox');
    await user.selectOptions(extraSelect, 'extra1');
    
    const addButton = screen.getByText('Add');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Selected Extras:')).toBeInTheDocument();
      expect(screen.getByText('Extra Cheese')).toBeInTheDocument();
      expect(screen.getByText('+$2.5')).toBeInTheDocument();
    });

    // Remove the extra
    const removeButton = screen.getByLabelText('Remove extra');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Selected Extras:')).not.toBeInTheDocument();
    });
  });

  it('calculates total price correctly with extras', async () => {
    const user = userEvent.setup();
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total:.*\$?12\.99/)).toBeInTheDocument();
    });

    // Add an extra
    const extraSelect = screen.getByRole('combobox');
    await user.selectOptions(extraSelect, 'extra1');
    
    const addButton = screen.getByText('Add');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Total:.*\$?15\.49/)).toBeInTheDocument();
    });
  });

  it('places order successfully with valid form data', async () => {
    const user = userEvent.setup();
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);
    (ordersAPI.create as jest.Mock).mockResolvedValue({ data: { _id: 'order123' } });

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Place Your Order')).toBeInTheDocument();
    });

    // Fill out the form
    await user.type(screen.getByPlaceholderText('Enter your full name'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Enter your email address'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890');
    await user.type(screen.getByPlaceholderText('Enter your delivery address'), '123 Main St');

    // Place the order
    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    await waitFor(() => {
      expect(ordersAPI.create).toHaveBeenCalledWith({
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '1234567890',
        customer_address: '123 Main St',
        items: [{ pizza_id: '1', quantity: 1, extras: [] }]
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/pizzas');
  });

  it('validates required fields before placing order', async () => {
    const user = userEvent.setup();
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });

    // Try to place order without filling required fields
    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    // Should not call the API
    expect(ordersAPI.create).not.toHaveBeenCalled();
  });

  it('handles quantity changes correctly', async () => {
    const user = userEvent.setup();
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total: $12.99')).toBeInTheDocument();
    });

    // Increase quantity - set value directly to avoid concatenation behavior in mocks
    const spinbuttons = screen.getAllByRole('spinbutton');
    const targetInput = spinbuttons[1] ?? spinbuttons[0];
    fireEvent.change(targetInput, { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getByText(/Total:.*\$?25\.98/)).toBeInTheDocument();
    });
  });

  it('navigates back to menu when back button is clicked', async () => {
    const user = userEvent.setup();
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Back to Menu')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to Menu');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/pizzas');
  });

  it('handles pizza not found', async () => {
    (pizzaAPI.getById as jest.Mock).mockRejectedValue(new Error('Pizza not found'));
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/pizzas');
    });
  });

  it('displays pizza not found message when pizza is null', async () => {
    (pizzaAPI.getById as jest.Mock).mockResolvedValue({ data: null });
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizza not found')).toBeInTheDocument();
    });
  });
});
