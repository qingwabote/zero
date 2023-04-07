export default interface System {
    load(): Promise<void>;
    start(): void;
    update(): void;
}