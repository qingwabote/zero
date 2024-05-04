import { bundle } from 'bundling';
import { Camera, DirectionalLight, GLTF, GeometryRenderer, Node, Pipeline, TextRenderer, TouchEventName, Zero, aabb3d, bundle as builtin, device, mat3, render, scene, vec3, vec4 } from "engine";
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler, Renderer } from "flex";

const pipeline = await (await builtin.cache('pipelines/forward', Pipeline)).instantiate();

const primitive = await (await builtin.cache('models/primitive/scene', GLTF)).instantiate();

const gltf_guardian = await (await bundle.cache('guardian_zelda_botw_fan-art/scene', GLTF)).instantiate();

enum VisibilityFlagBits {
    UP = 1 << 1,
    DOWN = 1 << 2,
    UI = 1 << 29,
    WORLD = 1 << 30
}

const tree_bounds = aabb3d.create(vec3.create(0, 4, 0), vec3.create(14, 14, 14));

class App extends Zero {
    protected start(): void {
        let debug: boolean = false

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
            down_camera.orthoSize = 12;
            down_camera.rect = [0, 0, 1, 0.5];
            down_camera.visibilities = VisibilityFlagBits.WORLD | VisibilityFlagBits.DOWN;
            down_camera.node.position = [0, 12, 8]
        }

        {
            const num = 6;
            const origins = [vec3.create(0, -8, -8), vec3.create(0, -1, -8), vec3.create(0, 6, -8), vec3.create(0, 13, -8)]
            for (let i = 0; i < origins.length; i++) {
                const pos = origins[i];
                const rotation = mat3.fromYRotation(mat3.create(), Math.PI * 2 / num);
                for (let i = 0; i < num; i++) {
                    const guardian = gltf_guardian.createScene("Sketchfab_Scene")!;
                    guardian.visibility = VisibilityFlagBits.WORLD;
                    guardian.position = vec3.transformMat3(pos, pos, rotation);
                }
            }
        }

        if (debug) {
            const debugDrawer = Node.build(GeometryRenderer);
            debugDrawer.node.visibility = VisibilityFlagBits.DOWN;

            this.pipeline.data.on(render.Data.Event.UPDATE, () => {
                debugDrawer.clear();

                if (this.scene.models instanceof scene.ModelTree) {
                    for (const node of this.scene.models.root.nodeIterator()) {
                        debugDrawer.drawAABB(node.bounds, vec4.RED);
                    }
                    debugDrawer.drawFrustum(up_camera.frustum.vertices, vec4.ONE);
                }

                debugDrawer.lateUpdate();
            })
        }

        const width = 640;
        const height = 960;

        const swapchain = device.swapchain;
        const scale = Math.min(swapchain.width / width, swapchain.height / height);

        {
            const camera = Node.build(Camera);
            camera.orthoSize = swapchain.height / scale / 2;
            camera.near = -1;
            camera.far = 1;
            camera.visibilities = VisibilityFlagBits.UI;
            camera.clears = Camera.ClearFlagBits.DEPTH;
        }

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
            controlPanel.setWidth('100%');
            controlPanel.setHeight('100%');
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
                controlPanel.setWidth('100%');
                controlPanel.setHeight('100%');
                down_container.addElement(controlPanel);
            }

            {
                const textRenderer = Renderer.create(TextRenderer);
                textRenderer.impl.text = 'TREE ON';
                textRenderer.impl.color = vec4.GREEN;
                textRenderer.impl.size = 50;
                textRenderer.positionType = PositionType.Absolute;
                textRenderer.setPosition(Edge.Right, 0);
                textRenderer.emitter.on(TouchEventName.START, async event => {
                    const last = this.scene.models;
                    if (textRenderer.impl.text == 'TREE OFF') {
                        textRenderer.impl.text = 'TREE ON';
                        textRenderer.impl.color = vec4.GREEN;
                        const models = new scene.ModelTree(tree_bounds);
                        for (const model of last) {
                            models.add(model);
                        }
                        this.scene.models = models;
                    } else {
                        textRenderer.impl.text = 'TREE OFF';
                        textRenderer.impl.color = vec4.ONE;
                        const models = new scene.ModelArray();
                        for (const model of last) {
                            models.add(model);
                        }
                        this.scene.models = models;
                    }
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

(new App(pipeline, new scene.ModelTree(tree_bounds))).initialize().attach();