import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCart } from './CartContext';

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

export interface OrderFormErrors {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  quantity?: string;
}

interface OrderContextType {
  // State
  orderForm: OrderFormData;
  selectedExtraId: string;
  orderLoading: boolean;
  orderErrors: OrderFormErrors;
  
  // Actions
  handleInputChange: (field: keyof OrderFormData, value: string | number) => void;
  setSelectedExtraId: (extraId: string) => void;
  handleAddExtra: () => void;
  handleRemoveExtra: (extraId: string) => void;
  handleAddToCart: (pizza: any, extras: Extra[]) => void;
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
  const { addItem } = useCart();

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
  const [orderErrors, setOrderErrors] = useState<OrderFormErrors>({});

  const validateName = (name: string): string | undefined => {
    if (!name || name.trim().length === 0) {
      return 'Name is required';
    }
    if (name.length > 100) {
      return 'Name must be at most 100 characters';
    }
    return undefined;
  };

  const validateEmail = (emailRaw: string): string | undefined => {
    const email = emailRaw.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Enter a valid email address';
    }
    return undefined;
  };

  const validatePhone = (phoneRaw?: string): string | undefined => {
    const phone = (phoneRaw || '').trim();
    if (!phone) {
      return 'Phone number is required';
    };
    const phoneDigitsOnly = /^\d{10,20}$/;
    if (!phoneDigitsOnly.test(phone)) {
      return 'Phone number must be 10 to 20 digits';
    }
    return undefined;
  };

  const validate = (data: OrderFormData): OrderFormErrors => {
    const errors: OrderFormErrors = {};
    const nameErr = validateName(data.customer_name);
    if (nameErr) {
      errors.customer_name = nameErr;
    }
    const emailErr = validateEmail(data.customer_email);
    if (emailErr) {
      errors.customer_email = emailErr;
    }
    if (!data.customer_address || data.customer_address.trim().length === 0) {
      errors.customer_address = 'Address is required';
    }
    if (!data.quantity || data.quantity < 1) {
      errors.quantity = 'Quantity must be at least 1';
    }
    const phoneErr = validatePhone(data.customer_phone);
    if (phoneErr) {
      errors.customer_phone = phoneErr;
    }
    return errors;
  };

  const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
    setOrderForm(prev => {
      const next = { ...prev, [field]: value } as OrderFormData;
      const nextErrors = validate(next);
      const errorFieldMap: Array<keyof OrderFormErrors> = [
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'quantity',
      ];
      if (errorFieldMap.includes(field as keyof OrderFormErrors)) {
        const typedField = field as keyof OrderFormErrors;
        setOrderErrors(prevErrs => ({ ...prevErrs, [typedField]: nextErrors[typedField] }));
      }
      return next;
    });
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

  const handleAddToCart = (pizza: any, extras: Extra[]) => {
    if (!pizza) return;
    addItem({
      pizzaId: pizza._id,
      name: pizza.name,
      price: pizza.price,
      quantity: orderForm.quantity,
      selectedExtraIds: orderForm.selected_extras,
      extrasCatalog: extras,
    });
  };

  const handlePlaceOrder = async (pizza: any, extras: Extra[], calculateTotal: () => number) => {
    const errors = validate(orderForm);
    setOrderErrors(errors);
    if (!pizza || Object.keys(errors).length > 0) {
      toast({
        title: 'Invalid form',
        description: 'Please correct the highlighted fields.',
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
    setOrderErrors({});
    setSelectedExtraId('');
    setOrderLoading(false);
  };

  const value: OrderContextType = {
    orderForm,
    selectedExtraId,
    orderLoading,
    orderErrors,
    handleInputChange,
    setSelectedExtraId,
    handleAddExtra,
    handleRemoveExtra,
    handleAddToCart,
    handlePlaceOrder,
    resetForm,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
