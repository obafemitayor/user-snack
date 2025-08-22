import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

export interface Extra {
  _id: string;
  name: string;
  price: number;
}

export interface OrderFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  quantity: number;
  selected_extras: string[];
}

interface OrderContextType {
  // State
  orderForm: OrderFormData;
  selectedExtraId: string;
  orderLoading: boolean;
  
  // Actions
  handleInputChange: (field: keyof OrderFormData, value: string | number) => void;
  setSelectedExtraId: (extraId: string) => void;
  handleAddExtra: () => void;
  handleRemoveExtra: (extraId: string) => void;
  handlePlaceOrder: (pizza: any, extras: Extra[], calculateTotal: () => number) => Promise<void>;
  resetForm: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const toast = useToast();
  const navigate = useNavigate();

  const [orderForm, setOrderForm] = useState<OrderFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    quantity: 1,
    selected_extras: []
  });

  const [selectedExtraId, setSelectedExtraId] = useState<string>('');
  const [orderLoading, setOrderLoading] = useState<boolean>(false);

  const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddExtra = () => {
    if (selectedExtraId && !orderForm.selected_extras.includes(selectedExtraId)) {
      setOrderForm(prev => ({
        ...prev,
        selected_extras: [...prev.selected_extras, selectedExtraId]
      }));
      setSelectedExtraId('');
    }
  };

  const handleRemoveExtra = (extraId: string) => {
    setOrderForm(prev => ({
      ...prev,
      selected_extras: prev.selected_extras.filter(id => id !== extraId)
    }));
  };

  const handlePlaceOrder = async (pizza: any, extras: Extra[], calculateTotal: () => number) => {
    if (!pizza || !orderForm.customer_name || !orderForm.customer_email || !orderForm.customer_address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (name, email, and address)',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setOrderLoading(true);

    try {
      const orderData = {
        customer_name: orderForm.customer_name,
        customer_email: orderForm.customer_email,
        customer_phone: orderForm.customer_phone || undefined,
        customer_address: orderForm.customer_address,
        items: [
          {
            pizza_id: pizza._id,
            quantity: orderForm.quantity,
            extras: orderForm.selected_extras
          }
        ]
      };

      await ordersAPI.create(orderData);
      
      toast({
        title: 'Order Placed!',
        description: 'Your pizza order has been placed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/pizzas');
      return;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: 'Failed to place your order. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    } finally {
      setOrderLoading(false);
    }
  };

  const resetForm = () => {
    setOrderForm({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      quantity: 1,
      selected_extras: []
    });
    setSelectedExtraId('');
    setOrderLoading(false);
  };

  const value: OrderContextType = {
    orderForm,
    selectedExtraId,
    orderLoading,
    handleInputChange,
    setSelectedExtraId,
    handleAddExtra,
    handleRemoveExtra,
    handlePlaceOrder,
    resetForm,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
