import { Camera, Node, Pipeline, TextRenderer, Texture, TouchEventName, VisibilityFlagBits, Zero, bundle as builtin, device, render, safeArea, vec3 } from "engine";
import { Align, Document, Edge, ElementContainer, FlexDirection, Gutter, Renderer } from "flex";
import CuttingBoard, { CuttingBoardEventType } from "./CuttingBoard.js";

const favicon = await builtin.cache('favicon.ico', Texture);

const normal = await (await builtin.cache('pipelines/unlit', Pipeline)).createRenderPipeline();
const msaa = await (await builtin.cache('pipelines/unlit-ms', Pipeline)).createRenderPipeline();
const fxaa = await (await builtin.cache('pipelines/unlit-fxaa', Pipeline)).createRenderPipeline();

const text_color_normal = [0.5, 0.5, 0.5, 1] as const;
const text_color_selected = [0, 1, 0, 1] as const;

export default class App extends Zero {
    private _pipelineTextSelected: TextRenderer | undefined = undefined;

    start(): render.Pipeline {
        const { width, height } = device.swapchain;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.DEFAULT;
        const doc = node.addComponent(Document);
        doc.alignItems = Align.Center
        doc.setWidth(width);
        doc.setHeight(height);
        doc.setPadding(Edge.Top, safeArea.top);

        const pipelineBar = (new Node).addComponent(ElementContainer);
        pipelineBar.flexDirection = FlexDirection.Row;
        pipelineBar.setGap(Gutter.Column, 16)
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'NORMAL';
            textRenderer.impl.color = text_color_normal;
            textRenderer.emitter.on(TouchEventName.START, async event => {
                this.onPipelineText(normal, textRenderer.impl)
            })
            this.onPipelineText(normal, textRenderer.impl);
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'MSAA';
            textRenderer.impl.color = text_color_normal;
            textRenderer.emitter.on(TouchEventName.START, async event => {
                this.onPipelineText(msaa, textRenderer.impl)
            })
            pipelineBar.addElement(textRenderer);
        }
        {
            const textRenderer = Renderer.create(TextRenderer);
            textRenderer.impl.text = 'FXAA';
            textRenderer.impl.color = text_color_normal;
            textRenderer.emitter.on(TouchEventName.START, async event => {
                this.onPipelineText(fxaa, textRenderer.impl)
            })
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
        })
        doc.addElement(cuttingBoard);

        return normal;
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

(new App).initialize();

