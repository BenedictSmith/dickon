import { describe, it, expect } from '@jest/globals';
import { Job } from '../../../src/domain/Job';

describe('Job Domain Entity', () => {
  describe('constructor', () => {
    it('should create a job with required fields', () => {
      // Arrange & Act
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'pending',
      });

      // Assert
      expect(job.id).toBe('job-1');
      expect(job.type).toBe('discovery');
      expect(job.status).toBe('pending');
      expect(job.progress).toBe(0);
      expect(job.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error if id is empty', () => {
      expect(() => {
        new Job({
          id: '',
          type: 'discovery',
          status: 'pending',
        });
      }).toThrow('Job id cannot be empty');
    });

    it('should throw error if type is empty', () => {
      expect(() => {
        new Job({
          id: 'job-1',
          type: '',
          status: 'pending',
        });
      }).toThrow('Job type cannot be empty');
    });

    it('should initialize with default progress of 0', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'pending',
      });

      expect(job.progress).toBe(0);
    });

    it('should accept optional progress value', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'running',
        progress: 50,
      });

      expect(job.progress).toBe(50);
    });

    it('should accept optional timestamps', () => {
      const startedAt = new Date('2024-01-01');
      const completedAt = new Date('2024-01-02');

      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'completed',
        startedAt,
        completedAt,
      });

      expect(job.startedAt).toBe(startedAt);
      expect(job.completedAt).toBe(completedAt);
    });

    it('should accept optional error message', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'failed',
        error: 'Connection timeout',
      });

      expect(job.error).toBe('Connection timeout');
    });
  });

  describe('status transitions', () => {
    it('should start as pending', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'pending',
      });

      expect(job.isPending()).toBe(true);
      expect(job.isRunning()).toBe(false);
      expect(job.isCompleted()).toBe(false);
      expect(job.isFailed()).toBe(false);
    });

    it('should detect running status', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'running',
      });

      expect(job.isPending()).toBe(false);
      expect(job.isRunning()).toBe(true);
      expect(job.isCompleted()).toBe(false);
    });

    it('should detect completed status', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'completed',
      });

      expect(job.isCompleted()).toBe(true);
      expect(job.isRunning()).toBe(false);
      expect(job.isDone()).toBe(true);
    });

    it('should detect failed status', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'failed',
      });

      expect(job.isFailed()).toBe(true);
      expect(job.isDone()).toBe(true);
    });

    it('should detect cancelled status', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'cancelled',
      });

      expect(job.isCancelled()).toBe(true);
      expect(job.isDone()).toBe(true);
    });
  });

  describe('progress validation', () => {
    it('should throw error if progress is negative', () => {
      expect(() => {
        new Job({
          id: 'job-1',
          type: 'discovery',
          status: 'running',
          progress: -1,
        });
      }).toThrow('Job progress must be between 0 and 100');
    });

    it('should throw error if progress exceeds 100', () => {
      expect(() => {
        new Job({
          id: 'job-1',
          type: 'discovery',
          status: 'running',
          progress: 101,
        });
      }).toThrow('Job progress must be between 0 and 100');
    });

    it('should accept progress of 0', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'running',
        progress: 0,
      });

      expect(job.progress).toBe(0);
    });

    it('should accept progress of 100', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'running',
        progress: 100,
      });

      expect(job.progress).toBe(100);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'running',
        progress: 50,
      });

      const json = job.toJSON();

      expect(json).toHaveProperty('id', 'job-1');
      expect(json).toHaveProperty('type', 'discovery');
      expect(json).toHaveProperty('status', 'running');
      expect(json).toHaveProperty('progress', 50);
      expect(json).toHaveProperty('createdAt');
    });

    it('should include optional fields when present', () => {
      const startedAt = new Date('2024-01-01');
      const job = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'running',
        startedAt,
        error: 'Test error',
      });

      const json = job.toJSON();

      expect(json).toHaveProperty('startedAt');
      expect(json).toHaveProperty('error', 'Test error');
    });
  });

  describe('equality', () => {
    it('should consider jobs equal if IDs match', () => {
      const job1 = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'pending',
      });

      const job2 = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'running',
      });

      expect(job1.equals(job2)).toBe(true);
    });

    it('should consider jobs different if IDs differ', () => {
      const job1 = new Job({
        id: 'job-1',
        type: 'discovery',
        status: 'pending',
      });

      const job2 = new Job({
        id: 'job-2',
        type: 'discovery',
        status: 'pending',
      });

      expect(job1.equals(job2)).toBe(false);
    });
  });
});
