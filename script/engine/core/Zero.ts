import { EventEmitterImpl } from "bastard";
import * as boot from "boot";
import { PipelineStageFlagBits, SubmitInfo } from "gfx";
import { Component } from "./Component.js";
import { Input, TouchEventName } from "./Input.js";
import { System } from "./System.js";
import { ComponentScheduler } from "./internal/ComponentScheduler.js";
import { TimeScheduler } from "./internal/TimeScheduler.js";
import { Pipeline } from "./render/Pipeline.js";
import { Scene } from "./render/Scene.js";
import { Profile, ProfileReadonly } from "./render/pipeline/Profile.js";
import { ChangeRecord } from "./render/scene/ChangeRecord.js";
import { ModelArray } from "./render/scene/ModelArray.js";
import { ModelCollection } from "./render/scene/ModelCollection.js";

enum Event {
    LOGIC_START = 'LOGIC_START',
    LOGIC_END = 'LOGIC_END',

    RENDER_START = 'RENDER_START',
    RENDER_END = 'RENDER_END',
}

interface EventToListener {
    [Event.LOGIC_START]: () => void;
    [Event.LOGIC_END]: () => void;

    [Event.RENDER_START]: () => void;
    [Event.RENDER_END]: () => void;
}

export abstract class Zero extends EventEmitterImpl<EventToListener> implements boot.EventListener {
    static readonly Event = Event;

    private static _instance: Zero;
    public static get instance(): Zero {
        return Zero._instance;
    }

    private static readonly _system2priority: Map<System, number> = new Map;

    static registerSystem(system: System, priority: number) {
        this._system2priority.set(system, priority);
    }

    readonly input = new Input;

    private readonly _componentScheduler = new ComponentScheduler;

    private readonly _timeScheduler = new TimeScheduler;

    private readonly _systems: readonly System[];

    private readonly _commandBuffer = boot.device.createCommandBuffer();
    private readonly _presentSemaphore = boot.device.createSemaphore();
    private readonly _renderSemaphore = boot.device.createSemaphore();
    private readonly _renderFence = boot.device.createFence();

    private readonly _inputEvents: Map<TouchEventName, any> = new Map;

    private _time = boot.initial;

    private _profile = new Profile;
    public get profile(): ProfileReadonly {
        return this._profile;
    }

    public get pipeline(): Pipeline {
        return this._pipeline;
    }
    public set pipeline(value: Pipeline) {
        this._pipeline = value;
        this._pipeline.dump();
    }

    readonly scene: Scene;

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

    setInterval(func: () => void, delay: number = 0) {
        return this._timeScheduler.setInterval(func, delay);
    }

    clearInterval(func: () => void) {
        this._timeScheduler.clearInterval(func);
    }

    onTouchStart(event: boot.TouchEvent) {
        this._inputEvents.set(TouchEventName.START, event)
    }
    onTouchMove(event: boot.TouchEvent) {
        this._inputEvents.set(TouchEventName.MOVE, event)
    }
    onTouchEnd(event: boot.TouchEvent) {
        this._inputEvents.set(TouchEventName.END, event)
    }
    onGesturePinch(event: boot.GestureEvent) {
        this._inputEvents.set(TouchEventName.PINCH, event)
    }
    onGestureRotate(event: boot.GestureEvent) {
        this._inputEvents.set(TouchEventName.ROTATE, event)
    }
    onFrame() {
        this.emit(Event.LOGIC_START);

        const time = boot.now();
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
        this.emit(Event.LOGIC_END);

        this.emit(Event.RENDER_START);
        boot.device.acquire(this._presentSemaphore);
        this.scene.update();
        this._pipeline.update();
        ChangeRecord.expire();
        this._commandBuffer.begin();

        this._profile.clear();
        for (let i = 0; i < this.scene.cameras.length; i++) {
            this._pipeline.record(this._profile, this._commandBuffer, i);
        }

        this._commandBuffer.end();
        this.emit(Event.RENDER_END);

        const submitInfo = new SubmitInfo;
        submitInfo.commandBuffer = this._commandBuffer;
        submitInfo.waitSemaphore = this._presentSemaphore;
        submitInfo.waitDstStageMask = PipelineStageFlagBits.PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
        submitInfo.signalSemaphore = this._renderSemaphore;
        boot.device.queue.submit(submitInfo, this._renderFence);
        boot.device.queue.present(this._renderSemaphore);
        boot.device.queue.waitFence(this._renderFence);
    }
} 