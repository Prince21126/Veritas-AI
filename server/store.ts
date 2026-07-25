import { KnowledgeDocument, KnowledgeChunk } from "./knowledge_base/types";
import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'partner';
  name: string;
  organization?: string;
  status: 'active' | 'suspended';
  trust_level: number;
  permissions: string[];
  category?: string;
  phone?: string;
  website?: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'html';
  institution: string;
  country: string;
  category: string;
  status: 'active' | 'paused';
  last_sync?: string;
  documents_collected: number;
  reliability_score: number;
  authority_score: number;
}

export interface VerificationHistory {
  id: string;
  query: string;
  date: string;
  user?: string;
  category: string;
  verification_status: string;
  confidence: number;
  time_taken_ms: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'verification' | 'alert';
  timestamp: string;
}

export class DataStore {
  users: User[] = [
    {
      id: "admin-1",
      email: "admin@veritas.local",
      password: "admin123", // MVP default password
      role: "admin",
      name: "Admin Principal",
      status: "active",
      trust_level: 1.0,
      permissions: ["all"]
    },
    {
      id: "partner-1",
      email: "partner@veritas.local",
      password: "partner123", // MVP default password
      role: "partner",
      name: "Porte-parole MSF",
      organization: "Médecins Sans Frontières",
      category: "Santé",
      status: "active",
      trust_level: 0.95,
      permissions: ["upload_docs"]
    }
  ];

  sources: Source[] = [
    {
      id: "source-1",
      name: "ONU Info (Français)",
      url: "https://news.un.org/feed/subscribe/fr/news/all/rss.xml",
      type: "rss",
      institution: "ONU",
      country: "Global",
      category: "Général",
      status: "active",
      documents_collected: 0,
      reliability_score: 1.0,
      authority_score: 1.0
    }
  ];

  history: VerificationHistory[] = [];
  notifications: Notification[] = [];

  addUser(user: User) {
    this.users.push(user);
  }
  updateUser(id: string, updates: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
    }
  }
  deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
  }

  addSource(source: Source) {
    this.sources.push(source);
  }
  updateSource(id: string, updates: Partial<Source>) {
    const idx = this.sources.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.sources[idx] = { ...this.sources[idx], ...updates };
    }
  }
  deleteSource(id: string) {
    this.sources = this.sources.filter(s => s.id !== id);
  }

  addHistory(record: VerificationHistory) {
    this.history.unshift(record);
    if (this.history.length > 1000) {
      this.history.pop();
    }
  }

  addNotification(notification: Notification) {
    this.notifications.unshift(notification);
  }

  getNotifications(userId: string) {
    return this.notifications.filter(n => n.userId === userId);
  }
}

export const globalStore = new DataStore();
