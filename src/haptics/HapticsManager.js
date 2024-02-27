import { createConsole } from "../utils/Console.js";
import HapticsWaveformEffects from "./HapticsWaveformEffects.js";

const _console = createConsole("HapticsManager");

/** @typedef {"front" | "rear"} BrilliantSoleHapticsLocation */

/** @typedef {import("./HapticsWaveformEffects.js").BrilliantSoleHapticsVibrationWaveformEffect} BrilliantSoleHapticsVibrationWaveformEffect */

/**
 * @typedef BrilliantSoleHapticsVibrationWaveformEffectSegment
 * a waveform effect segment can be either an effect or a delay (ms int ranging [0, 1270])
 * @type {BrilliantSoleHapticsVibrationWaveformEffect | number}
 */

/**
 * @typedef BrilliantSoleHapticsVibrationWaveformSegment
 * @type {Object}
 * @property {number} delay ms int ranging [0, 2550]
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
        locations.forEach((location) => {
            this.#verifyLocation(location);
        });
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

        _console.assertTypeWithError(waveformSegment.delay, "number");
        _console.assertWithError(
            waveformSegment.delay > 0,
            `delay must be greater than 0ms (got ${waveformSegment.delay}ms)`
        );
        _console.assertWithError(
            waveformSegment.delay <= 2560,
            `delay must be 2560ms or less (got ${waveformSegment.delay}ms)`
        );
    }
    static #maxNumberOfWaveformSegments = 20;
    get maxNumberOfWaveformSegments() {
        return HapticsManager.#maxNumberOfWaveformSegments;
    }
    /** @param {BrilliantSoleHapticsVibrationWaveformSegment[]} waveformSegments */
    #verifyWaveformSegments(waveformSegments) {
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
        this.#verifyLocations(locations);
        this.#verifyWaveformEffectSegments(waveformEffectSegments);
        this.#verifyWaveformEffectSegmentLoopCounts(waveformEffectSegmentLoopCounts);
        this.#verifyWaveformEffectSequenceLoopCount(waveformEffectSequenceLoopCount);

        // FILL
    }
    /**
     * @param {BrilliantSoleHapticsLocation[]} locations
     * @param {BrilliantSoleHapticsVibrationWaveformSegment[]} waveformSegments
     */
    createWaveformData(locations, waveformSegments) {
        this.#verifyLocations(locations);
        this.#verifyWaveformSegments(waveformSegments);
        // FILL
    }
}

export default HapticsManager;
