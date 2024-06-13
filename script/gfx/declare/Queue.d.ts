import { Fence } from "./Fence.js";
import { Semaphore } from "./Semaphore.js";
import { SubmitInfo } from "./info.js";

export declare class Queue {
    private constructor(...args);
    submit(info: SubmitInfo, fence: Fence): void;
    present(waitSemaphore: Semaphore): void;
}