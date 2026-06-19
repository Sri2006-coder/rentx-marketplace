import { db } from '../../config/db';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  }

  static async findUserById(id: string) {
    return db.user.findUnique({ 
      where: { id },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        role: true, 
        createdAt: true,
        trustProfile: {
          select: {
            trustScore: true,
            verifiedBadge: true,
            aadhaarStatus: true,
            panStatus: true,
            emailVerified: true,
            phoneVerified: true
          }
        }
      }
    });
  }

  static async createUser(data: Prisma.UserCreateInput) {
    return db.user.create({
      data: {
        ...data,
        trustProfile: {
          create: {
            trustScore: 0,
            aadhaarStatus: 'UNVERIFIED',
            panStatus: 'UNVERIFIED',
            verifiedBadge: false,
            emailVerified: false,
            phoneVerified: false
          }
        }
      }
    });
  }
}
