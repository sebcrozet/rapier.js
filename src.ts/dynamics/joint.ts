import {Rotation, Vector, VectorOps, RotationOps} from "../math";
import {RawJointParams, RawJointSet, RawRigidBodySet} from "../raw";
import {RigidBodyHandle} from "./rigid_body"
// #if DIM3
import {Quaternion} from "../math";
// #endif

/**
 * The integer identifier of a collider added to a `ColliderSet`.
 */
export type JointHandle = number;

/**
 * An enum grouping all possible types of joints:
 * - `Ball`: A Ball joint that removes all relative linear degrees of freedom between the affected bodies.
 * - `Fixed`: A fixed joint that removes all relative degrees of freedom between the affected bodies.
 * - `Prismatic`: A prismatic joint that removes all degrees of freedom between the affected
 *                bodies except for the translation along one axis.
 * - `Revolute`: (3D only) A revolute joint that removes all degrees of freedom between the affected
 *               bodies except for the rotation along one axis.
 */
export enum JointType {
    Ball,
    Fixed,
    Prismatic,
    // #if DIM3
    Revolute,
    // #endif
}

export enum SpringModel {
    Disabled,
    VelocityBased,
    AccelerationBased,
    ForceBased,
}

export class Joint {
    protected rawSet: RawJointSet; // The Joint won't need to free this.
    handle: JointHandle;

    constructor(rawSet: RawJointSet, handle: JointHandle) {
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /**
     * Checks if this joint is still valid (i.e. that it has
     * not been deleted from the joint set yet).
     */
    public isValid(): boolean {
        return this.rawSet.contains(this.handle);
    }

    /**
     * The unique integer identifier of the first rigid-body this joint it attached to.
     */
    public bodyHandle1(): RigidBodyHandle {
        return this.rawSet.jointBodyHandle1(this.handle);
    }

    /**
     * The unique integer identifier of the second rigid-body this joint is attached to.
     */
    public bodyHandle2(): RigidBodyHandle {
        return this.rawSet.jointBodyHandle2(this.handle);
    }

    /**
     * The type of this joint given as a string.
     */
    public type(): JointType {
        return this.rawSet.jointType(this.handle);
    }

    // #if DIM3
    /**
     * The rotation quaternion that aligns this joint's first local axis to the `x` axis.
     * @param target - The target Rotation object to write to.
     */
    public frameX1(target?: Rotation): Rotation {
        return RotationOps.fromRaw(this.rawSet.jointFrameX1(this.handle), target);
    }

    // #endif

    // #if DIM3
    /**
     * The rotation matrix that aligns this joint's second local axis to the `x` axis.
     * @param target - The target Rotation object to write to.
     */
    public frameX2(target?: Rotation): Rotation {
        return RotationOps.fromRaw(this.rawSet.jointFrameX2(this.handle), target);
    }

    // #endif

    /**
     * The position of the first anchor of this joint.
     *
     * The first anchor gives the position of the points application point on the
     * local frame of the first rigid-body it is attached to.
     * @param target - The target Vector object to write to.
     */
    public anchor1(target?: Vector): Vector {
        return VectorOps.fromRaw(this.rawSet.jointAnchor1(this.handle), target);
    }

    /**
     * The position of the second anchor of this joint.
     *
     * The second anchor gives the position of the points application point on the
     * local frame of the second rigid-body it is attached to.
     */
    public anchor2(target?: Vector): Vector {
        return VectorOps.fromRaw(this.rawSet.jointAnchor2(this.handle), target);
    }

    /**
     * The first axis of this joint, if any.
     *
     * For joints where an application axis makes sense (e.g. the revolute and prismatic joins),
     * this returns the application axis on the first rigid-body this joint is attached to, expressed
     * in the local-space of this first rigid-body.
     */
    public axis1(target?: Vector): Vector {
        return VectorOps.fromRaw(this.rawSet.jointAxis1(this.handle), target);
    }

    /**
     * The second axis of this joint, if any.
     *
     * For joints where an application axis makes sense (e.g. the revolute and prismatic joins),
     * this returns the application axis on the second rigid-body this joint is attached to, expressed
     * in the local-space of this second rigid-body.
     */
    public axis2(target?: Vector): Vector {
        return VectorOps.fromRaw(this.rawSet.jointAxis2(this.handle), target)
    }
}

export class UnitJoint extends Joint {
    /**
     * Are the limits enabled for this joint?
     */
    public limitsEnabled(): boolean {
        return this.rawSet.jointLimitsEnabled(this.handle);
    }

