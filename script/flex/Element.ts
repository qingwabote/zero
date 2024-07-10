import { EventEmitter, SmartRef } from "bastard";
import { AABB2D, Component, Input, Node, Vec2, aabb2d, vec2, vec3 } from "engine";
import { LayoutSystem } from "./LayoutSystem.js";
import * as yoga from "./yoga/index.js";

const vec3_a = vec3.create();

interface Touch {
    world: Readonly<Vec2>;
    local: Readonly<Vec2>;
}

interface TouchEvent {
    readonly touch: Touch;
}

interface GestureEvent extends TouchEvent {
    readonly touch: Touch;
    readonly delta: number;
}

interface EventToListener {
    [Input.TouchEvents.START]: (event: TouchEvent) => void;
    [Input.TouchEvents.MOVE]: (event: TouchEvent) => void;
    [Input.TouchEvents.END]: () => void;
    [Input.GestureEvents.PINCH]: (event: GestureEvent) => void;
    [Input.GestureEvents.ROTATE]: (event: GestureEvent) => void;
}

function yg_node_free(node: yoga.Node) { node.free(); }

export abstract class Element<T extends EventToListener = EventToListener> extends Component {
    private _emitter: EventEmitter<T> | undefined = undefined;
    public get emitter() {
        return this._emitter ?? (this._emitter = new EventEmitter.Impl);
    }

    readonly yg_node = new SmartRef(yoga.impl.Node.create(), yg_node_free);

    protected _bounds = aabb2d.create();
    public get bounds(): Readonly<AABB2D> {
        return this._bounds;
    }

    public get positionType(): yoga.PositionType {
        return this.yg_node.deref().getPositionType();
    }
    public set positionType(value: yoga.PositionType) {
        this.yg_node.deref().setPositionType(value);
    }

    constructor(node: Node) {
        super(node);
        const dirtiedFunc = () => { LayoutSystem.instance.markDirty(this); };
        this.yg_node.deref().setDirtiedFunc(dirtiedFunc);
        dirtiedFunc();
    }

    setWidth(value: number | 'auto' | `${number}%` | undefined) {
        this.yg_node.deref().setWidth(value);
    }

    setHeight(value: number | 'auto' | `${number}%` | undefined) {
        this.yg_node.deref().setHeight(value);
    }

    setPosition(edge: yoga.Edge, value: number | `${number}%` | undefined) {
        this.yg_node.deref().setPosition(edge, value);
    }

    setPadding(edge: yoga.Edge, value: number | `${number}%` | undefined) {
        this.yg_node.deref().setPadding(edge, value);
    }

    setGap(gutter: yoga.Gutter, value: number | undefined) {
        this.yg_node.deref().setGap(gutter, value);
    }

    layout_update() {
        const layout = this.yg_node.deref().getComputedLayout();
        this.node.position = vec2.set(vec3_a, layout.left, -layout.top);
        vec2.set(this._bounds.halfExtent, layout.width / 2, layout.height / 2);
        vec2.set(this._bounds.center, layout.width / 2, -layout.height / 2);
    }
}

export declare namespace Element {
    export { Touch, TouchEvent, GestureEvent, EventToListener }
}