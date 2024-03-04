import { Node, Primitive, TouchEventName, Vec2, vec2, vec3 } from "engine";
import { ElementContainer, ElementEventToListener, Renderer } from "flex";

const vec3_a = vec3.create()
const vec3_b = vec3.create()
const vec3_c = vec3.create()
const vec3_d = vec3.create()

export enum JoystickEventType {
    CHANGED = 'CHANGED'
}

interface JoystickEventToListener extends ElementEventToListener {
    [JoystickEventType.CHANGED]: () => void;
}

export default class Joystick extends ElementContainer<JoystickEventToListener> {
    private _point = vec2.create();
    get point(): Readonly<Vec2> {
        return this._point;
    }

    private _primitive: Renderer<Primitive>;

    constructor(node: Node) {
        super(node);

        const primitive = Renderer.create(Primitive);
        primitive.setWidth('100%');
        primitive.setHeight('100%');
        primitive.impl.color = [0, 1, 0, 1];
        this.draw(primitive, this._point)
        this.addElement(primitive);

        primitive.emitter.on(TouchEventName.START, event => {
            const local = event.touch.local;
            vec2.set(
                this._point,
                Math.max(Math.min(local[0], 1), -1),
                Math.max(Math.min(local[1], 1), -1)
            )
            this.draw(primitive, this._point)
            this.emitter.emit(JoystickEventType.CHANGED);
        });
        primitive.emitter.on(TouchEventName.MOVE, event => {
            const local = event.touch.local;
            vec2.set(
                this._point,
                Math.max(Math.min(local[0], 1), -1),
                Math.max(Math.min(local[1], 1), -1)
            )
            this.draw(primitive, this._point)
            this.emitter.emit(JoystickEventType.CHANGED);
        });
        primitive.emitter.on(TouchEventName.END, event => {
            vec2.set(this._point, 0, 0);
            this.draw(primitive, this._point)
            this.emitter.emit(JoystickEventType.CHANGED);
        });

        this._primitive = primitive;
    }

    draw(primitive: Renderer<Primitive>, point: Vec2): void {
        const impl = primitive.impl;
        impl.clear();

        const halfPoint = 0.2;

        vec3.set(vec3_a, -1 - halfPoint, 1 + halfPoint, 0);
        vec3.set(vec3_b, -1 - halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_c, 1 + halfPoint, -1 - halfPoint, 0);
        vec3.set(vec3_d, 1 + halfPoint, 1 + halfPoint, 0);

        impl.drawLine(vec3_a, vec3_b)
        impl.drawLine(vec3_b, vec3_c)
        impl.drawLine(vec3_c, vec3_d)
        impl.drawLine(vec3_d, vec3_a)

        vec3.set(vec3_a, point[0] - halfPoint, point[1] + halfPoint, 0);
        vec3.set(vec3_b, point[0] - halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_c, point[0] + halfPoint, point[1] - halfPoint, 0);
        vec3.set(vec3_d, point[0] + halfPoint, point[1] + halfPoint, 0);

        impl.drawLine(vec3_a, vec3_b)
        impl.drawLine(vec3_b, vec3_c)
        impl.drawLine(vec3_c, vec3_d)
        impl.drawLine(vec3_d, vec3_a)
    }
}