import { bundle } from 'bundling';
import { Camera, DirectionalLight, GLTF, Node, Pipeline, Shader, SkinnedAnimation, SpriteFrame, SpriteRenderer, StrokeRenderer, TextRenderer, Vec3, Zero, bundle as builtin, device, mat3, pipeline, shaderLib, vec3, vec4 } from 'engine';
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler, Renderer } from 'flex';

const VisibilityFlagBits = {
    UP: 1 << 1,
    DOWN: 1 << 2,
    UI: 1 << 29,
    WORLD: 1 << 30
} as const

const materialFunc: GLTF.MaterialFunc = function (params: GLTF.MaterialParams) {
    const res = GLTF.materialFuncPhong(params)
    return {
        effect: bundle.resolve("./effects/test"),
        passes: [res.passes[0], res.passes[1], res.passes[1]]
    }
}

const [walkrun_and_idle, plane, ss_depth, csm_off, csm_on] = await Promise.all([
    await (await bundle.once('walkrun_and_idle/scene', GLTF)).instantiate(undefined, function (params: GLTF.MaterialParams) {
        const res = materialFunc(params);
        if (params.index == 3 /* hair */) {
            res.passes[0].rasterizationState = { cullMode: 'BACK' };
            res.passes[1].rasterizationState = { cullMode: 'FRONT' };
        }
        return res
    }),
    await (await builtin.cache('models/primitive/scene', GLTF)).instantiate(undefined, materialFunc),
    builtin.cache('shaders/depth', Shader),
    await ((await bundle.cache('pipelines/csm-off', Pipeline)).instantiate(VisibilityFlagBits)),
    await ((await bundle.cache('pipelines/csm-on', Pipeline)).instantiate(VisibilityFlagBits))
])

const csm_off_shadowmap = new SpriteFrame(csm_off.textures['shadowmap']);
const csm_on_shadowmap = new SpriteFrame(csm_on.textures['shadowmap']);

const text_size = 64;

export class App extends Zero {
    protected override start() {
        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;

        const scaleX = w / width;
        const scaleY = h / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        const light = Node.build(DirectionalLight);
        light.node.position = [4, 4, 4];
        light.node.lookAt(vec3.ZERO)
        // node.visibility = Visibility_Up;


        let node: Node;

        // cameras
        node = new Node;
        const up_camera = node.addComponent(Camera);
        up_camera.visibilities = VisibilityFlagBits.WORLD | VisibilityFlagBits.UP;
        up_camera.fov = 45;
        up_camera.far = 16;
        up_camera.rect = [0, 0.5, 1, 0.5];
        node.position = [0, 4, 10];

        node = new Node;
        const down_camera = node.addComponent(Camera);
        down_camera.visibilities = VisibilityFlagBits.WORLD | VisibilityFlagBits.DOWN;
        down_camera.orthoSize = 12;
        down_camera.rect = [0, 0, 1, 0.5];
        down_camera.near = -8;
        node.position = light.node.position;

        const circles: [Vec3, number][] = [
            [vec3.create(0, 0, -1.5), 6],
            [vec3.create(0, 0, -3), 10],
            [vec3.create(0, 0, -4.5), 444]
        ]
        for (let i = 0; i < circles.length; i++) {
            const [origin, steps] = circles[i];
            const stride = mat3.fromYRotation(mat3.create(), Math.PI * 2 / steps);
            for (let j = 0; j < steps; j++) {
                node = walkrun_and_idle.createScene("Sketchfab_Scene")!;
                node.visibility = VisibilityFlagBits.WORLD;
                const animation = node.addComponent(SkinnedAnimation);
                animation.clips = walkrun_and_idle.proto.animationClips;
                animation.play(animation.clips[j % 3].name);
                node.position = vec3.transformMat3(origin, origin, stride);
            }
        }

        node = plane.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.WORLD
        node.scale = [5, 1, 5];

        const debugDrawer = Node.build(StrokeRenderer);
        debugDrawer.node.visibility = VisibilityFlagBits.DOWN;

        const vec3_6in10: Readonly<Vec3> = vec3.create(0.6, 0.6, 0.6);

        const debugDraw = () => {
            debugDrawer.clear()

            const cameras = this.scene.cameras;
            const cascades = this.pipeline.data.shadow!.getCascades(cameras[0])!;
            const bounds_color = vec4.create(...vec4.YELLOW);
            const frusta_color = vec4.create(...vec4.ONE);
            for (let i = 0; i < cascades.num; i++) {
                debugDrawer.frustum(cascades.boundaries[i].vertices, bounds_color);
                debugDrawer.frustum(cascades.frusta[i].vertices, frusta_color);
                vec3.multiply(bounds_color, bounds_color, vec3_6in10)
                vec3.multiply(frusta_color, frusta_color, vec3_6in10)
            }

            // for (const model of this.scene.models) {
            //     if (model.transform.visibility != VisibilityFlagBits.WORLD) {
            //         continue;
            //     }
            //     if (frustum.aabb(up_camera.frustum_faces, model.world_bounds)) {
            //         debugDrawer.aabb(model.world_bounds, vec4.RED);
            //     } else {
            //         debugDrawer.aabb(model.world_bounds, vec4.ONE);
            //     }
            // }
        }
        csm_off.data.on(pipeline.Data.Event.UPDATE, debugDraw)
        csm_on.data.on(pipeline.Data.Event.UPDATE, debugDraw)

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoSize = h / scale / 2;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);

