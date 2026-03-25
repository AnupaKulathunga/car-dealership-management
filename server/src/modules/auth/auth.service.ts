import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import type { RegisterInput } from './auth.validator';
import type { User } from '@prisma/client';

// Exclude passwordHash from user object
function excludePassword(user: User) {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Generate access and refresh JWT tokens
function generateTokens(user: User) {
  const payload = { userId: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokens = generateTokens(user);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: excludePassword(user),
  };
}

export async function register(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, env.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone,
    },
  });

  return excludePassword(user);
}

export async function refreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as {
      userId: number;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokens = generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired refresh token', 401);
  }
}

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return excludePassword(user);
}
