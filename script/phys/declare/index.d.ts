export declare async function load(): Promise<void>;

export declare class Vec3 {
    impl: any;
    get x(): number;
    get y(): number;
    get z(): number;
    set(x: number, y: number, z: number): void;
}

export class Quat {
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    set(x: number, y: number, z: number, w: number): void;
}

export declare class Transform {
    position: Vec3;
    rotation: Quat;
    identity(): void;
}

export declare class MotionState {
    set getWorldTransform(value: () => void);
    set setWorldTransform(value: () => void);
}

export declare abstract class Shape {
    scale: Vec3;
    constructor(impl: any);
}

export declare class BoxShape extends Shape {
    constructor();
}

export declare class RigidBody {
    readonly impl: any;
    mass: number;
    worldTransform: Transform;
    constructor(motionState: MotionState);
    addShape(shape: Shape);
    updateShapeTransform(shape: Shape, transform: Transform);
}

export declare abstract class RayResultCallback {
    hasHit(): boolean;
    constructor(impl: any);
}

export declare class ClosestRayResultCallback extends RayResultCallback {
    constructor();
}

export declare class DebugDrawer {
    set drawLine(value: (from: Vec3, to: Vec3, color: Vec3) => void);
}

export declare class World {
    readonly impl: any;
    debugDrawer?: DebugDrawer;
    addRigidBody(body: RigidBody): void;
    rayTest(from: Vec3, to: Vec3, resultCallback: RayResultCallback): void;
    update(dt: number): void;
}

export declare const impl: any;
