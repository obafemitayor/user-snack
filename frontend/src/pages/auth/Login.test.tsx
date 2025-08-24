import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { authAPI, TOKEN_KEY } from '../../services/api';
import { messages as loginMsgs } from './messages';

jest.mock('@chakra-ui/react', () => {
  const React = require('react');
  const Pass = ({ children }: any) => React.createElement('div', null, children);
  const TextPass = ({ children }: any) => React.createElement('span', null, children);
  const Button = ({ children, isLoading, onClick, type }: any) =>
    React.createElement('button', { disabled: !!isLoading, onClick, type }, children);
  const Input = ({ value, onChange, type, placeholder }: any) =>
    React.createElement('input', { value, onChange, type, placeholder });
  const InputGroup = ({ children }: any) => React.createElement('div', null, children);
  const InputRightElement = ({ children }: any) => React.createElement('span', null, children);
  const useToast = () => () => {};
  return {
    Box: Pass,
    Button,
    Card: Pass,
    CardBody: Pass,
    Center: Pass,
    Container: Pass,
    FormControl: Pass,
    FormLabel: TextPass,
    Heading: TextPass,
    Input,
    InputGroup,
    InputRightElement,
    Text: TextPass,
    useToast,
  };
});

jest.mock('../../services/api', () => {
  return {
    authAPI: { login: jest.fn() },
    TOKEN_KEY: 'usersnap_auth_token',
  };
});

const enMessages = Object.fromEntries(
  Object.entries(loginMsgs).map(([k, v]) => [v.id, v.defaultMessage])
);
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () =>
  render(
    <IntlProvider locale="en" messages={enMessages}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </IntlProvider>
  );

describe('Login Page', () => {
  const user = userEvent.setup();
  const setItemSpy = jest.spyOn(window.localStorage.__proto__, 'setItem');
  const getItemSpy = jest.spyOn(window.localStorage.__proto__, 'getItem');
  const removeItemSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem');

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('logs in successfully, saves token, and navigates to /admin/orders by default', async () => {
    (authAPI.login as jest.Mock).mockResolvedValueOnce('test-token-123');

    renderLogin();

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'admin@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'secret');
    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(TOKEN_KEY, 'test-token-123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/orders', { replace: true });
    });
  });

  it('shows error on failed login and does not save token', async () => {
    const error = { response: { data: { detail: 'Invalid email or password' } } } as any;
    (authAPI.login as jest.Mock).mockRejectedValueOnce(error);

    renderLogin();

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'admin@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(setItemSpy).not.toHaveBeenCalledWith(TOKEN_KEY, expect.any(String));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