        const sprite = Renderer.create(SpriteRenderer);
        sprite.impl.spriteFrame = csm_on_shadowmap;
        sprite.impl.shader = shaderLib.getShader(ss_depth);
        sprite.setWidth(200);
        sprite.setHeight(200);
        sprite.positionType = PositionType.Absolute;
        sprite.setPosition(Edge.Right, 0);
        sprite.setPosition(Edge.Bottom, 0);
        doc.addElement(sprite);

        const profiler = (new Node).addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);

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
            const controlPanel = Node.build(CameraControlPanel);
            controlPanel.camera = down_camera;
            controlPanel.positionType = PositionType.Absolute;
            controlPanel.setWidthPercent(100);
            controlPanel.setHeightPercent(100);
            down_container.addElement(controlPanel);

            {
                const textRenderer = Renderer.create(TextRenderer);
                textRenderer.impl.text = 'CSM ON';
                textRenderer.impl.color = vec4.GREEN;
                textRenderer.impl.size = text_size;
                textRenderer.positionType = PositionType.Absolute;
                textRenderer.setPosition(Edge.Left, 0);
                // textRenderer.emitter.on(Input.TouchEvents.START, async event => {
                //     if (textRenderer.impl.text == 'CSM OFF') {
                //         textRenderer.impl.text = 'CSM ON';
                //         textRenderer.impl.color = vec4.GREEN;
                //         sprite.impl.spriteFrame = csm_on_shadowmap;
                //         this.pipeline = csm_on;
                //     } else {
                //         textRenderer.impl.text = 'CSM OFF';
                //         textRenderer.impl.color = vec4.ONE;
                //         sprite.impl.spriteFrame = csm_off_shadowmap;
                //         this.pipeline = csm_off;
                //     }
                // })
                down_container.addElement(textRenderer);
            }

            {
                const textRenderer = Renderer.create(TextRenderer);
                textRenderer.impl.text = 'TREE OFF';
                textRenderer.impl.color = vec4.ONE;
                textRenderer.impl.size = text_size;
                textRenderer.positionType = PositionType.Absolute;
                textRenderer.setPosition(Edge.Right, 0);
                // textRenderer.emitter.on(Input.TouchEvents.START, async event => {
                //     const last = this.scene.models;
                //     if (textRenderer.impl.text == 'TREE OFF') {
                //         textRenderer.impl.text = 'TREE ON';
                //         textRenderer.impl.color = vec4.GREEN;
                //         const models = new scene.ModelTree(aabb3d.create(vec3.ZERO, vec3.create(6, 6, 6)));
                //         for (const model of last) {
                //             models.add(model);
                //         }
                //         this.scene.models = models;
                //     } else {
                //         textRenderer.impl.text = 'TREE OFF';
                //         textRenderer.impl.color = vec4.ONE;
                //         const models = new scene.ModelArray();
                //         for (const model of last) {
                //             models.add(model);
                //         }
                //         this.scene.models = models;
                //     }
                // })
                down_container.addElement(textRenderer);
            }

        }
        doc.addElement(down_container)
    }
}

(new App(csm_on)).initialize().attach();
