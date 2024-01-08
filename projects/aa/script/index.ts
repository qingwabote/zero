import { bundle } from 'bundling';
import { Camera, Node, Pipeline, SpriteFrame, SpriteRenderer, Texture, UIDocument, UIRenderer, VisibilityFlagBits, Zero, device, render, vec3 } from 'engine';

const screen = await bundle.cache('screen.png', Texture);

const pipeline = await (await bundle.cache('pipelines/fxaa', Pipeline)).createRenderPipeline();

class App extends Zero {
    protected start(): render.Pipeline {
        const { width, height } = device.swapchain;

        const camera = (new Node).addComponent(Camera);
        camera.orthoHeight = height / 2;
        camera.viewport = { x: 0, y: 0, width, height };
        camera.node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibility = VisibilityFlagBits.DEFAULT;

        const sprite = UIRenderer.create(SpriteRenderer);
        sprite.impl.spriteFrame = new SpriteFrame(screen.impl);
        doc.addElement(sprite);

        return pipeline
    }
}

new App;
