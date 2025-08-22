import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { ordersAPI } from '../../../../services/api';
import { messages } from '../../../../locales/en';
import OrdersList from '../OrdersList';
import { ChakraProvider } from '@chakra-ui/react';

jest.mock('../../../../services/api', () => ({
  ordersAPI: {
    getAll: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@chakra-ui/react', () => {
  const React = require('react');
  const Pass = ({ children }: any) => React.createElement('div', null, children);
  const TextPass = ({ children }: any) => React.createElement('span', null, children);
  const TablePass = ({ children }: any) => React.createElement('table', null, children);
  const TheadPass = ({ children }: any) => React.createElement('thead', null, children);
  const TbodyPass = ({ children }: any) => React.createElement('tbody', null, children);
  const TrPass = ({ children }: any) => React.createElement('tr', null, children);
  const ThPass = ({ children }: any) => React.createElement('th', null, children);
  const TdPass = ({ children }: any) => React.createElement('td', null, children);
  const useToast = () => () => {};
  return {
    ChakraProvider: Pass,
    Box: Pass,
    Container: Pass,
    Heading: TextPass,
    Text: TextPass,
    Button: ({ children, isDisabled, isLoading, onClick }: any) =>
      React.createElement('button', { disabled: !!isDisabled || !!isLoading, onClick }, children),
    VStack: Pass,
    HStack: Pass,
    Badge: TextPass,
    Card: Pass,
    CardBody: Pass,
    useToast,
    Spinner: () => React.createElement('div', { role: 'status' }),
    Center: Pass,
    Table: TablePass,
    Thead: TheadPass,
    Tbody: TbodyPass,
    Tr: TrPass,
    Th: ThPass,
    Td: TdPass,
    TableContainer: Pass,
  };
});

const mockOrders = {
  data: {
    items: [
      {
        _id: 'order1',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '1234567890',
        delivery_address: '123 Main St',
        status: 'pending',
        total_amount: 25.98,
        created_at: '2024-01-15T10:30:00Z',
        items: [
          {
            pizza_id: 'pizza1',
            quantity: 2,
            extras: []
          }
        ]
      },
      {
        _id: 'order2',
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        customer_phone: '0987654321',
        delivery_address: '456 Oak Ave',
        status: 'confirmed',
        total_amount: 18.99,
        created_at: '2024-01-15T11:45:00Z',
        items: [
          {
            pizza_id: 'pizza2',
            quantity: 1,
            extras: ['extra1']
          }
        ]
      }
    ],
    page: 1,
    pages: 1,
    total: 2
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

describe('OrdersList (real component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders orders list title', async () => {
    (ordersAPI.getAll as jest.Mock).mockResolvedValue(mockOrders);

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('📋 Orders Management')).toBeInTheDocument();
      expect(screen.getByText('Manage and track all customer orders')).toBeInTheDocument();
    });
  });

  it('displays loading spinner initially', () => {
    (ordersAPI.getAll as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('retrieves and displays orders list', async () => {
    (ordersAPI.getAll as jest.Mock).mockResolvedValue(mockOrders);

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/John Doe/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Jane Smith/).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
    expect(screen.getAllByText(/25\.98/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/18\.99/).length).toBeGreaterThan(0);
  });

  it('displays order status text and dates', async () => {
    (ordersAPI.getAll as jest.Mock).mockResolvedValue(mockOrders);

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/confirmed/i).length).toBeGreaterThan(0);
      // Date formatting varies; assert year
      expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0);
    });
  });

  it('navigates to order details when View Details button is clicked', async () => {
    const user = userEvent.setup();
    (ordersAPI.getAll as jest.Mock).mockResolvedValue(mockOrders);

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/John Doe/).length).toBeGreaterThan(0);
    });

    const viewDetailsButtons = screen.getAllByText('View Details');
    await user.click(viewDetailsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/orders/order1');
  });

  it('handles pagination correctly (initial call)', async () => {
    (ordersAPI.getAll as jest.Mock).mockResolvedValue(mockOrders);

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(ordersAPI.getAll).toHaveBeenCalledWith(1, 10);
    });
  });

  it('displays empty state when no orders available', async () => {
    const emptyResponse = {
      data: {
        items: [],
        page: 1,
        pages: 0,
        total: 0
      }
    };
    (ordersAPI.getAll as jest.Mock).mockResolvedValue(emptyResponse);

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully (shows empty state)', async () => {
    (ordersAPI.getAll as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  it('displays items count and customer info lines', async () => {
    (ordersAPI.getAll as jest.Mock).mockResolvedValue(mockOrders);

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/1\s*item\(s\)/).length).toBe(2);
      expect(screen.getAllByText(/Customer: John Doe/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Customer: Jane Smith/).length).toBeGreaterThan(0);
    });
  });

  it('calls API with correct parameters on initial load', async () => {
    (ordersAPI.getAll as jest.Mock).mockResolvedValue(mockOrders);

    render(
      <TestWrapper>
        <OrdersList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(ordersAPI.getAll).toHaveBeenCalledWith(1, 10);
    });
  });

});
