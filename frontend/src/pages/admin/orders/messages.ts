import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  // Orders List
  listTitle: {
    id: 'Orders.OrdersList.list_title',
    defaultMessage: '📋 Orders Management'
  },
  listSubtitle: {
    id: 'Orders.OrdersList.list_subtitle',
    defaultMessage: 'Manage and track all customer orders'
  },
  listEmpty: {
    id: 'Orders.OrdersList.list_empty',
    defaultMessage: 'No orders found'
  },
  customer: {
    id: 'Orders.OrdersList.customer',
    defaultMessage: 'Customer: {name}'
  },
  total: {
    id: 'Orders.OrdersList.total',
    defaultMessage: 'Total: {total}'
  },
  viewDetails: {
    id: 'Orders.OrdersList.view_details',
    defaultMessage: 'View Details'
  },
  loading: {
    id: 'Orders.OrdersList.loading',
    defaultMessage: 'Loading orders...'
  },

  // Order Details
  detailsLoading: {
    id: 'Orders.OrderDetails.details_loading',
    defaultMessage: 'Loading order details...'
  },
  detailsNotFound: {
    id: 'Orders.OrderDetails.details_not_found',
    defaultMessage: 'Order not found'
  },
  backToOrders: {
    id: 'Orders.OrderDetails.back_to_orders',
    defaultMessage: 'Back to Orders'
  },
  detailsTitle: {
    id: 'Orders.OrderDetails.details_title',
    defaultMessage: 'Order Details'
  },
  orderId: {
    id: 'Orders.OrderDetails.order_id',
    defaultMessage: 'Order ID: {id}'
  },
  status: {
    id: 'Orders.OrderDetails.status',
    defaultMessage: 'Status'
  },
  updateStatus: {
    id: 'Orders.OrderDetails.update_status',
    defaultMessage: 'Update Status'
  },
  customerInfo: {
    id: 'Orders.OrderDetails.customer_info',
    defaultMessage: 'Customer Information'
  },
  name: {
    id: 'Orders.OrderDetails.name',
    defaultMessage: 'Name: {name}'
  },
  email: {
    id: 'Orders.OrderDetails.email',
    defaultMessage: 'Email: {email}'
  },
  phone: {
    id: 'Orders.OrderDetails.phone',
    defaultMessage: 'Phone: {phone}'
  },
  address: {
    id: 'Orders.OrderDetails.address',
    defaultMessage: 'Address: {address}'
  },
  orderItems: {
    id: 'Orders.OrderDetails.order_items',
    defaultMessage: 'Order Items'
  },
  pizza: {
    id: 'Orders.OrderDetails.pizza',
    defaultMessage: 'Pizza: {name}'
  },
  quantity: {
    id: 'Orders.OrderDetails.quantity',
    defaultMessage: 'Quantity: {quantity}'
  },
  extras: {
    id: 'Orders.OrderDetails.extras',
    defaultMessage: '{extras}'
  },
  noExtras: {
    id: 'Orders.OrderDetails.no_extras',
    defaultMessage: 'No extras'
  },
  orderTotal: {
    id: 'Orders.OrderDetails.order_total',
    defaultMessage: 'Total: {total}'
  },
  updateSuccess: {
    id: 'Orders.OrderDetails.update_success',
    defaultMessage: 'Order status updated successfully!'
  },
  updateError: {
    id: 'Orders.OrderDetails.update_error',
    defaultMessage: 'Failed to update order status. Please try again.'
  },
  specialInstructions: {
    id: 'Orders.OrderDetails.special_instructions',
    defaultMessage: 'Special Instructions'
  },
  noSpecialInstructions: {
    id: 'Orders.OrderDetails.no_special_instructions',
    defaultMessage: 'No special instructions'
  },

  // Order Status
  statusPending: {
    id: 'Orders.Status.pending',
    defaultMessage: 'Pending'
  },
  statusConfirmed: {
    id: 'Orders.Status.confirmed',
    defaultMessage: 'Confirmed'
  },
  statusPreparing: {
    id: 'Orders.Status.preparing',
    defaultMessage: 'Preparing'
  },
  statusReady: {
    id: 'Orders.Status.ready',
    defaultMessage: 'Ready'
  },
  statusDelivered: {
    id: 'Orders.Status.delivered',
    defaultMessage: 'Delivered'
  },
  statusCancelled: {
    id: 'orders.statusCancelled',
    defaultMessage: 'Cancelled',
  },
  orderManagement: {
    id: 'orders.orderManagement',
    defaultMessage: 'Order Management',
  },
  orderDelivered: {
    id: 'orders.orderDelivered',
    defaultMessage: 'Order has been delivered successfully',
  },
  orderCancelled: {
    id: 'orders.orderCancelled',
    defaultMessage: 'Order has been cancelled',
  },
  orderIdLabel: {
    id: 'orders.orderIdLabel',
    defaultMessage: 'Order ID:',
  },
  orderDateLabel: {
    id: 'orders.orderDateLabel',
    defaultMessage: 'Order Date:',
  },
  totalAmountLabel: {
    id: 'orders.totalAmountLabel',
    defaultMessage: 'Total Amount:',
  },
  nameLabel: {
    id: 'orders.nameLabel',
    defaultMessage: 'Name:',
  },
  emailLabel: {
    id: 'orders.emailLabel',
    defaultMessage: 'Email:',
  },
  phoneLabel: {
    id: 'orders.phoneLabel',
    defaultMessage: 'Phone:',
  },
  deliveryAddressLabel: {
    id: 'orders.deliveryAddressLabel',
    defaultMessage: 'Delivery Address:',
  },
  tableHeaderItem: {
    id: 'orders.tableHeaderItem',
    defaultMessage: 'Item',
  },
  tableHeaderQuantity: {
    id: 'orders.tableHeaderQuantity',
    defaultMessage: 'Quantity',
  },
  tableHeaderExtras: {
    id: 'orders.tableHeaderExtras',
    defaultMessage: 'Extras',
  },
  tableHeaderPrice: {
    id: 'orders.tableHeaderPrice',
    defaultMessage: 'Price',
  },
  unknownPizza: {
    id: 'orders.unknownPizza',
    defaultMessage: 'Unknown Pizza',
  },
  priceNotAvailable: {
    id: 'orders.priceNotAvailable',
    defaultMessage: 'N/A',
  },
  tableHeaderOrderId: {
    id: 'orders.tableHeaderOrderId',
    defaultMessage: 'Order ID',
  },
  tableHeaderCustomer: {
    id: 'orders.tableHeaderCustomer',
    defaultMessage: 'Customer',
  },
  tableHeaderItems: {
    id: 'orders.tableHeaderItems',
    defaultMessage: 'Items',
  },
  tableHeaderTotal: {
    id: 'orders.tableHeaderTotal',
    defaultMessage: 'Total',
  },
  tableHeaderStatus: {
    id: 'orders.tableHeaderStatus',
    defaultMessage: 'Status',
  },
  tableHeaderDate: {
    id: 'orders.tableHeaderDate',
    defaultMessage: 'Date',
  },
  tableHeaderActions: {
    id: 'orders.tableHeaderActions',
    defaultMessage: 'Actions',
  },
  statusUpdateHelp: {
    id: 'orders.statusUpdateHelp',
    defaultMessage: 'Use this to track the order progress and notify customers of status changes.',
  },
});
