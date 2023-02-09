import Component from "../../../../script/core/Component.js";
import Label from "../../../../script/core/components/Label.js";
import BoxShape from "../../../../script/core/components/physics/BoxShape.js";
import { InputEvent } from "../../../../script/core/Input.js";
import vec3 from "../../../../script/core/math/vec3.js";
import PhysicsSystem from "../../../../script/core/physics/PhysicsSystem.js";

export default class CameraModePanel extends Component {
    private _dirty = true;

    private _fixed: boolean = true;
    private get fixed(): boolean {
        return this._fixed;
    }
    private set fixed(value: boolean) {
        this._fixed = value;
        this._dirty = true;
    }

    override start(): void {
        this.node.addComponent(Label);
        this.node.addComponent(BoxShape);

        const camera = zero.scene.cameras.find(camera => camera.visibilities & this.node.visibility)!;

        zero.input.on(InputEvent.TOUCH_START, event => {
            const touch = event.touches[0];
            const from = vec3.create();
            const to = vec3.create();
            camera.screenPointToRay(from, to, touch.x, touch.y);

            const ps = PhysicsSystem.instance;
            ps.world.rayTest(from, to);

            this.fixed = !this.fixed;
        })
    }

    override update(): void {
        if (this._dirty) {
            const label = this.node.getComponent(Label)!;
            label.text = this.fixed ? "Fixed Camera" : "Wandering Camera";

            const boxShape = this.node.getComponent(BoxShape)!;
            boxShape.size = vec3.create(label.size[0], label.size[1], 100);
            boxShape.origin = vec3.create(label.size[0] / 2, -label.size[1] / 2, 0);
            this._dirty = false;
        }

    }
}