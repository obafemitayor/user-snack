import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  title: {
    id: 'auth.login.title',
    defaultMessage: 'Admin Login',
  },
  emailLabel: {
    id: 'auth.login.emailLabel',
    defaultMessage: 'Email',
  },
  emailPlaceholder: {
    id: 'auth.login.emailPlaceholder',
    defaultMessage: 'you@example.com',
  },
  passwordLabel: {
    id: 'auth.login.passwordLabel',
    defaultMessage: 'Password',
  },
  passwordPlaceholder: {
    id: 'auth.login.passwordPlaceholder',
    defaultMessage: '••••••••',
  },
  show: {
    id: 'auth.login.show',
    defaultMessage: 'Show',
  },
  hide: {
    id: 'auth.login.hide',
    defaultMessage: 'Hide',
  },
  loginButton: {
    id: 'auth.login.button',
    defaultMessage: 'Login',
  },
  helperText: {
    id: 'auth.login.helperText',
    defaultMessage: 'Use your admin credentials to access order management.',
  },
  loggedIn: {
    id: 'auth.login.success',
    defaultMessage: 'Logged in',
  },
  invalidCredentials: {
    id: 'auth.login.invalidCredentials',
    defaultMessage: 'Invalid email or password',
  },
  loginFailed: {
    id: 'auth.login.failed',
    defaultMessage: 'Login failed',
  },
});
