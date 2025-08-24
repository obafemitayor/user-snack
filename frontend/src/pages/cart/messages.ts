import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  title: { id: 'Cart.title', defaultMessage: 'Your Cart' },
  empty: { id: 'Cart.empty', defaultMessage: 'Your cart is empty.' },
  goToMenu: { id: 'Cart.go_to_menu', defaultMessage: 'Go to Menu' },
  tableItem: { id: 'Cart.table.item', defaultMessage: 'Item' },
  tableExtras: { id: 'Cart.table.extras', defaultMessage: 'Extras' },
  tableQty: { id: 'Cart.table.qty', defaultMessage: 'Qty' },
  tablePrice: { id: 'Cart.table.price', defaultMessage: 'Price' },
  each: { id: 'Cart.price.each', defaultMessage: '{price} each' },
  remove: { id: 'Cart.remove', defaultMessage: 'Remove' },
  subtotal: { id: 'Cart.subtotal', defaultMessage: 'Subtotal: {price}' },
  addMore: { id: 'Cart.add_more', defaultMessage: 'Add more' },
  deliveryDetails: { id: 'Cart.delivery_details', defaultMessage: 'Delivery Details' },
  namePlaceholder: { id: 'Cart.name_placeholder', defaultMessage: 'Full Name' },
  emailPlaceholder: { id: 'Cart.email_placeholder', defaultMessage: 'Email' },
  phonePlaceholder: { id: 'Cart.phone_placeholder', defaultMessage: 'Phone Number' },
  addressPlaceholder: { id: 'Cart.address_placeholder', defaultMessage: 'Delivery Address' },
  placeOrder: { id: 'Cart.place_order', defaultMessage: 'Place Order' },
  required: { id: 'Cart.required', defaultMessage: 'This field is required' },
  invalidEmail: { id: 'Cart.invalid_email', defaultMessage: 'Please enter a valid email address' },
  invalidPhone: { id: 'Cart.invalid_phone', defaultMessage: 'Please enter a valid phone number' },
})
