import Fence from "../../../main/core/gfx/Fence.js";
import Queue from "../../../main/core/gfx/Queue.js";
import Semaphore from "../../../main/core/gfx/Semaphore.js";
import { SubmitInfo } from "../../../main/core/gfx/SubmitInfo.js";

export default class WebQueue implements Queue {
    submit(info: SubmitInfo, fence: Fence): void { }
    present(waitSemaphore: Semaphore): void { }
    waitFence(fence: Fence): void { }
}