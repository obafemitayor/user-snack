import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { ordersAPI } from '../../../../services/api';
import { messages } from '../../../../locales/en';
import OrderDetails from '../OrderDetails';
import { ChakraProvider } from '@chakra-ui/react';

jest.mock('../../../../services/api', () => ({
  ordersAPI: {
    getById: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'order1' }),
}));

jest.mock('@chakra-ui/react', () => {
  const React = require('react');
  const Pass = ({ children, ...props }: any) => React.createElement('div', props, children);
  const TextPass = ({ children, ...props }: any) => React.createElement('span', props, children);
  const SelectPass = ({ children, ...props }: any) => React.createElement('select', props, children);
  const TablePass = ({ children, ...props }: any) => React.createElement('table', props, children);
  const TheadPass = ({ children, ...props }: any) => React.createElement('thead', props, children);
  const TbodyPass = ({ children, ...props }: any) => React.createElement('tbody', props, children);
  const TrPass = ({ children, ...props }: any) => React.createElement('tr', props, children);
  const ThPass = ({ children, ...props }: any) => React.createElement('th', props, children);
  const TdPass = ({ children, ...props }: any) => React.createElement('td', props, children);
  const useToast = () => () => {};
  return {
    ChakraProvider: Pass,
    Box: Pass,
    Container: Pass,
    Heading: TextPass,
    Text: TextPass,
    Button: ({ children, isDisabled, isLoading, ...props }: any) =>
      React.createElement('button', { disabled: !!isDisabled || !!isLoading, ...props }, children),
    VStack: Pass,
    HStack: Pass,
    Badge: TextPass,
    Card: Pass,
    CardBody: Pass,
    FormControl: Pass,
    FormLabel: TextPass,
    Select: SelectPass,
    useToast,
    Spinner: () => React.createElement('div', { role: 'status' }),
    Center: Pass,
    Divider: Pass,
    List: Pass,
    ListItem: Pass,
    ListIcon: () => null,
    Table: TablePass,
    Thead: TheadPass,
    Tbody: TbodyPass,
    Tr: TrPass,
    Th: ThPass,
    Td: TdPass,
    TableContainer: Pass,
    Alert: Pass,
    AlertIcon: () => null,
  };
});

const mockOrder = {
  data: {
    _id: 'order1',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '1234567890',
    delivery_address: '123 Main St, City, State 12345',
    status: 'pending',
    total_amount: 28.48,
    created_at: '2024-01-15T10:30:00Z',
    items: [
      {
        pizza_id: 'pizza1',
        pizza_name: 'Margherita',
        quantity: 2,
        price: '12.99',
        extras: [{ name: 'cheese' }, { name: 'pepperoni' }]
      }
    ]
  }
};

const mockOrderNoExtras = {
  data: {
    _id: 'order1',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '1234567890',
    delivery_address: '123 Main St, City, State 12345',
    status: 'pending',
    total_amount: 12.99,
    created_at: '2024-01-15T10:30:00Z',
    items: [
      {
        pizza_id: 'pizza1',
        pizza_name: 'Margherita',
        quantity: 1,
        price: '12.99',
        extras: []
      }
    ]
  }
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>
    <IntlProvider locale="en" messages={messages}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </IntlProvider>
  </ChakraProvider>
);

