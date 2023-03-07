import Texture from "../../../../script/main/assets/Texture.js";
import SpriteRenderer from "../../../../script/main/components/2d/SpriteRenderer.js";
import Camera from "../../../../script/main/components/Camera.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import UIRenderer from "../../../../script/main/components/ui/UIRenderer.js";
import Asset from "../../../../script/main/core/Asset.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/pipeline/Flow.js";
import Zero from "../../../../script/main/core/Zero.js";
import ModelPhase from "../../../../script/main/pipeline/phases/ModelPhase.js";
import ForwardStage from "../../../../script/main/pipeline/stages/ForwardStage.js";
import VisibilityBit from "../../../../script/main/VisibilityBit.js";

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = UIDocument.create();

        const sprite = UIRenderer.create(SpriteRenderer)
        sprite.node.visibilityFlag = VisibilityBit.DEFAULT;
        sprite.impl.texture = (await Asset.cache.load('../../assets/favicon.ico', Texture)).gfx_texture;
        doc.addElement(sprite);

        node = new Node;
        node.visibilityFlag = VisibilityBit.DEFAULT
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2, 0];

        return new Flow([new ForwardStage([new ModelPhase], true)]);
    }
}

