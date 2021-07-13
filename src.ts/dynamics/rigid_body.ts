import {RawRigidBodySet} from "../raw"
import {Rotation, RotationOps, Vector, VectorOps} from '../math';
import {ColliderHandle} from "../geometry";

/**
 * The integer identifier of a collider added to a `ColliderSet`.
 */
export type RigidBodyHandle = number;

/**
 * The simulation status of a rigid-body.
 */
// TODO: rename this to RigidBodyType
export enum RigidBodyType {
    /**
     * A `RigidBodyType::Dynamic` body can be affected by all external forces.
     */
    Dynamic = 0,
    /**
     * A `RigidBodyType::Static` body cannot be affected by external forces.
     */
    Static,
    /**
     * A `RigidBodyType::KinematicPositionBased` body cannot be affected by any external forces but can be controlled
     * by the user at the position level while keeping realistic one-way interaction with dynamic bodies.
     *
     * One-way interaction means that a kinematic body can push a dynamic body, but a kinematic body
     * cannot be pushed by anything. In other words, the trajectory of a kinematic body can only be
     * modified by the user and is independent from any contact or joint it is involved in.
     */
    KinematicPositionBased,
    /**
     * A `RigidBodyType::KinematicVelocityBased` body cannot be affected by any external forces but can be controlled
     * by the user at the velocity level while keeping realistic one-way interaction with dynamic bodies.
     *
     * One-way interaction means that a kinematic body can push a dynamic body, but a kinematic body
     * cannot be pushed by anything. In other words, the trajectory of a kinematic body can only be
     * modified by the user and is independent from any contact or joint it is involved in.
     */
    KinematicVelocityBased,
}

/**
 * A rigid-body.
 */
export class RigidBody {
    private rawSet: RawRigidBodySet; // The RigidBody won't need to free this.
    readonly handle: RigidBodyHandle;

    constructor(rawSet: RawRigidBodySet, handle: RigidBodyHandle) {
        this.rawSet = rawSet;
        this.handle = handle;
    }

    /**
     * Checks if this rigid-body is still valid (i.e. that it has
     * not been deleted from the rigid-body set yet.
     */
    public isValid(): boolean {
        return this.rawSet.contains(this.handle);
    }

    /**
     * Locks or unlocks the ability of this rigid-body to translate.
     *
     * @param locked - If `true`, this rigid-body will no longer translate due to forces and impulses.
     * @param wakeUp - If `true`, this rigid-body will be automatically awaken if it is currently asleep.
     */
    public lockTranslations(locked: boolean, wakeUp: boolean) {
        return this.rawSet.rbLockTranslations(this.handle, locked, wakeUp);
    }

    /**
     * Locks or unlocks the ability of this rigid-body to rotate.
     *
     * @param locked - If `true`, this rigid-body will no longer rotate due to torques and impulses.
     * @param wakeUp - If `true`, this rigid-body will be automatically awaken if it is currently asleep.
     */
    public lockRotations(locked: boolean, wakeUp: boolean) {
        return this.rawSet.rbLockRotations(this.handle, locked, wakeUp);
    }

    // #if DIM3
    /**
     * Locks or unlocks the ability of this rigid-body to rotate along individual coordinate axes.
     *
     * @param enableX - If `false`, this rigid-body will no longer rotate due to torques and impulses, along the X coordinate axis.
     * @param enableY - If `false`, this rigid-body will no longer rotate due to torques and impulses, along the Y coordinate axis.
     * @param enableZ - If `false`, this rigid-body will no longer rotate due to torques and impulses, along the Z coordinate axis.
     * @param wakeUp - If `true`, this rigid-body will be automatically awaken if it is currently asleep.
     */
    public restrictRotations(enableX: boolean, enableY: boolean, enableZ: boolean, wakeUp: boolean) {
        return this.rawSet.rbRestrictRotations(this.handle, enableX, enableY, enableZ, wakeUp);
    }
    // #endif

    /**
     * The dominance group, in [-127, +127] this rigid-body is part of.
     */
    public dominanceGroup(): number {
        return this.rawSet.rbDominanceGroup(this.handle);
    }

    /**
     * Sets the dominance group of this rigid-body.
     *
     * @param group - The dominance group of this rigid-body. Must be a signed integer in the range [-127, +127].
     */
    public setDominanceGroup(group: number) {
        this.rawSet.rbSetDominanceGroup(this.handle, group);
    }

