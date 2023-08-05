import { Component } from "../../core/Component.js";
import { Model } from "../../core/render/scene/Model.js";

export abstract class ModelRenderer extends Component {
    abstract get model(): Model | undefined
}