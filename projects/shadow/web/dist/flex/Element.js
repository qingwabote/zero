import { EventEmitter } from "bastard";
import { Component, Input, aabb2d, vec2, vec3 } from "engine";
import { yoga } from "yoga";
import { Direction } from "./enums.js";
const vec3_a = vec3.create();
export class Element extends Component {
    constructor() {
        super(...arguments);
        this._emitter = undefined;
        this.yg_node = yoga.fn.YGNodeNew_PK();
        this._bounds = aabb2d.create();
    }
    get emitter() {
        var _a;
        return (_a = this._emitter) !== null && _a !== void 0 ? _a : (this._emitter = new EventEmitter.Impl);
    }
    get bounds() {
        return this._bounds;
    }
    get positionType() {
        return yoga.fn.YGNodeStyleGetPositionType();
    }
    set positionType(value) {
        yoga.fn.YGNodeStyleSetPositionType(this.yg_node, value);
    }
    setWidth(value) {
        yoga.fn.YGNodeStyleSetWidth(this.yg_node, value);
    }
    setWidthPercent(value) {
        yoga.fn.YGNodeStyleSetWidthPercent(this.yg_node, value);
    }
    setWidthAuto() {
        yoga.fn.YGNodeStyleSetWidthAuto(this.yg_node);
    }
    setHeight(value) {
        yoga.fn.YGNodeStyleSetHeight(this.yg_node, value);
    }
    setHeightPercent(value) {
        yoga.fn.YGNodeStyleSetHeightPercent(this.yg_node, value);
    }
    setHeightAuto() {
        yoga.fn.YGNodeStyleSetHeightAuto(this.yg_node);
    }
    setPosition(edge, value) {
        yoga.fn.YGNodeStyleSetPosition(this.yg_node, edge, value);
    }
    setPositionPercent(edge, value) {
        yoga.fn.YGNodeStyleSetPositionPercent(this.yg_node, edge, value);
    }
    setPositionAuto(edge) {
        yoga.fn.YGNodeStyleSetPositionAuto(this.yg_node, edge);
    }
    setPadding(edge, value) {
        yoga.fn.YGNodeStyleSetPadding(this.yg_node, edge, value);
    }
    setPaddingPercent(edge, value) {
        yoga.fn.YGNodeStyleSetPaddingPercent(this.yg_node, edge, value);
    }
    setGap(gutter, value) {
        yoga.fn.YGNodeStyleSetGap(this.yg_node, gutter, value);
    }
    setGapPercent(gutter, value) {
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
            const element = child.getComponent(Element);
            if (element) {
                element.applyLayout();
            }
        }
        yoga.fn.YGNodeSetHasNewLayout(this.yg_node, false);
    }
    doLayout() {
        const left = yoga.fn.YGNodeLayoutGetLeft(this.yg_node);
        const top = yoga.fn.YGNodeLayoutGetTop(this.yg_node);
        const width = yoga.fn.YGNodeLayoutGetWidth(this.yg_node);
        const height = yoga.fn.YGNodeLayoutGetHeight(this.yg_node);
        this.node.position = vec2.set(vec3_a, left, -top);
        vec2.set(this._bounds.halfExtent, width / 2, height / 2);
        vec2.set(this._bounds.center, width / 2, -height / 2);
    }
}
