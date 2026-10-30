import { MESSAGES, type CustomerCode, type LoginResponse, type Order, type OrderStatus, type Restaurant, type RestaurantAccount, type SupportTopic, type User } from './data';
import { Session } from './session';

export class ApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export namespace Api {

  const BASE = '/api';

  async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
    const headers: Record<string, string> = {};
    const token = auth ? Session.token() : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    let res: Response;
    try {
      res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch {
      throw new ApiError(0, MESSAGES.offline.ui);
    }

    const text = await res.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      if (res.status === 401 && auth) {
        const role = Session.last()?.role ?? 'CUSTOMER';
        Session.clear();
        location.assign(`/auth/callback?state=expired&role=${role}`);
        return new Promise<never>(() => { });
      }
      const raw = (data as { message?: string | string[] } | null)?.message;
      throw new ApiError(res.status, (Array.isArray(raw) ? raw.join('. ') : raw) || res.statusText || 'Request failed');
    }
    return data as T;
  }

  export const errorText = (err: unknown): string =>
    err instanceof ApiError ? err.message : 'Something went wrong. Try again.';

  export const login = (email: string, password: string): Promise<LoginResponse> =>
    request('POST', '/auth/login', { email, password }, false);
  export const register = (name: string, email: string, password: string): Promise<{ message: string }> =>
    request('POST', '/auth/register', { name, email, password }, false);
  export const forgotPassword = (email: string): Promise<{ message: string }> =>
    request('POST', '/auth/forgot-password', { email }, false);
  export const resetPassword = (token: string, password: string): Promise<{ message: string }> =>
    request('POST', '/auth/reset-password', { token, password }, false);
  export const support = (name: string, email: string, topic: SupportTopic, message: string): Promise<{ message: string }> =>
    request('POST', '/support', { name, email, topic, message }, false);
  export const me = (): Promise<User> => request('GET', '/auth/me');
  export const customerCode = (): Promise<CustomerCode> => request('GET', '/customer/me');

  export const restaurants = (): Promise<Restaurant[]> => request('GET', '/restaurant');
  export const restaurantAccounts = (): Promise<RestaurantAccount[]> => request('GET', '/restaurant/accounts');
  export const myRestaurant = (): Promise<Restaurant> => request('GET', '/restaurant/me');
  export const restaurant = (id: string): Promise<Restaurant> => request('GET', `/restaurant/${encodeURIComponent(id)}`);
  export const createRestaurant = (name: string, email: string, password: string): Promise<Restaurant> =>
    request('POST', '/restaurant', { name, email, password });

  export const orders = (): Promise<Order[]> => request('GET', '/order/all');
  export const readyOrders = (): Promise<Order[]> => request('GET', '/order/ready');
  export const restaurantOrders = (): Promise<Order[]> => request('GET', '/order/restaurant');
  export const createOrder = (qrToken: string, amountPaid: number): Promise<Order> =>
    request('POST', '/order/new', { qrToken, amountPaid });
  export const setStatus = (id: string, status: OrderStatus): Promise<Order> =>
    request('PATCH', `/order/${encodeURIComponent(id)}/status`, { status });
}
