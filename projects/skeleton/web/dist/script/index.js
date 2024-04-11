import { bundle } from 'bundling';
import { Camera, Node, Pipeline, Texture, Zero, device, vec3 } from 'engine';
import { Align, Document, Edge, Justify, PositionType, Profiler, Renderer } from 'flex';
import * as spine from 'spine';
const spine_atlas_src = await bundle.raw.once('spineboy/spineboy-pma.atlas', 'text');
const spine_atlas = new spine.core.TextureAtlas(spine_atlas_src);
for (const page of spine_atlas.pages) {
    page.setTexture(new spine.Texture(await bundle.once(`spineboy/${page.name}`, Texture)));
}
const spine_data_src = await bundle.raw.once('spineboy/spineboy-pro.json', 'text');
const pipeline = await (await bundle.cache('pipelines/post', Pipeline)).instantiate();
var VisibilityFlagBits;
(function (VisibilityFlagBits) {
    VisibilityFlagBits[VisibilityFlagBits["NONE"] = 0] = "NONE";
    VisibilityFlagBits[VisibilityFlagBits["UI"] = 536870912] = "UI";
    VisibilityFlagBits[VisibilityFlagBits["WORLD"] = 1073741824] = "WORLD";
    VisibilityFlagBits[VisibilityFlagBits["ALL"] = 4294967295] = "ALL";
})(VisibilityFlagBits || (VisibilityFlagBits = {}));
export class App extends Zero {
    start() {
        const width = 640;
        const height = 960;
        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;
        let node;
        node = new Node;
        const camera = node.addComponent(Camera);
        camera.orthoSize = swapchain.height / scale / 2;
        camera.visibilities = VisibilityFlagBits.UI;
        node.position = vec3.create(0, 0, width / 2);
        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.justifyContent = Justify.Center;
        doc.alignItems = Align.Center;
        doc.setWidth(width);
        doc.setHeight(height);
        const json = new spine.core.SkeletonJson(new spine.core.AtlasAttachmentLoader(spine_atlas));
        const skeletonData = json.readSkeletonData(spine_data_src);
        const skeleton = Renderer.create(spine.Animation);
        skeleton.impl.data = skeletonData;
        skeleton.impl.state.setAnimation(0, 'portal', true);
        doc.addElement(skeleton);
        node = new Node(Profiler.name);
        const profiler = node.addComponent(Profiler);
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8);
        profiler.setPosition(Edge.Bottom, 8);
        doc.addElement(profiler);
    }
}
(new App(pipeline)).initialize().attach();
