import React from 'react';
import { useOrder } from '../contexts/OrderContext';
import OrderForm from './OrderForm';

interface Extra {
  _id: string;
  name: string;
  price: number;
}

interface Pizza {
  _id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

interface OrderFormWrapperProps {
  extras: Extra[];
  pizza: Pizza | null;
  messages: any;
}

const OrderFormWrapper: React.FC<OrderFormWrapperProps> = ({ extras, pizza, messages }) => {
  const { orderForm } = useOrder();
  
  const calculateTotal = (): number => {
    if (!pizza) return 0;
    
    const pizzaTotal = pizza.price * orderForm.quantity;
    const extrasTotal = orderForm.selected_extras.reduce((total: number, extraId: string) => {
      const extra = extras.find(e => e._id === extraId);
      return total + (extra ? extra.price * orderForm.quantity : 0);
    }, 0);
    
    return parseFloat((pizzaTotal + extrasTotal).toFixed(2));
  };

  return (
    <OrderForm
      extras={extras}
      pizza={pizza}
      total={calculateTotal()}
      messages={messages}
      calculateTotal={calculateTotal}
    />
  );
};

export default OrderFormWrapper;
