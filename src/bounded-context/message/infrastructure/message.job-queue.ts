import { Job } from "bull";
import { JobQueue } from "../../../infrastructure/job-queue/bull.job-queue.js";
import { PrismaService } from "../../../infrastructure/prisma/prisma.infra.js";
import { Service } from "typedi";
import { ChatgptArtifictialIntelligenceProvider } from "../providers/chatgpt/chatgpt.artifictial-intelligence-provider.js";
import { PromptNotFound } from "../../prompt/errors/prompt-not-found.error.js";
import { PromptEntity } from "../../prompt/prompt.entity.js";
import signale from "signale";
import { injectable } from "tsyringe";

@injectable()
export class GenerationJobQueue extends JobQueue<{ promptId: any }> {
  constructor(
    private prismaService: PrismaService,
    private chatgpt: ChatgptArtifictialIntelligenceProvider
  ) {
    super("generation", process.env.REDIS_URL!);
  }
  protected async handleJob(job: Job<{ promptId: any }>): Promise<void> {
    signale.info(
      `GenerationQueue: Generating for prompt: ${job.data.promptId}`
    );

    const prompt = await this.prismaService.prompt.findUnique({
      where: { id: job.data.promptId },
    });

    if (!prompt) {
      throw new PromptNotFound();
    }

    const promptx = PromptEntity.fromSnapshot(prompt);

    await this.chatgpt.prompt(promptx, {
      conversationId: prompt.conversationId || undefined,
      parentMessageId: prompt.parentMessageId || undefined,
    });
  }
}
