import { bundle } from 'bundling';
import { Camera, DirectionalLight, GLTF, Node, Pipeline, Zero, bundle as builtin, device, escapism, vec3 } from "engine";
import { Spawn } from './Spawn.js';
import { VisibilityFlagBits } from './VisibilityFlagBits.js';

const [model, pipeline] = await Promise.all([
    await (await bundle.once('lowpoly_airplane/scene', GLTF)).instantiate(),
    await (await builtin.cache('pipelines/forward', Pipeline)).instantiate(VisibilityFlagBits)
])

pipeline.data.culling = null;

export class App extends Zero {
    start() {
        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;

        const scaleX = w / width;
        const scaleY = h / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = [4, 4, 4];
        node.lookAt(vec3.ZERO);

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 60;
        main_camera.near = 0.3;
        main_camera.far = 1000;
        main_camera.visibilities = VisibilityFlagBits.WORLD;
        node.position = [0, 10, 0];
        node.euler = [-90, 0, 0];

        node = new Node;
        const spawn = node.addComponent(Spawn);
        spawn.model = model;
        spawn.num = 1024;

        escapism.escapee.addComponent(escapism.Profiler);
    }
}

(new App(pipeline)).initialize().attach();
