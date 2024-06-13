export declare class Swapchain {
    readonly colorTexture: Texture;
    readonly width: number;
    readonly height: number

    acquire(semaphore: Semaphore): void;
}