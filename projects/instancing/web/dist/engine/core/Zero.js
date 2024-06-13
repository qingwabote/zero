import { EventEmitterImpl } from "bastard";
import * as boot from "boot";
import { PipelineStageFlagBits, SubmitInfo } from "gfx";
import { Input } from "./Input.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { Scene } from "./render/Scene.js";
import { Profile } from "./render/pipeline/Profile.js";
import { ModelArray } from "./render/scene/ModelArray.js";
import { PeriodicFlag } from "./render/scene/PeriodicFlag.js";
var Event;
(function (Event) {
    Event["LOGIC_START"] = "LOGIC_START";
    Event["LOGIC_END"] = "LOGIC_END";
    Event["RENDER_START"] = "RENDER_START";
    Event["RENDER_END"] = "RENDER_END";
})(Event || (Event = {}));
export class Zero extends EventEmitterImpl {
    static get instance() {
        return Zero._instance;
    }
    static registerSystem(system, priority) {
        this._system2priority.set(system, priority);
    }
    get input() {
        return this._input;
    }
    get profile() {
        return this._profile;
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
        this._commandBuffer = boot.device.createCommandBuffer();
        this._swapchainAcquired = boot.device.createSemaphore();
        this._queueExecuted = boot.device.createSemaphore();
        this._fence = boot.device.createFence();
        this._time = boot.initial;
        this._profile = new Profile;
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
        this.emit(Event.LOGIC_START);
        const time = boot.now();
        const delta = (time - this._time) / 1000;
        this._time = time;
        this._componentScheduler.update(delta);
        this._timeScheduler.update();
        for (const system of this._systems) {
            system.update(delta);
        }
        this._componentScheduler.lateUpdate();
        for (const system of this._systems) {
            system.lateUpdate(delta);
        }
        this.emit(Event.LOGIC_END);
        this.emit(Event.RENDER_START);
        boot.device.swapchain.acquire(this._swapchainAcquired);
        this.scene.update();
        this._pipeline.update();
        this._commandBuffer.begin();
        this._profile.clear();
        for (let i = 0; i < this.scene.cameras.length; i++) {
            this._pipeline.record(this._profile, this._commandBuffer, i);
        }
        PeriodicFlag.expire();
        this._commandBuffer.end();
        this.emit(Event.RENDER_END);
        const submitInfo = new SubmitInfo;
        submitInfo.commandBuffer = this._commandBuffer;
        submitInfo.waitSemaphore = this._swapchainAcquired;
        submitInfo.waitDstStageMask = PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT;
        submitInfo.signalSemaphore = this._queueExecuted;
        boot.device.queue.submit(submitInfo, this._fence);
        boot.device.queue.present(this._queueExecuted);
        boot.device.queue.wait(this._fence);
    }
}
Zero._system2priority = new Map;
Zero.Event = Event;
