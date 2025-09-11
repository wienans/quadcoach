import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import verifyJWT from '../../middleware/verifyJWT';

// Mock logger
jest.mock('../../middleware/logger', () => ({
  logEvents: jest.fn(),
}));

// Setup environment variables for tests
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

describe('verifyJWT Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn(() => mockResponse) as any,
      json: jest.fn(() => mockResponse) as any,
    };
    nextFunction = jest.fn();
  });

  describe('Valid JWT Token', () => {
    it('should verify valid JWT token and set UserInfo', () => {
      const testUser = {
        UserInfo: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
        },
      };

      const token = jwt.sign(testUser, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15m',
      });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect((mockRequest as any).UserInfo).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user'],
      });
    });

    it('should handle Authorization header (capital A)', () => {
      const testUser = {
        UserInfo: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['admin'],
        },
      };

      const token = jwt.sign(testUser, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15m',
      });

      mockRequest.headers = {
        Authorization: `Bearer ${token}`,
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect((mockRequest as any).UserInfo.roles).toEqual(['admin']);
    });
  });

  describe('Invalid Authorization Header', () => {
    it('should return 401 when no authorization header', () => {
      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic some-token',
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when Bearer token is malformed', () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Invalid JWT Token', () => {
    it('should handle invalid JWT token gracefully', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect((mockRequest as any).UserInfo).toEqual({
        id: '',
        email: '',
        name: '',
        roles: [],
      });
    });

    it('should handle expired token', () => {
      const testUser = {
        UserInfo: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
        },
      };

      // Create an expired token (expired 1 hour ago)
      const expiredToken = jwt.sign(testUser, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '-1h',
      });

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token expired' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle malformed JWT token', () => {
      mockRequest.headers = {
        authorization: 'Bearer malformed.jwt.token',
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect((mockRequest as any).UserInfo).toEqual({
        id: '',
        email: '',
        name: '',
        roles: [],
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should handle missing JWT secrets', () => {
      const originalAccessSecret = process.env.ACCESS_TOKEN_SECRET;
      delete process.env.ACCESS_TOKEN_SECRET;

      const token = 'some-token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(nextFunction).not.toHaveBeenCalled();

      // Restore environment variable
      process.env.ACCESS_TOKEN_SECRET = originalAccessSecret;
    });

    it('should handle missing refresh token secret', () => {
      const originalRefreshSecret = process.env.REFRESH_TOKEN_SECRET;
      delete process.env.REFRESH_TOKEN_SECRET;

      const token = 'some-token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(nextFunction).not.toHaveBeenCalled();

      // Restore environment variable
      process.env.REFRESH_TOKEN_SECRET = originalRefreshSecret;
    });
  });

  describe('Token Expiration Check', () => {
    it('should allow valid non-expired token', () => {
      const testUser = {
        UserInfo: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
        },
      };

      const futureTime = Math.floor(Date.now() / 1000) + 900; // 15 minutes from now
      const tokenWithExp = jwt.sign({ ...testUser, exp: futureTime }, process.env.ACCESS_TOKEN_SECRET!);

      mockRequest.headers = {
        authorization: `Bearer ${tokenWithExp}`,
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect((mockRequest as any).UserInfo.email).toBe('test@example.com');
    });

    it('should reject expired token based on exp claim', () => {
      const testUser = {
        UserInfo: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
        },
      };

      const pastTime = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
      const expiredTokenWithExp = jwt.sign({ ...testUser, exp: pastTime }, process.env.ACCESS_TOKEN_SECRET!);

      mockRequest.headers = {
        authorization: `Bearer ${expiredTokenWithExp}`,
      };

      verifyJWT(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token expired' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});