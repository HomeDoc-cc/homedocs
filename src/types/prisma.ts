export enum TaskRecurrenceUnit {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
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
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;

  // Recurring task fields
  isRecurring: boolean;
  interval: number | null;
  unit: TaskRecurrenceUnit | null;
  lastCompleted: string | null;
  nextDueDate: string | null;
  parentTaskId: string | null;
  parentTask?: Task | null;
  childTasks?: Task[];

  assigneeId: string | null;
  assignee: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  homeId: string | null;
  roomId: string | null;
  itemId: string | null;
  creatorId: string;
  creator: {
    id: string;
    name: string | null;
    email: string | null;
  };
  home: {
    id: string;
    name: string;
    userId: string;
    shares: {
      role: 'READ' | 'WRITE';
    }[];
  } | null;
  room: {
    id: string;
    name: string;
    homeId: string;
    home: {
      id: string;
      name: string;
      userId: string;
      shares: {
        role: 'READ' | 'WRITE';
      }[];
    };
  } | null;
  item: {
    id: string;
    name: string;
    roomId: string;
    room: {
      id: string;
      name: string;
      homeId: string;
      home: {
        id: string;
        name: string;
        userId: string;
        shares: {
          role: 'READ' | 'WRITE';
        }[];
      };
    };
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  isDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

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
