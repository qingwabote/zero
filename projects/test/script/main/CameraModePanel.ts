import Component from "../../../../script/core/Component.js";
import Label from "../../../../script/core/components/Label.js";
import BoxShape from "../../../../script/core/components/physics/BoxShape.js";
import { InputEvent } from "../../../../script/core/Input.js";
import vec3 from "../../../../script/core/math/vec3.js";
import PhysicsSystem from "../../../../script/core/physics/PhysicsSystem.js";

export default class CameraModePanel extends Component {
    override start(): void {
        this.node.addComponent(Label).text = "Fixed Camera";
        const boxShape = this.node.addComponent(BoxShape);
        boxShape.size = vec3.create(300, 300, 300)

        const camera = zero.scene.cameras.find(camera => camera.visibilities & this.node.visibility)!;

        zero.input.on(InputEvent.TOUCH_START, event => {
            const touch = event.touches[0];
            const from = vec3.create();
            const to = vec3.create();
            camera.screenPointToRay(from, to, touch.x, touch.y);

            const ps = PhysicsSystem.instance;
            ps.world.rayTest(from, to);
        })
    }
}