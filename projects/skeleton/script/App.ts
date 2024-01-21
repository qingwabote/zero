import { bundle } from 'bundling';
import { Camera, Node, Pipeline, Texture, VisibilityFlagBits, Zero, device, render, vec3 } from 'engine';
import { Align, Document, Edge, Justify, PositionType, Profiler, Renderer } from 'flex';
import * as spine from 'spine';

const spine_atlas_src = await bundle.raw.once('spineboy/spineboy-pma.atlas', 'text');
const spine_atlas = new spine.core.TextureAtlas(spine_atlas_src);
for (const page of spine_atlas.pages) {
    page.setTexture(new spine.Texture(await bundle.once(`spineboy/${page.name}`, Texture)))
}
const spine_data_src = await bundle.raw.once('spineboy/spineboy-pro.json', 'text');

const pipeline = await (await bundle.cache('pipelines/post', Pipeline)).createRenderPipeline();

export class App extends Zero {
    protected override start(): render.Pipeline {
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

        const json = new spine.core.SkeletonJson(new spine.core.AtlasAttachmentLoader(spine_atlas));
        const skeletonData = json.readSkeletonData(spine_data_src);

        const skeleton = Renderer.create(spine.Animation);
        skeleton.impl.data = skeletonData;
        skeleton.impl.state.setAnimation(0, 'portal', true);
        doc.addElement(skeleton)

        node = new Node(Profiler.name)
        const profiler = node.addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);

        return pipeline;
    }
}

