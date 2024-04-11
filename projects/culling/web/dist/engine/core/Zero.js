import { EventEmitterImpl } from "bastard";
import { attach, detach, device, initial, now } from "boot";
import { PipelineStageFlagBits, SubmitInfo } from "gfx";
import { Input, TouchEventName } from "./Input.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { FrameChangeRecord } from "./render/scene/FrameChangeRecord.js";
import { Root } from "./render/scene/Root.js";
export var ZeroEvent;
(function (ZeroEvent) {
    ZeroEvent["LOGIC_START"] = "LOGIC_START";
    ZeroEvent["LOGIC_END"] = "LOGIC_END";
    ZeroEvent["RENDER_START"] = "RENDER_START";
    ZeroEvent["RENDER_END"] = "RENDER_END";
})(ZeroEvent || (ZeroEvent = {}));
export class Zero extends EventEmitterImpl {
    static get instance() {
        return Zero._instance;
    }
    static registerSystem(system, priority) {
        this._system2priority.set(system, priority);
    }
    get drawCall() { return this._drawCall; }
    constructor(pipeline) {
        super();
        this.pipeline = pipeline;
        this.input = new Input;
        this.scene = new Root;
        this._componentScheduler = new ComponentScheduler;
        this._timeScheduler = new TimeScheduler;
        this._inputEvents = new Map;
        this._time = initial;
        this._drawCall = 0;
        const systems = [...Zero._system2priority.keys()];
        systems.sort(function (a, b) {
            return Zero._system2priority.get(b) - Zero._system2priority.get(a);
        });
        this._systems = systems;
        const commandBuffer = device.createCommandBuffer();
        this._commandBuffer = commandBuffer;
        const presentSemaphore = device.createSemaphore();
        this._presentSemaphore = presentSemaphore;
        const renderSemaphore = device.createSemaphore();
        this._renderSemaphore = renderSemaphore;
        const renderFence = device.createFence();
        this._renderFence = renderFence;
        Zero._instance = this;
    }
    initialize() {
        this.start();
        return this;
    }
    attach() {
        attach(this);
    }
    detach() {
        detach(this);
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
        this._inputEvents.set(TouchEventName.START, event);
    }
    onTouchMove(event) {
        this._inputEvents.set(TouchEventName.MOVE, event);
    }
    onTouchEnd(event) {
        this._inputEvents.set(TouchEventName.END, event);
    }
    onGesturePinch(event) {
        this._inputEvents.set(TouchEventName.PINCH, event);
    }
    onGestureRotate(event) {
        this._inputEvents.set(TouchEventName.ROTATE, event);
    }
    onFrame() {
        this.emit(ZeroEvent.LOGIC_START);
        const time = now();
        const delta = (time - this._time) / 1000;
        this._time = time;
        for (const [name, event] of this._inputEvents) {
            this.input.emit(name, event);
        }
        this._inputEvents.clear();
        this._componentScheduler.update(delta);
        this._timeScheduler.update();
        for (const system of this._systems) {
            system.update(delta);
        }
        this._componentScheduler.lateUpdate();
        for (const system of this._systems) {
            system.lateUpdate(delta);
        }
        this.emit(ZeroEvent.LOGIC_END);
        this.emit(ZeroEvent.RENDER_START);
        device.acquire(this._presentSemaphore);
        this.scene.update();
        this.pipeline.update();
        FrameChangeRecord.frameId++;
        this._commandBuffer.begin();
        this._drawCall = this.pipeline.record(this._commandBuffer, this.scene.cameras);
        this._commandBuffer.end();
        this.emit(ZeroEvent.RENDER_END);
        const submitInfo = new SubmitInfo;
        submitInfo.commandBuffer = this._commandBuffer;
        submitInfo.waitSemaphore = this._presentSemaphore;
        submitInfo.waitDstStageMask = PipelineStageFlagBits.PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
        submitInfo.signalSemaphore = this._renderSemaphore;
        device.queue.submit(submitInfo, this._renderFence);
        device.queue.present(this._renderSemaphore);
        device.queue.waitFence(this._renderFence);
    }
}
Zero._system2priority = new Map;
