import { Camera, InputEventType, Node, Pipeline, SpriteFrame, SpriteRenderer, Texture, VisibilityFlagBits, Zero, bundle, device, render, vec3 } from "engine";
import { Align, Document, Edge, Justify, PositionType, Profiler, Renderer } from "flex";

const unlit = await (await bundle.cache('pipelines/unlit', Pipeline)).createRenderPipeline();

const favicon = await bundle.cache('favicon.ico', Texture);

class App extends Zero {
    protected start(): render.Pipeline {
        const { width, height } = device.swapchain;

        let node: Node;

        node = new Node;
        const camera = node.addComponent(Camera);
        camera.orthoHeight = height / 2;
        camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.DEFAULT;
        const doc = node.addComponent(Document);
        doc.justifyContent = Justify.Center
        doc.alignItems = Align.Center
        doc.setWidth(width);
        doc.setHeight(height);

        const renderer = Renderer.create(SpriteRenderer);
        renderer.impl.spriteFrame = new SpriteFrame(favicon.impl);
        renderer.emitter.on(InputEventType.TOUCH_START, () => {
            console.log('TOUCH_START', renderer.node.name)
        })
        doc.addElement(renderer);

        node = new Node(Profiler.name)
        const profiler = node.addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        profiler.emitter.on(InputEventType.TOUCH_START, () => {
            console.log('TOUCH_START', profiler.node.name)
        })
        doc.addElement(profiler);

        return unlit;
    }
}

(new App).initialize();