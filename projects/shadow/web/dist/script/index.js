import { bundle } from 'bundling';
import { Animation, Camera, DirectionalLight, GLTF, GeometryRenderer, Node, Pipeline, Shader, SpriteFrame, SpriteRenderer, TextRenderer, TouchEventName, Zero, bundle as builtin, device, render, shaderLib, vec3, vec4 } from 'engine';
import { CameraControlPanel, Document, Edge, ElementContainer, PositionType, Profiler, Renderer } from 'flex';
const VisibilityFlagBits = {
    UP: 1 << 1,
    DOWN: 1 << 2,
    UI: 1 << 29,
    WORLD: 1 << 30
};
const materialFunc = function (params) {
    const pass = Object.assign({ macros: {
            USE_ALBEDO_MAP: params.texture ? 1 : 0,
            USE_SKIN: params.skin ? 1 : 0
        }, props: {
            albedo: params.albedo
        } }, params.texture &&
        {
            textures: {
                'albedoMap': params.texture.impl
            }
        });
    return [
        bundle.resolve("./effects/test"),
        [{}, pass, pass]
    ];
};
const [guardian, plane, ss_depth, csm1, csm] = await Promise.all([
    (async function () {
        const gltf = await bundle.cache('guardian_zelda_botw_fan-art/scene', GLTF);
        return gltf.instantiate(undefined, materialFunc);
    })(),
    (async function () {
        const gltf = await builtin.cache('models/primitive/scene', GLTF);
        return gltf.instantiate(undefined, materialFunc);
    })(),
    builtin.cache('shaders/depth', Shader),
    bundle.cache('pipelines/csm1', Pipeline),
    bundle.cache('pipelines/csm', Pipeline)
]);
const csm1_instance = await csm1.instantiate(VisibilityFlagBits);
const csm_instance = await csm.instantiate(VisibilityFlagBits);
const csm1_shadowmap = new SpriteFrame(csm1.textures['shadowmap']);
const csm_shadowmap = new SpriteFrame(csm.textures['shadowmap']);
export class App extends Zero {
    start() {
        const width = 640;
        const height = 960;
        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;
        const light = Node.build(DirectionalLight);
        light.node.position = [4, 4, 4];
        light.node.lookAt(vec3.ZERO);
        // node.visibility = Visibility_Up;
        let node;
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
        down_camera.orthoSize = 16;
        down_camera.rect = [0, 0, 1, 0.5];
        down_camera.near = -8;
        node.position = [-8, 8, 8];
        node = guardian.createScene("Sketchfab_Scene");
        const animation = node.addComponent(Animation);
        animation.clips = guardian.proto.animationClips;
        animation.play('WalkCycle');
        node.visibility = VisibilityFlagBits.WORLD;
        node.position = [0, -1, 0];
        node = plane.createScene("Plane");
        node.visibility = VisibilityFlagBits.WORLD;
        node.scale = [5, 1, 5];
        node.position = [0, -1, 0];
        const debugDrawer = Node.build(GeometryRenderer);
        debugDrawer.node.visibility = VisibilityFlagBits.DOWN;
        const debugDraw = () => {
            debugDrawer.clear();
            const shadow = this.pipeline.data.shadow;
            const cameraIndex = shadow.visibleCameras[0];
            const cascades = shadow.cascades.get(cameraIndex);
            for (let i = 0; i < shadow.cascadeNum; i++) {
                debugDrawer.drawFrustum(cascades.bounds[i].vertices, vec4.YELLOW);
                debugDrawer.drawFrustum(cascades.frusta[i].vertices, vec4.ONE);
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
        };
        csm1_instance.data.on(render.Data.Event.UPDATE, debugDraw);
        csm_instance.data.on(render.Data.Event.UPDATE, debugDraw);
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
        sprite.impl.spriteFrame = csm1_shadowmap;
        sprite.impl.shader = shaderLib.getShader(ss_depth);
        sprite.setWidth(200);
        sprite.setHeight(200);
        sprite.positionType = PositionType.Absolute;
        sprite.setPosition(Edge.Right, 0);
        sprite.setPosition(Edge.Bottom, 0);
        doc.addElement(sprite);
        const profiler = (new Node).addComponent(Profiler);
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8);
        profiler.setPosition(Edge.Bottom, 8);
        doc.addElement(profiler);
        const up_container = Node.build(ElementContainer);
        up_container.setWidth(width);
        up_container.setHeight(height / 2);
        {
            const controlPanel = Node.build(CameraControlPanel);
            controlPanel.camera = up_camera;
            controlPanel.setWidth('100%');
            controlPanel.setHeight('100%');
            up_container.addElement(controlPanel);
        }
        doc.addElement(up_container);
        const down_container = Node.build(ElementContainer);
        down_container.setWidth(width);
        down_container.setHeight(height / 2);
        {
            const controlPanel = Node.build(CameraControlPanel);
            controlPanel.camera = down_camera;
            controlPanel.positionType = PositionType.Absolute;
            controlPanel.setWidth('100%');
            controlPanel.setHeight('100%');
            down_container.addElement(controlPanel);
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'CSM OFF';
            textRenderer.impl.color = vec4.ONE;
            textRenderer.impl.size = 50;
            textRenderer.positionType = PositionType.Absolute;
            textRenderer.emitter.on(TouchEventName.START, async (event) => {
                if (textRenderer.impl.text == 'CSM OFF') {
                    textRenderer.impl.text = 'CSM ON';
                    textRenderer.impl.color = vec4.GREEN;
                    sprite.impl.spriteFrame = csm_shadowmap;
                    this.pipeline = csm_instance;
                }
                else {
                    textRenderer.impl.text = 'CSM OFF';
                    textRenderer.impl.color = vec4.ONE;
                    sprite.impl.spriteFrame = csm1_shadowmap;
                    this.pipeline = csm1_instance;
                }
            });
            down_container.addElement(textRenderer);
        }
        doc.addElement(down_container);
    }
}
(new App(csm1_instance)).initialize().attach();
