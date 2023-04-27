import VisibilityFlagBits from "../../../../script/main/VisibilityFlagBits.js";
import SpriteFrame from "../../../../script/main/assets/SpriteFrame.js";
import Camera from "../../../../script/main/components/Camera.js";
import SpriteRenderer from "../../../../script/main/components/SpriteRenderer.js";
import Profiler from "../../../../script/main/components/ui/Profiler.js";
import UIContainer from "../../../../script/main/components/ui/UIContainer.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import UIRenderer from "../../../../script/main/components/ui/UIRenderer.js";
import { UITouchEventType } from "../../../../script/main/components/ui/internal/UIElement.js";
import AssetLib from "../../../../script/main/core/AssetLib.js";
import Node from "../../../../script/main/core/Node.js";
import Zero from "../../../../script/main/core/Zero.js";
import vec2 from "../../../../script/main/core/math/vec2.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Flow from "../../../../script/main/core/render/Flow.js";
import ModelPhase from "../../../../script/main/render/phases/ModelPhase.js";
import stageFactory from "../../../../script/main/render/stageFactory.js";

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibilityFlag = VisibilityFlagBits.DEFAULT;

        const conatiner = (new Node).addComponent(UIContainer);
        // conatiner.anchor = vec2.create(0, 0)
        conatiner.on(UITouchEventType.TOUCH_START, (event) => {
            console.log('conatiner', event.touch.local)
        })

        const sprite = UIRenderer.create(SpriteRenderer)
        sprite.impl.spriteFrame = (await AssetLib.instance.load({ path: '../../assets/favicon.ico', type: SpriteFrame }));
        sprite.on(UITouchEventType.TOUCH_START, (event) => {
            console.log('sprite', event.touch.local)
        })
        conatiner.addElement(sprite);

        // const spriteS = UIRenderer.create(SpriteRenderer)
        // spriteS.impl.spriteFrame = (await AssetLib.instance.load({ path: '../../assets/favicon.ico', type: SpriteFrame }));
        // spriteS.size = vec2.create(100, 100)
        // conatiner.addElement(spriteS);

        doc.addElement(conatiner);
        // doc.addElement(sprite);

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, - height / 2, 0];

        return new Flow([stageFactory.forward([new ModelPhase], false)]);
    }
}

