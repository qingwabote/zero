import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, Effect, GLTF, GeometryRenderer, Input, Node, Pipeline, Shader, SpriteFrame, SpriteRenderer, TextRenderer, Zero, aabb3d, bundle as builtin, device, render, scene, shaderLib, vec3, vec4 } from 'engine';
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler, Renderer } from 'flex';

const VisibilityFlagBits = {
    UP: 1 << 1,
    DOWN: 1 << 2,
    UI: 1 << 29,
    WORLD: 1 << 30
} as const

const materialFunc: GLTF.MaterialFunc = function (params: GLTF.MaterialParams): [string, Effect.PassOverridden[]] {
    const pass: Effect.PassOverridden = {
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
        [{}, pass, pass]
    ]
}

const [guardian, plane, ss_depth, csm_off, csm_on] = await Promise.all([
    (async function () {
        const gltf = await bundle.cache('guardian_zelda_botw_fan-art/scene', GLTF);
        return gltf.instantiate(undefined, materialFunc);
    })(),
    (async function () {
        const gltf = await builtin.cache('models/primitive/scene', GLTF);
        return gltf.instantiate(undefined, materialFunc);
    })(),
    builtin.cache('shaders/depth', Shader),
    bundle.cache('pipelines/csm-off', Pipeline),
    bundle.cache('pipelines/csm-on', Pipeline)
])

const csm_off_instance = await csm_off.instantiate(VisibilityFlagBits);
const csm_on_instance = await csm_on.instantiate(VisibilityFlagBits);

const csm_off_shadowmap = new SpriteFrame(csm_off.textures['shadowmap']);
const csm_on_shadowmap = new SpriteFrame(csm_on.textures['shadowmap']);

export class App extends Zero {
    protected override start() {
        const width = 640;
        const height = 960;

        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
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
        node.position = [0, 2, 10];

        node = new Node;
        const down_camera = node.addComponent(Camera);
        down_camera.visibilities = VisibilityFlagBits.WORLD | VisibilityFlagBits.DOWN;
        down_camera.orthoSize = 12;
        down_camera.rect = [0, 0, 1, 0.5];
        down_camera.near = -8;
        node.position = [-8, 8, 8];

        node = guardian.createScene("Sketchfab_Scene")!;
        const animation = node.addComponent(Animation);
        animation.clips = guardian.proto.animationClips;
        animation.play('WalkCycle')
        node.visibility = VisibilityFlagBits.WORLD;
        node.position = [0, -1, 0]

        node = plane.createScene("Plane")!;
        node.visibility = VisibilityFlagBits.WORLD
        node.scale = [5, 1, 5];
        node.position = [0, -1, 0];

        const debugDrawer = Node.build(GeometryRenderer);
        debugDrawer.node.visibility = VisibilityFlagBits.DOWN;

        const vec3_6in10 = Object.freeze(vec3.create(0.6, 0.6, 0.6));

        const debugDraw = () => {
            debugDrawer.clear()

            const shadow = this.pipeline.data.shadow!;
            const cameraIndex = shadow.visibleCameras[0];
            const cascades = shadow.cascades.get(cameraIndex)!;
            const bounds_color = vec4.create(...vec4.YELLOW);
            const frusta_color = vec4.create(...vec4.ONE);
            for (let i = 0; i < shadow.cascadeNum; i++) {
                debugDrawer.drawFrustum(cascades.bounds[i].vertices, bounds_color);
                debugDrawer.drawFrustum(cascades.frusta[i].vertices, frusta_color);
                vec3.multiply(bounds_color, bounds_color, vec3_6in10)
                vec3.multiply(frusta_color, frusta_color, vec3_6in10)
            }

            // for (const model of this.scene.models) {
            //     if (model.transform.visibility != VisibilityFlagBits.WORLD) {
            //         continue;
            //     }
            //     if (frustum.aabb(up_camera.frustum_faces, model.world_bounds)) {
            //         debugDrawer.drawAABB(model.world_bounds, vec4.RED);
            //     } else {
            //         debugDrawer.drawAABB(model.world_bounds, vec4.ONE);
            //     }
            // }
            debugDrawer.lateUpdate();
        }
        csm_off_instance.data.on(render.Data.Event.UPDATE, debugDraw)
        csm_on_instance.data.on(render.Data.Event.UPDATE, debugDraw)

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
            controlPanel.setWidth('100%');
            controlPanel.setHeight('100%');
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
            controlPanel.setWidth('100%');
            controlPanel.setHeight('100%');
            down_container.addElement(controlPanel);

            {
                const textRenderer = Renderer.create(TextRenderer);
                textRenderer.impl.text = 'CSM ON';
                textRenderer.impl.color = vec4.GREEN;
                textRenderer.impl.size = 50;
                textRenderer.positionType = PositionType.Absolute;
                textRenderer.emitter.on(Input.TouchEvents.START, async event => {
                    if (textRenderer.impl.text == 'CSM OFF') {
                        textRenderer.impl.text = 'CSM ON';
                        textRenderer.impl.color = vec4.GREEN;
                        sprite.impl.spriteFrame = csm_on_shadowmap;
                        this.pipeline = csm_on_instance;
                    } else {
                        textRenderer.impl.text = 'CSM OFF';
                        textRenderer.impl.color = vec4.ONE;
                        sprite.impl.spriteFrame = csm_off_shadowmap;
                        this.pipeline = csm_off_instance;
                    }
                })
                down_container.addElement(textRenderer);
            }

            {
                const textRenderer = Renderer.create(TextRenderer);
                textRenderer.impl.text = 'TREE OFF';
                textRenderer.impl.color = vec4.ONE;
                textRenderer.impl.size = 50;
                textRenderer.positionType = PositionType.Absolute;
                textRenderer.setPosition(Edge.Right, 0);
                textRenderer.emitter.on(Input.TouchEvents.START, async event => {
                    const last = this.scene.models;
                    if (textRenderer.impl.text == 'TREE OFF') {
                        textRenderer.impl.text = 'TREE ON';
                        textRenderer.impl.color = vec4.GREEN;
                        const models = new scene.ModelTree(aabb3d.create(vec3.ZERO, vec3.create(6, 6, 6)));
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
    }
}

(new App(csm_on_instance)).initialize().attach();
