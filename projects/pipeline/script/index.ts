import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, GLTF, MaterialFunc, MaterialParams, Node, PassOverridden, Pipeline, TextRenderer, TouchEventName, Zero, bundle as builtin, device, render, vec3 } from 'engine';
import { Align, CameraControlPanel, Document, Edge, ElementContainer, FlexDirection, Gutter, Justify, PositionType, Profiler, Renderer } from 'flex';

const VisibilityFlagBits = {
    UI: 1 << 29,
    DEFAULT: 1 << 30
} as const

const materialFunc: MaterialFunc = function (params: MaterialParams): [string, PassOverridden[]] {
    const pass: PassOverridden = {
        macros: {
            USE_ALBEDO_MAP: params.texture ? 1 : 0,
            USE_SKIN: params.skin ? 1 : 0
        },
        props: {
            albedo: params.albedo
        },
        ...params.texture &&
        {
            textures: {
                'albedoMap': params.texture.impl
            }
        }
    }
    return [
        bundle.resolve("./effects/test"),
        [{}, pass, pass, pass]
    ]
}

const [guardian, plane, unlit, phong, shadow] = await Promise.all([
    (async function () {
        const gltf = await bundle.cache('guardian_zelda_botw_fan-art/scene', GLTF);
        return gltf.instantiate(undefined, materialFunc);
    })(),
    (async function () {
        const gltf = await builtin.cache('models/primitive/scene', GLTF);
        return gltf.instantiate(undefined, materialFunc);
    })(),
    (async function () {
        const pipeline = await bundle.cache('pipelines/unlit', Pipeline)
        return pipeline.instantiate(VisibilityFlagBits);
    })(),
    (async function () {
        const pipeline = await bundle.cache('pipelines/phong', Pipeline)
        return pipeline.instantiate(VisibilityFlagBits);
    })(),
    (async function () {
        const pipeline = await bundle.cache('pipelines/shadow', Pipeline)
        return pipeline.instantiate(VisibilityFlagBits);
    })(),
])

const text_size = 64;
const text_color_normal = [0.5, 0.5, 0.5, 1] as const;
const text_color_selected = [0, 1, 0, 1] as const;

export class App extends Zero {
    private _pipelineTextSelected: TextRenderer | undefined = undefined;

    protected override start() {
        const width = 640;
        const height = 960;

        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        let node: Node;

        const light = Node.build(DirectionalLight);
        light.node.position = [4, 4, 4];
        light.node.lookAt(vec3.ZERO)


        // cameras
        node = new Node;
        const up_camera = node.addComponent(Camera);
        up_camera.visibilities = VisibilityFlagBits.DEFAULT;
        up_camera.fov = 45;
        up_camera.far = 16
        up_camera.rect = [0, 0.5, 1, 0.5];
        node.position = [0, 2, 10];

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoSize = swapchain.height / scale / 2;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.setWidth(width)
        doc.setHeight(height)
        doc.justifyContent = Justify.Center;
        doc.alignItems = Align.Center;

        node = new Node;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.positionType = PositionType.Absolute;
        cameraControlPanel.camera = up_camera;
        cameraControlPanel.setWidth(width);
        cameraControlPanel.setHeight(height);
        doc.addElement(cameraControlPanel);

        const pipelineBar = (new Node).addComponent(ElementContainer);
        pipelineBar.flexDirection = FlexDirection.Row;
        pipelineBar.setGap(Gutter.Column, 32);
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'UNLIT';
            textRenderer.impl.color = text_color_normal;
            textRenderer.impl.size = text_size;
            textRenderer.emitter.on(TouchEventName.START, async event => {
                this.onPipelineText(unlit, textRenderer.impl)
            })
            this.onPipelineText(unlit, textRenderer.impl);
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'PHONG';
            textRenderer.impl.color = text_color_normal;
            textRenderer.impl.size = text_size;
            textRenderer.emitter.on(TouchEventName.START, async event => {
                this.onPipelineText(phong, textRenderer.impl)
            })
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'SHADOW';
            textRenderer.impl.color = text_color_normal;
            textRenderer.impl.size = text_size;
            textRenderer.emitter.on(TouchEventName.START, async event => {
                this.onPipelineText(shadow, textRenderer.impl)
            })
            pipelineBar.addElement(textRenderer);
        }
        pipelineBar.setPosition(Edge.Top, 30)
        doc.addElement(pipelineBar);

        const profiler = (new Node).addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);

        node = guardian.createScene("Sketchfab_Scene")!;
        const animation = node.addComponent(Animation);
        animation.clips = guardian.proto.animationClips;
        animation.play('WalkCycle')
        node.visibility = VisibilityFlagBits.DEFAULT;
        node.position = [0, -1, 0]

        node = plane.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.DEFAULT
        node.scale = [5, 1, 5];
        node.position = [0, -1, 0]
    }

    private onPipelineText(pipeline: render.Pipeline, renderer: TextRenderer) {
        if (this._pipelineTextSelected) {
            this._pipelineTextSelected.color = text_color_normal
        }
        this.pipeline = pipeline;
        renderer.color = text_color_selected;
        this._pipelineTextSelected = renderer;
    }
}

(new App(unlit)).initialize().attach();
