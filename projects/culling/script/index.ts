import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, GLTF, Input, Node, Pipeline, TextRenderer, Zero, aabb3d, device, mat3, pipeline, scene, vec3, vec4 } from "engine";
import { ModelTreeNode } from 'engine/scene/ModelTreeNode.js';
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler, Renderer } from "flex";

enum VisibilityFlagBits {
    UP = 1 << 1,
    DOWN = 1 << 2,
    UI = 1 << 29,
    WORLD = 1 << 30
}

const [model, forward] = await Promise.all([
    await (await bundle.once('guardian_zelda_botw_fan-art/scene', GLTF)).instantiate(undefined, function (params: GLTF.MaterialParams) {
        const res = GLTF.materialFuncPhong(params);
        if (params.index == 3 /* hair */) {
            res.passes[1].rasterizationState = { cullMode: 'FRONT' };
        }
        return res
    }),
    await (await bundle.cache('pipelines/forward', Pipeline)).instantiate(VisibilityFlagBits)
])

const tree_bounds = aabb3d.create(vec3.create(0, 4, 0), vec3.create(14, 14, 14));

function tree_cull(results: ModelTreeNode[], node: ModelTreeNode, frustum: Readonly<scene.Frustum>, visibilities: number): ModelTreeNode[] {
    if (frustum.aabb_out(node.bounds)) {
        return results;
    }

    results.push(node);

    for (const child of node.children.values()) {
        tree_cull(results, child, frustum, visibilities);
    }

    return results;
}

class App extends Zero {
    protected start(): void {
        let debug: boolean = true

        const light = Node.build(DirectionalLight)
        light.node.position = [-12, 12, -12];

        const up_camera = Node.build(Camera);
        up_camera.fov = 45;
        up_camera.far = 12
        up_camera.rect = [0, 0.5, 1, 0.5];
        up_camera.visibilities = VisibilityFlagBits.WORLD | VisibilityFlagBits.UP;
        up_camera.node.position = [0, 0, 0.001]

        let down_camera: Camera;
        if (debug) {
            down_camera = Node.build(Camera);
            down_camera.orthoSize = 16;
            down_camera.rect = [0, 0, 1, 0.5];
            down_camera.visibilities = VisibilityFlagBits.WORLD | VisibilityFlagBits.DOWN;
            down_camera.node.position = [24, 24, 24]
        }

        {
            const num = 6;
            // const origins = [vec3.create(0, -8, -8), vec3.create(0, -1, -8), vec3.create(0, 6, -8)]
            const origins = [vec3.create(0, -1, -8)]
            for (let i = 0; i < origins.length; i++) {
                const pos = origins[i];
                const rotation = mat3.fromYRotation(mat3.create(), Math.PI * 2 / num);
                for (let i = 0; i < num; i++) {
                    const guardian = model.createScene("Sketchfab_Scene")!;
                    const animation = guardian.addComponent(Animation);
                    animation.clips = model.proto.animationClips;
                    animation.play(0);
                    guardian.visibility = VisibilityFlagBits.WORLD;
                    guardian.position = vec3.transformMat3(pos, pos, rotation);
                }
            }
        }

        if (debug) {
            const stroke = (this.pipeline.flows[0].stages[0].phases[1] as pipeline.StrokePhase).stroke;

            this.pipeline.data.on(pipeline.Data.Event.UPDATE, () => {
                stroke.clear();

                if (this.pipeline.data.culling) {
                    if (this.scene.models instanceof scene.ModelTree) {
                        for (const node of tree_cull([], this.scene.models.root, up_camera.frustum, up_camera.visibilities)) {
                            stroke.aabb(node.bounds, vec4.GREEN);
                        }
                    } else {
                        const models: scene.Model[] = [];
                        this.scene.models.culler()(models, up_camera.frustum, up_camera.visibilities)
                        for (const model of models) {
                            stroke.aabb(model.bounds, vec4.GREEN);
                        }
                    }

                    stroke.frustum(up_camera.frustum.vertices, vec4.ONE);
                }
            })
        }

        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;

        const scaleX = w / width;
        const scaleY = h / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        const ui_camera = Node.build(Camera);
        ui_camera.orthoSize = h / scale / 2;
        ui_camera.near = -1;
        ui_camera.far = 1;
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;

        const doc = Node.build(Document);
        doc.setWidth(width);
        doc.setHeight(height);
        // doc.setPadding(Edge.Top, safeArea.top / scale);
        doc.node.position = vec3.create(-width / 2, height / 2);
        doc.node.visibility = VisibilityFlagBits.UI;

        const up_container = Node.build(ElementContainer)
        up_container.setWidth(width);
        up_container.setHeight(height / 2);
        {
            const controlPanel = Node.build(CameraControlPanel);
            controlPanel.camera = up_camera;
            controlPanel.setWidthPercent(100);
            controlPanel.setHeightPercent(100);
            up_container.addElement(controlPanel);
        }
        doc.addElement(up_container)

        const down_container = Node.build(ElementContainer)
        down_container.setWidth(width);
        down_container.setHeight(height / 2);
        {
            if (debug) {
                const controlPanel = Node.build(CameraControlPanel);
                controlPanel.camera = down_camera!;
                controlPanel.positionType = PositionType.Absolute;
                controlPanel.setWidthPercent(100);
                controlPanel.setHeightPercent(100);
                down_container.addElement(controlPanel);
            }

            {
                const textRenderer = Renderer.create(TextRenderer);
                textRenderer.impl.text = 'TREE ON';
                textRenderer.impl.color = vec4.GREEN;
                textRenderer.impl.size = 50;
                textRenderer.positionType = PositionType.Absolute;
                textRenderer.setPosition(Edge.Right, 0);

                const options = [
                    () => {
                        textRenderer.impl.text = 'TREE OFF';
                        textRenderer.impl.color = vec4.ONE;
                        this.scene.models = new scene.ModelArray(this.scene.models);
                        this.pipeline.data.culling = new pipeline.Culling;
                    },
                    () => {
                        textRenderer.impl.text = 'NONE';
                        textRenderer.impl.color = vec4.ONE;
                        this.scene.models = new scene.ModelArray(this.scene.models);
                        this.pipeline.data.culling = null;
                    },
                    () => {
                        textRenderer.impl.text = 'TREE ON';
                        textRenderer.impl.color = vec4.GREEN;
                        this.scene.models = new scene.ModelTree(tree_bounds, this.scene.models);
                        this.pipeline.data.culling = new pipeline.Culling;
                    },
                ]
                let optionIndex = 0
                textRenderer.emitter.on(Input.TouchEvents.START, async event => {
                    options[optionIndex]();
                    optionIndex = (optionIndex + 1) % 3;
                })
                down_container.addElement(textRenderer);
            }
        }
        doc.addElement(down_container)

        const profiler = Node.build(Profiler);
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);
    }
}

(new App(forward, new scene.ModelTree(tree_bounds))).initialize().attach();