import { EventEmitter, EventEmitterImpl, SmartRef } from "bastard";
import { AABB2D, Component, Node, TouchEventName, Vec2, aabb2d, vec2, vec3 } from "engine";
import * as yoga from "./yoga/index.js";

const vec3_a = vec3.create();

export interface Touch {
    world: Readonly<Vec2>;
    local: Readonly<Vec2>;
}

export interface TouchEvent {
    readonly touch: Touch;
}

export interface GestureEvent extends TouchEvent {
    readonly touch: Touch;
    readonly delta: number;
}

export interface ElementEventToListener {
    [TouchEventName.START]: (event: TouchEvent) => void;
    [TouchEventName.MOVE]: (event: TouchEvent) => void;
    [TouchEventName.END]: (event: TouchEvent) => void;
    [TouchEventName.PINCH]: (event: GestureEvent) => void;
    [TouchEventName.ROTATE]: (event: GestureEvent) => void;
}

function yg_node_free(node: yoga.Node) { node.free(); }

export abstract class Element<T extends ElementEventToListener = ElementEventToListener> extends Component {
    private _emitter: EventEmitter<T> | undefined = undefined;
    public get emitter() {
        return this._emitter ? this._emitter : this._emitter = new EventEmitterImpl;
    }

    readonly yg_node = new SmartRef(yoga.impl.Node.create(), yg_node_free);

    protected _bounds = aabb2d.create();
    public get bounds(): Readonly<AABB2D> {
        return this._bounds;
    }

    private _layout_dirty = true;

    public get positionType(): yoga.PositionType {
        return this.yg_node.deref().getPositionType();
    }
    public set positionType(value: yoga.PositionType) {
        this.yg_node.deref().setPositionType(value);
    }

    constructor(node: Node) {
        super(node);
        this.yg_node.deref().setDirtiedFunc(() => {
            this._layout_dirty = true;
        })
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

    lateUpdate(): void {
        if (this._layout_dirty) {
            this.layout_update(this.yg_node)
            this._layout_dirty = false;
        }
    }

    protected layout_update(yg_node: SmartRef<yoga.Node>) {
        const layout = yg_node.deref().getComputedLayout();
        vec3.set(vec3_a, layout.left, -layout.top, 0);
        this.node.position = vec3_a;
        vec2.set(this._bounds.halfExtent, layout.width / 2, layout.height / 2);
        vec2.set(this._bounds.center, layout.width / 2, -layout.height / 2);
    }
}