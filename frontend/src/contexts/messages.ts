import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  addedToCartTitle: { id: 'Cart.toast.added_title', defaultMessage: 'Added to cart' },
  addedToCartDesc: { id: 'Cart.toast.added_desc', defaultMessage: '{name} x{quantity}' },
  cartEmpty: { id: 'Cart.toast.empty', defaultMessage: 'Cart is empty' },
  orderPlaced: { id: 'Cart.toast.placed', defaultMessage: 'Order placed!' },
  orderFailedTitle: { id: 'Cart.toast.failed_title', defaultMessage: 'Order failed' },
  orderFailedDesc: { id: 'Cart.toast.failed_desc', defaultMessage: 'Please try again.' },
});
