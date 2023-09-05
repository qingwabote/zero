export interface System {
    get ready(): boolean;
    update(dt: number): void;
}