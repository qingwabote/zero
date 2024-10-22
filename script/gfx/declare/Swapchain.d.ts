import { Texture } from "./Texture.js";

export declare class Swapchain {
    readonly color: Texture;

    acquire(semaphore: Semaphore): void;
}