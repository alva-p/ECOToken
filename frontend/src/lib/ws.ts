const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000';

/** Cliente WebSocket para actualizaciones en tiempo real (ranking, saldos). STUB. */
export function createSocket(path = '/ws'): WebSocket {
  return new WebSocket(`${WS_URL}${path}`);
}
