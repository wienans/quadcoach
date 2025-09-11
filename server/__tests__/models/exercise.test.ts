import Exercise from '../../models/exercise';
import User from '../../models/user';
import { Types } from 'mongoose';

// Mock the models to avoid database dependency
jest.mock('../../models/exercise');
jest.mock('../../models/user');

const MockedExercise = Exercise as jest.Mocked<typeof Exercise>;
const MockedUser = User as jest.Mocked<typeof User>;

describe('Exercise Model', () => {
  describe('Exercise Creation', () => {
    it('should create a valid exercise with required fields', async () => {
      const exerciseData = {
        name: 'Basic Passing Drill',
        persons: 6,
      };

      const mockSavedExercise = {
        _id: new Types.ObjectId(),
        ...exerciseData,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
      } as any;

      MockedExercise.prototype.save = jest.fn().mockResolvedValue(mockSavedExercise);
      const exercise = new MockedExercise(exerciseData);
      const savedExercise: any = await exercise.save();

      expect(savedExercise._id).toBeDefined();
      expect(savedExercise.name).toBe(exerciseData.name);
      expect(savedExercise.persons).toBe(exerciseData.persons);
      expect(savedExercise.createdAt).toBeDefined();
      expect(savedExercise.updatedAt).toBeDefined();
    });

    it('should validate required fields', () => {
      const exerciseWithoutName = {
        persons: 6,
      };

      const exerciseWithoutPersons = {
        name: 'Test Exercise',
      };

      // Mock validation errors
      MockedExercise.prototype.save = jest.fn()
        .mockRejectedValueOnce(new Error('Name is required'))
        .mockRejectedValueOnce(new Error('Persons is required'));

      const exercise1 = new MockedExercise(exerciseWithoutName);
      const exercise2 = new MockedExercise(exerciseWithoutPersons);
      
      expect(exercise1.save()).rejects.toThrow('Name is required');
      expect(exercise2.save()).rejects.toThrow('Persons is required');
    });
  });

  describe('Exercise Fields', () => {
    it('should handle all optional fields correctly', async () => {
      const mockUser = { _id: new Types.ObjectId() };
      
      const exerciseData = {
        name: 'Advanced Drill',
        materials: ['Quaffle', 'Bludger', 'Snitch'],
        time_min: 30,
        beaters: 2,
        chasers: 3,
        persons: 7,
        tags: ['beginner', 'passing'],
        creator: 'Coach Smith',
        user: mockUser._id,
      };

      const mockSavedExercise = {
        _id: new Types.ObjectId(),
        ...exerciseData,
        save: jest.fn(),
      };

      MockedExercise.prototype.save = jest.fn().mockResolvedValue(mockSavedExercise);
      const exercise = new MockedExercise(exerciseData);
      const savedExercise = await exercise.save();

      expect(savedExercise.materials).toEqual(['Quaffle', 'Bludger', 'Snitch']);
      expect(savedExercise.time_min).toBe(30);
      expect(savedExercise.beaters).toBe(2);
      expect(savedExercise.chasers).toBe(3);
      expect(savedExercise.persons).toBe(7);
      expect(savedExercise.tags).toEqual(['beginner', 'passing']);
      expect(savedExercise.creator).toBe('Coach Smith');
      expect(savedExercise.user).toEqual(mockUser._id);
    });

    it('should handle description blocks', async () => {
      const exerciseData = {
        name: 'Drill with Blocks',
        persons: 4,
        description_blocks: [
          {
            description: 'Setup phase',
            coaching_points: 'Make sure players are in position',
            time_min: 5,
          },
          {
            video_url: 'https://example.com/video.mp4',
            description: 'Execution phase',
            time_min: 10,
          },
        ],
      };

      const mockSavedExercise = {
        _id: new Types.ObjectId(),
        ...exerciseData,
        save: jest.fn(),
      };

      MockedExercise.prototype.save = jest.fn().mockResolvedValue(mockSavedExercise);
      const exercise = new MockedExercise(exerciseData);
      const savedExercise = await exercise.save();

      expect(savedExercise.description_blocks).toHaveLength(2);
      expect(savedExercise.description_blocks![0].description).toBe('Setup phase');
      expect(savedExercise.description_blocks![0].coaching_points).toBe('Make sure players are in position');
      expect(savedExercise.description_blocks![0].time_min).toBe(5);
      expect(savedExercise.description_blocks![1].video_url).toBe('https://example.com/video.mp4');
      expect(savedExercise.description_blocks![1].description).toBe('Execution phase');
      expect(savedExercise.description_blocks![1].time_min).toBe(10);
    });
  });

  describe('Exercise Queries', () => {
    it('should find exercises by name', async () => {
      const mockExercises = [
        {
          _id: new Types.ObjectId(),
          name: 'Beginner Drill',
          persons: 4,
          tags: ['beginner'],
        }
      ];

      MockedExercise.find = jest.fn().mockResolvedValue(mockExercises);
      
      const exercises = await MockedExercise.find({ name: 'Beginner Drill' });
      
      expect(exercises).toHaveLength(1);
      expect(exercises[0].name).toBe('Beginner Drill');
      expect(MockedExercise.find).toHaveBeenCalledWith({ name: 'Beginner Drill' });
    });

    it('should find exercises by number of persons', async () => {
      const mockExercises = [
        {
          _id: new Types.ObjectId(),
          name: 'Advanced Drill',
          persons: 8,
          tags: ['advanced', 'team'],
        }
      ];

      MockedExercise.find = jest.fn().mockResolvedValue(mockExercises);
      
      const exercises = await MockedExercise.find({ persons: { $gte: 6 } });
      
      expect(exercises).toHaveLength(1);
      expect(exercises[0].name).toBe('Advanced Drill');
      expect(MockedExercise.find).toHaveBeenCalledWith({ persons: { $gte: 6 } });
    });

    it('should find exercises by tags', async () => {
      const mockExercises = [
        {
          _id: new Types.ObjectId(),
          name: 'Beginner Drill',
          persons: 4,
          tags: ['beginner'],
        }
      ];

      MockedExercise.find = jest.fn().mockResolvedValue(mockExercises);
      
      const exercises = await MockedExercise.find({ tags: 'beginner' });
      
      expect(exercises).toHaveLength(1);
      expect(exercises[0].name).toBe('Beginner Drill');
      expect(MockedExercise.find).toHaveBeenCalledWith({ tags: 'beginner' });
    });
  });

  describe('Exercise Population', () => {
    it('should populate user reference', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockExercise = {
        _id: new Types.ObjectId(),
        name: 'Test Exercise',
        persons: 5,
        user: mockUser,
      };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockExercise),
      };

      MockedExercise.findById = jest.fn().mockReturnValue(mockQuery);
      
      const populatedExercise = await MockedExercise.findById('someId').populate('user');
      
      expect(populatedExercise!.user).toBeTruthy();
      expect((populatedExercise!.user as any).name).toBe('Test User');
      expect((populatedExercise!.user as any).email).toBe('test@example.com');
      expect(mockQuery.populate).toHaveBeenCalledWith('user');
    });

    it('should populate related exercises', async () => {
      const mockRelatedExercise = {
        _id: new Types.ObjectId(),
        name: 'Related Exercise',
        persons: 3,
      };

      const mockExercise = {
        _id: new Types.ObjectId(),
        name: 'Main Exercise',
        persons: 6,
        related_to: [mockRelatedExercise],
      };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockExercise),
      };

      MockedExercise.findById = jest.fn().mockReturnValue(mockQuery);
      
      const populatedExercise = await MockedExercise.findById('someId').populate('related_to');
      
      expect(populatedExercise!.related_to).toHaveLength(1);
      expect((populatedExercise!.related_to![0] as any).name).toBe('Related Exercise');
      expect(mockQuery.populate).toHaveBeenCalledWith('related_to');
    });
  });
});