import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, Effect, GLTF, Material, MaterialParams, Node, Pass, Pipeline, TextRenderer, TouchEventName, Vec3, Zero, bundle as builtin, device, render, vec3 } from 'engine';
import { Align, CameraControlPanel, Document, Edge, ElementContainer, FlexDirection, Gutter, Justify, PositionType, Profiler, Renderer } from 'flex';

const VisibilityFlagBits = {
    UI: 1 << 29,
    DEFAULT: 1 << 30
} as const


async function materialFunc(params: MaterialParams) {
    const effect = await bundle.cache("./effects/test", Effect);
    const pass: Pass = {
        macros: {
            USE_ALBEDO_MAP: params.texture ? 1 : 0,
            USE_SKIN: params.skin ? 1 : 0
        },
        props: {
            albedo: params.albedo
        }
    }
    const passes = await effect.createPasses([
        {},
        pass,
        pass,
        pass
    ]);
    if (params.texture) {
        passes[1].setTexture('albedoMap', params.texture.impl)
        passes[2].setTexture('albedoMap', params.texture.impl)
        passes[3].setTexture('albedoMap', params.texture.impl)
    }
    return new Material(passes);
}

const [guardian, plane, unlit, phong, shadow] = await Promise.all([
    (async function () {
        const gltf = await bundle.cache('guardian_zelda_botw_fan-art/scene', GLTF);
        return gltf.instantiate(materialFunc);
    })(),
    (async function () {
        const gltf = await builtin.cache('models/primitive/scene', GLTF);
        return gltf.instantiate(materialFunc);
    })(),
    (async function () {
        const pipeline = await bundle.cache('pipelines/unlit', Pipeline)
        return pipeline.createRenderPipeline(VisibilityFlagBits);
    })(),
    (async function () {
        const pipeline = await bundle.cache('pipelines/phong', Pipeline)
        return pipeline.createRenderPipeline(VisibilityFlagBits);
    })(),
    (async function () {
        const pipeline = await bundle.cache('pipelines/shadow', Pipeline)
        return pipeline.createRenderPipeline(VisibilityFlagBits);
    })(),
])

const text_color_normal = [0, 1, 0, 1] as const;
const text_color_selected = [1, 0, 0, 1] as const;

export class App extends Zero {
    private _pipelineTextSelected: TextRenderer | undefined = undefined;

    protected override start(): render.Pipeline {
        const { width, height } = device.swapchain;

        const lit_position: Vec3 = [4, 4, 4];

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = lit_position;
        // node.visibility = Visibility_Up;


        // cameras
        node = new Node;
        const up_camera = node.addComponent(Camera);
        up_camera.visibilities = VisibilityFlagBits.DEFAULT;
        up_camera.fov = 45;
        up_camera.viewport = { x: 0, y: height / 2, width, height: height / 2 };
        node.position = [0, 0, 10];

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
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
        pipelineBar.setGap(Gutter.Column, 16);
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'UNLIT';
            textRenderer.impl.color = text_color_normal;
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
            textRenderer.emitter.on(TouchEventName.START, async event => {
                this.onPipelineText(phong, textRenderer.impl)
            })
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'SHADOW';
            textRenderer.impl.color = text_color_normal;
            textRenderer.emitter.on(TouchEventName.START, async event => {
                this.onPipelineText(shadow, textRenderer.impl)
            })
            pipelineBar.addElement(textRenderer);
        }
        doc.addElement(pipelineBar);

        const profiler = (new Node).addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);

        node = guardian.createScene("Sketchfab_Scene")!;
        const animation = node.addComponent(Animation);
        animation.clips = guardian.gltf.animationClips;
        animation.play('WalkCycle')
        node.visibility = VisibilityFlagBits.DEFAULT;
        node.position = [0, -1, 0]

        node = plane.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.DEFAULT
        node.scale = [5, 1, 5];
        node.position = [0, -1, 0]

        return unlit;
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

