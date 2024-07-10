export class View {
    get camera() {
        return this._modelsInCamera;
    }
    get shadow() {
        return this._modelsInCascades;
    }
    constructor(_scene, _camera, _shadow = null) {
        this._scene = _scene;
        this._camera = _camera;
        this._shadow = _shadow;
        this._modelsInCamera = [];
        const modelsInCascades = [];
        if (_shadow) {
            for (let i = 0; i < _shadow.num; i++) {
                modelsInCascades.push([]);
            }
        }
        this._modelsInCascades = modelsInCascades;
    }
    cull() {
        if (this._shadow) {
            const cull = this._scene.models.culler(this._shadow.num);
            for (let i = 0; i < this._shadow.num; i++) {
                this._modelsInCascades[i].length = 0;
                cull(this._modelsInCascades[i], this._shadow.boundaries[i], this._camera.visibilities);
            }
        }
        this._modelsInCamera.length = 0;
        this._scene.models.culler()(this._modelsInCamera, this._camera.frustum, this._camera.visibilities);
    }
}
