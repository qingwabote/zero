import { Camera, Flow, Node, Profiler, TextRenderer, Texture, UIDocument, UIRenderer, UITouchEventType, VisibilityFlagBits, Zero, bundle, device, platform, reboot, render, safeArea, vec2, vec3 } from "engine";
import CuttingBoard, { CuttingBoardEventType } from "./CuttingBoard.js";

const favicon = await bundle.cache('favicon.ico', Texture);

const flow = await bundle.cache('flows/unlit-ms', Flow);

export default class App extends Zero {
    start(): render.Flow {
        const { width, height } = device.swapchain;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibility = VisibilityFlagBits.DEFAULT;

        node = new Node;
        const cuttingBoard = node.addComponent(CuttingBoard);
        cuttingBoard.texture = favicon.impl;
        cuttingBoard.size = vec2.create(width, height);
        doc.addElement(cuttingBoard);

        const textRenderer = UIRenderer.create(TextRenderer);
        textRenderer.anchor = vec2.create(0.5, 1);
        textRenderer.node.position = [0, safeArea.y + safeArea.height - 100, 0];
        textRenderer.impl.text = '触摸并移动';
        cuttingBoard.on(CuttingBoardEventType.POLYGONS_CHANGED, () => {
            if (cuttingBoard.polygons.length > 9) {
                cuttingBoard.reset();
            }
        })

        doc.addElement(textRenderer);

        if (platform == 'wx') {
            const textRenderer = UIRenderer.create(TextRenderer);
            textRenderer.anchor = vec2.create(0, 1);
            textRenderer.impl.text = '重启';
            textRenderer.impl.color = [0, 1, 0, 1];
            textRenderer.on(UITouchEventType.TOUCH_START, async event => {
                reboot();
            })
            textRenderer.node.position = [-width / 2, safeArea.y + safeArea.height, 0];
            doc.addElement(textRenderer);
        }

        node = new Node;
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, safeArea.y, 0];
        doc.addElement(profiler);

        return flow.createFlow();
    }
}

new App;
