import Input, { TouchEvent } from "../../core/Input.js";

export default class WebInput extends Input {
    private _canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        super();

        canvas.addEventListener("mousedown", (mouseEvent) => {
            this.emit("TOUCH_START", this.createEvent(mouseEvent))
        })

        canvas.addEventListener("mousemove", (mouseEvent) => {
            if (mouseEvent.buttons) {
                this.emit("TOUCH_MOVE", this.createEvent(mouseEvent))
            }
        })

        canvas.addEventListener("mouseup", (mouseEvent) => {
            this.emit("TOUCH_END", this.createEvent(mouseEvent))
        })

        this._canvas = canvas;
    }

    private createEvent(mouseEvent: MouseEvent): TouchEvent {
        return { touches: [{ x: mouseEvent.offsetX, y: this._canvas.height - mouseEvent.offsetY }] }
    }
}