import { Node, Primitive, TouchEventName, Vec2, Vec4, mat4, vec2, vec3, vec4 } from "engine";
import { Align, ElementContainer, ElementEventToListener, Justify, Renderer, Touch } from "flex";
import { Texture } from "gfx";
import { Polygon, Vertex } from "./Polygon.js";
import PolygonsRenderer from "./PolygonsRenderer.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();

const vec3_a = vec3.create();
const vec3_b = vec3.create();

const mat4_a = mat4.create();

// https://www.cnblogs.com/xpvincent/p/5208994.html
function intersect_line_line(out: Vec2, a: Readonly<Vec2>, b: Readonly<Vec2>, c: Readonly<Vec2>, d: Readonly<Vec2>): boolean {
    // 三角形abc 面积的2倍  
    var area_abc = (a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0]);

    // 三角形abd 面积的2倍  
    var area_abd = (a[0] - d[0]) * (b[1] - d[1]) - (a[1] - d[1]) * (b[0] - d[0]);

    // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);  
    if (area_abc * area_abd >= 0) {
        return false;
    }

    // 三角形cda 面积的2倍  
    var area_cda = (c[0] - a[0]) * (d[1] - a[1]) - (c[1] - a[1]) * (d[0] - a[0]);
    // 三角形cdb 面积的2倍  
    // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.  
    var area_cdb = area_cda + area_abc - area_abd;
    if (area_cda * area_cdb >= 0) {
        return false;
    }

    //计算交点坐标  
    var t = area_cda / (area_abd - area_abc);
    var dx = t * (b[0] - a[0]),
        dy = t * (b[1] - a[1]);
    vec2.set(out, a[0] + dx, a[1] + dy);
    return true
}

interface Intersection {
    i: number;
    p: Vec2;
}

function intersect_line_polygon(a: Readonly<Vec2>, b: Readonly<Vec2>, polygon: Polygon) {
    const intersections: Intersection[] = []
    for (let i = 0; i < polygon.vertexes.length; i++) {
        vec2.subtract(vec2_a, a, polygon.translation)
        vec2.subtract(vec2_b, b, polygon.translation)
        const res = vec2.create();
        if (intersect_line_line(res, vec2_a, vec2_b, polygon.vertexes[i].pos, polygon.vertexes[i + 1 == polygon.vertexes.length ? 0 : i + 1].pos)) {
            intersections.push({ i, p: res })
        }
    }
    return intersections;
}

function cut(polygon: Polygon, intersections: Intersection[]): Polygon {
    function nextIndex(index: number) {
        return index + 1 == polygon.vertexes.length ? 0 : index + 1;
    }
    function delta(head: number, tail: number) {
        if (head > tail) {
            return polygon.vertexes.length - head + tail;
        } else {
            return tail - head;
        }
    }
    const vertexes: Vertex[] = [];
    let index = intersections[0].i;
    let next = nextIndex(index);
    let point = intersections[0].p;
    let t = vec2.distance(polygon.vertexes[index].pos, point) / vec2.distance(polygon.vertexes[index].pos, polygon.vertexes[next].pos);
    vertexes.push({
        pos: point,
        uv: vec2.lerp(vec2.create(), polygon.vertexes[index].uv, polygon.vertexes[next].uv, t)
    });
    const vertexPosMin = vec2.create(...point);
    const vertexPosMax = vec2.create(...point);
    index = nextIndex(index);

    const count = delta(intersections[0].i, intersections[1].i);
    for (let i = 0; i < count; i++) {
        vertexes.push(polygon.vertexes[index]);
        vec2.min(vertexPosMin, vertexPosMin, polygon.vertexes[index].pos)
        vec2.max(vertexPosMax, vertexPosMax, polygon.vertexes[index].pos)
        index = nextIndex(index);
    }

    index = intersections[1].i;
    next = nextIndex(index);
    point = intersections[1].p;
    t = vec2.distance(polygon.vertexes[index].pos, point) / vec2.distance(polygon.vertexes[index].pos, polygon.vertexes[next].pos);
    vertexes.push({
        pos: point,
        uv: vec2.lerp(vec2.create(), polygon.vertexes[index].uv, polygon.vertexes[next].uv, t)
    });
    vec2.min(vertexPosMin, vertexPosMin, point);
    vec2.max(vertexPosMax, vertexPosMax, point);

    const from = vec2.create();
    vec2.add(from, polygon.vertexPosMin, polygon.vertexPosMax);
    vec2.scale(from, from, 0.5);

    const to = vec2.create();
    vec2.add(to, vertexPosMin, vertexPosMax);
    vec2.scale(to, to, 0.5);

    const d = vec2.create();
    vec2.subtract(d, to, from);
    vec2.scale(d, d, 0.2);

    const translation = vec2.create();
    vec2.add(translation, polygon.translation, d)

    return { vertexes, vertexPosMin, vertexPosMax, translation };
}

