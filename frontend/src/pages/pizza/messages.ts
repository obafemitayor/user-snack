import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  // Pizza Menu
  menuTitle: {
    id: 'Pizza.PizzaMenu.menu_title',
    defaultMessage: '🍕 Pizza Menu'
  },
  menuSubtitle: {
    id: 'Pizza.PizzaMenu.menu_subtitle',
    defaultMessage: 'Choose from our delicious selection of pizzas'
  },
  menuEmpty: {
    id: 'Pizza.PizzaMenu.menu_empty',
    defaultMessage: 'No pizzas available at the moment'
  },
  menuPrice: {
    id: 'Pizza.PizzaMenu.menu_price',
    defaultMessage: '${price}'
  },
  viewDetails: {
    id: 'Pizza.PizzaMenu.view_details',
    defaultMessage: 'View Details & Order'
  },
  
  // Pizza Details
  loading: {
    id: 'Pizza.PizzaDetails.loading',
    defaultMessage: 'Loading pizza details...'
  },
  notFound: {
    id: 'Pizza.PizzaDetails.not_found',
    defaultMessage: 'Pizza not found'
  },
  backToMenu: {
    id: 'Pizza.PizzaDetails.back_to_menu',
    defaultMessage: 'Back to Menu'
  },
  orderForm: {
    id: 'Pizza.PizzaDetails.order_form',
    defaultMessage: 'Place Your Order'
  },
  customerName: {
    id: 'Pizza.PizzaDetails.customer_name',
    defaultMessage: 'Customer Name'
  },
  customerNamePlaceholder: {
    id: 'Pizza.PizzaDetails.customer_name_placeholder',
    defaultMessage: 'Enter your full name'
  },
  email: {
    id: 'Pizza.PizzaDetails.email',
    defaultMessage: 'Email'
  },
  emailPlaceholder: {
    id: 'Pizza.PizzaDetails.email_placeholder',
    defaultMessage: 'Enter your email address'
  },
  phone: {
    id: 'Pizza.PizzaDetails.phone',
    defaultMessage: 'Phone Number'
  },
  phonePlaceholder: {
    id: 'Pizza.PizzaDetails.phone_placeholder',
    defaultMessage: 'Enter your phone number'
  },
  address: {
    id: 'Pizza.PizzaDetails.address',
    defaultMessage: 'Delivery Address'
  },
  addressPlaceholder: {
    id: 'Pizza.PizzaDetails.address_placeholder',
    defaultMessage: 'Enter your delivery address'
  },
  quantity: {
    id: 'Pizza.PizzaDetails.quantity',
    defaultMessage: 'Quantity'
  },
  extras: {
    id: 'Pizza.PizzaDetails.extras',
    defaultMessage: 'Add Extras'
  },
  specialInstructions: {
    id: 'Pizza.PizzaDetails.special_instructions',
    defaultMessage: 'Special Instructions'
  },
  specialInstructionsPlaceholder: {
    id: 'Pizza.PizzaDetails.special_instructions_placeholder',
    defaultMessage: 'Any special requests or instructions'
  },
  total: {
    id: 'Pizza.PizzaDetails.total',
    defaultMessage: 'Total: {total}'
  },
  placeOrder: {
    id: 'Pizza.PizzaDetails.place_order',
    defaultMessage: 'Place Order'
  },
  orderSuccess: {
    id: 'Pizza.PizzaDetails.order_success',
    defaultMessage: 'Order placed successfully!'
  },
  orderError: {
    id: 'Pizza.PizzaDetails.order_error',
    defaultMessage: 'Failed to place order. Please try again.'
  },
  ingredientsLabel: {
    id: 'Pizza.PizzaDetails.ingredients_label',
    defaultMessage: 'Ingredients:'
  },
  missingInfo: {
    id: 'Pizza.PizzaDetails.missing_info',
    defaultMessage: 'Missing Information'
  },
  missingInfoDescription: {
    id: 'Pizza.PizzaDetails.missing_info_description',
    defaultMessage: 'Please fill in all required customer details'
  },
  orderPlaced: {
    id: 'Pizza.PizzaDetails.order_placed',
    defaultMessage: 'Order Placed!'
  },
  orderPlacedDescription: {
    id: 'Pizza.PizzaDetails.order_placed_description',
    defaultMessage: 'Your pizza order has been placed successfully'
  },
  orderFailed: {
    id: 'Pizza.PizzaDetails.order_failed',
    defaultMessage: 'Order Failed'
  },
  orderFailedDescription: {
    id: 'Pizza.PizzaDetails.order_failed_description',
    defaultMessage: 'Failed to place your order. Please try again.'
  },
  orderNow: {
    id: 'Pizza.Menu.order_now',
    defaultMessage: 'Order Now'
  },
  ingredients: {
    id: 'Pizza.Menu.ingredients',
    defaultMessage: 'Ingredients: {ingredients}'
  },
  addExtra: {
    id: 'Pizza.PizzaDetails.add_extra',
    defaultMessage: 'Add'
  },
  selectedExtras: {
    id: 'Pizza.PizzaDetails.selected_extras',
    defaultMessage: 'Selected Extras:'
  },
  selectExtraPlaceholder: {
    id: 'Pizza.PizzaDetails.select_extra_placeholder',
    defaultMessage: 'Select an extra to add'
  },
});
