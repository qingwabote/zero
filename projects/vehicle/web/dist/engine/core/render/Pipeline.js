export class Pipeline {
    constructor(data, textures, ubos, flows) {
        this.data = data;
        this.textures = textures;
        this.ubos = ubos;
        this.flows = flows;
        this._dumping = false;
    }
    dump() {
        this._dumping = true;
    }
    update(context) {
        this.data.update(context.profile, this._dumping);
    }
    batch(context, commandBuffer) {
        for (let i = 0; i < context.scene.cameras.length; i++) {
            for (const flow of this.flows) {
                flow.batch(context, commandBuffer, i);
            }
        }
    }
    upload(context, commandBuffer) {
        for (const ubo of this.ubos) {
            ubo.upload(context, commandBuffer, this._dumping);
        }
        this._dumping = false;
    }
    render(context, commandBuffer) {
        for (let i = 0; i < context.scene.cameras.length; i++) {
            for (const flow of this.flows) {
                flow.render(context, commandBuffer, i);
            }
        }
    }
}
