import { Button } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { TOKEN_KEY } from '../services/api';

interface LogoutButtonProps {
  size?: string;
  variant?: string;
  colorScheme?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ size = 'sm', variant = 'outline', colorScheme = 'red' }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };
  return (
    <Button size={size} variant={variant} colorScheme={colorScheme} onClick={handleLogout}>
      Log out
    </Button>
  );
};

export default LogoutButton;
