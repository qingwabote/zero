import { bundle } from 'bundling';
import { bundle as builtin, Camera, device, Node, Pipeline, vec3, Zero } from 'engine';
import { Align, Document, Edge, Justify, PositionType, Profiler, Renderer } from 'flex';
import { Atlas, SkeletonAnimation, SkeletonData } from 'spine2';

const atlas = await bundle.once('efx_zidan_a035', Atlas);
const skel = await bundle.raw.once('efx_zidan_a035.skel', 'buffer');

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

        const skeletonData = new SkeletonData(skel, atlas);

        const skeleton = Renderer.create(SkeletonAnimation);
        skeleton.impl.data = skeletonData;
        skeleton.impl.state!.addAnimationByName(0, 'up1', true, 0);
        doc.addElement(skeleton)

        node = new Node(Profiler.name)
        const profiler = node.addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);
    }
}

(new App(pipeline)).initialize().attach();