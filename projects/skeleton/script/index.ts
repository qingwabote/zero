import { bundle } from 'bundling';
import { bundle as builtin, Camera, device, escapism, Node, Pipeline, vec3, Zero } from 'engine';
import { Align, Document, Justify, Renderer } from 'flex';
import { Atlas, SkeletonAnimation, SkeletonData } from 'spine';

const atlas = await bundle.once('spineboy/spineboy-pma', Atlas);
const skel = await bundle.raw.once('spineboy/spineboy-pro.skel', 'buffer');

const pipeline = await (await builtin.once('pipelines/unlit', Pipeline)).instantiate()

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 29,
    WORLD = 1 << 30,
    ALL = 0xffffffff
}

export class App extends Zero {
    protected override start() {
        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;

        const scaleX = w / width;
        const scaleY = h / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        let node: Node;

        node = new Node;
        const camera = node.addComponent(Camera);
        camera.orthoSize = h / scale / 2;
        camera.visibilities = VisibilityFlagBits.UI;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.justifyContent = Justify.Center
        doc.alignItems = Align.Center
        doc.setWidth(width);
        doc.setHeight(height);

        const skeletonData = new SkeletonData(skel, atlas, 0.5);

        const skeleton = Renderer.create(SkeletonAnimation);
        skeleton.impl.data = skeletonData;
        skeleton.impl.state!.addAnimationByName(0, 'portal', true, 0);
        doc.addElement(skeleton)

        escapism.escapee.addComponent(escapism.Profiler);
    }
}

(new App(pipeline)).initialize().attach();