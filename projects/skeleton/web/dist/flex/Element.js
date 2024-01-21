import { EventEmitterImpl, SmartRef } from "bastard";
import { Component, GestureEventName, TouchEventName, aabb2d, vec2, vec3 } from "engine";
import * as yoga from "./yoga/index.js";
const vec3_a = vec3.create();
function yg_node_free(node) { node.free(); }
export class Element extends Component {
    get emitter() {
        return this._emitter ? this._emitter : this._emitter = new EventEmitterImpl;
    }
    get bounds() {
        return this._bounds;
    }
    get positionType() {
        return this.yg_node.deref().getPositionType();
    }
    set positionType(value) {
        this.yg_node.deref().setPositionType(value);
    }
    constructor(node) {
        super(node);
        this._emitter = undefined;
        this.yg_node = new SmartRef(yoga.impl.Node.create(), yg_node_free);
        this._bounds = aabb2d.create();
        this._layout_dirty = true;
        this.yg_node.deref().setDirtiedFunc(() => {
            this._layout_dirty = true;
        });
    }
    setWidth(value) {
        this.yg_node.deref().setWidth(value);
    }
    setHeight(value) {
        this.yg_node.deref().setHeight(value);
    }
    setPosition(edge, value) {
        this.yg_node.deref().setPosition(edge, value);
    }
    setPadding(edge, value) {
        this.yg_node.deref().setPadding(edge, value);
    }
    setGap(gutter, value) {
        this.yg_node.deref().setGap(gutter, value);
    }
    lateUpdate() {
        if (this._layout_dirty) {
            this.layout_update(this.yg_node);
            this._layout_dirty = false;
        }
    }
    layout_update(yg_node) {
        const layout = yg_node.deref().getComputedLayout();
        vec3.set(vec3_a, layout.left, -layout.top, 0);
        this.node.position = vec3_a;
        vec2.set(this._bounds.halfExtent, layout.width / 2, layout.height / 2);
        vec2.set(this._bounds.center, layout.width / 2, -layout.height / 2);
    }
}
