import { Node, Primitive, UIContainer, UIEventToListener, UIRenderer, UITouchEventType, Vec2, vec2, vec3 } from "engine";

const vec3_a = vec3.create()
const vec3_b = vec3.create()
const vec3_c = vec3.create()
const vec3_d = vec3.create()

export enum JoystickEventType {
    CHANGED = 'CHANGED'
}

interface EventToListener extends UIEventToListener {
    [JoystickEventType.CHANGED]: () => void;
}

export default class Joystick extends UIContainer<EventToListener> {
    private _point = vec2.create();
    get point(): Readonly<Vec2> {
        return this._point;
    }

    private _primitive: UIRenderer<Primitive>;

    public get size(): Readonly<Vec2> {
        return this._primitive.size;
    }
    public set size(value: Readonly<Vec2>) {
        this._primitive.size = value;
    }

    constructor(node: Node) {
        super(node);

        const primitive = UIRenderer.create(Primitive);
        this.draw(primitive, this._point)
        this.addElement(primitive);

        primitive.on(UITouchEventType.TOUCH_START, event => {
            const scale = primitive.impl.node.scale;
            const local = event.touch.local;
            vec2.set(
                this._point,
                Math.max(Math.min(local[0] / scale[0], 1), -1),
                Math.max(Math.min(local[1] / scale[1], 1), -1)
            )
            this.draw(primitive, this._point)
            this.emit(JoystickEventType.CHANGED);
        });
        primitive.on(UITouchEventType.TOUCH_MOVE, event => {
            const scale = primitive.impl.node.scale;
            const local = event.touch.local;
            vec2.set(
                this._point,
                Math.max(Math.min(local[0] / scale[0], 1), -1),
                Math.max(Math.min(local[1] / scale[1], 1), -1)
            )
            this.draw(primitive, this._point)
            this.emit(JoystickEventType.CHANGED);
        });
        primitive.on(UITouchEventType.TOUCH_END, event => {
            vec2.set(this._point, 0, 0);
            this.draw(primitive, this._point)
            this.emit(JoystickEventType.CHANGED);
        });

        this._primitive = primitive;
    }

    draw(primitive: UIRenderer<Primitive>, point: Vec2): void {
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