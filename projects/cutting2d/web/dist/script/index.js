import { Camera, Node, Pipeline, TextRenderer, Texture, TouchEventName, VisibilityFlagBits, Zero, bundle as builtin, device, safeArea, vec3 } from "engine";
import { Align, Document, Edge, ElementContainer, FlexDirection, Gutter, PositionType, Profiler, Renderer } from "flex";
import CuttingBoard, { CuttingBoardEventType } from "./CuttingBoard.js";
const favicon = await builtin.cache('favicon.ico', Texture);
const normal = await (await builtin.cache('pipelines/unlit', Pipeline)).instantiate();
const msaa = await (await builtin.cache('pipelines/unlit-ms', Pipeline)).instantiate();
const fxaa = await (await builtin.cache('pipelines/unlit-fxaa', Pipeline)).instantiate();
const text_color_normal = [0.5, 0.5, 0.5, 1];
const text_color_selected = [0, 1, 0, 1];
export default class App extends Zero {
    constructor() {
        super(...arguments);
        this._pipelineTextSelected = undefined;
    }
    start() {
        const width = 640;
        const height = 960;
        const swapchain = device.swapchain;
        const scaleX = swapchain.width / width;
        const scaleY = swapchain.height / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;
        let node;
        node = new Node;
        const camera = node.addComponent(Camera);
        camera.orthoSize = swapchain.height / scale / 2;
        camera.viewport = { x: 0, y: 0, width: swapchain.width, height: swapchain.height };
        node.position = vec3.create(0, 0, width / 2);
        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.DEFAULT;
        const doc = node.addComponent(Document);
        doc.alignItems = Align.Center;
        doc.setWidth(width);
        doc.setHeight(height);
        doc.setPadding(Edge.Top, safeArea.top / scale);
        const pipelineBar = (new Node).addComponent(ElementContainer);
        pipelineBar.flexDirection = FlexDirection.Row;
        pipelineBar.setGap(Gutter.Column, 16);
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'NORMAL';
            textRenderer.impl.color = text_color_normal;
            textRenderer.emitter.on(TouchEventName.START, async (event) => {
                this.onPipelineText(normal, textRenderer.impl);
            });
            this.onPipelineText(normal, textRenderer.impl);
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'MSAA';
            textRenderer.impl.color = text_color_normal;
            textRenderer.emitter.on(TouchEventName.START, async (event) => {
                this.onPipelineText(msaa, textRenderer.impl);
            });
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'FXAA';
            textRenderer.impl.color = text_color_normal;
            textRenderer.emitter.on(TouchEventName.START, async (event) => {
                this.onPipelineText(fxaa, textRenderer.impl);
            });
            pipelineBar.addElement(textRenderer);
        }
        doc.addElement(pipelineBar);
        node = new Node;
        const cuttingBoard = node.addComponent(CuttingBoard);
        cuttingBoard.texture = favicon.impl;
        cuttingBoard.setWidth(width);
        cuttingBoard.setHeight(height);
        cuttingBoard.emitter.on(CuttingBoardEventType.POLYGONS_CHANGED, () => {
            if (cuttingBoard.polygons.length > 9) {
                cuttingBoard.reset();
            }
        });
        doc.addElement(cuttingBoard);
        const profiler = (new Node).addComponent(Profiler);
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8);
        profiler.setPosition(Edge.Bottom, 8);
        doc.addElement(profiler);
        return normal;
    }
    onPipelineText(pipeline, renderer) {
        if (this._pipelineTextSelected) {
            this._pipelineTextSelected.color = text_color_normal;
        }
        this.pipeline = pipeline;
        renderer.color = text_color_selected;
        this._pipelineTextSelected = renderer;
    }
}
(new App).initialize();
