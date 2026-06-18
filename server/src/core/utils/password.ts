import bcrypt from 'bcrypt';

export class PasswordUtil {
  private static readonly saltRounds = 10;

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
