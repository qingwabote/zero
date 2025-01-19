export class Pipeline {
    constructor(data, ubos, flows) {
        this.data = data;
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
    batch(context) {
        for (let i = 0; i < context.scene.cameras.length; i++) {
            for (const flow of this.flows) {
                flow.batch(context, i);
            }
        }
    }
    upload(context) {
        for (const ubo of this.ubos) {
            ubo.upload(context, this._dumping);
        }
        this._dumping = false;
    }
    render(context) {
        for (let i = 0; i < context.scene.cameras.length; i++) {
            for (const flow of this.flows) {
                flow.render(context, i);
            }
        }
    }
}
