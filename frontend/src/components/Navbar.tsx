import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

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
  return (
    <Box bg="gray.800" px={4} position="fixed" top={0} left={0} right={0} zIndex={1000}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <HStack spacing={8} alignItems={'center'}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="white">
              🍕 UserSnap Pizza
            </Text>
          </Box>
          <HStack as={'nav'} spacing={4}>
            <NavLink to="/pizzas">Menu</NavLink>
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
