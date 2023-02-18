import { Job } from "./job.shared.js";

export abstract class JobQueue {
  abstract enqueue(job: Job<any>): Promise<void>;
  abstract dequeue(): Promise<Job<any> | null>;
}
