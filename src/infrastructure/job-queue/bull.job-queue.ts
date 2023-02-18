import BQueue, { Job, JobOptions, Queue } from "bull";
import { injectable } from "tsyringe";

export abstract class JobQueue<T> {
  private readonly queue: Queue;

  protected constructor(name: string, url: string) {
    this.queue = new BQueue(name, url);

    this.queue.process(this.processJob.bind(this));
  }

  protected abstract handleJob(job: Job<T>): Promise<void>;

  public async addJob(data: T, options?: JobOptions): Promise<Job<T>> {
    return this.queue.add(data, options);
  }

  private async processJob(job: Job<T>): Promise<void> {
    try {
      await this.handleJob(job);
      job.moveToCompleted();
    } catch (error) {
      console.error(error);
      job.retry();
    }
  }
}
