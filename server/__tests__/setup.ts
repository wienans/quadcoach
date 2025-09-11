import mongoose from 'mongoose';

// Mock mongoose for testing
beforeAll(async () => {
  // Use a simple mock connection string for testing
  const uri = 'mongodb://localhost:27017/test';
  
  // Mock mongoose.connect to avoid actual connection
  jest.spyOn(mongoose, 'connect').mockImplementation(async () => {
    return {} as any;
  });
  
  // Mock mongoose operations
  const mockConnection = {
    dropDatabase: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    collections: {},
  };
  
  Object.defineProperty(mongoose, 'connection', {
    value: mockConnection,
    writable: true
  });
});

// Cleanup after all tests
afterAll(async () => {
  // No actual cleanup needed for mocked connection
});

// Clean up after each test
afterEach(async () => {
  // Reset all mocks
  jest.clearAllMocks();
});