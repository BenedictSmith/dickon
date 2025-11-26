import { Job, JobStatus } from '../domain/Job';
import { DiscoveryService } from './DiscoveryService';
import { randomBytes } from 'crypto';

/**
 * Simple in-memory job manager
 * Tracks jobs and executes discovery in the background
 */
export class JobManager {
  private jobs: Map<string, Job> = new Map();
  private discoveryService: DiscoveryService;

  constructor(discoveryService: DiscoveryService) {
    this.discoveryService = discoveryService;
  }

  /**
   * Start a new discovery job
   */
  async startDiscovery(): Promise<Job> {
    const jobId = 'job-' + randomBytes(16).toString('hex');

    // Create pending job
    const job = new Job({
      id: jobId,
      type: 'discovery',
      status: 'pending',
    });

    this.jobs.set(jobId, job);

    // Start execution in background
    this.executeDiscovery(jobId).catch((error) => {
      console.error(`Discovery job ${jobId} failed:`, error);
    });

    return job;
  }

  /**
   * Execute discovery job in the background
   */
  private async executeDiscovery(jobId: string): Promise<void> {
    try {
      // Update to running
      this.updateJob(jobId, { status: 'running', startedAt: new Date(), progress: 0 });

      // Run discovery
      const count = await this.discoveryService.createSimilarityRelationships();

      // Update to completed
      this.updateJob(jobId, {
        status: 'completed',
        completedAt: new Date(),
        progress: 100,
        result: { relationshipsCreated: count },
      });
    } catch (error) {
      // Update to failed
      this.updateJob(jobId, {
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update a job with new properties
   */
  private updateJob(jobId: string, updates: Partial<JobProps>): void {
    const existing = this.jobs.get(jobId);
    if (!existing) return;

    const updated = new Job({
      ...existing,
      ...updates,
    });

    this.jobs.set(jobId, updated);
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Cancel a running job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.isDone()) {
      return false;
    }

    this.updateJob(jobId, {
      status: 'cancelled',
      completedAt: new Date(),
    });

    return true;
  }
}

// Helper type for updates
type JobProps = {
  id: string;
  type: string;
  status: JobStatus;
  progress?: number;
  createdAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: unknown;
};
