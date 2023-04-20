import { Vec2 } from "../../../../script/main/core/math/vec2.js";

export interface Vertex {
    readonly pos: Readonly<Vec2>;
    readonly uv: Readonly<Vec2>;
}

export interface Polygon {
    readonly vertexes: readonly Vertex[];
    readonly pos: Readonly<Vec2>
}