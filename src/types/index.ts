export interface User {
  id: string;
  username: string;
  token: string;
}

export interface Post {
  id: number;
  type: "missing" | "advertisement";

  title: string;
  subtitle?: string;
  description?: string;
  category?: string;

  content?: string;

  reward?: number;
  duration?: number;

  image?: string;

  location?: string;

  publisherId: number | string;
  publisherName: string;

  address?: string;

  createdAt?: string;

  newImageFile?: File | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageTime?: string;
}
