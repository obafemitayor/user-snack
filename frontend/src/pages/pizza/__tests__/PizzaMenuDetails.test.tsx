import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { pizzaAPI, extrasAPI } from '../../../services/api';
import { messages } from '../../../locales/en';
import PizzaMenuDetails from '../PizzaMenuDetails';
import { CartProvider } from '../../../contexts/CartContext';

jest.mock('../../../services/api', () => ({
  pizzaAPI: {
    getById: jest.fn(),
  },
  extrasAPI: {
    getAll: jest.fn(),
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
    FormErrorMessage: TextPass,
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
      <CartProvider>
        {children}
      </CartProvider>
    </BrowserRouter>
  </IntlProvider>
);

describe('PizzaMenuDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as unknown as jest.Mock).mockRestore?.();
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

    // Options render with currency formatting
    await waitFor(() => {
      expect(screen.getByText('Extra Cheese (+$2.50)')).toBeInTheDocument();
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

    // Wait for details to render
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
      expect(screen.getByText('+$2.50')).toBeInTheDocument();
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

  it('adds to cart when clicking Add to Cart', async () => {
    const user = userEvent.setup();
    (pizzaAPI.getById as jest.Mock).mockResolvedValue(mockPizza);
    (extrasAPI.getAll as jest.Mock).mockResolvedValue(mockExtras);

    render(
      <TestWrapper>
        <PizzaMenuDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });
    const addToCartButton = screen.getByText('Add to Cart');
    await user.click(addToCartButton);
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
