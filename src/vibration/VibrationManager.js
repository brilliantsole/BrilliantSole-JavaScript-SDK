import { createConsole } from "../utils/Console.js";
import VibrationWaveformEffects from "./VibrationWaveformEffects.js";
import { concatenateArrayBuffers } from "../utils/ArrayBufferUtils.js";

const _console = createConsole("VibrationManager");

/** @typedef {"front" | "rear"} BrilliantSoleVibrationLocation */
/** @typedef {"waveformEffect" | "waveform"} BrilliantSoleVibrationType */

/** @typedef {import("./VibrationWaveformEffects.js").BrilliantSoleVibrationWaveformEffect} BrilliantSoleVibrationWaveformEffect */
/**
 * @typedef BrilliantSoleVibrationWaveformEffectSegment
 * a waveform effect segment can be either an effect or a delay (ms int ranging [0, 1270])
 * @type {BrilliantSoleVibrationWaveformEffect | number}
 */

/**
 * @typedef BrilliantSoleVibrationWaveformSegment
 * @type {Object}
 * @property {number} duration ms int ranging [0, 2550]
 * @property {number} amplitude float ranging [0, 1]
 */

class VibrationManager {
    /** @type {BrilliantSoleVibrationLocation[]} */
    static #Locations = ["front", "rear"];
    static get Locations() {
        return this.#Locations;
    }
    get locations() {
        return VibrationManager.#Locations;
    }
    /** @param {BrilliantSoleVibrationLocation} location */
    #verifyLocation(location) {
        _console.assertTypeWithError(location, "string");
        _console.assertWithError(this.locations.includes(location), `invalid location "${location}"`);
    }
    /** @param {BrilliantSoleVibrationLocation[]} locations */
    #verifyLocations(locations) {
        this.#assertNonEmptyArray(locations);
        locations.forEach((location) => {
            this.#verifyLocation(location);
        });
    }
    /** @param {BrilliantSoleVibrationLocation[]} locations */
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
        return VibrationWaveformEffects;
    }
    /** @param {BrilliantSoleVibrationWaveformEffect} waveformEffect */
    #verifyWaveformEffect(waveformEffect) {
        _console.assertWithError(
            this.waveformEffects.includes(waveformEffect),
            `invalid waveformEffect "${waveformEffect}"`
        );
    }

    /** @param {BrilliantSoleVibrationWaveformEffectSegment} waveformEffectSegment */
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
        return VibrationManager.#maxNumberOfWaveformEffectSegments;
    }
    /** @param {BrilliantSoleVibrationWaveformEffectSegment[]} waveformEffectSegments */
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
        return VibrationManager.#maxWaveformEffectSegmentLoopCount;
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
        return VibrationManager.#maxWaveformEffectSequenceLoopCount;
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

    /** @param {BrilliantSoleVibrationWaveformSegment} waveformSegment */
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
        return VibrationManager.#maxNumberOfWaveformSegments;
    }
    /** @param {BrilliantSoleVibrationWaveformSegment[]} waveformSegments */
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
     * @param {BrilliantSoleVibrationLocation[]} locations
     * @param {BrilliantSoleVibrationWaveformEffectSegment[]} waveformEffectSegments waveform effects or delay (ms int ranging [0, 1270])
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
            const waveformEffectSegmentLoopCount = waveformEffectSegmentLoopCounts[index] || 0;
            if (index == 0 || index == 4) {
                dataArray[byteOffset++] = 0;
            }
            const bitOffset = 2 * (index % 4);
            dataArray[byteOffset] |= waveformEffectSegmentLoopCount << bitOffset;
        }
        if (waveformEffectSequenceLoopCount != 0) {
            dataArray[byteOffset++] = waveformEffectSequenceLoopCount;
        }

        const dataView = new DataView(Uint8Array.from(dataArray).buffer);
        _console.log({ dataArray, dataView });
        this.#createData(locations, "waveformEffect", dataView);
    }
    /**
     * @param {BrilliantSoleVibrationLocation[]} locations
     * @param {BrilliantSoleVibrationWaveformSegment[]} waveformSegments
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

    /** @type {BrilliantSoleVibrationType[]} */
    static #Types = ["waveformEffect", "waveform"];
    static get Types() {
        return this.#Types;
    }
    get #types() {
        return VibrationManager.#Types;
    }
    /** @param {BrilliantSoleVibrationType} vibrationType */
    #verifyVibrationType(vibrationType) {
        _console.assertTypeWithError(vibrationType, "string");
        _console.assertWithError(this.#types.includes(vibrationType), `invalid vibrationType "${vibrationType}"`);
    }

    /**
     * @param {BrilliantSoleVibrationLocation[]} locations
     * @param {BrilliantSoleVibrationType} vibrationType
     * @param {DataView} dataView
     */
    #createData(locations, vibrationType, dataView) {
        _console.assertWithError(dataView?.byteLength > 0, "no data received");
        const locationsBitmask = this.#createLocationsBitmask(locations);
        this.#verifyVibrationType(vibrationType);
        const vibrationTypeIndex = this.#types.indexOf(vibrationType);
        _console.log({ locationsBitmask, vibrationTypeIndex, dataView });
        const data = concatenateArrayBuffers(locationsBitmask, vibrationTypeIndex, dataView.byteLength, dataView);
        _console.log({ data });
        return data;
    }
}

export default VibrationManager;
