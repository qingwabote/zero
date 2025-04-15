import { DeepReadonly, EventEmitter } from "bastard";
import { AABB2D, Component, Input, Vec2, aabb2d, vec2, vec3 } from "engine";
import { pk } from "puttyknife";
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

    readonly yg_node: any = pk.fn.YGNodeNew_PK();

    protected _bounds = aabb2d.create();
    public get bounds(): DeepReadonly<AABB2D> {
        return this._bounds;
    }

    public get positionType(): PositionType {
        return pk.fn.YGNodeStyleGetPositionType();
    }
    public set positionType(value: PositionType) {
        pk.fn.YGNodeStyleSetPositionType(this.yg_node, value);
    }

    setWidth(value: number) {
        pk.fn.YGNodeStyleSetWidth(this.yg_node, value);
    }
    setWidthPercent(value: number) {
        pk.fn.YGNodeStyleSetWidthPercent(this.yg_node, value);
    }
    setWidthAuto() {
        pk.fn.YGNodeStyleSetWidthAuto(this.yg_node);
    }

    setHeight(value: number) {
        pk.fn.YGNodeStyleSetHeight(this.yg_node, value);
    }
    setHeightPercent(value: number) {
        pk.fn.YGNodeStyleSetHeightPercent(this.yg_node, value);
    }
    setHeightAuto() {
        pk.fn.YGNodeStyleSetHeightAuto(this.yg_node);
    }

    setPosition(edge: Edge, value: number) {
        pk.fn.YGNodeStyleSetPosition(this.yg_node, edge, value);
    }
    setPositionPercent(edge: Edge, value: number) {
        pk.fn.YGNodeStyleSetPositionPercent(this.yg_node, edge, value);
    }
    setPositionAuto(edge: Edge) {
        pk.fn.YGNodeStyleSetPositionAuto(this.yg_node, edge);
    }

    setPadding(edge: Edge, value: number) {
        pk.fn.YGNodeStyleSetPadding(this.yg_node, edge, value);
    }
    setPaddingPercent(edge: Edge, value: number) {
        pk.fn.YGNodeStyleSetPaddingPercent(this.yg_node, edge, value);
    }

    setGap(gutter: Gutter, value: number) {
        pk.fn.YGNodeStyleSetGap(this.yg_node, gutter, value);
    }
    setGapPercent(gutter: Gutter, value: number) {
        pk.fn.YGNodeStyleSetGapPercent(this.yg_node, gutter, value);
    }

    calculateLayout() {
        pk.fn.YGNodeCalculateLayout(this.yg_node, NaN, NaN, Direction.LTR);
    }

    applyLayout() {
        if (!pk.fn.YGNodeGetHasNewLayout(this.yg_node)) {
            return;
        }

        this.doLayout();

        for (const child of this.node.children) {
            const element = child.getComponent(Element)
            if (element) {
                element.applyLayout();
            }
        }

        pk.fn.YGNodeSetHasNewLayout(this.yg_node, false);
    }

    protected doLayout() {
        const left = pk.fn.YGNodeLayoutGetLeft(this.yg_node);
        const top = pk.fn.YGNodeLayoutGetTop(this.yg_node);
        const width = pk.fn.YGNodeLayoutGetWidth(this.yg_node);
        const height = pk.fn.YGNodeLayoutGetHeight(this.yg_node);
        this.node.position = vec2.set(vec3_a, left, -top);
        vec2.set(this._bounds.halfExtent, width / 2, height / 2);
        vec2.set(this._bounds.center, width / 2, -height / 2);
    }
}

export declare namespace Element {
    export { Touch, TouchEvent, GestureEvent, EventToListener }
}