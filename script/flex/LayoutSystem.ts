import { System, Zero } from 'engine';
import { Document } from './Document.js';

export class LayoutSystem extends System {

    static readonly instance = new LayoutSystem();

    private _documents: Set<Document> = new Set;

    addDocument(doc: Document) {
        this._documents.add(doc)
    }

    override lateUpdate(dt: number): void {
        for (const doc of this._documents) {
            doc.calculateLayout()
        }

        for (const doc of this._documents) {
            doc.applyLayout();
        }
    }
}

Zero.registerSystem(LayoutSystem.instance, 0)