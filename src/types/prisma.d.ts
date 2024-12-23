import { Prisma } from "@prisma/client";

export type Task = Prisma.TaskGetPayload<{
  include: {
    creator: true;
    assignee: true;
  };
}>;

export type User = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    image: true;
  };
}>;

export type Paint = Prisma.PaintGetPayload<{
  select: {
    id: true;
    name: true;
    brand: true;
    color: true;
    finish: true;
    code: true;
    location: true;
    notes: true;
    homeId: true;
    roomId: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"; 