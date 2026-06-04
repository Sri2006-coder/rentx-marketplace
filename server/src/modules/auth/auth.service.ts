import bcrypt from 'bcrypt';
import { db } from '@/config/db';
import { LoginInput, RegisterInput } from './auth.schema';
import { AppError, BadRequestError, UnauthorizedError } from '@/core/exceptions/AppError';
import { generateAccessToken, generateRefreshToken } from '@/core/utils/jwt';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await db.user.findUnique({ where: { email: data.email } });
    
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await db.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
      },
    });

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { 
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, 
      accessToken, 
      refreshToken 
    };
  }

  static async login(data: LoginInput) {
    const user = await db.user.findUnique({ where: { email: data.email } });
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { 
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, 
      accessToken, 
      refreshToken 
    };
  }
}
