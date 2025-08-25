import { Box } from '@chakra-ui/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import { CartProvider } from './contexts/CartContext';
import { messages } from './locales/en';
import OrderDetails from './pages/admin/orders/OrderDetails';
import OrdersList from './pages/admin/orders/OrdersList';
import Login from './pages/auth/Login';
import CartPage from './pages/cart/CartPage';
import PizzaMenuDetails from './pages/pizza/PizzaMenuDetails';
import PizzaMenuList from './pages/pizza/PizzaMenuList';

const App: React.FC = () => {
  return (
    <IntlProvider locale="en" messages={messages}>
      <CartProvider>
        <Box minH="100vh" bg="gray.50">
          <Navbar />
          <Box as="main" pt="80px">
            <Routes>
              <Route path="/" element={<PizzaMenuList />} />
              <Route path="/pizzas" element={<PizzaMenuList />} />
              <Route path="/pizzas/:id" element={<PizzaMenuDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/orders" element={<OrdersList />} />
              <Route path="/admin/orders/:id" element={<OrderDetails />} />
            </Routes>
          </Box>
        </Box>
      </CartProvider>
    </IntlProvider>
  );
};

export default App;
