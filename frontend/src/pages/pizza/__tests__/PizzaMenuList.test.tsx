import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';

import { messages } from '../../../locales/en';
import { pizzaAPI } from '../../../services/api';
import PizzaMenuList from '../PizzaMenuList';

jest.mock('../../../services/api', () => ({
  pizzaAPI: {
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
  const Pass = ({ children }: any) => React.createElement('div', {}, children);
  const ButtonPass = ({ children, onClick }: any) => React.createElement('button', { onClick }, children);
  const HeadingPass = ({ children }: any) => React.createElement('span', {}, children);
  const TextPass = ({ children }: any) => React.createElement('span', {}, children);
  const BadgePass = ({ children }: any) => React.createElement('span', {}, children);
  const ImagePass = ({ alt, src }: any) => React.createElement('img', { alt, src });
  const SpinnerPass = () => React.createElement('div', { role: 'status' }, 'Loading...');
  return {
    __esModule: true,
    Container: Pass,
    Box: Pass,
    SimpleGrid: Pass,
    Card: Pass,
    CardBody: Pass,
    Image: ImagePass,
    Text: TextPass,
    Button: ButtonPass,
    HStack: Pass,
    VStack: Pass,
    Badge: BadgePass,
    Heading: HeadingPass,
    useToast: () => jest.fn(),
    Spinner: SpinnerPass,
    Center: Pass,
  };
});

jest.mock('../../../components/Pagination', () => {
  const React = require('react');
  const PaginationStub = () => React.createElement('div', { 'data-testid': 'pagination' });
  return { __esModule: true, default: PaginationStub };
});

const mockPizzas = {
  data: {
    items: [
      {
        _id: '1',
        name: 'Margherita',
        description: 'Classic pizza with tomato and mozzarella',
        price: 12.99,
        image_url: 'https://example.com/margherita.jpg',
        ingredients: ['tomato', 'mozzarella', 'basil']
      },
      {
        _id: '2',
        name: 'Pepperoni',
        description: 'Pizza with pepperoni and cheese',
        price: 15.99,
        image_url: 'https://example.com/pepperoni.jpg',
        ingredients: ['tomato', 'mozzarella', 'pepperoni']
      }
    ],
    page: 1,
    pages: 1,
    total: 2
  }
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IntlProvider locale="en" messages={messages}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </IntlProvider>
);

describe('PizzaMenuList (real component)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pizza menu title', async () => {
    (pizzaAPI.getAll as jest.Mock).mockResolvedValue(mockPizzas);

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('🍕 Pizza Menu')).toBeInTheDocument();
      expect(screen.getByText('Choose from our delicious selection of pizzas')).toBeInTheDocument();
    });
  });

  it('displays loading spinner initially', () => {
    (pizzaAPI.getAll as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('retrieves and displays pizza menu', async () => {
    (pizzaAPI.getAll as jest.Mock).mockResolvedValue(mockPizzas);

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Margherita')).toBeInTheDocument();
      expect(screen.getByText('Pepperoni')).toBeInTheDocument();
    });

    expect(screen.getByText('Classic pizza with tomato and mozzarella')).toBeInTheDocument();
    expect(screen.getByText('Pizza with pepperoni and cheese')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('$15.99')).toBeInTheDocument();
  });

  it('displays ingredients for each pizza', async () => {
    (pizzaAPI.getAll as jest.Mock).mockResolvedValue(mockPizzas);

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Ingredients: tomato, mozzarella, basil')).toBeInTheDocument();
      expect(screen.getByText('Ingredients: tomato, mozzarella, pepperoni')).toBeInTheDocument();
    });
  });

  it('navigates to pizza details when View Details button is clicked', async () => {
    (pizzaAPI.getAll as jest.Mock).mockResolvedValue(mockPizzas);

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Margherita')).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByText('View Details & Order');
    fireEvent.click(viewDetailsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/pizzas/1');
  });

  it('handles pagination correctly', async () => {
    const paginatedResponse = {
      data: {
        items: [mockPizzas.data.items[0]],
        page: 1,
        pages: 2,
        total: 2
      }
    };
    (pizzaAPI.getAll as jest.Mock).mockResolvedValue(paginatedResponse);

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Margherita')).toBeInTheDocument();
    });
    expect(pizzaAPI.getAll).toHaveBeenCalledWith(1, 9);
  });

  it('displays empty state when no pizzas available', async () => {
    const emptyResponse = {
      data: {
        items: [],
        page: 1,
        pages: 0,
        total: 0
      }
    };
    (pizzaAPI.getAll as jest.Mock).mockResolvedValue(emptyResponse);

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No pizzas available at the moment')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    (pizzaAPI.getAll as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No pizzas available at the moment')).toBeInTheDocument();
    });
  });

  it('calls API with correct pagination parameters', async () => {
    (pizzaAPI.getAll as jest.Mock).mockResolvedValue(mockPizzas);

    render(
      <TestWrapper>
        <PizzaMenuList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(pizzaAPI.getAll).toHaveBeenCalledWith(1, 9);
    });
  });
});