    /**
     * Enable or disable CCD (Continuous Collision Detection) for this rigid-body.
     *
     * @param enabled - If `true`, CCD will be enabled for this rigid-body.
     */
    public enableCcd(enabled: boolean) {
        this.rawSet.rbEnableCcd(this.handle, enabled)
    }

    /**
     * The world-space translation of this rigid-body.
     * @param target - The target Vector object to write to.
     */
    public translation(target?: Vector): Vector {
        let res = this.rawSet.rbTranslation(this.handle);
        return VectorOps.fromRaw(res, target);
    }

    // #if DIM3

    /**
     * The world-space orientation of this rigid-body.
     * @param target - The target Rotation object to write to.
     */
    public rotation(target?: Rotation): Rotation {
        let res = this.rawSet.rbRotation(this.handle);
        return RotationOps.fromRaw(res, target);
    }

    // #endif

    // #if DIM2

    /**
     * The world-space orientation of this rigid-body.
     */
     public rotation(): Rotation {
        let res = this.rawSet.rbRotation(this.handle);
        return RotationOps.fromRaw(res);
    }

    // #endif

    /**
     * The world-space next translation of this rigid-body.
     * @param target - The target Vector object to write to.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicTranslation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
    public nextTranslation(target?: Vector): Vector {
        let res = this.rawSet.rbNextTranslation(this.handle);
        return VectorOps.fromRaw(res, target);
    }

    // #if DIM3

    /**
     * The world-space next orientation of this rigid-body.
     * @param target - The target Rotation object to write to.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicRotation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
    public nextRotation(target?: Rotation): Rotation {
        let res = this.rawSet.rbNextRotation(this.handle);
        return RotationOps.fromRaw(res, target);
    }

    // #endif

    // #if DIM2

    /**
     * The world-space next orientation of this rigid-body.
     *
     * If this rigid-body is kinematic this value is set by the `setNextKinematicRotation`
     * method and is used for estimating the kinematic body velocity at the next timestep.
     * For non-kinematic bodies, this value is currently unspecified.
     */
     public nextRotation(): Rotation {
        let res = this.rawSet.rbNextRotation(this.handle);
        return RotationOps.fromRaw(res);
    }

    // #endif

    /**
     * Sets the translation of this rigid-body.
     *
     * @param tra - The world-space position of the rigid-body.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     *                 wasn't moving before modifying its position.
     */
    public setTranslation(tra: Vector, wakeUp: boolean,) {
        // #if DIM2
        this.rawSet.rbSetTranslation(this.handle, tra.x, tra.y, wakeUp);
        // #endif
        // #if DIM3
        this.rawSet.rbSetTranslation(this.handle, tra.x, tra.y, tra.z, wakeUp);
        // #endif
    }

    /**
     * Sets the linear velocity fo this rigid-body.
     *
     * @param vel - The linear velocity to set.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    public setLinvel(vel: Vector, wakeUp: boolean) {
        let rawVel = VectorOps.intoRaw(vel);
        this.rawSet.rbSetLinvel(this.handle, rawVel, wakeUp);
        rawVel.free();
    }

    /**
     * The scale factor applied to the gravity affecting
     * this rigid-body.
     */
    public gravityScale(): number {
        return this.rawSet.rbGravityScale(this.handle);
    }

    /**
     * Sets the scale factor applied to the gravity affecting
     * this rigid-body.
     *
     * @param factor - The scale factor to set. A value of 0.0 means
     *   that this rigid-body will on longer be affected by gravity.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    public setGravityScale(factor: number, wakeUp: boolean) {
        this.rawSet.rbSetGravityScale(this.handle, factor, wakeUp);
    }

    // #if DIM3
    /**
     * Sets the rotation quaternion of this rigid-body.
     *
     * This does nothing if a zero quaternion is provided.
     *
     * @param rotation - The rotation to set.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     */
    public setRotation(rot: Rotation, wakeUp: boolean) {
        this.rawSet.rbSetRotation(this.handle, rot.x, rot.y, rot.z, rot.w, wakeUp);
    }

