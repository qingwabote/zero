import Component from "../../../../script/core/Component.js";
import Label from "../../../../script/core/components/Label.js";
import BoxShape from "../../../../script/core/components/physics/BoxShape.js";

export default class CameraModePanel extends Component {
    override start(): void {
        this.node.addComponent(Label).text = "Fixed Camera";
        const boxShape = this.node.addComponent(BoxShape);
    }
}