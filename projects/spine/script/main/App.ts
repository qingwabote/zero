import * as spine_core from '@esotericsoftware/spine-core';
import { Camera, ModelPhase, Node, Profiler, Texture, UIDocument, UIRenderer, VisibilityFlagBits, Zero, assetLib, device, loader, render, spine, stageFactory, vec2, vec3 } from 'engine-main';
import { SkeletonAnimation } from '../../../../script/engine/main/spine/SkeletonAnimation.js';

// const spine_atlas_src = await loader.load("assets/coin/coin-pma.atlas", "text");
// const spine_atlas = new spine_core.TextureAtlas(spine_atlas_src);
// for (const page of spine_atlas.pages) {
//     page.setTexture(new spine.Texture(await assetLib.load(`assets/coin/${page.name}`, Texture)))
// }
// const spine_data_src = await loader.load("assets/coin/coin-pro.json", "text");

const spine_atlas_src = await loader.load("assets/spineboy/spineboy-pma.atlas", "text");
const spine_atlas = new spine_core.TextureAtlas(spine_atlas_src);
for (const page of spine_atlas.pages) {
    page.setTexture(new spine.Texture(await assetLib.load(`assets/spineboy/${page.name}`, Texture)))
}
const spine_data_src = await loader.load("assets/spineboy/spineboy-pro.json", "text");

export default class App extends Zero {
    start(): render.Flow {
        const { width, height } = device.swapchain;

        let node: Node;

        node = new Node;
        const camera = node.addComponent(Camera);
        camera.orthoHeight = height / 2;
        camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibilityFlag = VisibilityFlagBits.DEFAULT;

        // const slider = (new Node).addComponent(Slider);
        // doc.addElement(slider);

        const json = new spine_core.SkeletonJson(new spine_core.AtlasAttachmentLoader(spine_atlas));
        const skeletonData = json.readSkeletonData(spine_data_src);

        const skeleton = UIRenderer.create(SkeletonAnimation);
        skeleton.impl.skeletonData = skeletonData;
        skeleton.impl.state.setAnimation(0, 'walk', true);
        doc.addElement(skeleton)

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, - height / 2, 0];

        return new render.Flow([stageFactory.forward([new ModelPhase], false)]);
    }
}

