export class VectorError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'VectorError';
    }

    static SizeMismatch() {
        return new VectorError('Vectors should be the same size');
    }
}

export class Vector extends Array<number> {
    private items: Array<number>;
    constructor(...items: Array<number>) {
        super(...items);
        this.items = items;
    }

    static #isEqual(a: number, b: number, treshold = 0.01) {
        return Math.abs(a - b) < treshold;
    }
    static #toDegrees(radians: number) {
        return (radians * 180) / Math.PI;
    }
    /**
     * @throws {VectorError} if vectors are not the same size
     */
    add(vector: Vector) {
        if (vector.size !== this.size) {
            throw VectorError.SizeMismatch();
        }
        return new Vector(
            ...vector.items.map((value, index) => this.items[index] + value),
        );
    }
    /**
     * @throws {VectorError} if vectors are not the same size
     */
    sub(vector: Vector) {
        if (vector.size !== this.size) {
            throw VectorError.SizeMismatch();
        }
        return new Vector(
            ...vector.items.map((value, index) => this.items[index] - value),
        );
    }
    scaleBy(number: number) {
        return new Vector(...this.items.map((value) => value * number));
    }
    /**
     * @throws {VectorError} if vectors are not the same size
     */
    dotProduct(vector: Vector) {
        if (vector.size !== this.size) {
            throw VectorError.SizeMismatch();
        }
        return vector.items.reduce((acc, value, index) => {
            return acc + value * this.items[index];
        }, 0);
    }
    normalize() {
        return this.scaleBy(1 / this.modulus);
    }

    haveSameDirectionWith(vector: Vector) {
        const dotProd = this.normalize().dotProduct(vector.normalize());
        return Vector.#isEqual(dotProd, 1);
    }
    haveOppositeDirectionWith(vector: Vector) {
        const dotProd = this.normalize().dotProduct(vector.normalize());
        return Vector.#isEqual(dotProd, -1);
    }
    isPerpendicular(vector: Vector) {
        const dotProd = this.normalize().dotProduct(vector.normalize());
        return Vector.#isEqual(dotProd, 0);
    }
    angleBetween(vector: Vector) {
        return Vector.#toDegrees(
            Math.acos(
                this.dotProduct(vector) / (this.modulus * vector.modulus),
            ),
        );
    }
    /**
     * @throws {VectorError} if vectors are not the same size
     */
    isEqualTo(vector: Vector) {
        if (vector.size !== this.size) {
            throw VectorError.SizeMismatch();
        }
        return vector.items.every((value, index) =>
            Vector.#isEqual(value, this.items[index]),
        );
    }

    get modulus() {
        return Math.hypot(...this.items);
    }

    get size() {
        return this.items.length;
    }
    get x() {
        return this.items[0];
    }
    get y() {
        return this.items[1];
    }
}