    /**
     * The min limit of this joint.
     */
    public limitsMin(): number {
        return this.rawSet.jointLimitsMin(this.handle);
    }

    /**
     * The max limit of this joint.
     */
    public limitsMax(): number {
        return this.rawSet.jointLimitsMax(this.handle);
    }

    public configureMotorModel(model: SpringModel) {
        this.rawSet.jointConfigureMotorModel(this.handle, model);
    }

    public configureMotorVelocity(targetVel: number, factor: number) {
        this.rawSet.jointConfigureUnitMotorVelocity(this.handle, targetVel, factor);
    }

    public configureMotorPosition(targetPos: number, stiffness: number, damping: number) {
        this.rawSet.jointConfigureUnitMotorPosition(this.handle, targetPos, stiffness, damping);
    }

    public configureMotor(targetPos: number, targetVel: number, stiffness: number, damping: number) {
        this.rawSet.jointConfigureUnitMotor(this.handle, targetPos, targetVel, stiffness, damping);
    }
}

export class FixedJoint extends Joint {}
export class PrismaticJoint extends UnitJoint {}

// #if DIM2
export class BallJoint extends UnitJoint {}
// #endif

// #if DIM3
export class BallJoint extends Joint {
    public configureMotorModel(model: SpringModel) {
        this.rawSet.jointConfigureMotorModel(this.handle, model);
    }

    public configureMotorVelocity(targetVel: Vector, factor: number) {
        this.rawSet.jointConfigureBallMotorVelocity(this.handle, targetVel.x, targetVel.y, targetVel.z, factor);
    }

    public configureMotorPosition(targetPos: Quaternion, stiffness: number, damping: number) {
        this.rawSet.jointConfigureBallMotorPosition(this.handle, targetPos.w, targetPos.x, targetPos.y, targetPos.z, stiffness, damping);
    }

    public configureMotor(targetPos: Quaternion, targetVel: Vector, stiffness: number, damping: number) {
        this.rawSet.jointConfigureBallMotor(this.handle,
            targetPos.w, targetPos.x, targetPos.y, targetPos.z,
            targetVel.x, targetVel.y, targetVel.z,
            stiffness, damping);
    }
}

export class RevoluteJoint extends UnitJoint {}
// #endif



export class JointParams {
    anchor1: Vector
    anchor2: Vector
    axis1: Vector
    axis2: Vector
    tangent1: Vector
    tangent2: Vector
    frame1: Rotation
    frame2: Rotation
    jointType: JointType
    limitsEnabled: boolean
    limits: Array<number>

    private constructor() {
    }

    /**
     * Create a new joint descriptor that builds Ball joints.
     *
     * A ball joints allows three relative rotational degrees of freedom
     * by preventing any relative translation between the anchors of the
     * two attached rigid-bodies.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     */
    public static ball(anchor1: Vector, anchor2: Vector): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.jointType = JointType.Ball;
        return res;
    }

