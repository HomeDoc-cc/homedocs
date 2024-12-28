import { hash } from 'bcryptjs';
import { z } from 'zod';

import { prisma } from './db';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
});

export type CreateUserInput = z.infer<typeof userSchema>;

export async function createUser(input: CreateUserInput) {
  const { email, password, name } = userSchema.parse(input);

  const exists = await prisma.user.findUnique({
    where: { email },
  });

  if (exists) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

  return user;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

  return user;
}
