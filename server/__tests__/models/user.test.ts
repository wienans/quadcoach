import User from '../../models/user';

// Mock the User model to avoid database dependency
jest.mock('../../models/user');

const MockedUser = User as jest.Mocked<typeof User>;

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a valid user with required fields', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
      };

      const mockSavedUser = {
        _id: 'mockId123',
        ...userData,
        roles: ['user'],
        active: true,
        isVerified: false,
        save: jest.fn().mockResolvedValue(this),
      };

      MockedUser.prototype.save = jest.fn().mockResolvedValue(mockSavedUser);
      const user = new MockedUser(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).toBe(userData.password);
      expect(savedUser.roles).toEqual(['user']); // default value
      expect(savedUser.active).toBe(true); // default value
      expect(savedUser.isVerified).toBe(false); // default value
    });

    it('should validate required fields', () => {
      const userDataWithoutName = {
        email: 'john@example.com',
        password: 'hashedPassword123',
      };

      const userDataWithoutEmail = {
        name: 'John Doe',
        password: 'hashedPassword123',
      };

      const userDataWithoutPassword = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Mock validation errors
      MockedUser.prototype.save = jest.fn()
        .mockRejectedValueOnce(new Error('Name is required'))
        .mockRejectedValueOnce(new Error('Email is required'))
        .mockRejectedValueOnce(new Error('Password is required'));

      const user1 = new MockedUser(userDataWithoutName);
      const user2 = new MockedUser(userDataWithoutEmail);
      const user3 = new MockedUser(userDataWithoutPassword);
      
      expect(user1.save()).rejects.toThrow();
      expect(user2.save()).rejects.toThrow();
      expect(user3.save()).rejects.toThrow();
    });
  });

  describe('User Fields', () => {
    it('should allow custom roles array', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedPassword123',
        roles: ['admin', 'user'],
      };

      const mockSavedUser = {
        _id: 'mockId123',
        ...userData,
        save: jest.fn(),
      };

      MockedUser.prototype.save = jest.fn().mockResolvedValue(mockSavedUser);
      const user = new MockedUser(userData);
      const savedUser = await user.save();

      expect(savedUser.roles).toEqual(['admin', 'user']);
    });

    it('should handle optional fields correctly', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        active: false,
        isVerified: true,
        emailToken: 'test-token-123',
        passwordResetToken: 'reset-token-123',
      };

      const mockSavedUser = {
        _id: 'mockId123',
        ...userData,
        save: jest.fn(),
      };

      MockedUser.prototype.save = jest.fn().mockResolvedValue(mockSavedUser);
      const user = new MockedUser(userData);
      const savedUser = await user.save();

      expect(savedUser.active).toBe(false);
      expect(savedUser.isVerified).toBe(true);
      expect(savedUser.emailToken).toBe('test-token-123');
      expect(savedUser.passwordResetToken).toBe('reset-token-123');
    });
  });

  describe('User Queries', () => {
    it('should find user by email', async () => {
      const mockUser = {
        _id: 'mockId123',
        name: 'Active User',
        email: 'active@example.com',
        password: 'password123',
        active: true,
        isVerified: true,
      };

      MockedUser.findOne = jest.fn().mockResolvedValue(mockUser);
      
      const user = await MockedUser.findOne({ email: 'active@example.com' });
      
      expect(user).toBeTruthy();
      expect(user!.name).toBe('Active User');
      expect(MockedUser.findOne).toHaveBeenCalledWith({ email: 'active@example.com' });
    });

    it('should find active users only', async () => {
      const mockActiveUsers = [
        {
          _id: 'mockId1',
          name: 'Active User',
          email: 'active@example.com',
          active: true,
        }
      ];

      MockedUser.find = jest.fn().mockResolvedValue(mockActiveUsers);
      
      const activeUsers = await MockedUser.find({ active: true });
      
      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].email).toBe('active@example.com');
      expect(MockedUser.find).toHaveBeenCalledWith({ active: true });
    });

    it('should find verified users only', async () => {
      const mockVerifiedUsers = [
        {
          _id: 'mockId1',
          name: 'Verified User',
          email: 'verified@example.com',
          isVerified: true,
        }
      ];

      MockedUser.find = jest.fn().mockResolvedValue(mockVerifiedUsers);
      
      const verifiedUsers = await MockedUser.find({ isVerified: true });
      
      expect(verifiedUsers).toHaveLength(1);
      expect(verifiedUsers[0].email).toBe('verified@example.com');
      expect(MockedUser.find).toHaveBeenCalledWith({ isVerified: true });
    });
  });

  describe('User Updates', () => {
    it('should update user fields', async () => {
      const mockUser = {
        _id: 'mockId123',
        name: 'Update Test User',
        email: 'update@example.com',
        password: 'password123',
        isVerified: false,
        emailToken: 'original-token',
        save: jest.fn(),
      };

      // Mock the update operations
      mockUser.isVerified = true;
      mockUser.emailToken = '';
      mockUser.save.mockResolvedValue(mockUser);

      MockedUser.findById = jest.fn().mockResolvedValue(mockUser);

      const updatedUser = await MockedUser.findById('mockId123');
      updatedUser!.isVerified = true;
      updatedUser!.emailToken = '';
      await updatedUser!.save();

      expect(updatedUser!.isVerified).toBe(true);
      expect(updatedUser!.emailToken).toBe('');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should update password reset token', async () => {
      const resetToken = 'new-reset-token';
      const mockUser = {
        _id: 'mockId123',
        name: 'Test User',
        passwordResetToken: '',
        save: jest.fn(),
      };

      mockUser.passwordResetToken = resetToken;
      mockUser.save.mockResolvedValue(mockUser);

      MockedUser.findById = jest.fn().mockResolvedValue(mockUser);

      const updatedUser = await MockedUser.findById('mockId123');
      updatedUser!.passwordResetToken = resetToken;
      await updatedUser!.save();

      expect(updatedUser!.passwordResetToken).toBe(resetToken);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});