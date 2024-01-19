import { bundle } from 'bundling';
import { Camera, Node, Pipeline, SpriteFrame, SpriteRenderer, Texture, TouchEventName, VisibilityFlagBits, Zero, bundle as builtin, device, render, vec3 } from 'engine';
import { Align, Document, Justify, Renderer } from 'flex';

const screen = await bundle.cache('screen.png', Texture);

const normal = await (await builtin.cache('pipelines/unlit', Pipeline)).createRenderPipeline();
const fxaa = await (await builtin.cache('pipelines/unlit-fxaa', Pipeline)).createRenderPipeline();

class App extends Zero {
    protected start(): render.Pipeline {
        const { width, height } = device.swapchain;

        const camera = (new Node).addComponent(Camera);
        camera.orthoHeight = height / 2;
        camera.viewport = { x: 0, y: 0, width, height };
        camera.node.position = vec3.create(0, 0, width / 2);

        let node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.DEFAULT;
        const doc = node.addComponent(Document);
        doc.justifyContent = Justify.Center;
        doc.alignItems = Align.Center;
        doc.setWidth(width);
        doc.setHeight(height);

        const sprite = Renderer.create(SpriteRenderer);
        sprite.impl.spriteFrame = new SpriteFrame(screen.impl);
        doc.addElement(sprite);

        this.input.on(TouchEventName.END, () => {
            this.pipeline = this.pipeline == normal ? fxaa : normal;
        })

        return normal
    }
}

(new App).initialize();