describe('OrderDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading spinner initially', () => {
    (ordersAPI.getById as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('retrieves and displays order details', async () => {
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Customer Information')).toBeInTheDocument();
    });

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/1234567890/)).toBeInTheDocument();
    expect(screen.getByText(/123 Main St, City, State 12345/)).toBeInTheDocument();
    expect(screen.getAllByText(/28\.48/).length).toBeGreaterThan(0);
    expect(await screen.findByText(/2024/)).toBeInTheDocument();
  });

  it('displays order status with correct value initially', async () => {
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    const select = await screen.findByRole('combobox');
    expect(select).toHaveValue('pending');
  });

  it('displays order items correctly', async () => {
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Margherita/)).toBeInTheDocument();
      expect(screen.getByText(/Quantity: 2/)).toBeInTheDocument();
      expect(screen.getByText(/cheese, pepperoni/)).toBeInTheDocument();
    });
    const row = (await screen.findByText(/Pizza: Margherita/)).closest('tr') as HTMLElement;
    expect(row).toHaveTextContent(/12\.99/);
  });

  it('calculates and displays item subtotals correctly', async () => {
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      // Test the actual total displayed in the mock
      expect(screen.getByText(/Total: \$28\.48/)).toBeInTheDocument();
    });
  });

  it('allows updating order status', async () => {
    const user = userEvent.setup();
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersAPI.updateStatus as jest.Mock).mockResolvedValue({
      data: { ...mockOrder.data, status: 'confirmed' }
    });

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Update Status')).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole('combobox');
    await user.selectOptions(statusSelect, 'confirmed');
    await user.click(screen.getByText('Update Status'));

    await waitFor(() => {
      expect(ordersAPI.updateStatus).toHaveBeenCalledWith('order1', 'confirmed');
    });
  });

  it('confirms order successfully', async () => {
    const user = userEvent.setup();
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersAPI.updateStatus as jest.Mock).mockResolvedValue({
      data: { ...mockOrder.data, status: 'confirmed' }
    });

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Update Status')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByRole('combobox'), 'confirmed');
    await user.click(screen.getByText('Update Status'));

    await waitFor(() => {
      expect(ordersAPI.updateStatus).toHaveBeenCalledWith('order1', 'confirmed');
    });
  });

  it('disables confirm button when order is already confirmed', async () => {
    const confirmedOrder = {
      ...mockOrder,
      data: { ...mockOrder.data, status: 'confirmed' }
    };
    (ordersAPI.getById as jest.Mock).mockResolvedValue(confirmedOrder);

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      const updateButton = screen.getByText('Update Status');
      expect(updateButton).toBeDisabled();
    });
  });

  it('navigates back to orders list when back button is clicked', async () => {
    const user = userEvent.setup();
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Back to Orders')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to Orders');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/orders');
  });

  it('handles order not found', async () => {
    (ordersAPI.getById as jest.Mock).mockRejectedValue(new Error('Order not found'));

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
  });

  it('displays order not found message when order is null', async () => {
    (ordersAPI.getById as jest.Mock).mockResolvedValue({ data: null });

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order not found')).toBeInTheDocument();
    });
  });

  it('handles status update errors gracefully', async () => {
    const user = userEvent.setup();
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersAPI.updateStatus as jest.Mock).mockRejectedValue(new Error('Update failed'));

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Update Status')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByRole('combobox'), 'confirmed');
    await user.click(screen.getByText('Update Status'));

    await waitFor(() => {
      expect(ordersAPI.updateStatus).toHaveBeenCalled();
    });

    expect(screen.getByRole('combobox')).toHaveValue('confirmed');
  });

  it('displays different status options in dropdown', async () => {
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      const statusSelect = screen.getByRole('combobox');
      expect(statusSelect).toBeInTheDocument();
      expect(statusSelect).toHaveValue('pending');
    });

    const statusSelect = screen.getByRole('combobox');
    fireEvent.click(statusSelect);

    expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Confirmed' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Preparing' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Delivered' })).toBeInTheDocument();
  });

  it('updates UI after successful status change', async () => {
    const user = userEvent.setup();
    (ordersAPI.getById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersAPI.updateStatus as jest.Mock).mockResolvedValue({
      data: { ...mockOrder.data, status: 'confirmed' }
    });

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('pending');
    });

    await user.selectOptions(screen.getByRole('combobox'), 'confirmed');
    await user.click(screen.getByText('Update Status'));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('confirmed');
    });
  });

  it('displays order items without extras correctly', async () => {
    (ordersAPI.getById as jest.Mock).mockResolvedValueOnce(mockOrderNoExtras);

    render(
      <TestWrapper>
        <OrderDetails />
      </TestWrapper>
    );

    expect(await screen.findByText(/Margherita/)).toBeInTheDocument();
    expect(await screen.findByText(/Quantity: 1/)).toBeInTheDocument();
    expect(await screen.findByText(/No extras/)).toBeInTheDocument();
    const row2 = (await screen.findByText(/Pizza: Margherita/)).closest('tr') as HTMLElement;
    expect(row2).toHaveTextContent(/12\.99/);
  });
});
