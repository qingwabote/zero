import { DeepReadonly, EventEmitter } from "bastard";
import { AABB2D, Component, Input, Vec2, aabb2d, vec2, vec3 } from "engine";
import { yoga } from "yoga";
import { Direction, Edge, Gutter, PositionType } from "./enums.js";

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

export abstract class Element<T extends EventToListener = EventToListener> extends Component {
    private _emitter: EventEmitter<T> | undefined = undefined;
    public get emitter() {
        return this._emitter ?? (this._emitter = new EventEmitter.Impl);
    }

    readonly yg_node: yoga.Node = yoga.fn.YGNodeNew_PK();

    protected _bounds = aabb2d.create();
    public get bounds(): DeepReadonly<AABB2D> {
        return this._bounds;
    }

    public get positionType(): PositionType {
        return yoga.fn.YGNodeStyleGetPositionType();
    }
    public set positionType(value: PositionType) {
        yoga.fn.YGNodeStyleSetPositionType(this.yg_node, value);
    }

    setWidth(value: number) {
        yoga.fn.YGNodeStyleSetWidth(this.yg_node, value);
    }
    setWidthPercent(value: number) {
        yoga.fn.YGNodeStyleSetWidthPercent(this.yg_node, value);
    }
    setWidthAuto() {
        yoga.fn.YGNodeStyleSetWidthAuto(this.yg_node);
    }

    setHeight(value: number) {
        yoga.fn.YGNodeStyleSetHeight(this.yg_node, value);
    }
    setHeightPercent(value: number) {
        yoga.fn.YGNodeStyleSetHeightPercent(this.yg_node, value);
    }
    setHeightAuto() {
        yoga.fn.YGNodeStyleSetHeightAuto(this.yg_node);
    }

    setPosition(edge: Edge, value: number) {
        yoga.fn.YGNodeStyleSetPosition(this.yg_node, edge, value);
    }
    setPositionPercent(edge: Edge, value: number) {
        yoga.fn.YGNodeStyleSetPositionPercent(this.yg_node, edge, value);
    }
    setPositionAuto(edge: Edge) {
        yoga.fn.YGNodeStyleSetPositionAuto(this.yg_node, edge);
    }

    setPadding(edge: Edge, value: number) {
        yoga.fn.YGNodeStyleSetPadding(this.yg_node, edge, value);
    }
    setPaddingPercent(edge: Edge, value: number) {
        yoga.fn.YGNodeStyleSetPaddingPercent(this.yg_node, edge, value);
    }

    setGap(gutter: Gutter, value: number) {
        yoga.fn.YGNodeStyleSetGap(this.yg_node, gutter, value);
    }
    setGapPercent(gutter: Gutter, value: number) {
        yoga.fn.YGNodeStyleSetGapPercent(this.yg_node, gutter, value);
    }

    calculateLayout() {
        yoga.fn.YGNodeCalculateLayout(this.yg_node, NaN, NaN, Direction.LTR);
    }

    applyLayout() {
        if (!yoga.fn.YGNodeGetHasNewLayout(this.yg_node)) {
            return;
        }

        this.doLayout();

        for (const child of this.node.children) {
            const element = child.getComponent(Element)
            if (element) {
                element.applyLayout();
            }
        }

        yoga.fn.YGNodeSetHasNewLayout(this.yg_node, false);
    }

    protected doLayout() {
        const left = yoga.fn.YGNodeLayoutGetLeft(this.yg_node);
        const top = yoga.fn.YGNodeLayoutGetTop(this.yg_node);
        const width = yoga.fn.YGNodeLayoutGetWidth(this.yg_node);
        const height = yoga.fn.YGNodeLayoutGetHeight(this.yg_node);
        this.node.position = vec2.set(vec3_a, left, -top);
        vec2.set(this._bounds.halfExtent, width / 2, height / 2);
        vec2.set(this._bounds.center, width / 2, -height / 2);
    }
}

export declare namespace Element {
    export { Touch, TouchEvent, GestureEvent, EventToListener }
}