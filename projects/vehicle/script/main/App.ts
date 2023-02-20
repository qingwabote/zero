import GLTF from "../../../../script/main/assets/GLTF.js";
import Camera from "../../../../script/main/components/Camera.js";
import CameraControlPanel from "../../../../script/main/components/CameraControlPanel.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import MeshRenderer from "../../../../script/main/components/MeshRenderer.js";
import BoxShape from "../../../../script/main/components/physics/BoxShape.js";
import DebugDrawer from "../../../../script/main/components/physics/DebugDrawer.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import { ClearFlagBit } from "../../../../script/main/gfx/Pipeline.js";
import vec3, { Vec3 } from "../../../../script/main/math/vec3.js";
import Node from "../../../../script/main/Node.js";
import RenderFlow from "../../../../script/main/pipeline/RenderFlow.js";
import VisibilityBit from "../../../../script/main/render/VisibilityBit.js";
import Zero from "../../../../script/main/Zero.js";

export default class App extends Zero {
    async start(): Promise<RenderFlow> {
        const { width, height } = this.window;

        const lit_position: Vec3 = [4, 4, 4];

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = lit_position;
        // node.visibility = Visibility_Up;

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 10];

        const primitive = new GLTF;
        await primitive.load('../../assets/models/primitive/scene');
        node = primitive.createScene("Cube")!;
        let meshRenderer = node.getComponent(MeshRenderer)!;
        let subMesh = meshRenderer.mesh.subMeshes[0];
        let shape = node.addComponent(BoxShape);
        shape.body.mass = 1;
        shape.size = vec3.subtract(vec3.create(), subMesh.vertexPositionMax, subMesh.vertexPositionMin);
        // node.scale = [4, 4, 4];
        node.position = [0, 3, 0];

        node = primitive.createScene("Cube")!;
        node.scale = [4, 0.1, 4]
        meshRenderer = node.getComponent(MeshRenderer)!;
        subMesh = meshRenderer.mesh.subMeshes[0];
        shape = node.addComponent(BoxShape);
        shape.size = vec3.subtract(vec3.create(), subMesh.vertexPositionMax, subMesh.vertexPositionMin);
        shape.scale = node.scale;
        node.position = [0, -1, 0];

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityBit.UI;
        ui_camera.clearFlags = ClearFlagBit.DEPTH;
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        // node.visibility = VisibilityBit.UI;
        node.addComponent(DebugDrawer);

        node = new Node;
        node.visibility = VisibilityBit.UI;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2 + 200, 0];

        node = new Node;
        node.visibility = VisibilityBit.UI;
        node.addComponent(CameraControlPanel).camera = main_camera;
        node.position = [-width / 2, height / 2, 0];

        return new RenderFlow;
    }
}

