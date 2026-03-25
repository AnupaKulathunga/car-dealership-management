import { AppError } from '../../../utils/AppError';

// ── Mocks (must be declared before imports that use them) ──────────────

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../../config/env', () => ({
  env: {
    jwtSecret: 'test-jwt-secret',
    jwtRefreshSecret: 'test-jwt-refresh-secret',
    bcryptSaltRounds: 10,
  },
}));

// ── Imports ────────────────────────────────────────────────────────────

import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { login, register, getProfile } from '../auth.service';

// ── Helpers ────────────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  email: 'john@example.com',
  passwordHash: 'hashed-password',
  firstName: 'John',
  lastName: 'Doe',
  role: 'SALES_AGENT' as const,
  phone: '0771234567',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

// ── Tests ──────────────────────────────────────────────────────────────

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── login ──────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return tokens and user on valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await login('john@example.com', 'password123');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user.email).toBe('john@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should throw 401 when email does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(login('nobody@example.com', 'password123')).rejects.toThrow(AppError);
      await expect(login('nobody@example.com', 'password123')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw 401 when password is wrong', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(login('john@example.com', 'wrong-password')).rejects.toThrow(AppError);
      await expect(login('john@example.com', 'wrong-password')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  // ── register ───────────────────────────────────────────────────────

  describe('register', () => {
    const registerInput = {
      email: 'jane@example.com',
      password: 'securePass1!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'SALES_AGENT' as const,
      phone: '0779876543',
    };

    it('should create user and return without passwordHash', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 2,
        ...registerInput,
        passwordHash: 'hashed-new-password',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await register(registerInput);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('jane@example.com');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerInput.email,
          passwordHash: 'hashed-new-password',
          firstName: registerInput.firstName,
          lastName: registerInput.lastName,
          role: registerInput.role,
          phone: registerInput.phone,
        },
      });
    });

    it('should throw 409 when email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(register(registerInput)).rejects.toThrow(AppError);
      await expect(register(registerInput)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  // ── getProfile ─────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should return user without passwordHash', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getProfile(1);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('john@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw 404 when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getProfile(999)).rejects.toThrow(AppError);
      await expect(getProfile(999)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
