import { Camera, Input, Node, Pipeline, TextRenderer, Texture, Zero, bundle as builtin, device, render, safeArea, vec3 } from "engine";
import { Align, Document, Edge, ElementContainer, FlexDirection, Gutter, PositionType, Profiler, Renderer } from "flex";
import { CuttingBoard } from "./CuttingBoard.js";

const favicon = await builtin.cache('favicon.ico', Texture);

const normal = await (await builtin.cache('pipelines/unlit', Pipeline)).instantiate();
const msaa = await (await builtin.cache('pipelines/unlit-ms', Pipeline)).instantiate();
const fxaa = await (await builtin.cache('pipelines/unlit-fxaa', Pipeline)).instantiate();

const text_color_normal = [0.5, 0.5, 0.5, 1] as const;
const text_color_selected = [0, 1, 0, 1] as const;

const text_size = 64;

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 29,
    WORLD = 1 << 30,
    ALL = 0xffffffff
}

export default class App extends Zero {
    private _pipelineTextSelected: TextRenderer | undefined = undefined;

    start() {
        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;

        const scaleX = w / width;
        const scaleY = h / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        let node: Node;

        node = new Node;
        const camera = node.addComponent(Camera);
        camera.orthoSize = h / scale / 2;
        camera.visibilities = VisibilityFlagBits.UI;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.alignItems = Align.Center
        doc.setWidth(width);
        doc.setHeight(height);
        doc.setPadding(Edge.Top, safeArea.top / scale);

        const pipelineBar = (new Node).addComponent(ElementContainer);
        pipelineBar.flexDirection = FlexDirection.Row;
        pipelineBar.setGap(Gutter.Column, 16)
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'NORMAL';
            textRenderer.impl.color = text_color_normal;
            textRenderer.impl.size = text_size;
            textRenderer.emitter.on(Input.TouchEvents.START, async event => {
                this.onPipelineText(normal, textRenderer.impl)
            })
            this.onPipelineText(normal, textRenderer.impl);
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'MSAA';
            textRenderer.impl.color = text_color_normal;
            textRenderer.impl.size = text_size;
            textRenderer.emitter.on(Input.TouchEvents.START, async event => {
                this.onPipelineText(msaa, textRenderer.impl)
            })
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'FXAA';
            textRenderer.impl.color = text_color_normal;
            textRenderer.impl.size = text_size;
            textRenderer.emitter.on(Input.TouchEvents.START, async event => {
                this.onPipelineText(fxaa, textRenderer.impl)
            })
            pipelineBar.addElement(textRenderer);
        }
        doc.addElement(pipelineBar);

        node = new Node;
        const cuttingBoard = node.addComponent(CuttingBoard);
        cuttingBoard.texture = favicon.impl;
        cuttingBoard.setWidthPercent(100);
        cuttingBoard.setHeightPercent(100);
        cuttingBoard.emitter.on(CuttingBoard.EventType.POLYGONS_CHANGED, () => {
            if (cuttingBoard.polygons.length > 9) {
                cuttingBoard.reset();
            }
        })
        doc.addElement(cuttingBoard);

        const profiler = (new Node).addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);
    }

    private onPipelineText(pipeline: render.Pipeline, renderer: TextRenderer) {
        if (this._pipelineTextSelected) {
            this._pipelineTextSelected.color = text_color_normal
        }
        this.pipeline = pipeline;
        renderer.color = text_color_selected;
        this._pipelineTextSelected = renderer;
    }
}

(new App(normal)).initialize().attach();

