
import { Fence, Queue, Semaphore, SubmitInfo } from "gfx-main";

export default class WebQueue implements Queue {
    submit(info: SubmitInfo, fence: Fence): void { }
    present(waitSemaphore: Semaphore): void { }
    waitFence(fence: Fence): void { }
}