    /**
     * Sets the angular velocity fo this rigid-body.
     *
     * @param vel - The angular velocity to set.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    public setAngvel(vel: Vector, wakeUp: boolean) {
        let rawVel = VectorOps.intoRaw(vel);
        this.rawSet.rbSetAngvel(this.handle, rawVel, wakeUp);
        rawVel.free();
    }

    // #endif

    // #if DIM2
    /**
     * Sets the rotation angle of this rigid-body.
     *
     * @param angle - The rotation angle, in radians.
     * @param wakeUp - Forces the rigid-body to wake-up so it is properly affected by forces if it
     * wasn't moving before modifying its position.
     */
    public setRotation(angle: number, wakeUp: boolean) {
        this.rawSet.rbSetRotation(this.handle, angle, wakeUp);
    }

    /**
     * Sets the angular velocity fo this rigid-body.
     *
     * @param vel - The angular velocity to set.
     * @param wakeUp - Forces the rigid-body to wake-up if it was asleep.
     */
    public setAngvel(vel: number, wakeUp: boolean) {
        this.rawSet.rbSetAngvel(this.handle, vel, wakeUp);
    }

    // #endif

    /**
     * If this rigid body is kinematic, sets its future translation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setTranslation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param t - The kinematic translation to set.
     */
    public setNextKinematicTranslation(t: Vector) {
        // #if DIM2
        this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y);
        // #endif
        // #if DIM3
        this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y, t.z);
        // #endif
    }

    // #if DIM3
    /**
     * If this rigid body is kinematic, sets its future rotation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setRotation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param rot - The kinematic rotation to set.
     */
    public setNextKinematicRotation(rot: Rotation) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, rot.x, rot.y, rot.z, rot.w);
    }

    // #endif

    // #if DIM2
    /**
     * If this rigid body is kinematic, sets its future rotation after the next timestep integration.
     *
     * This should be used instead of `rigidBody.setRotation` to make the dynamic object
     * interacting with this kinematic body behave as expected. Internally, Rapier will compute
     * an artificial velocity for this rigid-body from its current position and its next kinematic
     * position. This velocity will be used to compute forces on dynamic bodies interacting with
     * this body.
     *
     * @param angle - The kinematic rotation angle, in radians.
     */
    public setNextKinematicRotation(angle: number) {
        this.rawSet.rbSetNextKinematicRotation(this.handle, angle);
    }

    // #endif

    /**
     * The linear velocity of this rigid-body.
     * @param target - The target Vector object to write to.
     */
    public linvel(target?: Vector): Vector {
        return VectorOps.fromRaw(this.rawSet.rbLinvel(this.handle), target);
    }

    // #if DIM3
    /**
     * The angular velocity of this rigid-body.
     * @param target - The target Vector object to write to.
     */
    public angvel(target?: Vector): Vector {
        return VectorOps.fromRaw(this.rawSet.rbAngvel(this.handle), target);
    }

    // #endif

    // #if DIM2
    /**
     * The angular velocity of this rigid-body.
     */
    public angvel(): number {
        return this.rawSet.rbAngvel(this.handle);
    }

    // #endif

    /**
     * The mass of this rigid-body.
     */
    public mass(): number {
        return this.rawSet.rbMass(this.handle);
    }

    /**
     * Put this rigid body to sleep.
     *
     * A sleeping body no longer moves and is no longer simulated by the physics engine unless
     * it is waken up. It can be woken manually with `this.wakeUp()` or automatically due to
     * external forces like contacts.
     */
    public sleep() {
        this.rawSet.rbSleep(this.handle);
    }

    /**
     * Wakes this rigid-body up.
     *
     * A dynamic rigid-body that does not move during several consecutive frames will
     * be put to sleep by the physics engine, i.e., it will stop being simulated in order
     * to avoid useless computations.
     * This methods forces a sleeping rigid-body to wake-up. This is useful, e.g., before modifying
     * the position of a dynamic body so that it is properly simulated afterwards.
     */
    public wakeUp() {
        this.rawSet.rbWakeUp(this.handle);
    }

    /**
     * Is CCD enabled for this rigid-body?
     */
    public isCcdEnabled() {
        this.rawSet.rbIsCcdEnabled(this.handle);
    }

    /**
     * The number of colliders attached to this rigid-body.
     */
    public numColliders(): number {
        return this.rawSet.rbNumColliders(this.handle);
    }

    /**
     * Retrieves the handle of the `i-th` collider attached to this rigid-body.
     *
     * @param i - The index of the collider to retrieve. Must be a number in `[0, this.numColliders()[`.
     *         This index is **not** the same as the unique identifier of the collider.
     */
    public collider(i: number): ColliderHandle {
        return this.rawSet.rbCollider(this.handle, i);
    }


    /**
     * The status of this rigid-body: static, dynamic, or kinematic.
     */
    public bodyType(): RigidBodyType {
        return this.rawSet.rbBodyType(this.handle);
    }

    /**
     * Is this rigid-body sleeping?
     */
    public isSleeping(): boolean {
        return this.rawSet.rbIsSleeping(this.handle);
    }

    /**
     * Is the velocity of this rigid-body not zero?
     */
    public isMoving(): boolean {
        return this.rawSet.rbIsMoving(this.handle);
    }

    /**
     * Is this rigid-body static?
     */
    public isStatic(): boolean {
        return this.rawSet.rbIsStatic(this.handle);
    }

    /**
     * Is this rigid-body kinematic?
     */
    public isKinematic(): boolean {
        return this.rawSet.rbIsKinematic(this.handle);
    }

    /**
     * Is this rigid-body dynamic?
     */
    public isDynamic(): boolean {
        return this.rawSet.rbIsDynamic(this.handle);
    }

    /**
     * The linear damping coefficient of this rigid-body.
     */
    public linearDamping(): number {
        return this.rawSet.rbLinearDamping(this.handle);
    }

    /**
     * The angular damping coefficient of this rigid-body.
     */
    public angularDamping(): number {
        return this.rawSet.rbAngularDamping(this.handle);
    }

    /**
     * Sets the linear damping factor applied to this rigid-body.
     *
     * @param factor - The damping factor to set.
     */
    public setLinearDamping(factor: number) {
        this.rawSet.rbSetLinearDamping(this.handle, factor);
    }

    /**
     * Sets the linear damping factor applied to this rigid-body.
     *
     * @param factor - The damping factor to set.
     */
    public setAngularDamping(factor: number) {
        this.rawSet.rbSetAngularDamping(this.handle, factor);
    }

    /**
     * Applies a force at the center-of-mass of this rigid-body.
     *
     * @param force - the world-space force to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyForce(force: Vector, wakeUp: boolean) {
        const rawForce = VectorOps.intoRaw(force);
        this.rawSet.rbApplyForce(this.handle, rawForce, wakeUp);
        rawForce.free();
    }

    /**
     * Applies an impulse at the center-of-mass of this rigid-body.
     *
     * @param impulse - the world-space impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyImpulse(
        impulse: Vector,
        wakeUp: boolean,
    ) {
        const rawImpulse = VectorOps.intoRaw(impulse);
        this.rawSet.rbApplyImpulse(this.handle, rawImpulse, wakeUp);
        rawImpulse.free();
    }

    // #if DIM2
    /**
     * Applies a torque at the center-of-mass of this rigid-body.
     *
     * @param torque - the torque to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyTorque(torque: number, wakeUp: boolean) {
        this.rawSet.rbApplyTorque(this.handle, torque, wakeUp);
    }

    // #endif

    // #if DIM3
    /**
     * Applies a torque at the center-of-mass of this rigid-body.
     *
     * @param torque - the world-space torque to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyTorque(torque: Vector, wakeUp: boolean) {
        const rawTorque = VectorOps.intoRaw(torque);
        this.rawSet.rbApplyTorque(this.handle, rawTorque, wakeUp);
        rawTorque.free();
    }

    // #endif

    // #if DIM2
    /**
     * Applies an impulsive torque at the center-of-mass of this rigid-body.
     *
     * @param torqueImpulse - the torque impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyTorqueImpulse(torqueImpulse: number, wakeUp: boolean) {
        this.rawSet.rbApplyTorqueImpulse(this.handle, torqueImpulse, wakeUp);
    }

    // #endif

    // #if DIM3
    /**
     * Applies an impulsive torque at the center-of-mass of this rigid-body.
     *
     * @param torqueImpulse - the world-space torque impulse to apply on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyTorqueImpulse(torqueImpulse: Vector, wakeUp: boolean) {
        const rawTorqueImpulse = VectorOps.intoRaw(torqueImpulse);
        this.rawSet.rbApplyTorqueImpulse(this.handle, rawTorqueImpulse, wakeUp);
        rawTorqueImpulse.free();
    }

    // #endif

    /**
     * Applies a force at the given world-space point of this rigid-body.
     *
     * @param force - the world-space force to apply on the rigid-body.
     * @param point - the world-space point where the impulse is to be applied on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyForceAtPoint(
        force: Vector,
        point: Vector,
        wakeUp: boolean,
    ) {
        const rawForce = VectorOps.intoRaw(force);
        const rawPoint = VectorOps.intoRaw(point);
        this.rawSet.rbApplyForceAtPoint(this.handle, rawForce, rawPoint, wakeUp);
        rawForce.free();
        rawPoint.free();
    }

    /**
     * Applies an impulse at the given world-space point of this rigid-body.
     *
     * @param impulse - the world-space impulse to apply on the rigid-body.
     * @param point - the world-space point where the impulse is to be applied on the rigid-body.
     * @param wakeUp - should the rigid-body be automatically woken-up?
     */
    public applyImpulseAtPoint(
        impulse: Vector,
        point: Vector,
        wakeUp: boolean,
    ) {
        const rawImpulse = VectorOps.intoRaw(impulse);
        const rawPoint = VectorOps.intoRaw(point);
        this.rawSet.rbApplyImpulseAtPoint(this.handle, rawImpulse, rawPoint, wakeUp);
        rawImpulse.free();
        rawPoint.free();
    }
}

