import {
  Box,
  Flex,
  HStack,
  Link,
  Text,
  Spacer,
  Icon,
} from '@chakra-ui/react';
import React from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { messages as navMessages } from './messages';
import { ReactComponent as CartIcon } from '../assets/icons/cart.svg';
import { useCart } from '../contexts/CartContext';

interface NavLinkProps {
  children: React.ReactNode;
  to: string;
}

const NavLink: React.FC<NavLinkProps> = ({ children, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/pizzas' && location.pathname === '/');
  
  return (
    <Link
      as={RouterLink}
      to={to}
      px={2}
      py={1}
      rounded={'md'}
      color={isActive ? 'white' : 'gray.200'}
      bg={isActive ? 'orange.500' : 'transparent'}
      _hover={{
        textDecoration: 'none',
        bg: isActive ? 'orange.600' : 'gray.700',
      }}
    >
      {children}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const { items } = useCart();
  const count = items.length;
  const intl = useIntl();
  return (
    <Box bg="gray.800" px={4} position="fixed" top={0} left={0} right={0} zIndex={1000}>
      <Flex h={16} alignItems={'center'}>
        <HStack spacing={8} alignItems={'center'}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="white">
              {intl.formatMessage(navMessages.navBrand)}
            </Text>
          </Box>
          <HStack as={'nav'} spacing={4}>
            <NavLink to="/pizzas">{intl.formatMessage(navMessages.navMenu)}</NavLink>
          </HStack>
        </HStack>
        <Spacer />
        <HStack>
          <NavLink to="/cart">
            <HStack spacing={2} align="center">
              <Icon as={CartIcon} boxSize={5} color="orange.400" />
              <Text>{intl.formatMessage(navMessages.navCart, { count })}</Text>
            </HStack>
          </NavLink>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
