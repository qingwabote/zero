export default interface System {
    initialize(): Promise<void>;
    update(): void;
}