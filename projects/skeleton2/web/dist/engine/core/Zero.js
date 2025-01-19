import { EventEmitter } from "bastard";
import * as boot from "boot";
import { PipelineStageFlagBits, SubmitInfo } from "gfx";
import { Input } from "./Input.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { Scene } from "./render/Scene.js";
import { Profile } from "./render/pipeline/Profile.js";
import { quad } from "./render/quad.js";
import { ModelArray } from "./render/scene/ModelArray.js";
var Event;
(function (Event) {
    Event["FRAME_START"] = "FRAME_START";
    Event["UPDATE"] = "UPDATE";
    Event["LATE_UPDATE"] = "LATE_UPDATE";
    Event["SCENE_UPDATE"] = "SCENE_UPDATE";
    Event["PIPELINE_UPDATE"] = "PIPELINE_UPDATE";
    Event["DEVICE_SYNC"] = "DEVICE_SYNC";
    Event["UPLOAD"] = "UPLOAD";
    Event["PIPELINE_BATCH"] = "PIPELINE_BATCH";
    Event["RENDER"] = "RENDER";
    Event["FRAME_END"] = "FRAME_END";
})(Event || (Event = {}));
export class Zero extends EventEmitter.Impl {
    static get frameCount() {
        return this._frameCount;
    }
    static get instance() {
        return Zero._instance;
    }
    static registerSystem(system, priority) {
        this._system2priority.set(system, priority);
    }
    get input() {
        return this._input;
    }
    get pipeline() {
        return this._pipeline;
    }
    set pipeline(value) {
        this._pipeline = value;
        this._pipeline.dump();
    }
    constructor(_pipeline, models = new ModelArray) {
        super();
        this._pipeline = _pipeline;
        this._input = new Input;
        this._componentScheduler = new ComponentScheduler;
        this._timeScheduler = new TimeScheduler;
        this.commandBuffer = boot.device.createCommandBuffer();
        this._swapchainUsable = boot.device.createSemaphore();
        this._queueExecuted = boot.device.createSemaphore();
        this._fence = boot.device.createFence(true);
        this._time = boot.initial;
        this.profile = new Profile;
        this.scene = new Scene(models);
        const systems = [...Zero._system2priority.keys()];
        systems.sort(function (a, b) {
            return Zero._system2priority.get(b) - Zero._system2priority.get(a);
        });
        this._systems = systems;
        Zero._instance = this;
    }
    initialize() {
        this.start();
        return this;
    }
    attach() {
        boot.attach(this);
    }
    detach() {
        boot.detach(this);
    }
    addComponent(com) {
        this._componentScheduler.add(com);
    }
    setInterval(func, delay = 0) {
        return this._timeScheduler.setInterval(func, delay);
    }
    clearInterval(func) {
        this._timeScheduler.clearInterval(func);
    }
    onTouchStart(event) {
        this._input.onTouchStart(event);
    }
    onTouchMove(event) {
        this._input.onTouchMove(event);
    }
    onTouchEnd(event) {
        this._input.onTouchEnd(event);
    }
    onWheel(event) {
        this._input.onWheel(event);
    }
    onFrame() {
        this.emit(Event.FRAME_START);
        const time = boot.now();
        const delta = (time - this._time) / 1000;
        this._time = time;
        // updates component, responds to user input
        this._componentScheduler.update(delta);
        this._timeScheduler.update();
        // updates systems, applies physics and then animation
        for (const system of this._systems) {
            system.update(delta);
        }
        this.emit(Event.UPDATE);
        // after the update of components and systems
        this._componentScheduler.lateUpdate();
        // layout engine works here, after all positions and sizes set by the above settle down
        for (const system of this._systems) {
            system.lateUpdate(delta);
        }
        this.emit(Event.LATE_UPDATE);
        this.profile.clear();
        this.scene.update();
        this.emit(Event.SCENE_UPDATE);
        this._pipeline.update(this);
        this.emit(Event.PIPELINE_UPDATE);
        boot.device.waitForFence(this._fence);
        boot.device.swapchain.acquire(this._swapchainUsable);
        this.emit(Event.DEVICE_SYNC);
        this._componentScheduler.upload(this.commandBuffer);
        quad.indexBufferView.update(this.commandBuffer);
        this._pipeline.upload(this);
        this.emit(Event.UPLOAD);
        this.commandBuffer.begin();
        this._pipeline.batch(this);
        this.emit(Event.PIPELINE_BATCH);
        this._pipeline.render(this);
        this.commandBuffer.end();
        this.emit(Event.RENDER);
        const submitInfo = new SubmitInfo;
        submitInfo.commandBuffer = this.commandBuffer;
        submitInfo.waitSemaphore = this._swapchainUsable;
        submitInfo.waitDstStageMask = PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT;
        submitInfo.signalSemaphore = this._queueExecuted;
        boot.device.queue.submit(submitInfo, this._fence);
        boot.device.queue.present(this._queueExecuted);
        this.emit(Event.FRAME_END);
        Zero._frameCount++;
    }
}
Zero._frameCount = 1;
Zero._system2priority = new Map;
Zero.Event = Event;