export class RigidBodyDesc {
    translation: Vector;
    rotation: Rotation;
    gravityScale: number;
    mass: number;
    translationsEnabled: boolean;
    centerOfMass: Vector;
    linvel: Vector;
    // #if DIM2
    angvel: number;
    principalAngularInertia: number;
    rotationsEnabled: boolean;
    // #endif
    // #if DIM3
    angvel: Vector;
    principalAngularInertia: Vector;
    angularInertiaLocalFrame: Rotation;
    rotationsEnabledX: boolean;
    rotationsEnabledY: boolean;
    rotationsEnabledZ: boolean;
    // #endif
    linearDamping: number
    angularDamping: number
    status: RigidBodyType;
    canSleep: boolean;
    ccdEnabled: boolean;
    dominanceGroup: number;

    constructor(status: RigidBodyType) {
        this.status = status;
        this.translation = VectorOps.zeros();
        this.rotation = RotationOps.identity();
        this.gravityScale = 1.0;
        this.linvel = VectorOps.zeros();
        this.mass = 0.0;
        this.translationsEnabled = true;
        this.centerOfMass = VectorOps.zeros();
        // #if DIM2
        this.angvel = 0.0;
        this.principalAngularInertia = 0.0;
        this.rotationsEnabled = true;
        // #endif
        // #if DIM3
        this.angvel = VectorOps.zeros();
        this.principalAngularInertia = VectorOps.zeros();
        this.angularInertiaLocalFrame = RotationOps.identity();
        this.rotationsEnabledX = true;
        this.rotationsEnabledY = true;
        this.rotationsEnabledZ = true;
        // #endif
        this.linearDamping = 0.0;
        this.angularDamping = 0.0;
        this.canSleep = true;
        this.ccdEnabled = false;
        this.dominanceGroup = 0;
    }

