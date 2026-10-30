import { io, type Socket } from 'socket.io-client';
import { type Order, type OrderUpdate } from './data';
import { Session } from './session';

// Socket rooms on the backend gateway:
// order:<id> (the customer who owns it), customer:<id> (that customer), restaurant:<id> (that restaurant).
export namespace Live {
  let socket: Socket | undefined;
  const joined = new Set<string>();
  let room: 'customer.join' | 'restaurant.join' | undefined;
  const updates: ((u: OrderUpdate) => void)[] = [];
  const created: ((o: Order) => void)[] = [];
  const reconnects: (() => void)[] = [];

  const ack = (what: string) => (res?: { ok: boolean; error?: string }): void => {
    if (res && !res.ok) console.warn(`${what}: ${res.error}`);
  };
  const joinOrder = (s: Socket, orderId: string): void => { s.emit('order.join', { orderId }, ack(`order.join ${orderId}`)); };

  function connect(): Socket {
    if (socket) return socket;
    const s = io({ auth: { token: Session.token() } });
    let first = true;
    s.on('connect', () => {
      if (room) s.emit(room, {}, ack(room));
      joined.forEach(id => joinOrder(s, id));
      // Events sent while disconnected are lost, so pages reload their data after a reconnect.
      if (!first) reconnects.forEach(fn => fn());
      first = false;
    });
    s.on('order.updated', (u: OrderUpdate) => updates.forEach(fn => fn(u)));
    s.on('order.created', (o: Order) => created.forEach(fn => fn(o)));
    socket = s;
    return s;
  }

  // Follow the live status of these orders (customer only).
  export function watch(orderIds: string[]): void {
    const s = connect();
    orderIds.forEach(id => {
      if (joined.has(id)) return;
      joined.add(id);
      if (s.connected) joinOrder(s, id);
    });
  }

  export function joinRoom(event: 'customer.join' | 'restaurant.join'): void {
    room = event;
    const s = connect();
    if (s.connected) s.emit(event, {}, ack(event));
  }

  export const onUpdate = (fn: (u: OrderUpdate) => void): void => { updates.push(fn); };
  export const onCreated = (fn: (o: Order) => void): void => { created.push(fn); };
  export const onReconnect = (fn: () => void): void => { reconnects.push(fn); };
}
