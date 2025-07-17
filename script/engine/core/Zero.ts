import { EventEmitter } from "bastard";
import * as boot from "boot";
import { PipelineStageFlagBits, SubmitInfo } from "gfx";
import { Component } from "./Component.js";
import { Input } from "./Input.js";
import { Profile } from "./Profile.js";
import { System } from "./System.js";
import { escapee } from "./escapism/Escapee.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { Pipeline } from "./render/Pipeline.js";
import { Scene } from "./render/Scene.js";
import { Status } from "./render/pipeline/Status.js";
import { quad } from "./render/quad.js";
import { ModelArray } from "./render/scene/ModelArray.js";
import { ModelCollection } from "./render/scene/ModelCollection.js";

enum Event {
    FRAME_START = 'FRAME_START',
    UPDATE = 'UPDATE',
    LATE_UPDATE = 'LATE_UPDATE',
    SCENE_UPDATE = 'SCENE_UPDATE',
    PIPELINE_UPDATE = 'PIPELINE_UPDATE',
    SCENE_CULL = 'SCENE_CULL',
    PIPELINE_BATCH = 'PIPELINE_BATCH',
    DEVICE_SYNC = 'DEVICE_SYNC',
    RENDER = 'RENDER',
    FRAME_END = 'FRAME_END',
}

interface EventToListener {
    [Event.FRAME_START]: () => void;
    [Event.UPDATE]: () => void;
    [Event.LATE_UPDATE]: () => void;
    [Event.SCENE_UPDATE]: () => void;
    [Event.PIPELINE_UPDATE]: () => void;
    [Event.SCENE_CULL]: () => void;
    [Event.PIPELINE_BATCH]: () => void;
    [Event.DEVICE_SYNC]: () => void;
    [Event.RENDER]: () => void;
    [Event.FRAME_END]: () => void;
}

enum Phase {
    UPDATE,
    LATE_UPDATE,
    SCENE_UPDATE,
    PIPELINE_UPDATE,
    SCENE_CULL,
    PIPELINE_BATCH,
    DEVICE_SYNC,
    RENDER,
    _COUNT
}

export abstract class Zero extends EventEmitter.Impl<EventToListener> implements boot.EventListener {
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
    public readonly status = new Status;

    readonly profile: Profile<typeof Phase> = new Profile(Phase._COUNT);

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

        let time = boot.now();
        let t;
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
        this.profile.record(Phase.LATE_UPDATE, (t = boot.now()) - time);
        time = t;

        this.scene.update();
        this.emit(Event.SCENE_UPDATE);
        this.profile.record(Phase.SCENE_UPDATE, (t = boot.now()) - time);
        time = t;

        this._pipeline.update();
        this.emit(Event.PIPELINE_UPDATE);
        this.profile.record(Phase.PIPELINE_UPDATE, (t = boot.now()) - time);
        time = t;

        this._pipeline.cull();
        this.emit(Event.SCENE_CULL);
        this.profile.record(Phase.SCENE_CULL, (t = boot.now()) - time);
        time = t;

        this._pipeline.batch(this.scene);
        this.emit(Event.PIPELINE_BATCH);
        this.profile.record(Phase.PIPELINE_BATCH, (t = boot.now()) - time);
        time = t;

        boot.device.waitForFence(this._fence);
        boot.device.swapchain.acquire(this._swapchainUsable);
        this.emit(Event.DEVICE_SYNC);
        this.profile.record(Phase.DEVICE_SYNC, (t = boot.now()) - time);
        time = t;

        const cmd = this._commandBuffer;
        cmd.begin();
        this._componentScheduler.upload(cmd);
        quad.indexBufferView.update(cmd);
        this._pipeline.render(this.status.clear(), this.scene, cmd);
        escapee.render(cmd);
        cmd.end();
        this.emit(Event.RENDER);
        this.profile.record(Phase.RENDER, (t = boot.now()) - time);
        this.profile.update();

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
Zero.Phase = Phase;

export declare namespace Zero {
    export { Event, Phase }
}