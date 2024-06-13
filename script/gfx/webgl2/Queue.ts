import { Fence } from "./Fence.js";
import { Semaphore } from "./Semaphore.js";
import { SubmitInfo } from "./info.js";

export class Queue {
    submit(info: SubmitInfo, fence: Fence): void { }
    present(waitSemaphore: Semaphore): void { }
    wait(fence: Fence): void { }
}