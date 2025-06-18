import { Timestamp } from "firebase/firestore";

export interface IUser {
  anniversaryDate?: Timestamp | null;
  chatroomUid?: string | null;
  createdAt: Timestamp;
  email: string;
  lastLogin?: Timestamp | null;
  name: string;
  onboarded: boolean;
  partnerUid?: string | null;
  uid: string;
}

export interface IChatroom {
  createdAt: Date;
  users: string[];
  messages: IMessage[];
  uid: string;
}

export interface IMessage {
  senderUid: string;
  content: string;
  timestamp: Timestamp;
  attachmentUrl?: string | null;
  filename?: string | null;
}
