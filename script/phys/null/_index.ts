export async function load(): Promise<void> { return Promise.resolve() }

export class Vec3 {
    impl: any;
    get x(): number { return 0 };
    get y(): number { return 0 };
    get z(): number { return 0 };
    set(x: number, y: number, z: number): void { };
}

export class Quat {
    get x(): number { return 0 };
    get y(): number { return 0 };
    get z(): number { return 0 };
    get w(): number { return 0 };
    set(x: number, y: number, z: number, w: number): void { };
}

export class Transform {
    position: Vec3 = new Vec3;
    rotation: Quat = new Quat;
    identity(): void { };
}

export class MotionState {
    set getWorldTransform(value: () => void) { };
    set setWorldTransform(value: () => void) { };
}

export abstract class Shape {
    scale: Vec3 = new Vec3;
    constructor(impl: any) { };
}

export class BoxShape extends Shape {
    constructor() {
        super(null);
    };
}

export class RigidBody {
    readonly impl: any;
    mass: number = 0;
    worldTransform: Transform = new Transform;
    constructor(motionState: MotionState) { };
    addShape(shape: Shape) { };
    updateShapeTransform(shape: Shape, transform: Transform) { };
}

export abstract class RayResultCallback {
    hasHit(): boolean { return false };
    constructor(impl: any) { };
}

export class ClosestRayResultCallback extends RayResultCallback {
    constructor() {
        super(null);
    };
}

export class DebugDrawer {
    set drawLine(value: (from: Vec3, to: Vec3, color: Vec3) => void) { };
}

export class World {
    readonly impl: any;
    debugDrawer?: DebugDrawer;
    addRigidBody(body: RigidBody): void { };
    rayTest(from: Vec3, to: Vec3, resultCallback: RayResultCallback): void { };
    update(dt: number): void { };
}

export const impl: any = {};