    /**
     * A rigid-body descriptor used to build a dynamic rigid-body.
     */
    public static newDynamic(): RigidBodyDesc {
        return new RigidBodyDesc(RigidBodyType.Dynamic)
    }

    /**
     * A rigid-body descriptor used to build a position-based kinematic rigid-body.
     */
    public static newKinematicPositionBased(): RigidBodyDesc {
        return new RigidBodyDesc(RigidBodyType.KinematicPositionBased)
    }

    /**
     * A rigid-body descriptor used to build a velocity-based kinematic rigid-body.
     */
    public static newKinematicVelocityBased(): RigidBodyDesc {
        return new RigidBodyDesc(RigidBodyType.KinematicVelocityBased)
    }

    /**
     * A rigid-body descriptor used to build a static rigid-body.
     */
    public static newStatic(): RigidBodyDesc {
        return new RigidBodyDesc(RigidBodyType.Static)
    }

    public setDominanceGroup(group: number): RigidBodyDesc {
        this.dominanceGroup = group;
        return this;
    }

    // #if DIM2
    /**
     * Sets the initial translation of the rigid-body to create.
     */
    public setTranslation(x: number, y: number): RigidBodyDesc {
        if (typeof x != "number" || typeof y != "number")
            throw TypeError("The translation components must be numbers.");

        this.translation = {x: x, y: y};
        return this;
    }

