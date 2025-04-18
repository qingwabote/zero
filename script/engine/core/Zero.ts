import { EventEmitter } from "bastard";
import * as boot from "boot";
import { PipelineStageFlagBits, SubmitInfo } from "gfx";
import { Component } from "./Component.js";
import { Input } from "./Input.js";
import { System } from "./System.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { Context } from "./render/Context.js";
import { Pipeline } from "./render/Pipeline.js";
import { Scene } from "./render/Scene.js";
import { Profile } from "./render/pipeline/Profile.js";
import { quad } from "./render/quad.js";
import { ModelArray } from "./render/scene/ModelArray.js";
import { ModelCollection } from "./render/scene/ModelCollection.js";

enum Event {
    FRAME_START = 'FRAME_START',
    UPDATE = 'UPDATE',
    LATE_UPDATE = 'LATE_UPDATE',
    SCENE_UPDATE = 'SCENE_UPDATE',
    PIPELINE_UPDATE = 'PIPELINE_UPDATE',
    DEVICE_SYNC = 'DEVICE_SYNC',
    PIPELINE_BATCH = 'PIPELINE_BATCH',
    UPLOAD = 'UPLOAD',
    RENDER = 'RENDER',
    FRAME_END = 'FRAME_END',
}

interface EventToListener {
    [Event.FRAME_START]: () => void;
    [Event.UPDATE]: () => void;
    [Event.LATE_UPDATE]: () => void;
    [Event.SCENE_UPDATE]: () => void;
    [Event.PIPELINE_UPDATE]: () => void;
    [Event.DEVICE_SYNC]: () => void;
    [Event.PIPELINE_BATCH]: () => void;
    [Event.UPLOAD]: () => void;
    [Event.RENDER]: () => void;
    [Event.FRAME_END]: () => void;
}

export abstract class Zero extends EventEmitter.Impl<EventToListener> implements Context, boot.EventListener {
    private static _frameCount = 1;
    public static get frameCount(): number {
        return this._frameCount;
    }

    private static _instance: Zero;
    public static get instance(): Zero {
        return Zero._instance;
    }

    private static readonly _system2priority: Map<System, number> = new Map;

    static registerSystem(system: System, priority: number) {
        this._system2priority.set(system, priority);
    }

    static unregisterSystem(system: System) {
        if (!this._system2priority.delete(system)) {
            throw new Error("unregisterSystem");
        }
    }

    private readonly _input = new Input;
    public get input(): Input.Readonly {
        return this._input;
    }

    private readonly _componentScheduler = new ComponentScheduler;

    private readonly _timeScheduler = new TimeScheduler;

    private readonly _systems: readonly System[];

    private readonly _commandBuffer = boot.device.createCommandBuffer();
    private readonly _swapchainUsable = boot.device.createSemaphore();
    private readonly _queueExecuted = boot.device.createSemaphore();
    private readonly _fence = boot.device.createFence(true);

    private _time = boot.now();

    public get pipeline(): Pipeline {
        return this._pipeline;
    }
    public set pipeline(value: Pipeline) {
        this._pipeline = value;
        this._pipeline.dump();
    }

    public readonly scene: Scene;
    public readonly profile = new Profile;

    constructor(private _pipeline: Pipeline, models: ModelCollection = new ModelArray) {
        super();

        this.scene = new Scene(models)

        const systems: System[] = [...Zero._system2priority.keys()];
        systems.sort(function (a, b) {
            return Zero._system2priority.get(b)! - Zero._system2priority.get(a)!;
        })
        this._systems = systems;

        Zero._instance = this;
    }

    initialize() {
        this.start();
        return this;
    }

    protected abstract start(): void;

    attach() {
        boot.attach(this);
    }

    detach() {
        boot.detach(this);
    }

    addComponent(com: Component): void {
        this._componentScheduler.add(com);
    }

    setInterval(func: (dt: number) => void, delay: number = 0) {
        return this._timeScheduler.setInterval(func, delay);
    }

    clearInterval(func: () => void) {
        this._timeScheduler.clearInterval(func);
    }

    onTouchStart(event: boot.TouchEvent) {
        this._input.onTouchStart(event);
    }
    onTouchMove(event: boot.TouchEvent) {
        this._input.onTouchMove(event);
    }
    onTouchEnd(event: boot.TouchEvent) {
        this._input.onTouchEnd(event);
    }
    onWheel(event: boot.WheelEvent) {
        this._input.onWheel(event);
    }
    onFrame() {
        this.emit(Event.FRAME_START);

        const time = boot.now();
        const delta = (time - this._time) / 1000;
        this._time = time;

        this._timeScheduler.update(delta);

        // updates component, responds to user input
        this._componentScheduler.update(delta);
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

        const cmd = this._commandBuffer;
        cmd.begin();
        this._pipeline.batch(this, cmd);
        this.emit(Event.PIPELINE_BATCH);

        this._componentScheduler.upload(cmd);
        quad.indexBufferView.update(cmd);
        this._pipeline.upload(this, cmd);
        this.emit(Event.UPLOAD);

        this._pipeline.render(this, cmd);
        cmd.end();
        this.emit(Event.RENDER);

        const submitInfo = new SubmitInfo;
        submitInfo.commandBuffer = cmd;
        submitInfo.waitSemaphore = this._swapchainUsable;
        submitInfo.waitDstStageMask = PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT;
        submitInfo.signalSemaphore = this._queueExecuted;
        boot.device.queue.submit(submitInfo, this._fence);
        boot.device.queue.present(this._queueExecuted);
        this.emit(Event.FRAME_END);

        Zero._frameCount++;
    }
}
Zero.Event = Event;

export declare namespace Zero {
    export { Event }
}