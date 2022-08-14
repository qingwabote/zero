import Input from "../../core/Input.js";
export default class WebInput extends Input {
    _canvas;
    constructor(canvas) {
        super();
        canvas.addEventListener("mousedown", (mouseEvent) => {
            this.emit("TOUCH_START", this.createEvent(mouseEvent));
        });
        canvas.addEventListener("mousemove", (mouseEvent) => {
            if (mouseEvent.buttons) {
                this.emit("TOUCH_MOVE", this.createEvent(mouseEvent));
            }
        });
        canvas.addEventListener("mouseup", (mouseEvent) => {
            this.emit("TOUCH_END", this.createEvent(mouseEvent));
        });
        this._canvas = canvas;
    }
    createEvent(mouseEvent) {
        return { touches: [{ x: mouseEvent.offsetX, y: this._canvas.height - mouseEvent.offsetY }] };
    }
}
//# sourceMappingURL=WebInput.js.map