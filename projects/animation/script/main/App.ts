import VisibilityFlagBits from "../../../../script/main/VisibilityFlagBits.js";
import AnimationClip from "../../../../script/main/assets/AnimationClip.js";
import GLTF from "../../../../script/main/assets/GLTF.js";
import AnimationBlended from "../../../../script/main/components/AnimationBlended.js";
import Camera from "../../../../script/main/components/Camera.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import CameraControlPanel from "../../../../script/main/components/ui/CameraControlPanel.js";
import Profiler from "../../../../script/main/components/ui/Profiler.js";
import Slider, { SliderEventType } from "../../../../script/main/components/ui/Slider.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import Node from "../../../../script/main/core/Node.js";
import Zero from "../../../../script/main/core/Zero.js";
import { ClearFlagBits } from "../../../../script/main/core/gfx/Pipeline.js";
import vec2 from "../../../../script/main/core/math/vec2.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Flow from "../../../../script/main/core/render/Flow.js";
import stageFactory from "../../../../script/main/render/stageFactory.js";

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = [0, 4, 4];

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 12];

        const walkrun_and_idle = new GLTF();
        await walkrun_and_idle.load('./assets/walkrun_and_idle/scene');
        node = walkrun_and_idle.createScene("Sketchfab_Scene")!;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        const animation = node.addComponent(AnimationBlended);
        const clips: AnimationClip[] = [];
        clips.push(walkrun_and_idle.animationClips.find(clip => clip.name == 'Armature|Idle')!)
        clips.push(walkrun_and_idle.animationClips.find(clip => clip.name == 'Armature|Walk')!)
        clips.push(walkrun_and_idle.animationClips.find(clip => clip.name == 'Armature|Run')!)
        animation.clips = clips;
        animation.thresholds = [0, 0.5, 1]

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilityFlags = VisibilityFlagBits.UI;
        ui_camera.clearFlags = ClearFlagBits.DEPTH;
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibilityFlag = VisibilityFlagBits.UI;

        const profiler = (new Node).addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        profiler.node.position = [-width / 2, - height / 2, 0];
        doc.addElement(profiler);

        const cameraControlPanel = (new Node).addComponent(CameraControlPanel);
        cameraControlPanel.size = vec2.create(width, height);
        cameraControlPanel.camera = main_camera;
        doc.addElement(cameraControlPanel);

        const slider = (new Node).addComponent(Slider);
        slider.value = 0;
        slider.on(SliderEventType.CHANGED, () => {
            // animation.getState('Armature|Walk').speed = slider.value;
            animation.input = slider.value;
        })
        doc.addElement(slider);

        return new Flow([stageFactory.forward()])
    }
}

