import { AuthRepository } from './auth.repository';
import { LoginInput, RegisterInput } from './auth.schema';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../core/exceptions/AppError';
import { generateAccessToken, generateRefreshToken } from '../../core/utils/jwt';
import { PasswordUtil } from '../../core/utils/password';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await AuthRepository.findUserByEmail(data.email);
    
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    const passwordHash = await PasswordUtil.hash(data.password);

    const user = await AuthRepository.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
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
    const user = await AuthRepository.findUserByEmail(data.email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await PasswordUtil.compare(data.password, user.passwordHash);
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

  static async getMe(userId: string) {
    const user = await AuthRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}