    // #endif

    // #if DIM3
    /**
     * Sets the initial translation of the rigid-body to create.
     *
     * @param tra - The translation to set.
     */
    public setTranslation(x: number, y: number, z: number): RigidBodyDesc {
        if (typeof x != "number" || typeof y != "number" || typeof z != "number")
            throw TypeError("The translation components must be numbers.");

        this.translation = {x: x, y: y, z: z};
        return this;
    }

    // #endif

    /**
     * Sets the initial rotation of the rigid-body to create.
     *
     * @param rot - The rotation to set.
     */
    public setRotation(rot: Rotation): RigidBodyDesc {
        this.rotation = rot;
        return this;
    }

    /**
     * Sets the scale factor applied to the gravity affecting
     * the rigid-body being built.
     *
     * @param scale - The scale factor. Set this to `0.0` if the rigid-body
     *   needs to ignore gravity.
     */
    public setGravityScale(scale: number): RigidBodyDesc {
        this.gravityScale = scale;
        return this;
    }

    /**
     * Sets the initial mass of the rigid-body being built, before adding colliders' contributions.
     *
     * @param mass − The initial mass of the rigid-body to create.
     */
    public setAdditionalMass(mass: number): RigidBodyDesc {
        this.mass = mass;
        return this;
    }

    /**
     * Locks all translations that would have resulted from forces on
     * the created rigid-body.
     */
    public lockTranslations(): RigidBodyDesc {
        this.translationsEnabled = false;
        return this;
    }

    // #if DIM2
    /**
     * Sets the initial linear velocity of the rigid-body to create.
     *
     * @param x - The linear velocity to set along the `x` axis.
     * @param y - The linear velocity to set along the `y` axis.
     */
    public setLinvel(x: number, y: number): RigidBodyDesc {
        if (typeof x != "number" || typeof y != "number")
            throw TypeError("The linvel components must be numbers.");

        this.linvel = {x: x, y: y};
        return this;
    }

    /**
     * Sets the initial angular velocity of the rigid-body to create.
     *
     * @param vel - The angular velocity to set.
     */
    public setAngvel(vel: number): RigidBodyDesc {
        this.angvel = vel;
        return this;
    }

    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * Note that the final mass properties of the rigid-bodies depends
     * on the initial mass-properties of the rigid-body (set by this method)
     * to which is added the contributions of all the colliders with non-zero density
     * attached to this rigid-body.
     *
     * Therefore, if you want your provided mass properties to be the final
     * mass properties of your rigid-body, don't attach colliders to it, or
     * only attach colliders with densities equal to zero.
     *
     * @param mass − The initial mass of the rigid-body to create.
     * @param centerOfMass − The initial center-of-mass of the rigid-body to create.
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     */
    public setAdditionalMassProperties(mass: number, centerOfMass: Vector, principalAngularInertia: number): RigidBodyDesc {
        this.mass = mass;
        this.centerOfMass = centerOfMass;
        this.principalAngularInertia = principalAngularInertia;
        return this;
    }

    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     */
    public setAdditionalPrincipalAngularInertia(principalAngularInertia: number): RigidBodyDesc {
        this.principalAngularInertia = principalAngularInertia;
        return this;
    }

    /**
     * Locks all rotations that would have resulted from forces on
     * the created rigid-body.
     */
    public lockRotations(): RigidBodyDesc {
        this.rotationsEnabled = false;
        return this;
    }

    // #endif

    // #if DIM3
    /**
     * Sets the initial linear velocity of the rigid-body to create.
     *
     * @param x - The linear velocity to set along the `x` axis.
     * @param y - The linear velocity to set along the `y` axis.
     * @param z - The linear velocity to set along the `z` axis.
     */
    public setLinvel(x: number, y: number, z: number): RigidBodyDesc {
        if (typeof x != "number" || typeof y != "number" || typeof z != "number")
            throw TypeError("The linvel components must be numbers.");

        this.linvel = {x: x, y: y, z: z};
        return this;
    }

