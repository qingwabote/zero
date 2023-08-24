import * as spine_core from '@esotericsoftware/spine-core';
import { Camera, ModelPhase, Node, Texture, UIDocument, VisibilityFlagBits, Zero, assetLib, device, loader, render, spine, stageFactory, vec3 } from 'engine-main';

const spine_atlas_src = await loader.load("assets/coin/coin-pma.atlas", "text");
const spine_atlas = new spine_core.TextureAtlas(spine_atlas_src);
for (const page of spine_atlas.pages) {
    page.setTexture(new spine.Texture(await assetLib.load(`assets/coin/${page.name}`, Texture)))
}
const spine_data_src = await loader.load("assets/coin/coin-pro.json", "text");

// const spine_atlas_src = await loader.load("assets/spineboy/spineboy.atlas", "text");
// const spine_atlas = new spine_core.TextureAtlas(spine_atlas_src);
// for (const page of spine_atlas.pages) {
//     page.setTexture(new spine.Texture(await assetLib.load(`assets/spineboy/${page.name}`, Texture)))
// }
// const spine_data_src = await loader.load("assets/spineboy/spineboy-ess.json", "text");

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

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        const renderer = node.addComponent(spine.SkeletonRenderer);
        renderer.skeletonData = skeletonData;


        // node = new Node;
        // node.visibilityFlag = VisibilityFlagBits.DEFAULT
        // const profiler = node.addComponent(Profiler);
        // profiler.anchor = vec2.create(0, 0)
        // node.position = [-width / 2, - height / 2, 0];

        return new render.Flow([stageFactory.forward([new ModelPhase], false)]);
    }
}

