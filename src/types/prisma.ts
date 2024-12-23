export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Paint {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  brand: string;
  color: string;
  finish: string;
  code?: string | null;
  location?: string | null;
  notes?: string | null;
  homeId?: string | null;
  roomId?: string | null;
}

export interface Flooring {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: string;
  material: string;
  brand: string;
  color?: string | null;
  pattern?: string | null;
  notes?: string | null;
  homeId?: string | null;
  roomId?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date | null;
  cronPattern?: string | null;
  homeId?: string | null;
  roomId?: string | null;
  itemId?: string | null;
  creatorId: string;
  assigneeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  ownedHomes?: Home[];
  sharedHomes?: HomeShare[];
  createdTasks?: Task[];
  assignedTasks?: Task[];
}

export interface Home {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  address: string;
  description?: string | null;
  userId: string;
  rooms?: Room[];
  items?: Item[];
  tasks?: Task[];
  paints?: Paint[];
  floorings?: Flooring[];
}

export interface Room {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string | null;
  homeId: string;
  items?: Item[];
  tasks?: Task[];
  paints?: Paint[];
  floorings?: Flooring[];
}

export interface Item {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  purchaseDate?: Date | null;
  warrantyUntil?: Date | null;
  manualUrl?: string | null;
  homeId: string;
  roomId: string;
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeShare {
  id: string;
  homeId: string;
  userId: string;
  role: 'READ' | 'WRITE';
  createdAt: Date;
} 