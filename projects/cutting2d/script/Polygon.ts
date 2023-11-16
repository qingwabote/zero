import { Vec2 } from "engine";

export interface Vertex {
    readonly pos: Readonly<Vec2>;
    readonly uv: Readonly<Vec2>;
}

export interface Polygon {
    readonly vertexes: readonly Vertex[];
    readonly vertexPosMin: Readonly<Vec2>;
    readonly vertexPosMax: Readonly<Vec2>;
    readonly translation: Readonly<Vec2>
}