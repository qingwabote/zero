import { Camera, ModelPhase, Node, Profiler, Slider, UIDocument, VisibilityFlagBits, Zero, device, render, stageFactory, vec2, vec3 } from "engine-main";

export class App extends Zero {
    start(): render.Flow {
        const { width, height } = device.swapchain;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibility = VisibilityFlagBits.DEFAULT;

        // const conatiner = (new Node).addComponent(UIContainer);
        // // conatiner.anchor = vec2.create(0, 0)
        // conatiner.on(UITouchEventType.TOUCH_START, (event) => {
        //     console.log('conatiner', event.touch.local)
        // })

        // const sprite = UIRenderer.create(SpriteRenderer)
        // sprite.impl.spriteFrame = (await AssetLib.instance.load({ path: '../../assets/favicon.ico', type: SpriteFrame }));
        // sprite.on(UITouchEventType.TOUCH_START, (event) => {
        //     console.log('sprite', event.touch.local)
        // })
        // conatiner.addElement(sprite);

        // doc.addElement(conatiner);

        const slider = (new Node).addComponent(Slider);
        doc.addElement(slider);

        node = new Node;
        node.visibility = VisibilityFlagBits.DEFAULT
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, - height / 2, 0];

        return new render.Flow([stageFactory.forward([new ModelPhase], false)]);
    }
}

