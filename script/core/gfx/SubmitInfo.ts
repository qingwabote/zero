import CommandBuffer from "./CommandBuffer.js";
import { PipelineStageFlags } from "./Pipeline.js";
import Semaphore from "./Semaphore.js";

export interface SubmitInfo {
    commandBuffer: CommandBuffer;
    waitDstStageMask?: PipelineStageFlags;
    waitSemaphore?: Semaphore;
    signalSemaphore?: Semaphore;
}