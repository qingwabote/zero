import { System, Zero } from 'engine';
export class LayoutSystem extends System {
    constructor() {
        super(...arguments);
        this._documents = new Set;
    }
    addDocument(doc) {
        this._documents.add(doc);
    }
    lateUpdate(dt) {
        for (const doc of this._documents) {
            doc.calculateLayout();
        }
        for (const doc of this._documents) {
            doc.applyLayout();
        }
    }
}
LayoutSystem.instance = new LayoutSystem();
Zero.registerSystem(LayoutSystem.instance, 0);
