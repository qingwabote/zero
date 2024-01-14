import { Camera, Node, Pipeline, Profiler, TextRenderer, UIDocument, UIRenderer, UITouchEventType, VisibilityFlagBits, Zero, bundle, device, loadBundle, safeArea, vec2, vec3 } from "engine";

const unlit = await (await bundle.cache('pipelines/unlit', Pipeline)).createRenderPipeline();

class App extends Zero {
    start() {
        const { width, height } = device.swapchain;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibility = VisibilityFlagBits.DEFAULT;

        let y = safeArea.y + safeArea.height - 100;
        let d = 80;

        let textRenderer = UIRenderer.create(TextRenderer);
        textRenderer.anchor = vec2.create(0.5, 1);
        textRenderer.impl.text = '动画混合';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.on(UITouchEventType.TOUCH_START, async event => {
            this.go('animation');
        })
        textRenderer.node.position = [0, y, 0];
        y -= d;
        doc.addElement(textRenderer);

        textRenderer = UIRenderer.create(TextRenderer);
        textRenderer.anchor = vec2.create(0.5, 1);
        textRenderer.impl.text = '阴影';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.on(UITouchEventType.TOUCH_START, async event => {
            this.go('shadow');
        })
        textRenderer.node.position = [0, y, 0];
        y -= d;
        doc.addElement(textRenderer);

        textRenderer = UIRenderer.create(TextRenderer);
        textRenderer.anchor = vec2.create(0.5, 1);
        textRenderer.impl.text = '蒙皮';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.on(UITouchEventType.TOUCH_START, async event => {
            this.go('skin');
        })
        textRenderer.node.position = [0, y, 0];
        y -= d;
        doc.addElement(textRenderer);

        textRenderer = UIRenderer.create(TextRenderer);
        textRenderer.anchor = vec2.create(0.5, 1);
        textRenderer.impl.text = '骨骼';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.on(UITouchEventType.TOUCH_START, async event => {
            this.go('skeleton', 'spine');
        })
        textRenderer.node.position = [0, y, 0];
        y -= d;
        doc.addElement(textRenderer);

        textRenderer = UIRenderer.create(TextRenderer);
        textRenderer.anchor = vec2.create(0.5, 1);
        textRenderer.impl.text = '载具';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.on(UITouchEventType.TOUCH_START, async event => {
            this.go('vehicle', 'physics');
        })
        textRenderer.node.position = [0, y, 0];
        y -= d;
        doc.addElement(textRenderer);

        textRenderer = UIRenderer.create(TextRenderer);
        textRenderer.anchor = vec2.create(0.5, 1);
        textRenderer.impl.text = '切割';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.on(UITouchEventType.TOUCH_START, async event => {
            this.go('cutting2d');
        })
        textRenderer.node.position = [0, y, 0];
        y -= d;
        doc.addElement(textRenderer);

        textRenderer = UIRenderer.create(TextRenderer);
        textRenderer.anchor = vec2.create(0.5, 1);
        textRenderer.impl.text = 'yoga';
        textRenderer.impl.color = [0, 1, 0, 1];
        textRenderer.on(UITouchEventType.TOUCH_START, async event => {
            this.go('yoga');
        })
        textRenderer.node.position = [0, y, 0];
        y -= d;
        doc.addElement(textRenderer);

        node = new Node;
        node.visibility = VisibilityFlagBits.DEFAULT
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, safeArea.y, 0];

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

(new App).initialize();