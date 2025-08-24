import React, { createContext, useContext, useMemo, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useIntl } from 'react-intl';
import { messages as ctxMessages } from './messages';

export interface CartExtra {
  _id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique line id
  pizzaId: string;
  name: string;
  price: number; // base pizza price
  quantity: number;
  extras: CartExtra[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (args: { pizzaId: string; name: string; price: number; quantity: number; selectedExtraIds: string[]; extrasCatalog: CartExtra[]; }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  placeOrder: (customer: { customer_name: string; customer_email: string; customer_phone?: string; customer_address: string; }) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const STORAGE_KEY_INIT = 'usersnap_cart_v1';
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INIT);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return (parsed as any[]).map((i) => ({
        id: String(i.id),
        pizzaId: String(i.pizzaId),
        name: String(i.name),
        price: Number(i.price) || 0,
        quantity: Math.max(1, Number(i.quantity) || 1),
        extras: Array.isArray(i.extras)
          ? i.extras.map((e: any) => ({
              _id: String(e._id),
              name: String(e.name),
              price: Number(e.price) || 0,
            }))
          : [],
      }));
    } catch {
      return [];
    }
  });
  const STORAGE_KEY = 'usersnap_cart_v1';
  const toast = useToast();
  const navigate = useNavigate();
  const intl = useIntl();

  const addItem: CartContextType['addItem'] = ({ pizzaId, name, price, quantity, selectedExtraIds, extrasCatalog }) => {
    const extras = selectedExtraIds
      .map(id => extrasCatalog.find(e => e._id === id))
      .filter((e): e is CartExtra => !!e);
    const id = `${pizzaId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems(prev => {
      const next = [...prev, { id, pizzaId, name, price, quantity, extras }];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {}
      return next;
    });
    toast({
      title: intl.formatMessage(ctxMessages.addedToCartTitle),
      description: intl.formatMessage(ctxMessages.addedToCartDesc, { name, quantity }),
      status: 'success',
      duration: 2500,
      isClosable: true,
    });
  };

  const removeItem = (id: string) =>
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      try {
        if (typeof window !== 'undefined') {
          if (next.length === 0) localStorage.removeItem(STORAGE_KEY);
          else localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {}
      return next;
    });

  const updateQuantity = (id: string, quantity: number) =>
    setItems(prev => {
      const next = prev.map(i => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
      try {
        if (typeof window !== 'undefined') {
          if (next.length === 0) localStorage.removeItem(STORAGE_KEY);
          else localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  const clearCart = () => {
    setItems([]);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  };

  const getSubtotal = useMemo(() => {
    return () => items.reduce((sum, i) => {
      const extrasSum = i.extras.reduce((eSum, e) => eSum + e.price, 0);
      return sum + (i.price + extrasSum) * i.quantity;
    }, 0);
  }, [items]);

  const placeOrder: CartContextType['placeOrder'] = async (customer) => {
    if (items.length === 0) {
      toast({ title: intl.formatMessage(ctxMessages.cartEmpty), status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    try {
      const payload = {
        customer_name: customer.customer_name,
        customer_email: customer.customer_email,
        customer_phone: customer.customer_phone || undefined,
        customer_address: customer.customer_address,
        items: items.map(i => ({
          pizza_id: i.pizzaId,
          quantity: i.quantity,
          extras: i.extras.map(e => e._id),
        }))
      };
      await ordersAPI.create(payload);
      toast({ title: intl.formatMessage(ctxMessages.orderPlaced), status: 'success', duration: 4000, isClosable: true });
      clearCart();
      navigate('/pizzas');
    } catch (err) {
      console.error(err);
      toast({
        title: intl.formatMessage(ctxMessages.orderFailedTitle),
        description: intl.formatMessage(ctxMessages.orderFailedDesc),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const value = { items, addItem, removeItem, updateQuantity, clearCart, getSubtotal, placeOrder };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
