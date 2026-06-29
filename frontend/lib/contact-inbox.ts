/** DTO de mensajes de contacto expuesto al admin (allowlist; sin ip_hash). */

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface ContactStats {
  total: number;
  unread: number;
  last24h: number;
}
