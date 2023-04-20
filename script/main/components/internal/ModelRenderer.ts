import Component from "../../core/Component.js";
import Model from "../../core/scene/Model.js";

export default abstract class ModelRenderer extends Component {
    abstract get model(): Model | undefined
}