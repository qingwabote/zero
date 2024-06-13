import { Camera, Input, Node, Pipeline, TextRenderer, Zero, bundle, device, loadBundle, safeArea, vec3 } from "engine";
import { Align, Document, Edge, Renderer } from 'flex';

const VisibilityFlagBits = {
    UI: 1 << 29,
} as const

const unlit = await (await bundle.cache('pipelines/unlit', Pipeline)).instantiate();

class App extends Zero {
    start() {
        const width = 640;
        const height = 960;

        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoSize = swapchain.height / scale / 2;
        ui_camera.visibilities = VisibilityFlagBits.UI;
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(Document);
        doc.setWidth(width);
        doc.setHeight(height);
        doc.setPadding(Edge.Top, safeArea.top / scale);
        doc.alignItems = Align.Center
        doc.node.position = vec3.create(-width / 2, height / 2);
        doc.node.visibility = VisibilityFlagBits.UI;

        let textRenderer = Renderer.create(TextRenderer);
        textRenderer.impl.text = '动画混合';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.emitter.on(Input.TouchEvents.START, async event => {
            this.go('animation');
        })
        doc.addElement(textRenderer);

        textRenderer = Renderer.create(TextRenderer);
        textRenderer.impl.text = '阴影';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.emitter.on(Input.TouchEvents.START, async event => {
            this.go('shadow');
        })
        doc.addElement(textRenderer);

        textRenderer = Renderer.create(TextRenderer);
        textRenderer.impl.text = '蒙皮';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.emitter.on(Input.TouchEvents.START, async event => {
            this.go('skin');
        })
        doc.addElement(textRenderer);

        textRenderer = Renderer.create(TextRenderer);
        textRenderer.impl.text = '骨骼';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.emitter.on(Input.TouchEvents.START, async event => {
            this.go('skeleton', 'spine');
        })
        doc.addElement(textRenderer);

        textRenderer = Renderer.create(TextRenderer);
        textRenderer.impl.text = '载具';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.emitter.on(Input.TouchEvents.START, async event => {
            this.go('vehicle', 'physics');
        })
        doc.addElement(textRenderer);

        textRenderer = Renderer.create(TextRenderer);
        textRenderer.impl.text = '切割';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.emitter.on(Input.TouchEvents.START, async event => {
            this.go('cutting2d');
        })
        doc.addElement(textRenderer);

        textRenderer = Renderer.create(TextRenderer);
        textRenderer.impl.text = 'instancing';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.emitter.on(Input.TouchEvents.START, async event => {
            this.go('instancing');
        })
        doc.addElement(textRenderer);

        return unlit;
    }

    private async go(name: string, ...dependencies: string[]) {
        this.detach();

        const promises = [];
        promises.push(loadBundle(name))
        for (const dep of dependencies) {
            promises.push(loadBundle(dep))
        }
        await Promise.all(promises);

        import(name);
    }
}

(new App(unlit)).initialize().attach();