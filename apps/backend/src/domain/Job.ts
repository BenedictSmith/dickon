/**
 * Job status enum
 */
export type JobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

/**
 * Job properties for construction
 */
export interface JobProps {
  id: string;
  type: string;
  status: JobStatus;
  progress?: number;
  createdAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: unknown;
}

/**
 * Domain entity representing a background job
 * Tracks status, progress, and lifecycle of discovery jobs
 */
export class Job {
  public readonly id: string;
  public readonly type: string;
  public readonly status: JobStatus;
  public readonly progress: number;
  public readonly createdAt: Date;
  public readonly startedAt?: Date;
  public readonly completedAt?: Date;
  public readonly error?: string;
  public readonly result?: unknown;

  constructor(props: JobProps) {
    // Validation
    if (!props.id || props.id.trim() === '') {
      throw new Error('Job id cannot be empty');
    }
    if (!props.type || props.type.trim() === '') {
      throw new Error('Job type cannot be empty');
    }

    const progress = props.progress ?? 0;
    if (progress < 0 || progress > 100) {
      throw new Error('Job progress must be between 0 and 100');
    }

    this.id = props.id;
    this.type = props.type;
    this.status = props.status;
    this.progress = progress;
    this.createdAt = props.createdAt || new Date();
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.error = props.error;
    this.result = props.result;
  }

  /**
   * Check if job is pending
   */
  isPending(): boolean {
    return this.status === 'PENDING';
  }

  /**
   * Check if job is currently running
   */
  isRunning(): boolean {
    return this.status === 'RUNNING';
  }

  /**
   * Check if job completed successfully
   */
  isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }

  /**
   * Check if job failed
   */
  isFailed(): boolean {
    return this.status === 'FAILED';
  }

  /**
   * Check if job was cancelled
   */
  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  /**
   * Check if job is in a terminal state (completed, failed, or cancelled)
   */
  isDone(): boolean {
    return this.isCompleted() || this.isFailed() || this.isCancelled();
  }

  /**
   * Serialize job to JSON
   */
  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      id: this.id,
      type: this.type,
      status: this.status,
      progress: this.progress,
      createdAt: this.createdAt.toISOString(),
    };

    if (this.startedAt) {
      json.startedAt = this.startedAt.toISOString();
    }
    if (this.completedAt) {
      json.completedAt = this.completedAt.toISOString();
    }
    if (this.error) {
      json.error = this.error;
    }
    if (this.result !== undefined) {
      json.result = this.result;
    }

    return json;
  }

  /**
   * Check equality based on ID
   */
  equals(other: Job): boolean {
    return this.id === other.id;
  }
}
