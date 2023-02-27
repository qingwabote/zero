import Texture from "../../../../script/main/assets/Texture.js";
import SpriteRenderer from "../../../../script/main/components/2d/SpriteRenderer.js";
import Camera from "../../../../script/main/components/Camera.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import UIRenderer from "../../../../script/main/components/ui/UIRenderer.js";
import Asset from "../../../../script/main/core/Asset.js";
import vec2 from "../../../../script/main/core/math/vec2.js";
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

        const sprite = UIRenderer.create(SpriteRenderer)
        sprite.node.visibilityFlag = VisibilityBit.DEFAULT;
        sprite.impl.texture = (await Asset.cache.load('../../assets/favicon.ico', Texture)).gfx_texture;
        sprite.size = vec2.create(100, 100)
        sprite.anchor = vec2.create(0, 0);
        sprite.node.scale = vec3.create(2, 2, 1)

        const sp = (new Node).addComponent(SpriteRenderer);
        sp.node.visibilityFlag = VisibilityBit.DEFAULT;
        sp.texture = sprite.impl.texture;
        sp.node.scale = vec3.create(100, 100, 1)

        node = new Node;
        node.visibilityFlag = VisibilityBit.DEFAULT
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2 + 200, 0];

        return new Flow([new ForwardStage([new ModelPhase], true)]);
    }
}

