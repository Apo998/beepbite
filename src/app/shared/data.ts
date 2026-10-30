export type Role = 'CUSTOMER' | 'RESTAURANT' | 'ADMIN';
export type OrderStatus = 'PREPARING' | 'READY' | 'COMPLETED';

export interface User { _id: string; name: string; email: string; role: Role; createdAt: string; updatedAt: string }
export interface Restaurant { _id: string; userId: string; name: string; createdAt: string; updatedAt: string }
export interface RestaurantAccount extends Restaurant { email: string | null }
export type SupportTopic = 'account' | 'orders' | 'points' | 'restaurants' | 'other';
export interface CustomerCode { qrToken: string; qrCode: string; pointsBalance: number }
export interface Order {
  _id: string;
  customerId: string;
  restaurantId: string;

  orderId: number;
  amountPaid: number;
  status: OrderStatus;
  createdAt: string;

  updatedAt: string;
}

export interface LoginResponse { accessToken: string; user: { id: string; email: string; role: Role } }
export interface OrderUpdate { id: string; orderNumber: number; status: OrderStatus }

export const MESSAGES = {
  invalidLogin: { api: 'Invalid Email or password', ui: "That email and password don't match. Check them and try again." },
  emailExists: { api: 'Email already exists', ui: 'This email already has an account.' },
  customerNotFound: { api: 'Customer not found', ui: "We couldn't find that code. Ask the customer to show it again." },
  orderNotFound: { api: 'Order not found', ui: "This order isn't here any more. It may have been removed." },
  registered: { api: 'Registered successfully', ui: "You're in. Sign in to get your code." },
  offline: { ui: "We couldn't reach BeepBite just now. Check your connection and try again." }
};
