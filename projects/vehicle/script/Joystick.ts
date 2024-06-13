import { GeometryRenderer, Input, Node, Vec2, Vec4, vec2, vec3 } from "engine";
import { Element, ElementContainer, Renderer } from "flex";

const vec3_a = vec3.create()
const vec3_b = vec3.create()
const vec3_c = vec3.create()
const vec3_d = vec3.create()

enum EventType {
    CHANGED = 'CHANGED'
}

interface EventToListener extends Element.EventToListener {
    [EventType.CHANGED]: () => void;
}

export class Joystick extends ElementContainer<EventToListener> {
    private _point = vec2.create();
    get point(): Readonly<Vec2> {
        return this._point;
    }

    constructor(node: Node) {
        super(node);

        const color: Vec4 = [0, 1, 0, 1]

        const primitive = Renderer.create(GeometryRenderer);
        primitive.setWidth('100%');
        primitive.setHeight('100%');
        this.draw(primitive, this._point, color)
        this.addElement(primitive);

        primitive.emitter.on(Input.TouchEvents.START, event => {
            const local = event.touch.local;
            vec2.set(
                this._point,
                Math.max(Math.min(local[0], 1), -1),
                Math.max(Math.min(local[1], 1), -1)
            )
            this.draw(primitive, this._point, color)
            this.emitter.emit(EventType.CHANGED);
        });
        primitive.emitter.on(Input.TouchEvents.MOVE, event => {
            const local = event.touch.local;
            vec2.set(
                this._point,
                Math.max(Math.min(local[0], 1), -1),
                Math.max(Math.min(local[1], 1), -1)
            )
            this.draw(primitive, this._point, color)
            this.emitter.emit(EventType.CHANGED);
        });
        primitive.emitter.on(Input.TouchEvents.END, () => {
            vec2.set(this._point, 0, 0);
            this.draw(primitive, this._point, color)
            this.emitter.emit(EventType.CHANGED);
        });
    }

    draw(primitive: Renderer<GeometryRenderer>, point: Vec2, color: Vec4): void {
        const impl = primitive.impl;
        impl.clear();

        const halfPoint = 0.2;

        vec3.set(vec3_a, -1 - halfPoint, 1 + halfPoint, 0);
        vec3.set(vec3_b, -1 - halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_c, 1 + halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_d, 1 + halfPoint, 1 + halfPoint, 0);

        impl.drawLine(vec3_a, vec3_b, color)
        impl.drawLine(vec3_b, vec3_c, color)
        impl.drawLine(vec3_c, vec3_d, color)
        impl.drawLine(vec3_d, vec3_a, color)

        vec3.set(vec3_a, point[0] - halfPoint, point[1] + halfPoint, 0);
        vec3.set(vec3_b, point[0] - halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_c, point[0] + halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_d, point[0] + halfPoint, point[1] + halfPoint, 0);

        impl.drawLine(vec3_a, vec3_b, color)
        impl.drawLine(vec3_b, vec3_c, color)
        impl.drawLine(vec3_c, vec3_d, color)
        impl.drawLine(vec3_d, vec3_a, color)
    }
}

Joystick.EventType = EventType;

export declare namespace Joystick {
    export { EventType }
}