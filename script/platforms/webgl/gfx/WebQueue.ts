import Fence from "../../../core/gfx/Fence.js";
import Queue from "../../../core/gfx/Queue.js";
import Semaphore from "../../../core/gfx/Semaphore.js";
import { SubmitInfo } from "../../../core/gfx/SubmitInfo.js";

export default class WebQueue implements Queue {
    submit(info: SubmitInfo, fence: Fence): void { }
    present(waitSemaphore: Semaphore): void { }
    waitFence(fence: Fence): void { }
}