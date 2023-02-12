import Fence from "../../../main/gfx/Fence.js";
import Queue from "../../../main/gfx/Queue.js";
import Semaphore from "../../../main/gfx/Semaphore.js";
import { SubmitInfo } from "../../../main/gfx/SubmitInfo.js";

export default class WebQueue implements Queue {
    submit(info: SubmitInfo, fence: Fence): void { }
    present(waitSemaphore: Semaphore): void { }
    waitFence(fence: Fence): void { }
}