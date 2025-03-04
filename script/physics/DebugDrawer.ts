import { Component, Node, StrokeRenderer, vec3, vec4 } from "engine";
import { phys } from "phys";
import { PhysicsSystem } from "./PhysicsSystem.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();
const vec4_a = vec4.create(0, 0, 0, 1);

export class DebugDrawer extends Component {
    private readonly _stroke: StrokeRenderer

    constructor(node: Node) {
        super(node);

        const stroke = node.addComponent(StrokeRenderer);

        phys.fn.physWorld_setDebugDrawer_PK(PhysicsSystem.instance.world.pointer, phys.heap.addFunction((args) => {
            const [from, to, color] = phys.heap.getArgs(args, 'p', 'p', 'p');
            stroke.line(
                phys.heap.cpyBuffer(vec3_a, phys.fn.physVector3_get(from), 'f32', 3),
                phys.heap.cpyBuffer(vec3_b, phys.fn.physVector3_get(to), 'f32', 3),
                phys.heap.cpyBuffer(vec4_a, phys.fn.physVector3_get(color), 'f32', 3)
            )
        }))

        this._stroke = stroke;
    }

    override update(dt: number): void {
        this._stroke.clear();
    }
}