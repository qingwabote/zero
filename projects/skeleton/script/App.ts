import { bundle } from 'bundling';
import { Camera, Node, Pipeline, Profiler, TextRenderer, Texture, UIDocument, UIRenderer, UITouchEventType, VisibilityFlagBits, Zero, bundle as builtin, device, platform, reboot, render, safeArea, vec2, vec3 } from 'engine';
import * as spine from 'spine';

const spine_atlas_src = await bundle.raw.once('spineboy/spineboy-pma.atlas', 'text');
const spine_atlas = new spine.core.TextureAtlas(spine_atlas_src);
for (const page of spine_atlas.pages) {
    page.setTexture(new spine.Texture(await bundle.once(`spineboy/${page.name}`, Texture)))
}
const spine_data_src = await bundle.raw.once('spineboy/spineboy-pro.json', 'text');

const pipeline = await builtin.cache('pipelines/unlit', Pipeline);

export class App extends Zero {
    protected override start(): render.Pipeline {
        const { width, height } = device.swapchain;

        let node: Node;

        node = new Node;
        const camera = node.addComponent(Camera);
        camera.orthoHeight = height / 2;
        camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibility = VisibilityFlagBits.DEFAULT;

        const json = new spine.core.SkeletonJson(new spine.core.AtlasAttachmentLoader(spine_atlas));
        const skeletonData = json.readSkeletonData(spine_data_src);

        const skeleton = UIRenderer.create(spine.Animation);
        skeleton.impl.data = skeletonData;
        skeleton.impl.state.setAnimation(0, 'portal', true);
        skeleton.node.scale = [0.5, 0.5, 1]
        doc.addElement(skeleton)

        node = new Node;
        node.visibility = VisibilityFlagBits.DEFAULT
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, safeArea.y, 0];

        if (platform == 'wx') {
            const textRenderer = UIRenderer.create(TextRenderer);
            textRenderer.anchor = vec2.create(0, 1);
            textRenderer.impl.text = '重启';
            textRenderer.impl.color = [0, 1, 0, 1];
            textRenderer.on(UITouchEventType.TOUCH_START, async event => {
                reboot();
            })
            textRenderer.node.position = [-width / 2, safeArea.y + safeArea.height, 0];
            textRenderer.node.visibility = VisibilityFlagBits.DEFAULT;
            doc.addElement(textRenderer);
        }

        return pipeline.createRenderPipeline();
    }
}

