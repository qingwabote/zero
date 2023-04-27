import SpriteFrame from "../../assets/SpriteFrame.js";
import AssetLib from "../../core/AssetLib.js";
import Node from "../../core/Node.js";
import SpriteRenderer from "../SpriteRenderer.js";
import UIContainer from "./UIContainer.js";
import UIRenderer from "./UIRenderer.js";

const texture_splash_info = { path: '../../assets/images/splash', type: SpriteFrame };
AssetLib.preloaded.push(texture_splash_info);

export default class Slider extends UIContainer {
    private _background: UIRenderer<SpriteRenderer>;

    constructor(node: Node) {
        super(node);

        const bg = UIRenderer.create(SpriteRenderer);
        bg.impl.spriteFrame = AssetLib.instance.get(texture_splash_info);
        this.addElement(bg);
        this._background = bg;
    }
}