    /**
     * Creates a new joint descriptor that builds a Fixed joint.
     *
     * A fixed joint removes all the degrees of freedom between the affected bodies, ensuring their
     * anchor and local frames coincide in world-space.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param frame1 - The reference orientation of the joint wrt. the first rigid-body.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param frame2 - The reference orientation of the joint wrt. the second rigid-body.
     */
    public static fixed(anchor1: Vector, frame1: Rotation, anchor2: Vector, frame2: Rotation): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.frame1 = frame1;
        res.frame2 = frame2;
        res.jointType = JointType.Fixed;
        return res;
    }

    // #if DIM2
    /**
     * Creates a new joint descriptor that builds a Prismatic joint.
     *
     * A prismatic joint removes all the degrees of freedom between the
     * affected bodies, except for the translation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis1 - Axis of the joint, expressed in the local-space of the first rigid-body it is attached to.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis2 - Axis of the joint, expressed in the local-space of the second rigid-body it is attached to.
     */
    public static prismatic(anchor1: Vector, axis1: Vector, anchor2: Vector, axis2: Vector): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.axis1 = axis1;
        res.anchor2 = anchor2;
        res.axis2 = axis2;
        res.jointType = JointType.Prismatic;
        return res;
    }

    // #endif

    // #if DIM3

    /**
     * Creates a new joint descriptor that builds a Prismatic joint.
     *
     * A prismatic joint removes all the degrees of freedom between the
     * affected bodies, except for the translation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis1 - Axis of the joint, expressed in the local-space of the first rigid-body it is attached to.
     * @param tangent1 - A vector orthogonal to `axis1`. It is used to compute a basis orthonormal
     *                   to the joint's axis. If this tangent is set to the zero vector, the orthonormal
     *                   basis will be automatically computed arbitrarily.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis2 - Axis of the joint, expressed in the local-space of the second rigid-body it is attached to.
     * @param tangent2 - A vector orthogonal to `axis2`. It is used to compute a basis orthonormal
     *                   to the joint's axis. If this tangent is set to the zero vector, the orthonormal
     *                   basis will be automatically computed arbitrarily.
     */
    public static prismatic(
        anchor1: Vector,
        axis1: Vector,
        tangent1: Vector,
        anchor2: Vector,
        axis2: Vector,
        tangent2: Vector,
    ): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.axis1 = axis1;
        res.tangent1 = tangent1;
        res.anchor2 = anchor2;
        res.axis2 = axis2;
        res.tangent2 = tangent2;
        res.jointType = JointType.Prismatic;
        return res;
    }

    /**
     * Create a new joint descriptor that builds Revolute joints.
     *
     * A revolute joint removes all degrees of freedom between the affected
     * bodies except for the rotation along one axis.
     *
     * @param anchor1 - Point where the joint is attached on the first rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis1 - Axis of the joint, expressed in the local-space of the first rigid-body it is attached to.
     * @param anchor2 - Point where the joint is attached on the second rigid-body affected by this joint. Expressed in the
     *                  local-space of the rigid-body.
     * @param axis2 - Axis of the joint, expressed in the local-space of the second rigid-body it is attached to.
     */
    public static revolute(
        anchor1: Vector,
        axis1: Vector,
        anchor2: Vector,
        axis2: Vector,
    ): JointParams {
        let res = new JointParams();
        res.anchor1 = anchor1;
        res.anchor2 = anchor2;
        res.axis1 = axis1;
        res.axis2 = axis2;
        res.jointType = JointType.Revolute;
        return res;
    }

    // #endif

    public intoRaw(): RawJointParams {
        let rawA1 = VectorOps.intoRaw(this.anchor1);
        let rawA2 = VectorOps.intoRaw(this.anchor2);
        let rawAx1;
        let rawAx2;
        let result;
        let limitsEnabled = false;
        let limitsMin = 0.0;
        let limitsMax = 0.0;

        switch (this.jointType) {
            case JointType.Ball:
                result = RawJointParams.ball(rawA1, rawA2);
                break;
            case JointType.Fixed:
                let rawFra1 = RotationOps.intoRaw(this.frame1);
                let rawFra2 = RotationOps.intoRaw(this.frame2);
                result = RawJointParams.fixed(rawA1, rawFra1, rawA2, rawFra2);
                rawFra1.free();
                rawFra2.free();
                break;
            case JointType.Prismatic:
                rawAx1 = VectorOps.intoRaw(this.axis1);
                rawAx2 = VectorOps.intoRaw(this.axis2);

                if (!!this.limitsEnabled) {
                    limitsEnabled = true;
                    limitsMin = this.limits[0];
                    limitsMax = this.limits[1];
                }

                // #if DIM2
                result = RawJointParams.prismatic(
                    rawA1,
                    rawAx1,
                    rawA2,
                    rawAx2,
                    limitsEnabled,
                    limitsMin,
                    limitsMax,
                );
                // #endif

                // #if DIM3
                let rawTa1 = VectorOps.intoRaw(this.tangent1);
                let rawTa2 = VectorOps.intoRaw(this.tangent2);
                result = RawJointParams.prismatic(
                    rawA1,
                    rawAx1,
                    rawTa1,
                    rawA2,
                    rawAx2,
                    rawTa2,
                    limitsEnabled,
                    limitsMin,
                    limitsMax,
                );
                rawTa1.free();
                rawTa2.free();
                // #endif

                rawAx1.free();
                rawAx2.free();
                break;
            // #if DIM3
            case JointType.Revolute:
                rawAx1 = VectorOps.intoRaw(this.axis1);
                rawAx2 = VectorOps.intoRaw(this.axis2);
                result = RawJointParams.revolute(rawA1, rawAx1, rawA2, rawAx2);
                rawAx1.free();
                rawAx2.free();
                break;
            // #endif
        }

        rawA1.free();
        rawA2.free();

        return result;
    }
}