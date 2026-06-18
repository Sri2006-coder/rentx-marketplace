import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-key-for-dev';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-for-dev';

export interface JwtPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '7d' });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};
