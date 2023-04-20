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

const vec3_a = vec3.create();
const vec3_b = vec3.create();

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

        const polygons: Polygon[] = [];

        const vertexes: Vertex[] = [
            { pos: vec2.create(pos_l, pos_t), uv: vec2.create(uv_l, uv_t) },
            { pos: vec2.create(pos_l, pos_b), uv: vec2.create(uv_l, uv_b) },
            { pos: vec2.create(pos_r, pos_b), uv: vec2.create(uv_r, uv_b) },
            { pos: vec2.create(pos_r, pos_t), uv: vec2.create(uv_r, uv_t) },
        ];
        polygons.push({ vertexes, pos: vec2.ZERO });

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