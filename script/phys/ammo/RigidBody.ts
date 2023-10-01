import { MotionState } from "./MotionState.js";
import { Shape } from "./Shape.js";
import { Transform } from "./Transform.js";
import { impl as ammo } from "./context.js";

const bt_vec3_a = new ammo.btVector3(0, 0, 0);
const bt_transform_a = new ammo.btTransform();

export class RigidBody {
    readonly impl: any;

    private _mass: number = 0;
    get mass(): number {
        return this._mass;
    }
    set mass(value: number) {
        const shape = ammo.castObject(this.impl.getCollisionShape(), ammo.btCompoundShape);
        bt_vec3_a.setValue(0, 0, 0);
        shape.calculateLocalInertia(value, bt_vec3_a);
        this.impl.setMassProps(value, bt_vec3_a);

        this._mass = value;
    }

    private _worldTransform = new Transform(null);
    get worldTransform(): Transform {
        this._worldTransform.impl = this.impl.getWorldTransform();
        return this._worldTransform;
    }

    set worldTransform(transform: Transform) {
        this.impl.setWorldTransform(transform.impl);
    }

    constructor(motionState: MotionState) {
        const info = new ammo.btRigidBodyConstructionInfo(1, motionState.impl, new ammo.btCompoundShape());
        this.impl = new ammo.btRigidBody(info);
        ammo.destroy(info);

        // bt_vec3_a.setValue(0, 0, 0);
        // this.impl.setMassProps(0, bt_vec3_a);
    }

    addShape(shape: Shape) {
        bt_transform_a.setIdentity();
        ammo.castObject(this.impl.getCollisionShape(), ammo.btCompoundShape).addChildShape(bt_transform_a, shape.impl);
    }

    updateShapeTransform(shape: Shape, transform: Transform) {
        let index = -1;
        const compound = ammo.castObject(this.impl.getCollisionShape(), ammo.btCompoundShape);
        for (let i = 0; i < compound.getNumChildShapes(); i++) {
            if (ammo.compare(compound.getChildShape(i), shape.impl)) {
                index = i;
            }
        }
        compound.updateChildTransform(index, transform.impl);
    }
}