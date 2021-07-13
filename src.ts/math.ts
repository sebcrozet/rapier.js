import {RawVector, RawRotation} from "./raw";

// #if DIM2
export interface Vector {
    x: number;
    y: number;
}

/**
 * A 2D vector.
 */
export class Vector2 implements Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class VectorOps {
    public static new(x: number, y: number): Vector {
        return new Vector2(x, y);
    }

    public static zeros(): Vector {
        return VectorOps.new(0.0, 0.0);
    }

    // FIXME: type ram: RawVector?
    public static fromRaw(raw: RawVector, target?: Vector): Vector {
        if (!raw)
            return null;

        let res: Vector;

        if (target) {
            target.x = raw.x;
            target.y = raw.y;
            res = target;
        } else {
            res = VectorOps.new(raw.x, raw.y);
        }

        raw.free();
        return res;
    }

    public static intoRaw(v: Vector): RawVector {
        return new RawVector(v.x, v.y);
    }
}

/**
 * A rotation angle in radians.
 */
export type Rotation = number;

export class RotationOps {
    public static identity(): number {
        return 0.0;
    }

    public static fromRaw(raw: RawRotation): Rotation {
        if (!raw)
            return null;

        let res = raw.angle;
        raw.free();
        return res;
    }

    public static intoRaw(angle: Rotation): RawRotation {
        return RawRotation.fromAngle(angle);
    }
}

// #endif


// #if DIM3
export interface Vector {
    x: number;
    y: number;
    z: number;
}

/**
 * A 3D vector.
 */
export class Vector3 implements Vector {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export class VectorOps {
    public static new(x: number, y: number, z: number): Vector {
        return new Vector3(x, y, z);
    }

    public static intoRaw(v: Vector): RawVector {
        return new RawVector(v.x, v.y, v.z);
    }

    public static zeros(): Vector {
        return VectorOps.new(0.0, 0.0, 0.0);
    }

    // FIXME: type ram: RawVector?
    public static fromRaw(raw: RawVector, target?: Vector): Vector {
        if (!raw)
            return null;

        let res: Vector;

        if (target) {
            target.x = raw.x;
            target.y = raw.y;
            target.z = raw.z;
            res = target;
        } else {
            res = VectorOps.new(raw.x, raw.y, raw.z);
        }

        raw.free();
        return res;
    }
}

export interface Rotation {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * A quaternion.
 */
export class Quaternion implements Rotation {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

export class RotationOps {
    public static identity(): Rotation {
        return new Quaternion(0.0, 0.0, 0.0, 1.0);
    }

    public static fromRaw(raw: RawRotation, target?: Rotation): Rotation {
        if (!raw)
            return null;

        let res 

        if (target) {
            target.x = raw.x;
            target.y = raw.y;
            target.z = raw.z;
            target.w = raw.w;
            res = target;
        } else {
            res = new Quaternion(raw.x, raw.y, raw.z, raw.w);
        }

        raw.free();
        return res;
    }

    public static intoRaw(rot: Rotation): RawRotation {
        return new RawRotation(rot.x, rot.y, rot.z, rot.w);
    }
}

// #endif