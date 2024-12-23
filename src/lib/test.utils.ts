import { prisma } from "./db";
import { hash } from "bcryptjs";
import { encode } from "next-auth/jwt";

export async function getTestUserToken() {
  // Create a test user if it doesn't exist
  const email = "test@example.com";
  const password = "password123";

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: await hash(password, 12),
        name: "Test User",
      },
    });
  }

  // Create a session token
  const token = await encode({
    token: {
      email: user.email,
      name: user.name,
      sub: user.id,
    },
    secret: process.env.NEXTAUTH_SECRET!,
  });

  return token;
} 