    /**
     * Sets the initial angular velocity of the rigid-body to create.
     *
     * @param vel - The angular velocity to set.
     */
    public setAngvel(vel: Vector): RigidBodyDesc {
        this.angvel = vel;
        return this;
    }

    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * Note that the final mass properties of the rigid-bodies depends
     * on the initial mass-properties of the rigid-body (set by this method)
     * to which is added the contributions of all the colliders with non-zero density
     * attached to this rigid-body.
     *
     * Therefore, if you want your provided mass properties to be the final
     * mass properties of your rigid-body, don't attach colliders to it, or
     * only attach colliders with densities equal to zero.
     *
     * @param mass − The initial mass of the rigid-body to create.
     * @param centerOfMass − The initial center-of-mass of the rigid-body to create.
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     *                                  These are the eigenvalues of the angular inertia matrix.
     * @param angularInertiaLocalFrame − The initial local angular inertia frame of the rigid-body to create.
     *                                   These are the eigenvectors of the angular inertia matrix.
     */
    public setAdditionalMassProperties(mass: number, centerOfMass: Vector, principalAngularInertia: Vector, angularInertiaLocalFrame: Rotation): RigidBodyDesc {
        this.mass = mass;
        this.centerOfMass = centerOfMass;
        this.principalAngularInertia = principalAngularInertia;
        this.angularInertiaLocalFrame = angularInertiaLocalFrame;
        return this;
    }


    /**
     * Sets the mass properties of the rigid-body being built.
     *
     * @param principalAngularInertia − The initial principal angular inertia of the rigid-body to create.
     */
    public setAdditionalPrincipalAngularInertia(principalAngularInertia: Vector): RigidBodyDesc {
        this.principalAngularInertia = principalAngularInertia;
        return this;
    }

    /**
     * Allow rotation of this rigid-body only along specific axes.
     * @param rotationsEnabledX - Are rotations along the X axis enabled?
     * @param rotationsEnabledY - Are rotations along the y axis enabled?
     * @param rotationsEnabledZ - Are rotations along the Z axis enabled?
     */
    public restrictRotations(rotationsEnabledX: boolean, rotationsEnabledY: boolean, rotationsEnabledZ: boolean): RigidBodyDesc {
        this.rotationsEnabledX = rotationsEnabledX;
        this.rotationsEnabledY = rotationsEnabledY;
        this.rotationsEnabledZ = rotationsEnabledZ;
        return this;
    }

    /**
     * Locks all rotations that would have resulted from forces on
     * the created rigid-body.
     */
    public lockRotations(): RigidBodyDesc {
        return this.restrictRotations(false, false, false);
    }

    // #endif

    /**
     * Sets the linear damping of the rigid-body to create.
     *
     * This will progressively slowdown the translational movement of the rigid-body.
     *
     * @param damping - The angular damping coefficient. Should be >= 0. The higher this
     *                  value is, the stronger the translational slowdown will be.
     */
    public setLinearDamping(damping: number): RigidBodyDesc {
        this.linearDamping = damping;
        return this;
    }

    /**
     * Sets the angular damping of the rigid-body to create.
     *
     * This will progressively slowdown the rotational movement of the rigid-body.
     *
     * @param damping - The angular damping coefficient. Should be >= 0. The higher this
     *                  value is, the stronger the rotational slowdown will be.
     */
    public setAngularDamping(damping: number): RigidBodyDesc {
        this.angularDamping = damping;
        return this;
    }

    /**
     * Sets whether or not the rigid-body to create can sleep.
     *
     * @param can - true if the rigid-body can sleep, false if it can't.
     */
    public setCanSleep(can: boolean): RigidBodyDesc {
        this.canSleep = can;
        return this;
    }

    /**
     * Sets whether Continuous Collision Detection (CCD) is enabled for this rigid-body.
     *
     * @param enabled - true if the rigid-body has CCD enabled.
     */
    public setCcdEnabled(enabled: boolean): RigidBodyDesc {
        this.ccdEnabled = enabled;
        return this;
    }
}