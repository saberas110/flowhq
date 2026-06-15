/**
 * Get access token from cookie (only works if httponly=false)
 */
function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === 'access') {
      return value;
    }
  }
  return null;
}

/**
 * Check if current host is a LAN IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
 */
function isLanIp(host: string): boolean {
  return /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host);
}

/**
 * Auto-detect WebSocket URL based on current host
 * - Localhost: use ws:// with cookies (same-origin)
 * - LAN IP (phone): use ws:// with token in query string
 */
export function getWebSocketUrl(path: string): string {
  if (typeof window === 'undefined') {
    return `ws://127.0.0.1:8000${path}`;
  }

  const { host } = window.location;
  const hostWithoutPort = host.split(':')[0];
  const isLocalhost = hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1';
  const isLan = isLanIp(hostWithoutPort);

  // Build WebSocket URL using same host but Django port (8000)
  const wsUrl = `ws://${hostWithoutPort}:8000${path}`;

  // Localhost: cookies work (same-origin)
  if (isLocalhost) {
    return wsUrl;
  }

  // LAN IP (phone): add token to query string
  if (isLan) {
    const token = getAccessToken();
    if (token) {
      const separator = wsUrl.includes('?') ? '&' : '?';
      return `${wsUrl}${separator}token=${token}`;
    }
  }

  return wsUrl;
}

// Convenience functions
export function getPresenceSocketUrl(): string {
  return getWebSocketUrl('/ws/presence/');
}

export function getChatSocketUrl(conversationId: number): string {
  return getWebSocketUrl(`/ws/chat/${conversationId}/`);
}
