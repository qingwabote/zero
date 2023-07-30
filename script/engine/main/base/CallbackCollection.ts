export interface CallbackCollection {
    set(callback: Function): void;
    delete(callback: Function): void;
    call(...args: any[]): void;
    clear(): void;
}