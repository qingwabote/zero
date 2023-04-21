import Primitive from "../../../../script/main/components/Primitive.js";
import BoundedRenderer from "../../../../script/main/components/internal/BoundedRenderer.js";
import UIContainer from "../../../../script/main/components/ui/UIContainer.js";
import UIRenderer from "../../../../script/main/components/ui/UIRenderer.js";
import { UITouchEventType } from "../../../../script/main/components/ui/internal/UIElement.js";
import Node from "../../../../script/main/core/Node.js";
import Texture from "../../../../script/main/core/gfx/Texture.js";
import vec2, { Vec2 } from "../../../../script/main/core/math/vec2.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import vec4, { Vec4 } from "../../../../script/main/core/math/vec4.js";
import { Polygon, Vertex } from "./Polygon.js";
import PolygonsRenderer from "./PolygonsRenderer.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();

const vec3_a = vec3.create();
const vec3_b = vec3.create();

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

const PIXELS_PER_UNIT = BoundedRenderer.PIXELS_PER_UNIT;

export default class CuttingBoard extends UIContainer {

    texture!: Texture;

    private _primitive!: Primitive;

    start(): void {
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

        let polygons: Polygon[] = [];
        const vertexes: Vertex[] = [
            { pos: vec2.create(pos_l, pos_t), uv: vec2.create(uv_l, uv_t) },
            { pos: vec2.create(pos_l, pos_b), uv: vec2.create(uv_l, uv_b) },
            { pos: vec2.create(pos_r, pos_b), uv: vec2.create(uv_r, uv_b) },
            { pos: vec2.create(pos_r, pos_t), uv: vec2.create(uv_r, uv_t) },
        ];
        polygons.push({ vertexes, vertexPosMin: vertexes[1].pos, vertexPosMax: vertexes[3].pos, translation: vec2.ZERO });

        const primitive = UIRenderer.create(Primitive);
        this.addElement(primitive);
        this._primitive = primitive.impl;

        // set size
        const halfSize = vec2.create(this.size[0] / 2, this.size[1] / 2);
        this.drawLine(vec2.create(-halfSize[0], -halfSize[1]), vec2.create(halfSize[0], halfSize[1]), vec4.ZERO);

        let point: Readonly<Vec2>;
        this.on(UITouchEventType.TOUCH_START, event => {
            point = event.touch.local;
        });
        this.on(UITouchEventType.TOUCH_MOVE, event => {
            const local = event.touch.local;
            this.drawLine(point, local);
        });
        this.on(UITouchEventType.TOUCH_END, event => {
            const local = event.touch.local;
            const out: Polygon[] = [];
            let cutted = false;
            for (const polygon of polygons) {
                const result = intersect_line_polygon(point, local, polygon);
                if (result.length == 2) {
                    out.push(cut(polygon, result))
                    out.push(cut(polygon, result.reverse()))
                    cutted = true;
                } else {
                    out.push(polygon);
                }
            }
            if (cutted) {
                polygonsRenderer.polygons = out;
                polygons = out;
            }
        });

        const node = new Node;
        const polygonsRenderer = node.addComponent(PolygonsRenderer);
        polygonsRenderer.polygons = polygons;
        polygonsRenderer.texture = this.texture;
        this.addElement(polygonsRenderer);
    }

    private drawLine(from: Readonly<Vec2>, to: Readonly<Vec2>, color: Readonly<Vec4> = vec4.ONE) {
        vec3.set(vec3_a, from[0] / PIXELS_PER_UNIT, from[1] / PIXELS_PER_UNIT, 0);
        vec3.set(vec3_b, to[0] / PIXELS_PER_UNIT, to[1] / PIXELS_PER_UNIT, 0);
        this._primitive.clear();
        this._primitive.drawLine(vec3_a, vec3_b, color);
    }
}