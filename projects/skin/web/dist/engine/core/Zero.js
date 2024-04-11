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
    get commandCalls() {
        return this._commandCalls;
    }
    get pipeline() {
        return this._pipeline;
    }
    set pipeline(value) {
        this._pipeline = value;
        this._pipeline_changed = true;
    }
    constructor(_pipeline) {
        super();
        this._pipeline = _pipeline;
        this.input = new Input;
        this.scene = new Root;
        this._componentScheduler = new ComponentScheduler;
        this._timeScheduler = new TimeScheduler;
        this._commandBuffer = device.createCommandBuffer();
        this._presentSemaphore = device.createSemaphore();
        this._renderSemaphore = device.createSemaphore();
        this._renderFence = device.createFence();
        this._inputEvents = new Map;
        this._time = initial;
        this._commandCalls = { renderPasses: 0, draws: 0 };
        this._pipeline_changed = true;
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
        if (this._pipeline_changed) {
            this._pipeline.use();
            this._pipeline_changed = false;
        }
        this.scene.update();
        this._pipeline.update();
        FrameChangeRecord.frameId++;
        this._commandBuffer.begin();
        this._commandCalls.renderPasses = 0;
        this._commandCalls.draws = 0;
        for (let i = 0; i < this.scene.cameras.length; i++) {
            this._pipeline.record(this._commandCalls, this._commandBuffer, i);
        }
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
