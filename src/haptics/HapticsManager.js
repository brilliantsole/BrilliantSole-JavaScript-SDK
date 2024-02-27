import { createConsole } from "../utils/Console.js";
import HapticsWaveformEffects from "./HapticsWaveformEffects.js";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.js";

const _console = createConsole("HapticsManager");

/** @typedef {"front" | "rear"} BrilliantSoleHapticsLocation */
/** @typedef {"waveformEffect" | "waveform"} BrilliantSoleHapticsVibrationType */

/** @typedef {import("./HapticsWaveformEffects.js").BrilliantSoleHapticsVibrationWaveformEffect} BrilliantSoleHapticsVibrationWaveformEffect */

/**
 * @typedef BrilliantSoleHapticsVibrationWaveformEffectSegment
 * a waveform effect segment can be either an effect or a delay (ms int ranging [0, 1270])
 * @type {BrilliantSoleHapticsVibrationWaveformEffect | number}
 */

/**
 * @typedef BrilliantSoleHapticsVibrationWaveformSegment
 * @type {Object}
 * @property {number} duration ms int ranging [0, 2550]
 * @property {number} amplitude float ranging [0, 1]
 */

class HapticsManager {
    /** @type {BrilliantSoleHapticsLocation[]} */
    static #locations = ["front", "rear"];
    get locations() {
        return HapticsManager.#locations;
    }
    /** @param {BrilliantSoleHapticsLocation} location */
    #verifyLocation(location) {
        _console.assertTypeWithError(location, "string");
        _console.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
    }
    /** @param {BrilliantSoleHapticsLocation[]} locations */
    #verifyLocations(locations) {
        this.#assertNonEmptyArray(locations);
        locations.forEach((location) => {
            this.#verifyLocation(location);
        });
    }
    /** @param {BrilliantSoleHapticsLocation[]} locations */
    #createLocationsBitmask(locations) {
        this.#verifyLocations(locations);

        let locationsBitmask = 0;
        locations.forEach((location) => {
            const locationIndex = this.locations.indexOf(location);
            locationsBitmask |= 1 << locationIndex;
        });
        _console.log({ locationsBitmask });
        _console.assertWithError(locationsBitmask > 0, `locationsBitmask must not be zero`);
        return locationsBitmask;
    }

    /** @param {any[]} array */
    #assertNonEmptyArray(array) {
        _console.assertWithError(Array.isArray(array), "passed non-array");
        _console.assertWithError(array.length > 0, "passed empty array");
    }

    get waveformEffects() {
        return HapticsWaveformEffects;
    }
    /** @param {BrilliantSoleHapticsVibrationWaveformEffect} waveformEffect */
    #verifyWaveformEffect(waveformEffect) {
        _console.assertWithError(
            this.waveformEffects.includes(waveformEffect),
            `invalid waveformEffect "${waveformEffect}"`
        );
    }

    /** @param {BrilliantSoleHapticsVibrationWaveformEffectSegment} waveformEffectSegment */
    #verifyWaveformEffectSegment(waveformEffectSegment) {
        switch (typeof waveformEffectSegment) {
            case "string":
                const waveformEffect = waveformEffectSegment;
                this.#verifyWaveformEffect(waveformEffect);
                break;
            case "number":
                const delay = waveformEffectSegment;
                _console.assertWithError(delay >= 0, `delay must be 0ms or greater (got ${delay})`);
                _console.assertWithError(delay <= 1270, `delay must be 1270ms or less (got ${delay})`);
                break;
            default:
                throw Error(`invalid waveformEffectSegment type "${typeof waveformEffectSegment}"`);
        }
    }
    static #maxNumberOfWaveformEffectSegments = 8;
    get maxNumberOfWaveformEffectSegments() {
        return HapticsManager.#maxNumberOfWaveformEffectSegments;
    }
    /** @param {BrilliantSoleHapticsVibrationWaveformEffectSegment[]} waveformEffectSegments */
    #verifyWaveformEffectSegments(waveformEffectSegments) {
        this.#assertNonEmptyArray(waveformEffectSegments);
        _console.assertWithError(
            waveformEffectSegments.length <= this.maxNumberOfWaveformEffectSegments,
            `must have ${this.maxNumberOfWaveformEffectSegments} waveformEffectSegments or fewer (got ${waveformEffectSegments.length})`
        );
        waveformEffectSegments.forEach((waveformEffectSegment) => {
            this.#verifyWaveformEffectSegment(waveformEffectSegment);
        });
    }

    static #maxWaveformEffectSegmentLoopCount = 3;
    get maxWaveformEffectSegmentLoopCount() {
        return HapticsManager.#maxWaveformEffectSegmentLoopCount;
    }
    /** @param {number} waveformEffectSegmentLoopCount */
    #verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount) {
        _console.assertTypeWithError(waveformEffectSegmentLoopCount, "number");
        _console.assertWithError(
            waveformEffectSegmentLoopCount >= 0,
            `waveformEffectSegmentLoopCount must be 0 or greater (got ${waveformEffectSegmentLoopCount})`
        );
        _console.assertWithError(
            waveformEffectSegmentLoopCount <= this.maxWaveformEffectSegmentLoopCount,
            `waveformEffectSegmentLoopCount must be ${this.maxWaveformEffectSegmentLoopCount} or fewer (got ${waveformEffectSegmentLoopCount})`
        );
    }
    /** @param {number[]} waveformEffectSegmentLoopCounts */
    #verifyWaveformEffectSegmentLoopCounts(waveformEffectSegmentLoopCounts) {
        this.#assertNonEmptyArray(waveformEffectSegmentLoopCounts);
        _console.assertWithError(
            waveformEffectSegmentLoopCounts.length <= this.maxNumberOfWaveformEffectSegments,
            `must have ${this.maxNumberOfWaveformEffectSegments} waveformEffectSegmentLoopCounts or fewer (got ${waveformEffectSegmentLoopCounts.length})`
        );
        waveformEffectSegmentLoopCounts.forEach((waveformEffectSegmentLoopCount) => {
            this.#verifyWaveformEffectSegmentLoopCount(waveformEffectSegmentLoopCount);
        });
    }

    static #maxWaveformEffectSequenceLoopCount = 6;
    get maxWaveformEffectSequenceLoopCount() {
        return HapticsManager.#maxWaveformEffectSequenceLoopCount;
    }
    /** @param {number} waveformEffectSequenceLoopCount */
    #verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount) {
        _console.assertTypeWithError(waveformEffectSequenceLoopCount, "number");
        _console.assertWithError(
            waveformEffectSequenceLoopCount >= 0,
            `waveformEffectSequenceLoopCount must be 0 or greater (got ${waveformEffectSequenceLoopCount})`
        );
        _console.assertWithError(
            waveformEffectSequenceLoopCount <= this.maxWaveformEffectSequenceLoopCount,
            `waveformEffectSequenceLoopCount must be ${this.maxWaveformEffectSequenceLoopCount} or fewer (got ${waveformEffectSequenceLoopCount})`
        );
    }

    /** @param {BrilliantSoleHapticsVibrationWaveformSegment} waveformSegment */
    #verifyWaveformSegment(waveformSegment) {
        _console.assertTypeWithError(waveformSegment.amplitude, "number");
        _console.assertWithError(
            waveformSegment.amplitude >= 0,
            `amplitude must be 0 or greater (got ${waveformSegment.amplitude})`
        );
        _console.assertWithError(
            waveformSegment.amplitude <= 1,
            `amplitude must be 1 or less (got ${waveformSegment.amplitude})`
        );

        _console.assertTypeWithError(waveformSegment.duration, "number");
        _console.assertWithError(
            waveformSegment.duration > 0,
            `duration must be greater than 0ms (got ${waveformSegment.duration}ms)`
        );
        _console.assertWithError(
            waveformSegment.duration <= 2560,
            `duration must be 2560ms or less (got ${waveformSegment.duration}ms)`
        );
    }
    static #maxNumberOfWaveformSegments = 20;
    get maxNumberOfWaveformSegments() {
        return HapticsManager.#maxNumberOfWaveformSegments;
    }
    /** @param {BrilliantSoleHapticsVibrationWaveformSegment[]} waveformSegments */
    #verifyWaveformSegments(waveformSegments) {
        this.#assertNonEmptyArray(waveformSegments);
        _console.assertWithError(
            waveformSegments.length <= this.maxNumberOfWaveformSegments,
            `must have ${this.maxNumberOfWaveformSegments} waveformSegments or fewer (got ${waveformSegments.length})`
        );
        waveformSegments.forEach((waveformSegment) => {
            this.#verifyWaveformSegment(waveformSegment);
        });
    }

    /**
     * @param {BrilliantSoleHapticsLocation[]} locations
     * @param {BrilliantSoleHapticsVibrationWaveformEffectSegment[]} waveformEffectSegments
     * @param {number[]?} waveformEffectSegmentLoopCounts how many times each segment should loop (int ranging [0, 3])
     * @param {number?} waveformEffectSequenceLoopCount how many times the entire sequence should loop (int ranging [0, 6])
     */
    createWaveformEffectsData(
        locations,
        waveformEffectSegments,
        waveformEffectSegmentLoopCounts = [],
        waveformEffectSequenceLoopCount = 0
    ) {
        this.#verifyWaveformEffectSegments(waveformEffectSegments);
        this.#verifyWaveformEffectSegmentLoopCounts(waveformEffectSegmentLoopCounts);
        this.#verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount);

        let dataArray = [];
        let byteOffset = 0;

        const includeAllWaveformEffectSegments =
            waveformEffectSegmentLoopCounts.length > 0 || waveformEffectSequenceLoopCount != 0;

        for (
            let index = 0;
            index < waveformEffectSegments.length ||
            (includeAllWaveformEffectSegments && index < this.maxNumberOfWaveformEffectSegments);
            index++
        ) {
            const waveformEffectSegment = waveformEffectSegments[index] || "none";

            if (typeof waveformEffectSegment == "string") {
                const waveformEffect = waveformEffectSegment;
                dataArray[byteOffset++] = this.waveformEffects.indexOf(waveformEffect);
            } else {
                const delay = waveformEffectSegment;
                dataArray[byteOffset++] = (1 << 7) | Math.floor(delay); // set most significant bit to 1
            }
        }

        const includeAllWaveformEffectSegmentLoopCounts = waveformEffectSequenceLoopCount != 0;
        for (
            let index = 0;
            index < waveformEffectSegmentLoopCounts.length ||
            (includeAllWaveformEffectSegmentLoopCounts && index < this.maxNumberOfWaveformEffectSegments);
            index++
        ) {
            // FILL
            // first or second byte?
            // first or second half of byte?
        }
        if (waveformEffectSequenceLoopCount != 0) {
            dataArray[byteOffset++] = waveformEffectSequenceLoopCount;
        }

        const dataView = new DataView(Uint8Array.from(dataArray).buffer);
        _console.log({ dataArray, dataView });
        this.#createData(locations, "waveformEffect", dataView);
    }
    /**
     * @param {BrilliantSoleHapticsLocation[]} locations
     * @param {BrilliantSoleHapticsVibrationWaveformSegment[]} waveformSegments
     */
    createWaveformData(locations, waveformSegments) {
        this.#verifyWaveformSegments(waveformSegments);
        const dataView = new DataView(new ArrayBuffer(waveformSegments.length * 2));
        waveformSegments.forEach((waveformSegment, index) => {
            dataView.setUint8(index * 2, waveformSegment.amplitude);
            dataView.setUint8(index * 2 + 1, Math.floor(waveformSegment.duration / 10));
        });
        _console.log({ dataView });
        this.#createData(locations, "waveform", dataView);
    }

    /** @type {BrilliantSoleHapticsVibrationType[]} */
    static #VibrationTypes = ["waveformEffect", "waveform"];
    get #vibrationTypes() {
        return HapticsManager.#VibrationTypes;
    }
    /** @param {BrilliantSoleHapticsVibrationType} vibrationType */
    #verifyVibrationType(vibrationType) {
        _console.assertTypeWithError(vibrationType, "string");
        _console.assertWithError(
            this.#vibrationTypes.includes(vibrationType),
            `invalid vibrationType "${vibrationType}"`
        );
    }

    /**
     * @param {BrilliantSoleHapticsLocation[]} locations
     * @param {BrilliantSoleHapticsVibrationType} vibrationType
     * @param {DataView} dataView
     */
    #createData(locations, vibrationType, dataView) {
        const locationsBitmask = this.#createLocationsBitmask(locations);
        this.#verifyVibrationType(vibrationType);
        const vibrationTypeIndex = this.#vibrationTypes.indexOf(vibrationType);
        _console.log({ locationsBitmask, vibrationTypeIndex, dataView });
        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
        _console.log({ data });
        return data;
    }
}

export default HapticsManager;
