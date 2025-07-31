import { Component, GLTF, Node, quat, vec3, Vec3 } from "engine";
import { VisibilityFlagBits } from "./VisibilityFlagBits.js";

const vec3_a = vec3.create();
const quat_a = quat.create();
const quat_b = quat.create();

const SPEED = vec3.create(0, 0, 0.05);

export class Spawn extends Component {
    model!: GLTF.Instance

    num: number = 0;

    private _transforms!: Node[];
    private _destinations!: Vec3[];

    start(): void {
        const transforms: Node[] = new Array(this.num);
        const destinations: Vec3[] = new Array(this.num);
        for (let i = 0; i < this.num; i++) {
            const node = this.model.createScene("Sketchfab_Scene")!;
            node.visibility = VisibilityFlagBits.WORLD;
            // const animation = node.addComponent(SkinnedAnimation);
            // animation.clips = this.model.proto.animationClips;
            // animation.play(i % 3);
            node.scale = vec3.create(0.3, 0.3, 0.3);
            node.position = vec3.set(vec3_a, Math.random() * 6 - 3, 0, Math.random() * 12 - 6)
            transforms[i] = node;
            destinations[i] = vec3.create();
        }
        this._transforms = transforms;
        this._destinations = destinations;
    }

    // update(dt: number): void {
    //     for (let i = 0; i < this.num; i++) {
    //         var transform = this._transforms[i];
    //         var destination = this._destinations[i];

    //         var d = vec3.subtract(vec3_a, destination, transform.position);
    //         if (vec3.length(d) < 1) {
    //             vec3.set(destination, Math.random() * 6 - 3, 0, Math.random() * 12 - 6)
    //             continue;
    //         }

    //         vec3.normalize(d, d);
    //         var rot = quat.fromViewUp(quat_a, d);

    //         transform.rotation = quat.slerp(quat_b, transform.rotation, rot, 0.05);

    //         const move = vec3.transformQuat(vec3_a, SPEED, transform.rotation);
    //         vec3.add(move, transform.position, move);
    //         transform.position = move;
    //     }
    // }
}