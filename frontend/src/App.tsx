import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';
import { messages } from './locales/en';
import Navbar from './components/Navbar';
import PizzaMenuList from './pages/pizza/PizzaMenuList';
import PizzaMenuDetails from './pages/pizza/PizzaMenuDetails';
import OrdersList from './pages/admin/orders/OrdersList';
import OrderDetails from './pages/admin/orders/OrderDetails';
import { CartProvider } from './contexts/CartContext';
import CartPage from './pages/cart/CartPage';
import Login from './pages/auth/Login';

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