export enum CuttingBoardEventType {
    POLYGONS_CHANGED = "POLYGONS_CHANGED",
}

export interface CuttingBoardEventToListener extends ElementEventToListener {
    [CuttingBoardEventType.POLYGONS_CHANGED]: () => void;
}

export default class CuttingBoard extends ElementContainer<CuttingBoardEventToListener> {

    texture!: Texture;

    private _polygons: readonly Polygon[] = [];
    public get polygons(): readonly Polygon[] {
        return this._polygons;
    }

    private _polygonsRenderer!: PolygonsRenderer;

    private _primitive!: Primitive;

    start(): void {
        this.justifyContent = Justify.Center;
        this.alignItems = Align.Center;

        const node = new Node;
        this._polygonsRenderer = node.addComponent(PolygonsRenderer);
        this.addElement(this._polygonsRenderer);

        const primitive = Renderer.create(Primitive);
        // primitive.positionType = PositionType.Absolute
        // primitive.setWidth('100%');
        // primitive.setHeight('100%');
        this.addElement(primitive);
        this._primitive = primitive.impl;

        let touch: Touch;
        this.emitter.on(TouchEventName.START, event => {
            touch = event.touch;
        });
        this.emitter.on(TouchEventName.MOVE, event => {
            mat4.invert(mat4_a, primitive.node.world_matrix);
            const from = vec2.transformMat4(vec2.create(), touch.world, mat4_a);
            const to = vec2.transformMat4(vec2.create(), event.touch.world, mat4_a);
            this.drawLine(from, to);
        });
        this.emitter.on(TouchEventName.END, event => {
            mat4.invert(mat4_a, this._polygonsRenderer.node.world_matrix);
            const a = vec2.transformMat4(vec2.create(), touch.world, mat4_a);
            const b = vec2.transformMat4(vec2.create(), event.touch.world, mat4_a);

            const out: Polygon[] = [];
            let cutted = false;
            for (const polygon of this._polygons) {
                const result = intersect_line_polygon(a, b, polygon);
                if (result.length == 2) {
                    out.push(cut(polygon, result))
                    out.push(cut(polygon, result.reverse()))
                    cutted = true;
                } else {
                    out.push(polygon);
                }
            }
            if (cutted) {
                this._polygonsRenderer.polygons = out;
                this._polygons = out;

                this.emitter.emit(CuttingBoardEventType.POLYGONS_CHANGED);
            }
        });

        this.reset();
    }

    reset() {
        const { width, height } = this.texture.info;
        const [halfExtentX, halfExtentY] = [width / 2, height / 2];

        const pos_l = -halfExtentX;
        const pos_r = halfExtentX;
        const pos_t = halfExtentY;
        const pos_b = -halfExtentY;

        const uv_l = 0;
        const uv_r = 1;
        const uv_t = 0;
        const uv_b = 1;

        const polygons: Polygon[] = [];
        const vertexes: Vertex[] = [
            { pos: vec2.create(pos_l, pos_t), uv: vec2.create(uv_l, uv_t) },
            { pos: vec2.create(pos_l, pos_b), uv: vec2.create(uv_l, uv_b) },
            { pos: vec2.create(pos_r, pos_b), uv: vec2.create(uv_r, uv_b) },
            { pos: vec2.create(pos_r, pos_t), uv: vec2.create(uv_r, uv_t) },
        ];
        polygons.push({ vertexes, vertexPosMin: vertexes[1].pos, vertexPosMax: vertexes[3].pos, translation: vec2.ZERO });

        this._polygonsRenderer.texture = this.texture;
        this._polygonsRenderer.polygons = polygons;

        this._polygons = polygons;

        this.emitter.emit(CuttingBoardEventType.POLYGONS_CHANGED);
    }

    private drawLine(from: Readonly<Vec2>, to: Readonly<Vec2>, color: Readonly<Vec4> = vec4.ONE) {
        vec3.set(vec3_a, from[0], from[1], 0);
        vec3.set(vec3_b, to[0], to[1], 0);
        this._primitive.clear();
        this._primitive.drawLine(vec3_a, vec3_b, color);
    }
}