import SubModel from "./SubModel.js";

export default class Model {
    private _subModels: SubModel[];
    get subModels(): SubModel[] {
        return this._subModels;
    }

    constructor(subModels: SubModel[]) {
        this._subModels = subModels;
    }
}