import { Dictionary } from 'typescript-collections';
import Vex from 'vexflow';

/**
 * Class with helper methods to handle asynchronous JavaScript requests
 */
declare class AJAX {
    /**
     * Retrieve the content of the file at url
     * @param url
     * @returns {any}
     */
    static ajax(url: string, timeout?: number): Promise<string>;
}

/**
 * A class representing mathematical fractions, which have a numerator and a denominator.
 */
declare class Fraction {
    private static maximumAllowedNumber;
    private numerator;
    private denominator;
    private wholeValue;
    private realValue;
    /**
     * Returns the maximum of two fractions (does not clone)
     * @param f1
     * @param f2
     * @returns {Fraction}
     */
    static max(f1: Fraction, f2: Fraction): Fraction;
    static Equal(f1: Fraction, f2: Fraction): boolean;
    /**
     * The same as Fraction.clone
     * @param fraction
     * @returns {Fraction}
     */
    static createFromFraction(fraction: Fraction): Fraction;
    static plus(f1: Fraction, f2: Fraction): Fraction;
    static minus(f1: Fraction, f2: Fraction): Fraction;
    static multiply(f1: Fraction, f2: Fraction): Fraction;
    private static greatestCommonDenominator;
    /**
     *
     * @param numerator
     * @param denominator
     * @param wholeValue - the integer number, needed for values greater than 1
     * @param simplify - If simplify is true, then the fraction is simplified
     * to make both the numerator and denominator coprime, and less than maximumAllowedNumber.
     */
    constructor(numerator?: number, denominator?: number, wholeValue?: number, simplify?: boolean);
    toString(): string;
    clone(): Fraction;
    get Numerator(): number;
    set Numerator(value: number);
    get Denominator(): number;
    set Denominator(value: number);
    get WholeValue(): number;
    set WholeValue(value: number);
    /**
     * Returns the unified numerator where the whole value will be expanded
     * with the denominator and added to the existing numerator.
     */
    GetExpandedNumerator(): number;
    calculateNumberOfNeededDots(): number;
    IsNegative(): boolean;
    get RealValue(): number;
    expand(expansionValue: number): void;
    /**
     * Adds a Fraction to this Fraction.
     * Attention: This changes the already existing Fraction, which might be referenced elsewhere!
     * Use Fraction.plus() for creating a new Fraction object being the sum of two Fractions.
     * @param fraction the Fraction to add.
     */
    Add(fraction: Fraction): Fraction;
    /**
     * Subtracts a Fraction from this Fraction.
     * Attention: This changes the already existing Fraction, which might be referenced elsewhere!
     * Use Fraction.minus() for creating a new Fraction object being the difference of two Fractions.
     * @param fraction the Fraction to subtract.
     */
    Sub(fraction: Fraction): Fraction;
    /**
     * Brute Force quanization by searching incremental with the numerator until the denominator is
     * smaller/equal than the desired one.
     * @param maxAllowedDenominator
     */
    Quantize(maxAllowedDenominator: number): Fraction;
    Equals(obj: Fraction): boolean;
    CompareTo(obj: Fraction): number;
    lt(frac: Fraction): boolean;
    lte(frac: Fraction): boolean;
    gt(frac: Fraction): boolean;
    gte(frac: Fraction): boolean;
    private setRealValue;
    private simplify;
    static FloatInaccuracyTolerance: number;
    isOnBeat(timeSignature: Fraction): boolean;
    distanceFromBeat(timeSignature: Fraction): number;
}

declare class MusicPartManager {
    constructor(musicSheet: MusicSheet);
    private parts;
    private timestamps;
    private musicSheet;
    private sheetStart;
    private sheetEnd;
    /**
     * This method is called from CoreContainer when the user changes a Repetitions's userNumberOfRepetitions.
     */
    reInit(): void;
    /**
     * Main initialize method for MusicPartManager.
     */
    init(): void;
    getCurrentRepetitionTimestampTransform(curEnrolledTimestamp: Fraction): TimestampTransform;
    absoluteEnrolledToSheetTimestamp(timestamp: Fraction): Fraction;
    get Parts(): PartListEntry[];
    get MusicSheet(): MusicSheet;
    getIterator(start?: Fraction): MusicPartManagerIterator;
    setSelectionStart(beginning: Fraction): void;
    setSelectionRange(start: Fraction, end: Fraction): void;
    private calcMapping;
}
declare class TimestampTransform {
    constructor(sourceTimestamp: Fraction, enrolledTimestamp: Fraction, repetition: Repetition, curRepetitionIteration: number);
    $from: Fraction;
    to: Fraction;
    nextBackJump: Fraction;
    nextForwardJump: Fraction;
    curRepetition: Repetition;
    curRepetitionIteration: number;
}

declare class InstrumentalGroup {
    constructor(name: string, musicSheet: MusicSheet, parent: InstrumentalGroup);
    private name;
    private musicSheet;
    private parent;
    private instrumentalGroups;
    get InstrumentalGroups(): InstrumentalGroup[];
    get Parent(): InstrumentalGroup;
    get Name(): string;
    set Name(value: string);
    get GetMusicSheet(): MusicSheet;
}

/**
 * The Alignment of a TextLabel.
 * Specifically the label's position coordinates within the Bounding Box.
 * For LeftBottom, the label's position is at the left bottom corner of its Bounding Box.
 * (used for example with title, composer, author, etc.)
 * (see Show Bounding Box For -> Labels in the local demo)
 */
declare enum TextAlignmentEnum {
    LeftTop = 0,
    LeftCenter = 1,
    LeftBottom = 2,
    CenterTop = 3,
    CenterCenter = 4,
    CenterBottom = 5,
    RightTop = 6,
    RightCenter = 7,
    RightBottom = 8
}
declare class TextAlignment {
    static IsLeft(textAlignment: TextAlignmentEnum): boolean;
    static IsCenterAligned(textAlignment: TextAlignmentEnum): boolean;
    static IsRight(textAlignment: TextAlignmentEnum): boolean;
}

/**
 * Represents a color in RGBA
 */
declare class OSMDColor {
    alpha: number;
    red: number;
    green: number;
    blue: number;
    constructor(red: number, green: number, blue: number);
    static get Black(): OSMDColor;
    static get DeepSkyBlue(): OSMDColor;
    static get Green(): OSMDColor;
    static get Magenta(): OSMDColor;
    static get Orange(): OSMDColor;
    static get Red(): OSMDColor;
    static get Disabled(): OSMDColor;
    static get DarkBlue(): OSMDColor;
    static get Debug1(): OSMDColor;
    static get Debug2(): OSMDColor;
    static get Debug3(): OSMDColor;
    toString(): string;
}

/**
 * The fonts available for writing on the sheet music
 */
declare enum Fonts {
    TimesNewRoman = 0,
    Kokila = 1
}

/**
 * The styles available to write text on the music sheet
 */
declare enum FontStyles {
    Regular = 0,
    Bold = 1,
    Italic = 2,
    BoldItalic = 3,
    Underlined = 4
}

/**
 * A text label on the graphical music sheet.
 * It is used e.g. for titles, composer names, instrument names and dynamic instructions.
 */
declare class Label {
    constructor(text?: string, alignment?: TextAlignmentEnum, font?: Fonts, print?: boolean);
    text: string;
    print: boolean;
    color: OSMDColor;
    colorDefault: string;
    font: Fonts;
    fontFamily: string;
    fontStyle: FontStyles;
    fontHeight: number;
    textAlignment: TextAlignmentEnum;
    IsCreditLabel: boolean;
    ToString(): string;
}

declare enum NoteEnum {
    C = 0,
    D = 2,
    E = 4,
    F = 5,
    G = 7,
    A = 9,
    B = 11
}
/** Describes Accidental types.
 * Do not use the number values of these enum members directly for calculation anymore.
 * To use these for pitch calculation, use pitch.AccidentalHalfTones()
 * or Pitch.HalfTonesFromAccidental(accidentalEnum).
 */
declare enum AccidentalEnum {
    SHARP = 0,
    FLAT = 1,
    NONE = 2,
    NATURAL = 3,
    DOUBLESHARP = 4,
    DOUBLEFLAT = 5,
    TRIPLESHARP = 6,
    TRIPLEFLAT = 7,
    QUARTERTONESHARP = 8,
    QUARTERTONEFLAT = 9,
    SLASHFLAT = 10,
    THREEQUARTERSSHARP = 11,
    THREEQUARTERSFLAT = 12,
    SLASHQUARTERSHARP = 13,
    SLASHSHARP = 14,
    DOUBLESLASHFLAT = 15,
    SORI = 16,
    KORON = 17
}
declare class Pitch {
    static pitchEnumValues: NoteEnum[];
    private static halftoneFactor;
    private static octXmlDiff;
    private octave;
    OctaveShiftApplied: boolean;
    private fundamentalNote;
    private accidental;
    private accidentalXml;
    private frequency;
    private halfTone;
    static getNoteEnumString(note: NoteEnum): string;
    /** Changes a note x lines/steps up (+) or down (-) from a NoteEnum on a staffline/keyboard (white keys).
     * E.g. Two lines down (-2) from a D is a B.
     * Two lines up from an A is a C.
     *   (e.g. in the treble/violin clef, going one line up: E -> F (semitone), F -> G (2 semitones)).
     * Returns new NoteEnum and the octave shift (e.g. -1 = new octave is one octave down). */
    static lineShiftFromNoteEnum(noteEnum: NoteEnum, lines: number): [NoteEnum, number];
    /**
     * @param the input pitch
     * @param the number of halftones to transpose with
     * @returns ret[0] = the transposed fundamental.
     * ret[1] = the octave shift (not the new octave!)
     * @constructor
     */
    static CalculateTransposedHalfTone(pitch: Pitch, transpose: number): {
        halftone: number;
        overflow: number;
    };
    /** Returns the fundamental note x (0 <= x <= 11, e.g. 0 = C) with octave change/overflow.
     * The halftone will be one of the values in the enum NoteEnum, converted to number here as we need numbers for calculation.
     */
    static WrapAroundCheck(value: number, limit: number): {
        halftone: number;
        overflow: number;
    };
    static calcFrequency(obj: Pitch | number): number;
    static calcFractionalKey(frequency: number): number;
    static fromFrequency(frequency: number): Pitch;
    static fromHalftone(halftone: number): Pitch;
    static ceiling(halftone: number): NoteEnum;
    static floor(halftone: number): NoteEnum;
    constructor(fundamentalNote: NoteEnum, octave: number, accidental: AccidentalEnum, accidentalXml?: string, isRest?: boolean, octaveShiftApplied?: boolean);
    /** Turns an AccidentalEnum into half tone steps for pitch calculation.
     *
     */
    static HalfTonesFromAccidental(accidental: AccidentalEnum): number;
    static AccidentalFromHalfTones(halfTones: number): AccidentalEnum;
    /**
     * Converts AccidentalEnum to a string which represents an accidental in VexFlow
     * Can also be useful in other cases, but has to match Vexflow accidental codes.
     * @param accidental
     * @returns {string} Vexflow Accidental code
     */
    static accidentalVexflow(accidental: AccidentalEnum): string;
    get AccidentalHalfTones(): number;
    get Octave(): number;
    get FundamentalNote(): NoteEnum;
    get Accidental(): AccidentalEnum;
    get AccidentalXml(): string;
    get Frequency(): number;
    static get OctaveXmlDifference(): number;
    getHalfTone(): number;
    getTransposedPitch(factor: number): Pitch;
    DoEnharmonicChange(): void;
    ToString(): string;
    /** A short representation of the note like A4 (A, octave 4), Ab5 or C#4. */
    ToStringShort(octaveOffset?: number): string;
    /** A shortcut getter for ToStringShort that can be useful for debugging. */
    get ToStringShortGet(): string;
    OperatorEquals(p2: Pitch): boolean;
    OperatorNotEqual(p2: Pitch): boolean;
    OperatorFundamentalGreaterThan(p2: Pitch): boolean;
    OperatorFundamentalLessThan(p2: Pitch): boolean;
    private getHigherPitchByTransposeFactor;
    private getLowerPitchByTransposeFactor;
    private getNextFundamentalNote;
    private getPreviousFundamentalNote;
}

declare abstract class AbstractNotationInstruction {
    constructor(parent: SourceStaffEntry);
    protected parent: SourceStaffEntry;
    /** States whether the object should be displayed. False if xmlNode.attribute("print-object").value = "no". */
    private printObject;
    get Parent(): SourceStaffEntry;
    set Parent(value: SourceStaffEntry);
    get PrintObject(): boolean;
    set PrintObject(value: boolean);
}

/**
 * A [[ClefInstruction]] is the clef placed at the beginning of the stave, which indicates the pitch of the notes.
 */
declare class ClefInstruction extends AbstractNotationInstruction {
    constructor(clefType?: ClefEnum, octaveOffset?: number, line?: number);
    private clefType;
    private line;
    private octaveOffset;
    private clefPitch;
    private referenceCyPosition;
    static getDefaultClefFromMidiInstrument(instrument: MidiInstrument): ClefInstruction;
    static getAllPossibleClefs(): ClefInstruction[];
    static isSupportedClef(clef: ClefEnum): boolean;
    get ClefType(): ClefEnum;
    set ClefType(value: ClefEnum);
    get Line(): number;
    set Line(value: number);
    get OctaveOffset(): number;
    set OctaveOffset(value: number);
    get ClefPitch(): Pitch;
    set ClefPitch(value: Pitch);
    get ReferenceCyPosition(): number;
    set ReferenceCyPosition(value: number);
    Equals(other: ClefInstruction): boolean;
    NotEqual(clef2: ClefInstruction): boolean;
    ToString(): string;
    private calcParameters;
}
declare enum ClefEnum {
    G = 0,
    F = 1,
    C = 2,
    percussion = 3,
    TAB = 4
}
declare enum MidiInstrument {
    None = -1,
    Acoustic_Grand_Piano = 0,
    Bright_Acoustic_Piano = 1,
    Electric_Grand_Piano = 2,
    Honky_tonk_Piano = 3,
    Electric_Piano_1 = 4,
    Electric_Piano_2 = 5,
    Harpsichord = 6,
    Clavinet = 7,
    Celesta = 8,
    Glockenspiel = 9,
    Music_Box = 10,
    Vibraphone = 11,
    Marimba = 12,
    Xylophone = 13,
    Tubular_Bells = 14,
    Dulcimer = 15,
    Drawbar_Organ = 16,
    Percussive_Organ = 17,
    Rock_Organ = 18,
    Church_Organ = 19,
    Reed_Organ = 20,
    Accordion = 21,
    Harmonica = 22,
    Tango_Accordion = 23,
    Acoustic_Guitar_nylon = 24,
    Acoustic_Guitar_steel = 25,
    Electric_Guitar_jazz = 26,
    Electric_Guitar_clean = 27,
    Electric_Guitar_muted = 28,
    Overdriven_Guitar = 29,
    Distortion_Guitar = 30,
    Guitar_harmonics = 31,
    Acoustic_Bass = 32,
    Electric_Bass_finger = 33,
    Electric_Bass_pick = 34,
    Fretless_Bass = 35,
    Slap_Bass_1 = 36,
    Slap_Bass_2 = 37,
    Synth_Bass_1 = 38,
    Synth_Bass_2 = 39,
    Violin = 40,
    Viola = 41,
    Cello = 42,
    Contrabass = 43,
    Tremolo_Strings = 44,
    Pizzicato_Strings = 45,
    Orchestral_Harp = 46,
    Timpani = 47,
    String_Ensemble_1 = 48,
    String_Ensemble_2 = 49,
    Synth_Strings_1 = 50,
    Synth_Strings_2 = 51,
    Choir_Aahs = 52,
    Voice_Oohs = 53,
    Synth_Voice = 54,
    Orchestra_Hit = 55,
    Trumpet = 56,
    Trombone = 57,
    Tuba = 58,
    Muted_Trumpet = 59,
    French_Horn = 60,
    Brass_Section = 61,
    Synth_Brass_1 = 62,
    Synth_Brass_2 = 63,
    Soprano_Sax = 64,
    Alto_Sax = 65,
    Tenor_Sax = 66,
    Baritone_Sax = 67,
    Oboe = 68,
    English_Horn = 69,
    Bassoon = 70,
    Clarinet = 71,
    Piccolo = 72,
    Flute = 73,
    Recorder = 74,
    Pan_Flute = 75,
    Blown_Bottle = 76,
    Shakuhachi = 77,
    Whistle = 78,
    Ocarina = 79,
    Lead_1_square = 80,
    Lead_2_sawtooth = 81,
    Lead_3_calliope = 82,
    Lead_4_chiff = 83,
    Lead_5_charang = 84,
    Lead_6_voice = 85,
    Lead_7_fifths = 86,
    Lead_8_bass_lead = 87,
    Pad_1_new_age = 88,
    Pad_2_warm = 89,
    Pad_3_polysynth = 90,
    Pad_4_choir = 91,
    Pad_5_bowed = 92,
    Pad_6_metallic = 93,
    Pad_7_halo = 94,
    Pad_8_sweep = 95,
    FX_1_rain = 96,
    FX_2_soundtrack = 97,
    FX_3_crystal = 98,
    FX_4_atmosphere = 99,
    FX_5_brightness = 100,
    FX_6_goblins = 101,
    FX_7_echoes = 102,
    FX_8_scifi = 103,
    Sitar = 104,
    Banjo = 105,
    Shamisen = 106,
    Koto = 107,
    Kalimba = 108,
    Bag_pipe = 109,
    Fiddle = 110,
    Shanai = 111,
    Tinkle_Bell = 112,
    Agogo = 113,
    Steel_Drums = 114,
    Woodblock = 115,
    Taiko_Drum = 116,
    Melodic_Tom = 117,
    Synth_Drum = 118,
    Reverse_Cymbal = 119,
    Guitar_Fret_Noise = 120,
    Breath_Noise = 121,
    Seashore = 122,
    Bird_Tweet = 123,
    Telephone_Ring = 124,
    Helicopter = 125,
    Applause = 126,
    Gunshot = 127,
    Percussion = 128
}

declare class SubInstrument {
    constructor(parentInstrument: Instrument);
    private static midiInstrument;
    idString: string;
    midiInstrumentID: MidiInstrument;
    volume: number;
    pan: number;
    fixedKey: number;
    name: string;
    private parentInstrument;
    get ParentInstrument(): Instrument;
    static isPianoInstrument(instrument: MidiInstrument): boolean;
    setMidiInstrument(instrumentType: string): void;
    private parseMidiInstrument;
}

declare class Instrument extends InstrumentalGroup {
    constructor(id: number, idString: string, musicSheet: MusicSheet, parent: InstrumentalGroup);
    /** Transposition halftones for this instrument only.
     *  This is additive to osmd.Sheet.Transpose (MusicSheet).
     *  osmd.TransposeCaculator needs to be defined/created for this to take effect. (just set it with new TransposeCalculator())
     * You need to call osmd.updateGraphic() before the next render() (assuming this is set after load()).
     */
    Transpose: number;
    highlight: boolean;
    private voices;
    private staves;
    private nameLabel;
    private idString;
    private id;
    private hasLyrics;
    private hasChordSymbols;
    private playbackTranspose;
    private lyricVersesNumbers;
    private subInstruments;
    private partAbbreviation;
    get Voices(): Voice[];
    get Staves(): Staff[];
    get NameLabel(): Label;
    get HasLyrics(): boolean;
    set HasLyrics(value: boolean);
    get HasChordSymbols(): boolean;
    set HasChordSymbols(value: boolean);
    get LyricVersesNumbers(): string[];
    set LyricVersesNumbers(value: string[]);
    get Name(): string;
    set Name(value: string);
    get IdString(): string;
    get Id(): number;
    get MidiInstrumentId(): MidiInstrument;
    set MidiInstrumentId(value: MidiInstrument);
    get Volume(): number;
    set Volume(value: number);
    get PlaybackTranspose(): number;
    set PlaybackTranspose(value: number);
    get SubInstruments(): SubInstrument[];
    getSubInstrument(subInstrumentIdString: string): SubInstrument;
    get PartAbbreviation(): string;
    set PartAbbreviation(value: string);
    get Visible(): boolean;
    /** Checks that Instrument.Visible and at least one staff visible. */
    isVisible(): boolean;
    set Visible(value: boolean);
    get Audible(): boolean;
    set Audible(value: boolean);
    get Following(): boolean;
    set Following(value: boolean);
    SetVoiceAudible(voiceId: number, audible: boolean): void;
    SetVoiceFollowing(voiceId: number, following: boolean): void;
    SetStaffAudible(staffId: number, audible: boolean): void;
    SetStaffFollow(staffId: number, follow: boolean): void;
    areAllVoiceVisible(): boolean;
    createStaves(numberOfStaves: number): void;
    toString(): string;
}

/**
 * A [[Beam]] - the bar grouping multiple consecutive [[Note]]s.
 */
declare class Beam {
    private notes;
    private extendedNoteList;
    BeamNumber: number;
    BeamNumberOffsetToXML: number;
    AutoGenerated: boolean;
    constructor(beamNumber?: number, beamNumberOffsetToXML?: number);
    get Notes(): Note[];
    set Notes(value: Note[]);
    get ExtendedNoteList(): Note[];
    set ExtendedNoteList(value: Note[]);
    /**
     * Perform all the appropriate actions for adding a singleNote to the Beam.
     * @param note
     */
    addNoteToBeam(note: Note): void;
}
declare enum BeamEnum {
    BeamNone = -1,
    BeamBegin = 0,
    BeamContinue = 1,
    BeamEnd = 2,
    BeamForward = 3,
    BeamBackward = 4
}

declare class AbstractExpression {
    protected placement: PlacementEnum;
    parentMeasure: SourceMeasure;
    ColorXML: string;
    constructor(placement: PlacementEnum);
    protected static isStringInStringList(stringList: Array<string>, inputString: string): boolean;
    /** Placement of the expression */
    get Placement(): PlacementEnum;
    static PlacementEnumFromString(placementString: string): PlacementEnum;
}
declare enum PlacementEnum {
    Above = 0,
    Below = 1,
    Left = 2,
    Right = 3,
    NotYetDefined = 4,
    AboveOrBelow = 5
}

/**
 * Tuplets create irregular rhythms; e.g. triplets, quadruplets, quintuplets, etc.
 */
declare class Tuplet {
    constructor(tupletLabelNumber: number, bracket?: boolean);
    private tupletLabelNumber;
    PlacementFromXml: boolean;
    tupletLabelNumberPlacement: PlacementEnum;
    RenderTupletNumber: boolean;
    /** Notes contained in the tuplet, per VoiceEntry (list of VoiceEntries, which has a list of notes). */
    private notes;
    private fractions;
    Ratioed: boolean;
    /** Whether this tuplet has a bracket. (e.g. showing |--3--| or just 3 for a triplet) */
    private bracket;
    /** Boolean if 'bracket="no"' or "yes" was explicitly requested in the XML, otherwise undefined. */
    BracketedXmlValue: boolean;
    /** Whether <tuplet show-number="none"> was given in the XML, indicating the tuplet number should not be rendered. */
    ShowNumberNoneGivenInXml: boolean;
    /** Determines whether the tuplet should be bracketed (arguments are EngravingRules). */
    shouldBeBracketed(useXmlValue: boolean, tupletsBracketed: boolean, tripletsBracketed: boolean, isTabMeasure?: boolean, tabTupletsBracketed?: boolean): boolean;
    get TupletLabelNumber(): number;
    set TupletLabelNumber(value: number);
    get Notes(): Note[][];
    set Notes(value: Note[][]);
    get Fractions(): Fraction[];
    set Fractions(value: Fraction[]);
    get Bracket(): boolean;
    set Bracket(value: boolean);
    /**
     * Returns the index of the given Note in the Tuplet List (notes[0], notes[1],...).
     * @param note
     * @returns {number}
     */
    getNoteIndex(note: Note): number;
}

declare enum ColoringModes {
    XML = 0,
    AutoColoring = 1,
    CustomColorSet = 2
}

declare enum DrawingParametersEnum {
    allon = "allon",
    compact = "compact",
    compacttight = "compacttight",
    default = "default",
    leadsheet = "leadsheet",
    preview = "preview",
    thumbnail = "thumbnail"
}

/**
 * The types of ties available
 */
declare enum TieTypes {
    "SIMPLE" = "",
    "HAMMERON" = "H",
    "PULLOFF" = "P",
    "SLIDE" = "S",
    "TAPPING" = "T"
}

/**
 * A [[Tie]] connects two notes of the same pitch and name, indicating that they have to be played as a single note.
 */
declare class Tie {
    constructor(note: Note, type: TieTypes);
    private notes;
    private type;
    TieNumber: number;
    TieDirection: PlacementEnum;
    /** Can contain tie directions at certain note indices.
     *  For example, if it contains {2: PlacementEnum.Below}, then
     *  the tie should go downwards from Tie.Notes[2] onwards,
     *  even if tie.TieDirection is PlacementEnum.Above (tie starts going up on Notes[0]).
     */
    NoteIndexToTieDirection: NoteIndexToPlacementEnum;
    getTieDirection(startNote?: Note): PlacementEnum;
    get Notes(): Note[];
    get Type(): TieTypes;
    get StartNote(): Note;
    get Duration(): Fraction;
    get Pitch(): Pitch;
    AddNote(note: Note): void;
}
interface NoteIndexToPlacementEnum {
    [key: number]: PlacementEnum;
}

declare class Slur {
    constructor();
    private startNote;
    private endNote;
    PlacementXml: PlacementEnum;
    get StartNote(): Note;
    set StartNote(value: Note);
    get EndNote(): Note;
    set EndNote(value: Note);
    startNoteHasMoreStartingSlurs(): boolean;
    endNoteHasMoreEndingSlurs(): boolean;
    isCrossed(): boolean;
    isSlurLonger(): boolean;
}

/**
 * The supported styles to draw a rectangle on the music sheet
 */
declare enum OutlineAndFillStyleEnum {
    BaseWritingColor = 0,
    FollowingCursor = 1,
    AlternativeFollowingCursor = 2,
    PlaybackCursor = 3,
    Highlighted = 4,
    ErrorUnderlay = 5,
    Selected = 6,
    SelectionSymbol = 7,
    DebugColor1 = 8,
    DebugColor2 = 9,
    DebugColor3 = 10,
    SplitScreenDivision = 11,
    GreyTransparentOverlay = 12,
    MarkedArea1 = 13,
    MarkedArea2 = 14,
    MarkedArea3 = 15,
    MarkedArea4 = 16,
    MarkedArea5 = 17,
    MarkedArea6 = 18,
    MarkedArea7 = 19,
    MarkedArea8 = 20,
    MarkedArea9 = 21,
    MarkedArea10 = 22,
    Comment1 = 23,
    Comment2 = 24,
    Comment3 = 25,
    Comment4 = 26,
    Comment5 = 27,
    Comment6 = 28,
    Comment7 = 29,
    Comment8 = 30,
    Comment9 = 31,
    Comment10 = 32
}
declare const OUTLINE_AND_FILL_STYLE_DICT: Dictionary<OutlineAndFillStyleEnum, string>;
declare enum StyleSets {
    MarkedArea = 0,
    Comment = 1
}
/**
 * The layers which one can draw on (not supported)
 */
declare enum GraphicalLayers {
    Background = 0,
    Highlight = 1,
    MeasureError = 2,
    SelectionSymbol = 3,
    Cursor = 4,
    PSI_Debug = 5,
    Notes = 6,
    Comment = 7,
    Debug_above = 8
}
declare enum NoteState {
    Normal = 0,
    Selected = 1,
    Follow_Confirmed = 2,
    QFeedback_NotFound = 3,
    QFeedback_OK = 4,
    QFeedback_Perfect = 5,
    Debug1 = 6,
    Debug2 = 7,
    Debug3 = 8
}
declare enum AutoColorSet {
    C = "#d82c6b",
    D = "#F89D15",
    E = "#FFE21A",
    F = "#4dbd5c",
    G = "#009D96",
    A = "#43469d",
    B = "#76429c",
    Rest = "#000000"
}

/**
 * A note head with shape and fill information belonging to a [[Note]].
 */
declare class Notehead {
    /**
     * @param sourceNote
     * @param shapeTypeXml The shape type given from XML.
     *                     See https://usermanuals.musicxml.com/MusicXML/Content/ST-MusicXML-notehead-value.htm
     * @param filledXml The XML flag to fill the note shape. Can be undefined if not included in XML.
     *                  If undefined, the filled parameter will be calculated by note duration (d < half note => filled)
     */
    constructor(sourceNote: Note, shapeTypeXml: string, filledXml?: boolean);
    /** shape of the note head (normal, square, triangle, etc.) */
    private shape;
    private filled;
    /** the [[Note]] this NoteHead belongs to. */
    private sourceNote;
    /** Sets the note head's shape from XML parameters.
     * @param shapeTypeXml The XML shape.
     * @param filledXmlAttribute the filled parameter as given in XML.
     *                           Can be undefined if not given in XML or if it should be calculated from note duration.
     *                           If undefined, this.sourceNote should not be undefined.
     */
    setShapeFromXml(shapeTypeXml: string, filledXmlAttribute?: boolean): void;
    get SourceNote(): Note;
    get Shape(): NoteHeadShape;
    get Filled(): boolean;
    /** Converts xml attribute to NoteHeadShape.
     * Necessary because "circle-x" is not a valid enum member name.
     */
    static ShapeTypeXmlToShape(shapeTypeXml: string): NoteHeadShape;
}
/** shape of a note head, needs to be supported by MusicXML and Vexflow. */
declare enum NoteHeadShape {
    CIRCLEX = 0,
    DIAMOND = 1,
    NORMAL = 2,
    RECTANGLE = 3,
    SLASH = 4,
    SQUARE = 5,
    TRIANGLE = 6,
    TRIANGLE_INVERTED = 7,
    X = 8
}

declare class Arpeggio {
    constructor(parentVoiceEntry: VoiceEntry, type?: ArpeggioType);
    parentVoiceEntry: VoiceEntry;
    notes: Note[];
    type: ArpeggioType;
    addNote(note: Note): void;
}
/** Corresponds to VF.Stroke.Type for now. But we don't want VexFlow as a dependency here. */
declare enum ArpeggioType {
    BRUSH_DOWN = 1,
    BRUSH_UP = 2,
    ROLL_DOWN = 3,
    ROLL_UP = 4,
    RASQUEDO_DOWN = 5,
    RASQUEDO_UP = 6,
    ARPEGGIO_DIRECTIONLESS = 7
}

declare enum NoteType {
    UNDEFINED = 0,// e.g. not given in XML
    _1024th = 1,// enum member cannot start with a number
    _512th = 2,
    _256th = 3,
    _128th = 4,
    _64th = 5,
    _32nd = 6,
    _16th = 7,
    EIGTH = 8,
    QUARTER = 9,
    HALF = 10,
    WHOLE = 11,
    BREVE = 12,
    LONG = 13,
    MAXIMA = 14
}
declare class NoteTypeHandler {
    static NoteTypeXmlValues: string[];
    static NoteTypeToString(noteType: NoteType): string;
    static StringToNoteType(noteType: string): NoteType;
    /**
     *
     * @param type
     * @returns {Fraction} - a Note's Duration from a given type (type must be valid).
     */
    static getNoteDurationFromType(type: string): Fraction;
}

/**
 * A [[KeyInstruction]] is a key signature denoting which notes are to be sharpened or flattened.
 */
declare class KeyInstruction extends AbstractNotationInstruction {
    constructor(sourceStaffEntry?: SourceStaffEntry, key?: number, mode?: KeyEnum);
    private static sharpPositionList;
    private static flatPositionList;
    private keyType;
    keyTypeOriginal: number;
    private mode;
    private alteratedNotes;
    /** The halftones this instruction was transposed by, compared to the original. */
    isTransposedBy: number;
    static copy(keyInstruction: KeyInstruction): KeyInstruction;
    static getAllPossibleMajorKeyInstructions(): KeyInstruction[];
    get Key(): number;
    set Key(value: number);
    get Mode(): KeyEnum;
    set Mode(value: KeyEnum);
    get AlteratedNotes(): NoteEnum[];
    private calcAlteratedNotes;
    willAlterateNote(note: NoteEnum): boolean;
    getAlterationForPitch(pitch: Pitch): AccidentalEnum;
    ToString(): string;
    OperatorEquals(key2: KeyInstruction): boolean;
    OperatorNotEqual(key2: KeyInstruction): boolean;
}
declare class NoteEnumToHalfToneLink {
    constructor(note: NoteEnum, halftone: number);
    note: NoteEnum;
    halfTone: number;
}
declare enum KeyEnum {
    major = 0,
    minor = 1,
    none = 2,
    dorian = 3,
    phrygian = 4,
    lydian = 5,
    mixolydian = 6,
    aeolian = 7,
    ionian = 8,
    locrian = 9
}

declare class RepetitionInstructionComparer {
    static Compare(x: RepetitionInstruction, y: RepetitionInstruction): number;
}
declare class RepetitionInstruction {
    constructor(measureIndex: number, type: RepetitionInstructionEnum, alignment?: AlignmentType, parentRepetition?: Repetition, endingIndices?: number[]);
    measureIndex: number;
    endingIndices: number[];
    type: RepetitionInstructionEnum;
    alignment: AlignmentType;
    parentRepetition: Repetition;
    CompareTo(obj: Object): number;
    equals(other: RepetitionInstruction): boolean;
}
declare enum RepetitionInstructionEnum {
    StartLine = 0,
    ForwardJump = 1,
    BackJumpLine = 2,
    Ending = 3,
    DaCapo = 4,
    DalSegno = 5,
    Fine = 6,
    ToCoda = 7,
    DalSegnoAlFine = 8,
    DaCapoAlFine = 9,
    DalSegnoAlCoda = 10,
    DaCapoAlCoda = 11,
    Coda = 12,
    Segno = 13,
    None = 14
}
declare enum AlignmentType {
    Begin = 0,
    End = 1
}

/**
 * A [[RhythmInstruction]] is the time signature which specifies the number of beats in each bar, and the value of one beat.
 */
declare class RhythmInstruction extends AbstractNotationInstruction {
    constructor(rhythm: Fraction, rhythmSymbolEnum: RhythmSymbolEnum);
    private numerator;
    private denominator;
    private rhythm;
    private symbolEnum;
    get Rhythm(): Fraction;
    set Rhythm(value: Fraction);
    get SymbolEnum(): RhythmSymbolEnum;
    set SymbolEnum(value: RhythmSymbolEnum);
    clone(): RhythmInstruction;
    OperatorEquals(rhythm2: RhythmInstruction): boolean;
    OperatorNotEqual(rhythm2: RhythmInstruction): boolean;
    ToString(): string;
}
declare enum RhythmSymbolEnum {
    NONE = 0,
    COMMON = 1,
    CUT = 2
}

declare enum TechnicalInstructionType {
    Fingering = 0,
    String = 1
}
declare class TechnicalInstruction {
    type: TechnicalInstructionType;
    value: string;
    placement: PlacementEnum;
    sourceNote: Note;
    /** To be able to set fontFamily for fingerings, e.g. (after load, before render):
     * osmd.cursor.GNotesUnderCursor()[0].parentVoiceEntry.parentVoiceEntry.TechnicalInstructions[0].fontFamily = "Comic Sans MS"
     * Note that staffEntry.FingeringInstructions is only created during render(),
     *   so it's no use setting it there before render.
     */
    fontFamily: string;
}

declare class PointF2D {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    static get Empty(): PointF2D;
    static pointsAreEqual(p1: PointF2D, p2: PointF2D): boolean;
    ToString(): string;
}

/**
 * Represent the size of a 2D object, with (width, height)
 */
declare class SizeF2D {
    width: number;
    height: number;
    constructor(width?: number, height?: number);
}

/**
 * Represent a rectangle on a plane
 */
declare class RectangleF2D {
    x: number;
    y: number;
    width: number;
    height: number;
    /**
     *
     * @param x
     * @param y
     * @param width
     * @param height
     */
    constructor(x: number, y: number, width: number, height: number);
    static createFromLocationAndSize(location: PointF2D, size: SizeF2D): RectangleF2D;
    get Location(): PointF2D;
    get Size(): SizeF2D;
}

declare abstract class AClassHierarchyTrackable {
    isInstanceOfClass(className: string): boolean;
}

declare class GraphicalObject extends AClassHierarchyTrackable {
    protected boundingBox: BoundingBox;
    get PositionAndShape(): BoundingBox;
    set PositionAndShape(value: BoundingBox);
}

/**
 * A bounding box delimits an area on the 2D plane.
 * @param dataObject Graphical object where the bounding box will be attached
 * @param parent Parent bounding box of an object in a higher hierarchy position
 * @param connectChildToParent Create a child to parent relationship too. Will be true by default
 */
declare class BoundingBox {
    protected isSymbol: boolean;
    protected relativePositionHasBeenSet: boolean;
    protected xBordersHaveBeenSet: boolean;
    protected yBordersHaveBeenSet: boolean;
    protected absolutePosition: PointF2D;
    protected relativePosition: PointF2D;
    protected size: SizeF2D;
    protected marginSize: SizeF2D;
    protected upperLeftCorner: PointF2D;
    protected upperLeftMarginCorner: PointF2D;
    protected borderLeft: number;
    protected borderRight: number;
    protected borderTop: number;
    protected borderBottom: number;
    protected borderMarginLeft: number;
    protected borderMarginRight: number;
    protected borderMarginTop: number;
    protected borderMarginBottom: number;
    protected boundingRectangle: RectangleF2D;
    protected boundingMarginRectangle: RectangleF2D;
    protected childElements: BoundingBox[];
    protected parent: BoundingBox;
    protected dataObject: Object;
    /**
     * Create a bounding box
     * @param dataObject Graphical object where the bounding box will be attached
     * @param parent Parent bounding box of an object in a higher hierarchy position
     * @param isSymbol Defines the bounding box to be symbol thus not calculating its boundaries by itself. NOTE: Borders need to be set!
     */
    constructor(dataObject?: Object, parent?: BoundingBox, isSymbol?: boolean);
    get RelativePositionHasBeenSet(): boolean;
    get XBordersHaveBeenSet(): boolean;
    set XBordersHaveBeenSet(value: boolean);
    get YBordersHaveBeenSet(): boolean;
    set YBordersHaveBeenSet(value: boolean);
    get AbsolutePosition(): PointF2D;
    set AbsolutePosition(value: PointF2D);
    get RelativePosition(): PointF2D;
    set RelativePosition(value: PointF2D);
    get Size(): SizeF2D;
    set Size(value: SizeF2D);
    get MarginSize(): SizeF2D;
    get UpperLeftCorner(): PointF2D;
    get UpperLeftMarginCorner(): PointF2D;
    get BorderLeft(): number;
    set BorderLeft(value: number);
    get BorderRight(): number;
    set BorderRight(value: number);
    get BorderTop(): number;
    set BorderTop(value: number);
    get BorderBottom(): number;
    set BorderBottom(value: number);
    get BorderMarginLeft(): number;
    set BorderMarginLeft(value: number);
    get BorderMarginRight(): number;
    set BorderMarginRight(value: number);
    get BorderMarginTop(): number;
    set BorderMarginTop(value: number);
    get BorderMarginBottom(): number;
    set BorderMarginBottom(value: number);
    get BoundingRectangle(): RectangleF2D;
    get BoundingMarginRectangle(): RectangleF2D;
    get ChildElements(): BoundingBox[];
    set ChildElements(value: BoundingBox[]);
    get Parent(): BoundingBox;
    set Parent(value: BoundingBox);
    get DataObject(): Object;
    /**
     * Get the center of a bounding box
     * @param boundingBox Bounding box to check
     */
    get Center(): PointF2D;
    setAbsolutePositionFromParent(): void;
    /**
     * Calculate the the absolute position by adding up all relative positions of all parents (including the own rel. pos.)
     */
    calculateAbsolutePosition(): void;
    /**
     * This method calculates the Absolute Positions recursively
     */
    calculateAbsolutePositionsRecursiveWithoutTopelement(): void;
    /**
     * This method calculates the Absolute Positions recursively
     * from the root element down to the leaf elements
     * @param x
     * @param y
     */
    calculateAbsolutePositionsRecursive(x: number, y: number): void;
    /**
     * calculates the absolute positions of all children of this boundingBox
     */
    calculateAbsolutePositionsOfChildren(): void;
    /**
     * This method calculates the BoundingBoxes
     */
    calculateBoundingBox(ignoreClasses?: string[]): void;
    calculateTopBottomBorders(): void;
    /**
     * This method computes the first non-overlapping position in the placementPsi Element for the current (this) positionAndShapeInfo
     * @param placementPsi
     * @param direction
     * @param position
     */
    computeNonOverlappingPositionWithMargin(placementPsi: BoundingBox, direction: ColDirEnum, position: PointF2D): void;
    /**
     * This method detects a collision (without margins)
     * @param psi
     * @returns {boolean}
     */
    collisionDetection(psi: BoundingBox): boolean;
    /**
     * This method checks if the given Psi's Margins lie inside the current Psi's Margins.
     * @param psi
     * @returns {boolean}
     */
    liesInsideBorders(psi: BoundingBox): boolean;
    pointLiesInsideBorders(position: PointF2D): boolean;
    /**
     * This method detects a collision (margin-wide)
     * @param psi
     * @returns {boolean}
     */
    marginCollisionDetection(psi: BoundingBox): boolean;
    /**
     * This method checks if the given Psi's Margins lie inside the current Psi's Margins
     * @param psi
     * @returns {boolean}
     */
    liesInsideMargins(psi: BoundingBox): boolean;
    pointLiesInsideMargins(position: PointF2D): boolean;
    /**
     * This method computes the first non-overlapping position in the placementPsi Element for the current (this) positionAndShapeInfo
     * @param placementPsi
     * @param direction
     * @param position
     */
    computeNonOverlappingPosition(placementPsi: BoundingBox, direction: ColDirEnum, position: PointF2D): void;
    getClickedObjectOfType<T>(clickPosition: PointF2D): T;
    getObjectsInRegion<T extends GraphicalObject>(region: BoundingBox, liesInside?: boolean, className?: string): T[];
    protected calculateRectangle(): void;
    protected calculateMarginRectangle(): void;
    /**
     * This method calculates the margin border along the given direction so that no collision takes place along this direction
     * @param toBePlaced
     * @param direction
     */
    private calculateMarginPositionAlongDirection;
    /**
     * This method calculates the border along the given direction so that no collision takes place along this direction
     * @param toBePlaced
     * @param direction
     */
    private calculatePositionAlongDirection;
}
declare enum ColDirEnum {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3,
    NotYetDefined = 4
}

declare class Glissando {
    constructor(note: Note);
    private notes;
    StartNote: Note;
    EndNote: Note;
    XMLNumber: number;
    Direction: ColDirEnum;
    get Notes(): Note[];
    get Duration(): Fraction;
    get Pitch(): Pitch;
    AddNote(note: Note): void;
}

/**
 * Represents a single pitch with a duration (length)
 */
declare class Note {
    constructor(voiceEntry: VoiceEntry, parentStaffEntry: SourceStaffEntry, length: Fraction, pitch: Pitch, sourceMeasure: SourceMeasure, isRest?: boolean);
    /**
     * The transposed (!!!) HalfTone of this note.
     */
    halfTone: number;
    state: NoteState;
    private voiceEntry;
    private parentStaffEntry;
    private length;
    private sourceMeasure;
    /** The length/duration given in the <type> tag. different from length for tuplets/tremolos. */
    private typeLength;
    /** The NoteType given in the XML, e.g. quarter, which can be a normal quarter or tuplet quarter -> can have different length/fraction */
    private noteTypeXml;
    DotsXml: number;
    /** The amount of notes the tuplet of this note (if there is one) replaces. */
    private normalNotes;
    private isRestFlag;
    IsWholeMeasureRest: boolean;
    /**
     * The untransposed (!!!) source data.
     */
    private pitch;
    /** The transposed pitch, if the score is transposed, otherwise undefined. */
    TransposedPitch: Pitch;
    displayStepUnpitched: NoteEnum;
    displayOctaveUnpitched: number;
    get NoteAsString(): string;
    private beam;
    private tuplet;
    private tie;
    private glissando;
    private slurs;
    private playbackInstrumentId;
    private notehead;
    /** Custom notehead vexflow code. E.g. "vb" = quarter, "v1d" = whole, "v53" = half, etc. - see tables.js
     * Set this before render() (e.g. after load, before first render).
     */
    CustomNoteheadVFCode: string;
    /** States whether the note should be displayed. False if xmlNode.attribute("print-object").value = "no". */
    private printObject;
    /** The Arpeggio this note is part of. */
    private arpeggio;
    /** States whether this is a cue note (Stichnote) (smaller size). */
    private isCueNote;
    IsGraceNote: boolean;
    /** The stem direction asked for in XML. Not necessarily final or wanted stem direction. */
    private stemDirectionXml;
    /** The number of tremolo strokes this note has (16th tremolo = 2 strokes).
     * Could be a Tremolo object in future when there is more data like tremolo between two notes.
     */
    TremoloInfo: TremoloInfo;
    /** Color of the stem given in the XML Stem tag. RGB Hexadecimal, like #00FF00.
     * This is not used for rendering, which takes VoiceEntry.StemColor.
     * It is merely given in the note's stem element in XML and stored here for reference.
     * So, to read or change the stem color of a note, modify note.ParentVoiceEntry.StemColor.
     */
    private stemColorXml;
    /** Color of the notehead given in the XML Notehead tag. RGB Hexadecimal, like #00FF00.
     * This should not be changed, instead noteheadColor is used and modifiable for Rendering.
     * Needs to be stored here and not in Note.Notehead,
     * because Note.Notehead is undefined for normal Noteheads to save space and time.
     */
    private noteheadColorXml;
    /** Color of the notehead currently set/desired for next render. RGB Hexadecimal, like #00FF00.
     * Needs to be stored here and not in Note.Notehead,
     * because Note.Notehead is undefined for normal Noteheads to save space and time.
     */
    private noteheadColor;
    private noteheadColorCurrentlyRendered;
    Fingering: TechnicalInstruction;
    StringInstruction: TechnicalInstruction;
    /** Used by GraphicalNote.FromNote(note) and osmd.rules.GNote(note) to get a GraphicalNote from a Note.
     *  Note that we don't want the data model (Note) to be dependent on the graphical implementation (GraphicalNote),
     *    and have (potentially circular) import dependencies of graphical parts, which also applies to other non-graphical classes.
     *    That's why we don't save a GraphicalNote reference directly in Note.
     */
    NoteToGraphicalNoteObjectId: number;
    ToStringShort(octaveOffset?: number): string;
    get ToStringShortGet(): string;
    get ParentVoiceEntry(): VoiceEntry;
    set ParentVoiceEntry(value: VoiceEntry);
    get ParentStaffEntry(): SourceStaffEntry;
    get ParentStaff(): Staff;
    get Length(): Fraction;
    set Length(value: Fraction);
    get SourceMeasure(): SourceMeasure;
    get TypeLength(): Fraction;
    set TypeLength(value: Fraction);
    get NoteTypeXml(): NoteType;
    set NoteTypeXml(value: NoteType);
    get NormalNotes(): number;
    set NormalNotes(value: number);
    get Pitch(): Pitch;
    get NoteBeam(): Beam;
    set NoteBeam(value: Beam);
    set Notehead(value: Notehead);
    get Notehead(): Notehead;
    get NoteTuplet(): Tuplet;
    set NoteTuplet(value: Tuplet);
    get NoteGlissando(): Glissando;
    set NoteGlissando(value: Glissando);
    get NoteTie(): Tie;
    set NoteTie(value: Tie);
    get NoteSlurs(): Slur[];
    set NoteSlurs(value: Slur[]);
    get PlaybackInstrumentId(): string;
    set PlaybackInstrumentId(value: string);
    get PrintObject(): boolean;
    set PrintObject(value: boolean);
    get Arpeggio(): Arpeggio;
    set Arpeggio(value: Arpeggio);
    get IsCueNote(): boolean;
    set IsCueNote(value: boolean);
    get StemDirectionXml(): StemDirectionType;
    set StemDirectionXml(value: StemDirectionType);
    get TremoloStrokes(): number;
    get StemColorXml(): string;
    set StemColorXml(value: string);
    get NoteheadColorXml(): string;
    set NoteheadColorXml(value: string);
    /** The desired notehead color for the next render. */
    get NoteheadColor(): string;
    set NoteheadColor(value: string);
    get NoteheadColorCurrentlyRendered(): string;
    set NoteheadColorCurrentlyRendered(value: string);
    isRest(): boolean;
    /** Note: May be dangerous to use if ParentStaffEntry.VerticalContainerParent etc is not set.
     * better calculate this directly when you have access to the note's measure.
     * whole rest: length = measure length. (4/4 in a 4/4 time signature, 3/4 in a 3/4 time signature, 1/4 in a 1/4 time signature, etc.)
     */
    isWholeRest(): boolean;
    /** Whether the note fills the whole measure. */
    isWholeMeasureNote(): boolean;
    ToString(): string;
    getAbsoluteTimestamp(): Fraction;
    isDuplicateSlur(slur: Slur): boolean;
    hasTabEffects(): boolean;
}
declare enum Appearance {
    Normal = 0,
    Grace = 1,
    Cue = 2
}
interface TremoloInfo {
    tremoloStrokes: number;
    /** Buzz roll (type="unmeasured" in XML) */
    tremoloUnmeasured: boolean;
}

declare class LyricWord {
    private syllables;
    get Syllables(): LyricsEntry[];
    containsVoiceEntry(voiceEntry: VoiceEntry): boolean;
    findLyricEntryInVoiceEntry(voiceEntry: VoiceEntry): LyricsEntry;
}

declare class LyricsEntry {
    constructor(text: string, verseNumber: string, word: LyricWord, parent: VoiceEntry, syllableNumber?: number);
    private text;
    private word;
    private parent;
    private verseNumber;
    private syllableIndex;
    extend: boolean;
    get Text(): string;
    set Text(value: string);
    get Word(): LyricWord;
    get Parent(): VoiceEntry;
    set Parent(value: VoiceEntry);
    get VerseNumber(): string;
    get SyllableIndex(): number;
    get IsTranslation(): boolean;
    get IsChorus(): boolean;
    get FontStyle(): FontStyles;
}

declare class OrnamentContainer {
    constructor(ornament: OrnamentEnum);
    private ornament;
    placement: PlacementEnum;
    private accidentalAbove;
    private accidentalBelow;
    get GetOrnament(): OrnamentEnum;
    get AccidentalAbove(): AccidentalEnum;
    set AccidentalAbove(value: AccidentalEnum);
    get AccidentalBelow(): AccidentalEnum;
    set AccidentalBelow(value: AccidentalEnum);
}
declare enum OrnamentEnum {
    Trill = 0,
    Turn = 1,
    InvertedTurn = 2,
    DelayedTurn = 3,
    DelayedInvertedTurn = 4,
    Mordent = 5,
    InvertedMordent = 6
}

declare class Articulation {
    placement: PlacementEnum;
    articulationEnum: ArticulationEnum;
    constructor(articulationEnum: ArticulationEnum, placement: PlacementEnum);
    Equals(otherArticulation: Articulation): boolean;
}

/**
 * A [[VoiceEntry]] contains the notes in a voice at a timestamp.
 */
declare class VoiceEntry {
    /**
     *
     * @param timestamp The relative timestamp within the source measure.
     * @param parentVoice
     * @param parentSourceStaffEntry
     * @param isGrace States whether the VoiceEntry has (only) grace notes.
     * @param graceNoteSlash States whether the grace note(s) have a slash (Acciaccatura, played before the beat)
     */
    constructor(timestamp: Fraction, parentVoice: Voice, parentSourceStaffEntry: SourceStaffEntry, isGrace?: boolean, graceNoteSlash?: boolean, graceSlur?: boolean);
    private parentVoice;
    private parentSourceStaffEntry;
    private timestamp;
    private notes;
    private isGrace;
    /** States whether the grace notes come after a main note (at end of measure). */
    private graceAfterMainNote;
    private graceNoteSlash;
    private graceSlur;
    private articulations;
    private technicalInstructions;
    private lyricsEntries;
    /** The Arpeggio consisting of this VoiceEntry's notes. Undefined if no arpeggio exists. */
    private arpeggio;
    private ornamentContainer;
    private wantedStemDirection;
    /** Stem direction specified in the xml stem element. */
    private stemDirectionXml;
    private stemDirection;
    /** Color of the stem given in XML. RGB Hexadecimal, like #00FF00. */
    private stemColorXml;
    /** Color of the stem currently set. RGB Hexadecimal, like #00FF00. */
    private stemColor;
    get ParentSourceStaffEntry(): SourceStaffEntry;
    get ParentVoice(): Voice;
    get Timestamp(): Fraction;
    set Timestamp(value: Fraction);
    get Notes(): Note[];
    get IsGrace(): boolean;
    set IsGrace(value: boolean);
    get GraceAfterMainNote(): boolean;
    set GraceAfterMainNote(value: boolean);
    get GraceNoteSlash(): boolean;
    set GraceNoteSlash(value: boolean);
    get GraceSlur(): boolean;
    set GraceSlur(value: boolean);
    get Articulations(): Articulation[];
    set Articulations(value: Articulation[]);
    get TechnicalInstructions(): TechnicalInstruction[];
    get LyricsEntries(): Dictionary<string, LyricsEntry>;
    get Arpeggio(): Arpeggio;
    set Arpeggio(value: Arpeggio);
    get OrnamentContainer(): OrnamentContainer;
    set OrnamentContainer(value: OrnamentContainer);
    set WantedStemDirection(value: StemDirectionType);
    get WantedStemDirection(): StemDirectionType;
    set StemDirectionXml(value: StemDirectionType);
    get StemDirectionXml(): StemDirectionType;
    set StemDirection(value: StemDirectionType);
    get StemDirection(): StemDirectionType;
    get StemColorXml(): string;
    set StemColorXml(value: string);
    get StemColor(): string;
    set StemColor(value: string);
    hasArticulation(articulation: Articulation): boolean;
    static isSupportedArticulation(articulation: ArticulationEnum): boolean;
    hasTie(): boolean;
    hasSlur(): boolean;
    isStaccato(): boolean;
    isAccent(): boolean;
    getVerseNumberForLyricEntry(lyricsEntry: LyricsEntry): string;
    createVoiceEntriesForOrnament(voiceEntryWithOrnament: VoiceEntry, activeKey: KeyInstruction): VoiceEntry[];
    private createBaseVoiceEntry;
    private createAlteratedVoiceEntry;
}
declare enum ArticulationEnum {
    accent = 0,
    strongaccent = 1,
    softaccent = 2,
    marcatoup = 3,
    marcatodown = 4,
    invertedstrongaccent = 5,
    staccato = 6,
    staccatissimo = 7,
    spiccato = 8,
    tenuto = 9,
    fermata = 10,
    invertedfermata = 11,
    breathmark = 12,
    caesura = 13,
    lefthandpizzicato = 14,
    naturalharmonic = 15,
    snappizzicato = 16,
    upbow = 17,
    downbow = 18,
    scoop = 19,
    plop = 20,
    doit = 21,
    falloff = 22,
    stress = 23,
    unstress = 24,
    detachedlegato = 25,
    otherarticulation = 26,
    bend = 27
}
declare enum StemDirectionType {
    Undefined = -1,
    Up = 0,
    Down = 1,
    None = 2,
    Double = 3
}

/**
 * A [[Voice]] contains all the [[VoiceEntry]]s in a voice in a [[StaffLine]].
 */
declare class Voice {
    private voiceEntries;
    private parent;
    private visible;
    private audible;
    private following;
    /**
     * The Id given in the MusicXMl file to distinguish the different voices. It is unique per instrument.
     */
    private voiceId;
    private volume;
    constructor(parent: Instrument, voiceId: number);
    get VoiceEntries(): VoiceEntry[];
    get Parent(): Instrument;
    get Visible(): boolean;
    set Visible(value: boolean);
    get Audible(): boolean;
    set Audible(value: boolean);
    get Following(): boolean;
    set Following(value: boolean);
    get VoiceId(): number;
    get Volume(): number;
    set Volume(value: number);
}

declare class Staff {
    constructor(parentInstrument: Instrument, instrumentStaffId: number);
    idInMusicSheet: number;
    audible: boolean;
    Visible: boolean;
    following: boolean;
    isTab: boolean;
    private parentInstrument;
    private voices;
    private volume;
    private id;
    private stafflineCount;
    hasLyrics: boolean;
    openTieDict: {
        [_: number]: Tie;
    };
    get ParentInstrument(): Instrument;
    set ParentInstrument(value: Instrument);
    get Voices(): Voice[];
    get Id(): number;
    get Volume(): number;
    set Volume(value: number);
    get StafflineCount(): number;
    set StafflineCount(value: number);
    /** Checks whether Staff.Visible and Staff.ParentInstrument.Visible. */
    isVisible(): boolean;
}

/**
 * Used for linked voices.
 */
declare class StaffEntryLink {
    constructor(voiceEntry: VoiceEntry);
    private voiceEntry;
    private linkStaffEntries;
    get GetVoiceEntry(): VoiceEntry;
    get LinkStaffEntries(): SourceStaffEntry[];
    set LinkStaffEntries(value: SourceStaffEntry[]);
}

declare class Clickable extends GraphicalObject {
    dataObject: Object;
}

/**
 * The graphical counterpart of a Label
 */
declare class GraphicalLabel extends Clickable {
    private label;
    private rules;
    TextLines: {
        text: string;
        xOffset: number;
        width: number;
    }[];
    /** A reference to the Node in the SVG, if SVGBackend, otherwise undefined.
     *  Allows manipulation without re-rendering, e.g. for dynamics, lyrics, etc.
     *  For the Canvas backend, this is unfortunately not possible.
     */
    SVGNode: Node;
    /** Read-only informational variable only set once by lyrics centering algorithm. */
    CenteringXShift: number;
    ColorXML: string;
    /**
     * Creates a new GraphicalLabel from a Label
     * @param label  label object containing text
     * @param textHeight Height of text
     * @param alignment Alignement like left, right, top, ...
     * @param parent Parent Bounding Box where the label is attached to
     */
    constructor(label: Label, textHeight: number, alignment: TextAlignmentEnum, rules: EngravingRules, parent?: BoundingBox);
    get Label(): Label;
    toString(): string;
    /**
     * Calculate GraphicalLabel's Borders according to its Alignment
     * Create also the text-lines and their offsets here
     */
    setLabelPositionAndShapeBorders(): void;
}

declare class GraphicalLine {
    constructor(start: PointF2D, end: PointF2D, width?: number, styleEnum?: OutlineAndFillStyleEnum, colorHex?: string);
    styleId: number;
    private start;
    private end;
    private width;
    colorHex: string;
    SVGElement: Node;
    get Start(): PointF2D;
    set Start(value: PointF2D);
    get End(): PointF2D;
    set End(value: PointF2D);
    get Width(): number;
    set Width(value: number);
}

declare class VerticalGraphicalStaffEntryContainer {
    constructor(numberOfEntries: number, absoluteTimestamp: Fraction);
    private index;
    private absoluteTimestamp;
    private staffEntries;
    get Index(): number;
    set Index(value: number);
    get AbsoluteTimestamp(): Fraction;
    get StaffEntries(): GraphicalStaffEntry[];
    set StaffEntries(value: GraphicalStaffEntry[]);
    static compareByTimestamp(x: VerticalGraphicalStaffEntryContainer, y: VerticalGraphicalStaffEntryContainer): number;
    /**
     * Return the first non-null [[GraphicalStaffEntry]].
     * @returns {any}
     */
    getFirstNonNullStaffEntry(): GraphicalStaffEntry;
}

declare enum DynamicExpressionSymbolEnum {
    p = 0,
    f = 1,
    s = 2,
    z = 3,
    m = 4,
    r = 5
}

declare class InstantaneousDynamicExpression extends AbstractExpression {
    static staticConstructor(): void;
    constructor(dynamicExpression: string, soundDynamics: number, placement: PlacementEnum, staffNumber: number, measure: SourceMeasure);
    static dynamicToRelativeVolumeDict: Dictionary<DynamicEnum, number>;
    private multiExpression;
    private dynamicEnum;
    private soundDynamic;
    private staffNumber;
    private length;
    InMeasureTimestamp: Fraction;
    get ParentMultiExpression(): MultiExpression;
    set ParentMultiExpression(value: MultiExpression);
    get DynEnum(): DynamicEnum;
    set DynEnum(value: DynamicEnum);
    get SoundDynamic(): number;
    set SoundDynamic(value: number);
    get Placement(): PlacementEnum;
    set Placement(value: PlacementEnum);
    get StaffNumber(): number;
    set StaffNumber(value: number);
    get Length(): number;
    get MidiVolume(): number;
    get Volume(): number;
    static isInputStringInstantaneousDynamic(inputString: string): boolean;
    private static listInstantaneousDynamics;
    getDynamicExpressionSymbol(c: string): DynamicExpressionSymbolEnum;
    private calculateLength;
}
declare enum DynamicEnum {
    pppppp = 0,
    ppppp = 1,
    pppp = 2,
    ppp = 3,
    pp = 4,
    p = 5,
    mp = 6,
    mf = 7,
    f = 8,
    ff = 9,
    fff = 10,
    ffff = 11,
    fffff = 12,
    ffffff = 13,
    sf = 14,
    sff = 15,
    sfp = 16,
    sfpp = 17,
    fp = 18,
    rf = 19,
    rfz = 20,
    sfz = 21,
    sffz = 22,
    fz = 23,
    other = 24
}

declare class ContinuousDynamicExpression extends AbstractExpression {
    constructor(dynamicType: ContDynamicEnum, placement: PlacementEnum, staffNumber: number, measure: SourceMeasure, numberXml: number, label?: string);
    private static listContinuousDynamicIncreasing;
    private static listContinuousDynamicDecreasing;
    private dynamicType;
    NumberXml: number;
    private startMultiExpression;
    private endMultiExpression;
    private startVolume;
    private endVolume;
    private staffNumber;
    private label;
    IsStartOfSoftAccent: boolean;
    YPosXml: number;
    get DynamicType(): ContDynamicEnum;
    set DynamicType(value: ContDynamicEnum);
    get StartMultiExpression(): MultiExpression;
    set StartMultiExpression(value: MultiExpression);
    get EndMultiExpression(): MultiExpression;
    set EndMultiExpression(value: MultiExpression);
    get Placement(): PlacementEnum;
    set Placement(value: PlacementEnum);
    get StartVolume(): number;
    set StartVolume(value: number);
    get EndVolume(): number;
    set EndVolume(value: number);
    get StaffNumber(): number;
    set StaffNumber(value: number);
    get Label(): string;
    set Label(value: string);
    static isInputStringContinuousDynamic(inputString: string): boolean;
    getInterpolatedDynamic(currentAbsoluteTimestamp: Fraction): number;
    isWedge(): boolean;
    private setType;
}
declare enum ContDynamicEnum {
    crescendo = 0,
    /** Diminuendo/Decrescendo. These terms are apparently sometimes synonyms, and a falling wedge is given in MusicXML as type="diminuendo". */
    diminuendo = 1
}

declare class MoodExpression extends AbstractExpression {
    constructor(label: string, placement: PlacementEnum, staffNumber: number);
    private static listMoodAffettuoso;
    private static listMoodAgitato;
    private static listMoodAppassionato;
    private static listMoodAnimato;
    private static listMoodBrillante;
    private static listMoodCantabile;
    private static listMoodDolce;
    private static listMoodEnergico;
    private static listMoodEroico;
    private static listMoodEspressivo;
    private static listMoodFurioso;
    private static listMoodGiocoso;
    private static listMoodGioioso;
    private static listMoodLacrimoso;
    private static listMoodGrandioso;
    private static listMoodGrazioso;
    private static listMoodLeggiero;
    private static listMoodMaestoso;
    private static listMoodMalinconico;
    private static listMoodMarcato;
    private static listMoodMarziale;
    private static listMoodMesto;
    private static listMoodMorendo;
    private static listMoodNobilmente;
    private static listMoodPatetico;
    private static listMoodPesante;
    private static listMoodSautille;
    private static listMoodSaltando;
    private static listMoodScherzando;
    private static listMoodSostenuto;
    private static listMoodSpiccato;
    private static listMoodTenerezza;
    private static listMoodTranquillamente;
    private static listMoodTrionfante;
    private moodType;
    private label;
    private staffNumber;
    fontStyle: FontStyles;
    static isInputStringMood(inputString: string): boolean;
    get Label(): string;
    set Label(value: string);
    get Mood(): MoodEnum;
    set Mood(value: MoodEnum);
    get StaffNumber(): number;
    set StaffNumber(value: number);
    get Placement(): PlacementEnum;
    set Placement(value: PlacementEnum);
    private setMoodType;
}
declare enum MoodEnum {
    Affettuoso = 0,
    Agitato = 1,
    Appassionato = 2,
    Animato = 3,
    Brillante = 4,
    Cantabile = 5,
    Dolce = 6,
    Energico = 7,
    Eroico = 8,
    Espressivo = 9,
    Furioso = 10,
    Giocoso = 11,
    Gioioso = 12,
    Lacrimoso = 13,
    Grandioso = 14,
    Grazioso = 15,
    Leggiero = 16,
    Maestoso = 17,
    Malinconico = 18,
    Marcato = 19,
    Marziale = 20,
    Mesto = 21,
    Morendo = 22,
    Nobilmente = 23,
    Patetico = 24,
    Pesante = 25,
    Sautille = 26,
    Saltando = 27,
    Scherzando = 28,
    Sostenuto = 29,
    Spiccato = 30,
    Tenerezza = 31,
    Tranquillamente = 32,
    Trionfante = 33,
    Vivace = 34
}

declare class UnknownExpression extends AbstractExpression {
    constructor(label: string, placement: PlacementEnum, textAlignment: TextAlignmentEnum, staffNumber: number);
    private label;
    private textAlignment;
    private staffNumber;
    fontStyle: FontStyles;
    defaultYXml: number;
    get Label(): string;
    get Placement(): PlacementEnum;
    set Placement(value: PlacementEnum);
    get StaffNumber(): number;
    set StaffNumber(value: number);
    get TextAlignment(): TextAlignmentEnum;
}

declare class Pedal {
    constructor(line?: boolean, sign?: boolean);
    private line;
    private sign;
    StaffNumber: number;
    ParentStartMultiExpression: MultiExpression;
    ParentEndMultiExpression: MultiExpression;
    ChangeEnd: boolean;
    ChangeBegin: boolean;
    /** Whether the pedal ends at the stave end (and not before the endNote) */
    EndsStave: boolean;
    /** Whether the pedal begins at the stave beginning (and not before the startNote - e.g. for whole measure rest) */
    BeginsStave: boolean;
    get IsLine(): boolean;
    get IsSign(): boolean;
}

declare class MultiExpression {
    constructor(sourceMeasure: SourceMeasure, timestamp: Fraction);
    private sourceMeasure;
    private staffNumber;
    private timestamp;
    EndOffsetFraction: Fraction;
    /** The 'number="x"' given in XML, e.g. of a wedge, used to identify similar expressions. */
    numberXml: number;
    private instantaneousDynamic;
    private endingContinuousDynamic;
    private startingContinuousDynamic;
    private unknownList;
    private moodList;
    private expressions;
    private combinedExpressionsText;
    private octaveShiftStart;
    private octaveShiftEnd;
    PedalStart: Pedal;
    PedalEnd: Pedal;
    get SourceMeasureParent(): SourceMeasure;
    set SourceMeasureParent(value: SourceMeasure);
    get StaffNumber(): number;
    set StaffNumber(value: number);
    get Timestamp(): Fraction;
    set Timestamp(value: Fraction);
    get AbsoluteTimestamp(): Fraction;
    get InstantaneousDynamic(): InstantaneousDynamicExpression;
    set InstantaneousDynamic(value: InstantaneousDynamicExpression);
    get EndingContinuousDynamic(): ContinuousDynamicExpression;
    set EndingContinuousDynamic(value: ContinuousDynamicExpression);
    get StartingContinuousDynamic(): ContinuousDynamicExpression;
    set StartingContinuousDynamic(value: ContinuousDynamicExpression);
    get MoodList(): MoodExpression[];
    get UnknownList(): UnknownExpression[];
    get EntriesList(): MultiExpressionEntry[];
    get OctaveShiftStart(): OctaveShift;
    set OctaveShiftStart(value: OctaveShift);
    get OctaveShiftEnd(): OctaveShift;
    set OctaveShiftEnd(value: OctaveShift);
    get CombinedExpressionsText(): string;
    set CombinedExpressionsText(value: string);
    getPlacementOfFirstEntry(): PlacementEnum;
    getFontstyleOfFirstEntry(): FontStyles;
    getColorXMLOfFirstEntry(): string;
    addExpression(abstractExpression: AbstractExpression, prefix: string): void;
    CompareTo(other: MultiExpression): number;
    private addExpressionToEntryList;
    private removeExpressionFromEntryList;
}
declare class MultiExpressionEntry {
    prefix: string;
    expression: AbstractExpression;
    label: string;
}

declare class OctaveShift {
    constructor(type: string, octave: number);
    private octaveValue;
    private staffNumber;
    numberXml: number;
    private startMultiExpression;
    private endMultiExpression;
    get Type(): OctaveEnum;
    set Type(value: OctaveEnum);
    get StaffNumber(): number;
    set StaffNumber(value: number);
    get ParentStartMultiExpression(): MultiExpression;
    set ParentStartMultiExpression(value: MultiExpression);
    get ParentEndMultiExpression(): MultiExpression;
    set ParentEndMultiExpression(value: MultiExpression);
    private setOctaveShiftValue;
    /**
     * Convert a source (XML) pitch of a note to the pitch needed to draw. E.g. 8va would draw +1 octave so we reduce by 1
     * @param pitch Original pitch
     * @param octaveShiftValue octave shift
     * @returns New pitch with corrected octave shift
     */
    static getPitchFromOctaveShift(pitch: Pitch, octaveShiftValue: OctaveEnum): Pitch;
}
declare enum OctaveEnum {
    VA8 = 0,
    VB8 = 1,
    MA15 = 2,
    MB15 = 3,
    NONE = 4
}

/**
 * The graphical counterpart of a [[VoiceEntry]].
 */
declare class GraphicalVoiceEntry extends GraphicalObject {
    constructor(parentVoiceEntry: VoiceEntry, parentStaffEntry: GraphicalStaffEntry, rules?: EngravingRules);
    parentVoiceEntry: VoiceEntry;
    parentStaffEntry: GraphicalStaffEntry;
    notes: GraphicalNote[];
    /** Contains octave shifts affecting this voice entry, caused by octave brackets. */
    octaveShiftValue: OctaveEnum;
    protected rules: EngravingRules;
    GraceSlash: boolean;
    /** Sort this entry's notes by pitch.
     * Notes need to be sorted for Vexflow StaveNote creation.
     * Note that Vexflow needs the reverse order, see VexFlowConverter.StaveNote().
     */
    sort(): GraphicalNote[];
    /** Sort notes for vexflow (bottom to top), which needs them in the reverse order OSMD likes to have them.
     *  Note that sort() and reverse() replace the array in place,
     *  so to avoid changing the array one could copy it first, see sortedNotesCopyForVexflow() (commented),
     *  though copying the array is also unnecessary (time+memory) for now.
     */
    sortForVexflow(): GraphicalNote[];
    applyCustomNoteheads(): void;
    /** (Re-)color notes and stems
     */
    color(): void;
}

/**
 * The graphical counterpart of a [[Note]]
 */
declare class GraphicalNote extends GraphicalObject {
    constructor(note: Note, parent: GraphicalVoiceEntry, rules: EngravingRules, graphicalNoteLength?: Fraction);
    sourceNote: Note;
    DrawnAccidental: AccidentalEnum;
    graphicalNoteLength: Fraction;
    parentVoiceEntry: GraphicalVoiceEntry;
    numberOfDots: number;
    rules: EngravingRules;
    staffLine: number;
    baseFingeringXOffset: number;
    baseStringNumberXOffset: number;
    lineShift: number;
    Transpose(keyInstruction: KeyInstruction, activeClef: ClefInstruction, halfTones: number, octaveEnum: OctaveEnum): Pitch;
    /**
     * Return the number of dots needed to represent the given fraction.
     * @param fraction
     * @returns {number}
     */
    private calculateNumberOfNeededDots;
    get ParentMusicPage(): GraphicalMusicPage;
    /** Get a GraphicalNote from a Note. Use osmd.rules as the second parameter (instance reference).
     *  Also more easily available via osmd.rules.GNote(note). */
    static FromNote(note: Note, rules: EngravingRules): GraphicalNote;
    ToStringShort(octaveOffset?: number): string;
    get ToStringShortGet(): string;
    getLyricsSVGs(): HTMLElement[];
    /** Change the color of a note (without re-rendering). See ColoringOptions for options like applyToBeams etc.
     * This requires the SVG backend (default, instead of canvas backend).
     */
    setColor(color: string, coloringOptions: ColoringOptions): void;
    /** Toggle visibility of the note, making it and its stem and beams invisible for `false`.
     * By default, this will also hide the note's slurs and ties (see visibilityOptions).
     * (This only works with the default SVG backend, not with the Canvas backend/renderer)
     * To get a GraphicalNote from a Note, use osmd.EngravingRules.GNote(note).
     */
    setVisible(visible: boolean, visibilityOptions?: VisibilityOptions): void;
}
/** Coloring options for VexFlowGraphicalNote.setColor(). */
interface ColoringOptions {
    applyToBeams?: boolean;
    applyToFlag?: boolean;
    applyToLedgerLines?: boolean;
    applyToLyrics?: boolean;
    applyToModifiers?: boolean;
    applyToMultiRestMeasure?: boolean;
    /** Whether to apply the color to the number indicating how many measures the rest lasts (not the measure number). */
    applyToMultiRestMeasureNumber?: boolean;
    /** Whether to apply the color to the wide bar within the stafflines (looks about like `|----|`). */
    applyToMultiRestMeasureRestBar?: boolean;
    applyToNoteheads?: boolean;
    applyToSlurs?: boolean;
    applyToStem?: boolean;
    applyToTies?: boolean;
}
/** Visibility options for VexFlowGraphicalNote.setVisible().
 * E.g. if setVisible(false, {applyToTies: false}), everything about a note will be invisible except its ties.
 * */
interface VisibilityOptions {
    applyToBeams?: boolean;
    applyToLedgerLines?: boolean;
    applyToNotehead?: boolean;
    applyToSlurs?: boolean;
    applyToStem?: boolean;
    applyToTies?: boolean;
}

import VF$d = Vex.Flow;
/**
 * The graphical counterpart of a [[Tie]].
 */
declare class GraphicalTie {
    private tie;
    private startNote;
    private endNote;
    vfTie: VF$d.StaveTie;
    constructor(tie: Tie, start?: GraphicalNote, end?: GraphicalNote);
    get SVGElement(): HTMLElement;
    get GetTie(): Tie;
    get StartNote(): GraphicalNote;
    get Tie(): Tie;
    set StartNote(value: GraphicalNote);
    get EndNote(): GraphicalNote;
    set EndNote(value: GraphicalNote);
}

declare enum SystemLinesEnum {
    SingleThin = 0,/*SINGLE,       [bar-style=regular]*/
    DoubleThin = 1,/*DOUBLE,       [bar-style=light-light]*/
    ThinBold = 2,/*END,          [bar-style=light-heavy]*/
    BoldThinDots = 3,/*REPEAT_BEGIN, repeat[direction=forward]*/
    DotsThinBold = 4,/*REPEAT_END,   repeat[direction=backward]*/
    DotsBoldBoldDots = 5,/*REPEAT_BOTH*/
    None = 6,/*              [bar-style=none]*/
    Dotted = 7,/*              [bar-style=dotted]*/
    Dashed = 8,/*              [bar-style=dashed]*/
    Bold = 9,/*              [bar-style=heavy]*/
    BoldThin = 10,/*              [bar-style=heavy-light]*/
    DoubleBold = 11,/*              [bar-style=heavy-heavy]*/
    Tick = 12,/*              [bar-style=tick]*/
    Short = 13
}
declare class SystemLinesEnumHelper {
    static xmlBarlineStyleToSystemLinesEnum(xmlValue: string): SystemLinesEnum;
}

/**
 * Represents a measure in the music sheet (one measure in one staff line)
 */
declare abstract class GraphicalMeasure extends GraphicalObject {
    protected firstInstructionStaffEntry: GraphicalStaffEntry;
    protected lastInstructionStaffEntry: GraphicalStaffEntry;
    constructor(staff?: Staff, parentSourceMeasure?: SourceMeasure, staffLine?: StaffLine);
    parentSourceMeasure: SourceMeasure;
    staffEntries: GraphicalStaffEntry[];
    /** The clef of the first note of the measure (the clef the measure starts with). */
    InitiallyActiveClef: ClefInstruction;
    /**
     * The x-width of possibly existing: repetition start line, clef, key, rhythm.
     */
    beginInstructionsWidth: number;
    /**
     * The minimum possible x-width of all staff entries without overlapping.
     */
    minimumStaffEntriesWidth: number;
    /**
     * Will be set by music system builder while building systems.
     */
    staffEntriesScaleFactor: number;
    /**
     * The x-width of possibly existing: repetition end line, clef.
     */
    endInstructionsWidth: number;
    hasError: boolean;
    /**
     * Whether or not this measure is nothing but rest(s).
     * Also see SourceMeasure.allRests, which is not the same, because a source measure can have multiple staffs/graphicalMeasures.
     */
    hasOnlyRests: boolean;
    private parentStaff;
    private parentMusicSystem;
    private measureNumber;
    private parentStaffLine;
    /** Used to show key, rhythm changes at the end of the system, has MeasureNumber < 0, because never set. */
    IsExtraGraphicalMeasure: boolean;
    ExtraGraphicalMeasurePreviousMeasure: GraphicalMeasure;
    ShowTimeSignature: boolean;
    ShowKeySignature: boolean;
    isTabMeasure: boolean;
    /** Only exists on multiple rest measure (VexFlowMultiRestMeasure). See isMultiRestMeasure() function. */
    multiRestElement: any;
    get ParentStaff(): Staff;
    get ParentMusicSystem(): MusicSystem;
    set ParentMusicSystem(value: MusicSystem);
    get MeasureNumber(): number;
    get FirstInstructionStaffEntry(): GraphicalStaffEntry;
    set FirstInstructionStaffEntry(value: GraphicalStaffEntry);
    get LastInstructionStaffEntry(): GraphicalStaffEntry;
    set LastInstructionStaffEntry(value: GraphicalStaffEntry);
    get ParentStaffLine(): StaffLine;
    set ParentStaffLine(value: StaffLine);
    /**
     * Reset all the geometric values and parameters of this measure and put it in an initialized state.
     * This is needed to evaluate a measure a second time by system builder.
     */
    resetLayout(): void;
    /**
     * Return the x-width of a given measure line.
     * @param line
     */
    getLineWidth(line: SystemLinesEnum): number;
    /**
     * Add the given clef to the begin of the measure.
     * This has to update/increase BeginInstructionsWidth.
     * @param clef
     */
    addClefAtBegin(clef: ClefInstruction): void;
    /**
     * Add the given key to the begin of the measure.
     * This has to update/increase BeginInstructionsWidth.
     * @param currentKey - The new valid key.
     * @param previousKey - The old cancelled key. Needed to show which accidentals are not valid any more.
     * @param currentClef - The valid clef. Needed to put the accidentals on the right y-positions.
     */
    addKeyAtBegin(currentKey: KeyInstruction, previousKey: KeyInstruction, currentClef: ClefInstruction): void;
    /**
     * Add the given rhythm to the begin of the measure.
     * This has to update/increase BeginInstructionsWidth.
     * @param rhythm
     */
    addRhythmAtBegin(rhythm: RhythmInstruction): void;
    /**
     * Add the given clef to the end of the measure.
     * This has to update/increase EndInstructionsWidth.
     * @param clef
     */
    addClefAtEnd(clef: ClefInstruction, visible?: boolean): void;
    /**
     * Set the x-position relative to the staffline (y-Position is always 0 relative to the staffline).
     * @param xPos
     */
    setPositionInStaffline(xPos: number): void;
    /**
     * Set the overall x-width of the measure.
     * @param width
     */
    setWidth(width: number): void;
    /**
     * This method is called after the StaffEntriesScaleFactor has been set.
     * Here the final x-positions of the staff entries have to be set.
     * (multiply the minimal positions with the scaling factor, considering the BeginInstructionsWidth).
     */
    layoutSymbols(): void;
    findGraphicalStaffEntryFromTimestamp(relativeTimestamp: Fraction): GraphicalStaffEntry;
    /**
     * Iterate from start to end and find the [[GraphicalStaffEntry]] with the same absolute timestamp.
     * @param absoluteTimestamp
     * @returns {any}
     */
    findGraphicalStaffEntryFromVerticalContainerTimestamp(absoluteTimestamp: Fraction): GraphicalStaffEntry;
    /**
     * Check if the all the [[GraphicalMeasure]]'s [[StaffEntry]]s (their minimum Length) have the same duration with the [[SourceMeasure]].
     * @returns {boolean}
     */
    hasSameDurationWithSourceMeasureParent(): boolean;
    /**
     * Check a whole [[Measure]] for the presence of multiple Voices (used for Stem direction).
     * @returns {boolean}
     */
    hasMultipleVoices(): boolean;
    isVisible(): boolean;
    isMultiRestMeasure(): boolean;
    getGraphicalMeasureDurationFromStaffEntries(): Fraction;
    addGraphicalStaffEntry(graphicalStaffEntry: GraphicalStaffEntry): void;
    /**
     * Add a [[StaffEntry]] (along with its [[BoundingBox]]) to the current Measure.
     * @param staffEntry
     */
    addGraphicalStaffEntryAtTimestamp(staffEntry: GraphicalStaffEntry): void;
    isPianoRightHand(): boolean;
    isPianoLeftHand(): boolean;
    isUpperStaffOfInstrument(): boolean;
    isLowerStaffOfInstrument(): boolean;
    beginsWithLineRepetition(): boolean;
    /**
     * Check if this Measure is a Repetition Ending.
     * @returns {boolean}
     */
    endsWithLineRepetition(): boolean;
    /**
     * Check if a Repetition starts at the next Measure.
     * @returns {boolean}
     */
    beginsWithWordRepetition(): boolean;
    /**
     * Check if this Measure is a Repetition Ending.
     */
    endsWithWordRepetition(): boolean;
    getTransposedHalftones(): number;
}

declare class GraphicalChordSymbolContainer extends GraphicalObject {
    private chordSymbolContainer;
    private graphicalLabel;
    private rules;
    constructor(chordSymbolContainer: ChordSymbolContainer, parent: BoundingBox, textHeight: number, keyInstruction: KeyInstruction, transposeHalftones: number, rules: EngravingRules);
    get GetChordSymbolContainer(): ChordSymbolContainer;
    get GraphicalLabel(): GraphicalLabel;
    private calculateLabel;
}

/**
 * The graphical counterpart of a [[LyricWord]]
 */
declare class GraphicalLyricWord {
    private lyricWord;
    private graphicalLyricsEntries;
    constructor(lyricWord: LyricWord);
    get GetLyricWord(): LyricWord;
    get GraphicalLyricsEntries(): GraphicalLyricEntry[];
    set GraphicalLyricsEntries(value: GraphicalLyricEntry[]);
    isFilled(): boolean;
    private initialize;
}

/**
 * The graphical counterpart of a [[LyricsEntry]]
 */
declare class GraphicalLyricEntry {
    private lyricsEntry;
    private graphicalLyricWord;
    private graphicalLabel;
    private graphicalStaffEntry;
    constructor(lyricsEntry: LyricsEntry, graphicalStaffEntry: GraphicalStaffEntry, lyricsHeight: number, staffHeight: number);
    hasDashFromLyricWord(): boolean;
    get LyricsEntry(): LyricsEntry;
    get ParentLyricWord(): GraphicalLyricWord;
    set ParentLyricWord(value: GraphicalLyricWord);
    get GraphicalLabel(): GraphicalLabel;
    set GraphicalLabel(value: GraphicalLabel);
    get StaffEntryParent(): GraphicalStaffEntry;
    set StaffEntryParent(value: GraphicalStaffEntry);
}

declare abstract class AbstractGraphicalInstruction extends GraphicalObject {
    protected parent: GraphicalStaffEntry;
    constructor(parent: GraphicalStaffEntry);
    get Parent(): GraphicalStaffEntry;
    set Parent(value: GraphicalStaffEntry);
}

/**
 * The graphical counterpart of a [[StaffEntryLink]].
 * Used for linked voices.
 */
declare class GraphicalStaffEntryLink {
    private staffEntryLink;
    private graphicalLinkedStaffEntries;
    constructor(staffEntryLink: StaffEntryLink);
    get GetStaffEntryLink(): StaffEntryLink;
    get GraphicalLinkedStaffEntries(): GraphicalStaffEntry[];
    set GraphicalLinkedStaffEntries(value: GraphicalStaffEntry[]);
    isFilled(): boolean;
    /**
     * Return all the [[GraphicalNote]]s that correspond to the [[LinkedVoiceEntry]] (the one saved in [[StaffEntryLink]]).
     * @param graphicalStaffEntry
     * @returns {any}
     */
    getLinkedStaffEntriesGraphicalNotes(graphicalStaffEntry: GraphicalStaffEntry): GraphicalNote[];
    private initialize;
}

/**
 * The graphical counterpart of a [[SourceStaffEntry]].
 */
declare abstract class GraphicalStaffEntry extends GraphicalObject {
    constructor(parentMeasure: GraphicalMeasure, sourceStaffEntry?: SourceStaffEntry, staffEntryParent?: GraphicalStaffEntry);
    graphicalChordContainers: GraphicalChordSymbolContainer[];
    graphicalLink: GraphicalStaffEntryLink;
    relInMeasureTimestamp: Fraction;
    sourceStaffEntry: SourceStaffEntry;
    parentMeasure: GraphicalMeasure;
    graphicalVoiceEntries: GraphicalVoiceEntry[];
    staffEntryParent: GraphicalStaffEntry;
    parentVerticalContainer: VerticalGraphicalStaffEntryContainer;
    tabStaffEntry: GraphicalStaffEntry;
    MaxAccidentals: number;
    private graphicalInstructions;
    ties: Tie[];
    private graphicalTies;
    private lyricsEntries;
    FingeringEntries: GraphicalLabel[];
    get GraphicalInstructions(): AbstractGraphicalInstruction[];
    get GraphicalTies(): GraphicalTie[];
    get LyricsEntries(): GraphicalLyricEntry[];
    set LyricsEntries(value: GraphicalLyricEntry[]);
    /**
     * Calculate the absolute Timestamp.
     * @returns {Fraction}
     */
    getAbsoluteTimestamp(): Fraction;
    /**
     * Search through all the GraphicalNotes to find the suitable one for a TieEndNote.
     * @param tieNote
     * @returns {any}
     */
    findTieGraphicalNoteFromNote(tieNote: Note): GraphicalNote;
    /**
     * Search through all [[GraphicalNote]]s to find the suitable one for an StartSlurNote (that 's also an EndTieNote).
     * @param tieNote
     * @param slur
     * @returns {any}
     */
    findEndTieGraphicalNoteFromNoteWithStartingSlur(tieNote: Note, slur: Slur): GraphicalNote;
    findGraphicalNoteFromGraceNote(graceNote: Note): GraphicalNote;
    findGraphicalNoteFromNote(note: Note): GraphicalNote;
    getGraphicalNoteDurationFromVoice(voice: Voice): Fraction;
    /**
     * Find the [[StaffEntry]]'s [[GraphicalNote]]s that correspond to the given [[VoiceEntry]]'s [[Note]]s.
     * @param voiceEntry
     * @returns {any}
     */
    findVoiceEntryGraphicalNotes(voiceEntry: VoiceEntry): GraphicalNote[];
    /**
     * Check if the given [[VoiceEntry]] is part of the [[StaffEntry]]'s Linked [[VoiceEntry]].
     * @param voiceEntry
     * @returns {boolean}
     */
    isVoiceEntryPartOfLinkedVoiceEntry(voiceEntry: VoiceEntry): boolean;
    /**
     * Return the [[StaffEntry]]'s Minimum NoteLength.
     * @returns {Fraction}
     */
    findStaffEntryMinNoteLength(): Fraction;
    findStaffEntryMaxNoteLength(): Fraction;
    /**
     * Find or creates the list of [[GraphicalNote]]s in case of a [[VoiceEntry]] (not from TiedNote).
     * @param voiceEntry
     * @returns {GraphicalNote[]}
     */
    findOrCreateGraphicalVoiceEntry(voiceEntry: VoiceEntry): GraphicalVoiceEntry;
    /**
     * Find or creates the list of [[GraphicalNote]]s in case of a TiedNote.
     * @param graphicalNote
     * @returns {GraphicalNote[]}
     */
    findOrCreateGraphicalVoiceEntryFromGraphicalNote(graphicalNote: GraphicalNote): GraphicalVoiceEntry;
    /**
     * Insert the [[GraphicalNote]] to the correct index of the [[GraphicalNote]]s list,
     * so that the order of the [[GraphicalNote]]'s in the list corresponds to the [[VoiceEntry]]'s [[Note]]s order.
     * (needed when adding Tie-EndNotes).
     * @param graphicalNotes
     * @param graphicalNote
     */
    addGraphicalNoteToListAtCorrectYPosition(gve: GraphicalVoiceEntry, graphicalNote: GraphicalNote): void;
    /**
     * Returns true if this staff entry has only rests
     */
    hasOnlyRests(): boolean;
    getSkylineMin(): number;
    /** Highest Y around the staff entry and notes in OSMD units (pixels / 10). Note that negative y is up. */
    getHighestYAtEntry(): number;
    /** Lowest Y around the staff entry and notes in OSMD units (pixels / 10). Note that positive y is down. */
    getLowestYAtEntry(): number;
    getBottomlineMax(): number;
    getAbsoluteStartAndEnd(): [number, number];
}

/**
 * Contains a skyline and a bottomline for a measure.
 */
declare class SkyBottomLineCalculationResult {
    skyLine: number[];
    bottomLine: number[];
    constructor(skyLine: number[], bottomLine: number[]);
}

/**
 * This class calculates and holds the skyline and bottom line information.
 * It also has functions to update areas of the two lines if new elements are
 * added to the staffline (e.g. measure number, annotations, ...)
 */
declare class SkyBottomLineCalculator {
    /** Parent Staffline where the skyline and bottom line is attached */
    private mStaffLineParent;
    /** Internal array for the skyline */
    private mSkyLine;
    /** Internal array for the bottomline */
    private mBottomLine;
    /** Engraving rules for formatting */
    private mRules;
    /**
     * Create a new object of the calculator
     * @param staffLineParent staffline where the calculator should be attached
     */
    constructor(staffLineParent: StaffLine);
    /**
     * This method updates the skylines and bottomlines for mStaffLineParent.
     * @param calculationResults the skylines and bottomlines of mStaffLineParent's measures calculated by SkyBottomLineBatchCalculator
     */
    updateLines(calculationResults: SkyBottomLineCalculationResult[]): void;
    /**
     * This method calculates the Sky- and BottomLines for a StaffLine.
     */
    calculateLines(): void;
    updateSkyLineWithLine(start: PointF2D, end: PointF2D, value: number): void;
    /**
     * This method updates the SkyLine for a given Wedge.
     * @param start Start point of the wedge (the point where both lines meet)
     * @param end End point of the wedge (the end of the most extreme line: upper line for skyline, lower line for bottomline)
     */
    updateSkyLineWithWedge(start: PointF2D, end: PointF2D): void;
    /**
     * This method updates the BottomLine for a given Wedge.
     * @param start Start point of the wedge
     * @param end End point of the wedge
     */
    updateBottomLineWithWedge(start: PointF2D, end: PointF2D): void;
    /**
     * This method updates the SkyLine for a given range with a given value
     * //param  to update the SkyLine for
     * @param startIndex Start index of the range
     * @param endIndex End index of the range
     * @param value ??
     */
    updateSkyLineInRange(startIndex: number, endIndex: number, value: number): void;
    /**
     * This method updates the BottomLine for a given range with a given value
     * @param startIndex Start index of the range
     * @param endIndex End index of the range (excluding)
     * @param value ??
     */
    updateBottomLineInRange(startIndex: number, endIndex: number, value: number): void;
    /**
     * Resets a SkyLine in a range to its original value
     * @param startIndex Start index of the range
     * @param endIndex End index of the range (excluding)
     */
    resetSkyLineInRange(startIndex: number, endIndex: number): void;
    /**
     * Resets a bottom line in a range to its original value
     * @param startIndex Start index of the range
     * @param endIndex End index of the range
     */
    resetBottomLineInRange(startIndex: number, endIndex: number): void;
    /**
     * Update the whole skyline with a certain value
     * @param value value to be set
     */
    setSkyLineWithValue(value: number): void;
    /**
     * Update the whole bottomline with a certain value
     * @param value value to be set
     */
    setBottomLineWithValue(value: number): void;
    getLeftIndexForPointX(x: number, length: number): number;
    getRightIndexForPointX(x: number, length: number): number;
    /**
     * This method updates the StaffLine Borders with the Sky- and BottomLines Min- and MaxValues.
     */
    updateStaffLineBorders(): void;
    /**
     * This method finds the minimum value of the SkyLine.
     */
    getSkyLineMin(): number;
    getSkyLineMinAtPoint(point: number): number;
    /**
     * This method finds the SkyLine's minimum value within a given range.
     * @param startIndex Starting index
     * @param endIndex End index (including)
     */
    getSkyLineMinInRange(startIndex: number, endIndex: number): number;
    /**
     * This method finds the maximum value of the BottomLine.
     */
    getBottomLineMax(): number;
    getBottomLineMaxAtPoint(point: number): number;
    /**
     * This method finds the BottomLine's maximum value within a given range.
     * @param startIndex Start index of the range
     * @param endIndex End index of the range (excluding)
     */
    getBottomLineMaxInRange(startIndex: number, endIndex: number): number;
    /**
     * This method returns the maximum value of the bottom line around a specific
     * bounding box. Will return undefined if the bounding box is not valid or inside staffline
     * @param boundingBox Bounding box where the maximum should be retrieved from
     * @returns Maximum value inside bounding box boundaries or undefined if not possible
     */
    getBottomLineMaxInBoundingBox(boundingBox: BoundingBox): number;
    /**
     * Updates sky- and bottom line with a boundingBox and its children
     * @param boundingBox Bounding box to be added
     */
    updateWithBoundingBoxRecursively(boundingBox: BoundingBox): void;
    /**
     * go backwards through the skyline array and find a number so that
     * we can properly calculate the average
     * @param start the starting index of the search
     * @param tSkyLine the skyline to search through
     */
    private findPreviousValidNumber;
    /**
     * go forward through the skyline array and find a number so that
     * we can properly calculate the average
     * @param start the starting index of the search
     * @param tSkyLine the skyline to search through
     */
    private findNextValidNumber;
    /**
     * Debugging drawing function that can draw single pixels
     * @param coord Point to draw to
     * @param backend the backend to be used
     * @param color the color to be used, default is red
     */
    private drawPixel;
    /**
     * Update an array with the value given inside a range. NOTE: will only be updated if value > oldValue
     * @param array Array to fill in the new value
     * @param startIndex start index to begin with (default: 0)
     * @param endIndex end index of array (excluding, default: array length)
     * @param value value to fill in (default: 0)
     */
    private updateInRange;
    /**
     * Sets the value given to the range inside the array. NOTE: will always update the value
     * @param array Array to fill in the new value
     * @param startIndex start index to begin with (default: 0)
     * @param endIndex end index of array (excluding, default: array length)
     * @param value value to fill in (default: 0)
     */
    private setInRange;
    /**
     * Get all values of the selected line inside the given range
     * @param skyBottomArray Skyline or bottom line
     * @param startIndex start index
     * @param endIndex end index (including)
     */
    private getMinInRange;
    /**
     * Get the maximum value inside the given indices
     * @param skyBottomArray Skyline or bottom line
     * @param startIndex start index
     * @param endIndex end index (including)
     */
    private getMaxInRange;
    /** Sampling units that are used to quantize the sky and bottom line  */
    get SamplingUnit(): number;
    /** Parent staffline where the skybottomline calculator is attached to */
    get StaffLineParent(): StaffLine;
    /** Get the plain skyline array */
    get SkyLine(): number[];
    /** Get the plain bottomline array */
    get BottomLine(): number[];
}

declare enum MusicSymbol {
    Unused_first_Symbol = 0,
    BLACK_HEAD = 1,
    UPWARDS_TAIL = 2,
    DOWNWARDS_TAIL = 3,
    UPWARDS_DOUBLE_TAIL = 4,
    DOWNWARDS_DOUBLE_TAIL = 5,
    UPWARDS_TRIPLE_TAIL = 6,
    DOWNWARDS_TRIPLE_TAIL = 7,
    UPWARDS_QUAD_TAIL = 8,
    DOWNWARDS_QUAD_TAIL = 9,
    ROUND_HEAD = 10,
    WHITE_HEAD = 11,
    G_CLEF = 12,
    F_CLEF = 13,
    C_CLEF = 14,
    BREVE = 15,
    BREVE_REST = 16,
    COMMON_TIME = 17,
    CUT_TIME = 18,
    WHOLE_REST = 19,
    HALF_REST = 20,
    QUARTER_REST = 21,
    EIGHTH_REST = 22,
    SIXTEENTH_REST = 23,
    THIRTYSECOND_REST = 24,
    SIXTYFOURTH_REST = 25,
    FLAT = 26,
    SHARP = 27,
    NATURAL = 28,
    DOUBLE_FLAT = 29,
    DOUBLE_SHARP = 30,
    ZERO = 31,
    ONE = 32,
    TWO = 33,
    THREE = 34,
    FOUR = 35,
    FIVE = 36,
    SIX = 37,
    SEVEN = 38,
    EIGHT = 39,
    NINE = 40,
    DOT = 41,
    FERMATA = 42,
    INVERTED_FERMATA = 43,
    SPICCATO = 44,
    TENUTO = 45,
    MARCATO = 46,
    MARCATISSIMO = 47,
    INVERTED_MARCATISSIMO = 48,
    P = 49,
    F = 50,
    S = 51,
    Z = 52,
    M = 53,
    R = 54,
    SEGNO = 55,
    CODA = 56,
    DRUM_CLEF = 57,
    G_CLEF_SUB8 = 58,
    G_CLEF_SUPER8 = 59,
    G_CLEF_SUB15 = 60,
    G_CLEF_SUPER15 = 61,
    F_CLEF_SUB8 = 62,
    F_CLEF_SUPER8 = 63,
    F_CLEF_SUB15 = 64,
    F_CLEF_SUPER15 = 65,
    DOWN_BOW = 66,
    MORDENT = 67,
    INVERTED_MORDENT = 68,
    TURN = 69,
    INVERTED_TURN = 70,
    LEFTHAND_PIZZICATO = 71,
    RELEASE_PED = 72,
    ENGAGE_PED = 73,
    VA8 = 74,
    VB8 = 75,
    TRILL = 76,
    MA15 = 77,
    MB15 = 78,
    HIGH = 79,
    PLAY = 80,
    MIC = 81,
    SNAP_PIZZICATO = 82,
    NATURAL_HARMONIC = 83,
    EditPen = 84,
    PEDAL_BRACKET = 85,
    PEDAL_MIXED = 86,
    PEDAL_SYMBOL = 87
}

/**
 * The graphical counterpart of an [[OctaveShift]]
 */
declare class GraphicalOctaveShift extends GraphicalObject {
    constructor(octaveShift: OctaveShift, parent: BoundingBox);
    getOctaveShift: OctaveShift;
    octaveSymbol: MusicSymbol;
    dashesStart: PointF2D;
    dashesEnd: PointF2D;
    endsOnDifferentStaffLine: boolean;
    /** Whether the octave shift should be drawn until the end of the measure, instead of the current note. */
    graphicalEndAtMeasureEnd: boolean;
    /** The measure in which this OctaveShift (which can be a part/bracket of a multi-line shift) ends graphically. */
    endMeasure: GraphicalMeasure;
    isFirstPart: boolean;
    isSecondPart: boolean;
    private setSymbol;
}

declare class GraphicalCurve {
    private static bezierCurveStepSize;
    private static tPow3;
    private static oneMinusTPow3;
    private static bezierFactorOne;
    private static bezierFactorTwo;
    constructor();
    bezierStartPt: PointF2D;
    bezierStartControlPt: PointF2D;
    bezierEndControlPt: PointF2D;
    bezierEndPt: PointF2D;
    /**
     *
     * @param relativePosition
     */
    calculateCurvePointAtIndex(relativePosition: number): PointF2D;
}

declare class GraphicalSlur extends GraphicalCurve {
    constructor(slur: Slur, rules: EngravingRules);
    slur: Slur;
    staffEntries: GraphicalStaffEntry[];
    placement: PlacementEnum;
    graceStart: boolean;
    graceEnd: boolean;
    private rules;
    SVGElement: Node;
    /**
     * Compares the timespan of two Graphical Slurs
     * @param x
     * @param y
     */
    static Compare(x: GraphicalSlur, y: GraphicalSlur): number;
    /**
     *
     * @param rules
     */
    calculateCurve(rules: EngravingRules): void;
    /**
     * This method calculates the Start and End Positions of the Slur Curve.
     * @param slurStartNote
     * @param slurEndNote
     * @param staffLine
     * @param startX
     * @param startY
     * @param endX
     * @param endY
     * @param rules
     * @param skyBottomLineCalculator
     */
    private calculateStartAndEnd;
    /**
     * This method calculates the placement of the Curve.
     * @param skyBottomLineCalculator
     * @param staffLine
     */
    private calculatePlacement;
    /**
     * This method calculates the Points between Start- and EndPoint (case above).
     * @param start
     * @param end
     * @param staffLine
     * @param skyBottomLineCalculator
     */
    private calculateTopPoints;
    /**
     * This method calculates the Points between Start- and EndPoint (case below).
     * @param start
     * @param end
     * @param staffLine
     * @param skyBottomLineCalculator
     */
    private calculateBottomPoints;
    /**
     * This method calculates the maximum slope between StartPoint and BetweenPoints.
     * @param points
     * @param start
     * @param end
     */
    private calculateMaxLeftSlope;
    /**
     * This method calculates the maximum slope between EndPoint and BetweenPoints.
     * @param points
     * @param start
     * @param end
     */
    private calculateMaxRightSlope;
    /**
     * This method returns the maximum (meaningful) points.Y.
     * @param points
     */
    private getPointListMaxY;
    /**
     * This method calculates the translated and rotated PointsList (case above).
     * @param points
     * @param startX
     * @param startY
     * @param rotationMatrix
     */
    private calculateTranslatedAndRotatedPointListAbove;
    /**
     * This method calculates the translated and rotated PointsList (case below).
     * @param points
     * @param startX
     * @param startY
     * @param rotationMatrix
     */
    private calculateTranslatedAndRotatedPointListBelow;
    /**
     * This method calculates the HeightWidthRatio between the MaxYpoint (from the points between StartPoint and EndPoint)
     * and the X-distance from StartPoint to EndPoint.
     * @param endX
     * @param points
     */
    private calculateHeightWidthRatio;
    /**
     * This method calculates the 2 ControlPoints of the SlurCurve.
     * @param endX
     * @param startAngle
     * @param endAngle
     * @param points
     */
    private calculateControlPoints;
    /**
     * This method calculates the angles for the Curve's Tangent Lines.
     * @param leftAngle
     * @param rightAngle
     * @param startLineSlope
     * @param endLineSlope
     * @param maxAngle
     */
    private calculateAngles;
    private static degreesToRadiansFactor;
}

declare abstract class AbstractGraphicalExpression extends GraphicalObject {
    protected label: GraphicalLabel;
    protected parentStaffLine: StaffLine;
    /** Internal cache of read expression */
    protected expression: AbstractExpression;
    /** EngravingRules for positioning */
    protected rules: EngravingRules;
    parentMeasure: SourceMeasure;
    constructor(parentStaffline: StaffLine, expression: AbstractExpression, measure: SourceMeasure);
    /** Graphical label of the expression if available */
    get Label(): GraphicalLabel;
    /** Staffline where the expression is attached to */
    get ParentStaffLine(): StaffLine;
    get SourceExpression(): AbstractExpression;
    get Placement(): PlacementEnum;
    abstract updateSkyBottomLine(): void;
}

/**
 * The graphical counterpart of an [[Pedal]]
 */
declare class GraphicalPedal extends GraphicalObject {
    constructor(pedal: Pedal, parent: BoundingBox);
    getPedal: Pedal;
    pedalSymbol: MusicSymbol;
    private setSymbol;
}

declare class GraphicalGlissando {
    Glissando: Glissando;
    Line: GraphicalLine;
    staffEntries: GraphicalStaffEntry[];
    StaffLine: StaffLine;
    Width: number;
    Color: string;
    constructor(glissando: Glissando);
    calculateLine(rules: EngravingRules): void;
}

/**
 * A StaffLine contains the [[Measure]]s in one line of the music sheet
 * (one instrument, one line, until a line break)
 */
declare abstract class StaffLine extends GraphicalObject {
    protected measures: GraphicalMeasure[];
    protected staffLines: GraphicalLine[];
    protected parentMusicSystem: MusicSystem;
    protected parentStaff: Staff;
    protected octaveShifts: GraphicalOctaveShift[];
    protected skyBottomLine: SkyBottomLineCalculator;
    protected lyricLines: GraphicalLine[];
    protected lyricsDashes: GraphicalLabel[];
    protected abstractExpressions: AbstractGraphicalExpression[];
    /** The staff height in units */
    private staffHeight;
    private topLineOffset;
    private bottomLineOffset;
    protected graphicalSlurs: GraphicalSlur[];
    protected graphicalGlissandi: GraphicalGlissando[];
    constructor(parentSystem: MusicSystem, parentStaff: Staff);
    /**
     * If the musicXML sets different numbers of stafflines, we need to have different offsets
     * to accomodate this - primarily for the sky and bottom lines and cursor.
     */
    private calculateStaffLineOffsets;
    get Measures(): GraphicalMeasure[];
    set Measures(value: GraphicalMeasure[]);
    get StaffLines(): GraphicalLine[];
    set StaffLines(value: GraphicalLine[]);
    get NextStaffLine(): StaffLine;
    get LyricLines(): GraphicalLine[];
    get AbstractExpressions(): AbstractGraphicalExpression[];
    set AbstractExpressions(value: AbstractGraphicalExpression[]);
    set LyricLines(value: GraphicalLine[]);
    get LyricsDashes(): GraphicalLabel[];
    set LyricsDashes(value: GraphicalLabel[]);
    get ParentMusicSystem(): MusicSystem;
    set ParentMusicSystem(value: MusicSystem);
    get ParentStaff(): Staff;
    set ParentStaff(value: Staff);
    get SkyBottomLineCalculator(): SkyBottomLineCalculator;
    get SkyLine(): number[];
    get BottomLine(): number[];
    get OctaveShifts(): GraphicalOctaveShift[];
    set OctaveShifts(value: GraphicalOctaveShift[]);
    Pedals: GraphicalPedal[];
    get StaffHeight(): number;
    get TopLineOffset(): number;
    get BottomLineOffset(): number;
    get GraphicalSlurs(): GraphicalSlur[];
    get GraphicalGlissandi(): GraphicalGlissando[];
    /**
     * Add a given Graphical Slur to the staffline
     * @param gSlur
     */
    addSlurToStaffline(gSlur: GraphicalSlur): void;
    addGlissandoToStaffline(gGlissando: GraphicalGlissando): void;
    addActivitySymbolClickArea(): void;
    /**
     * True iff [[StaffLine]] belongs to an [[Instrument]] with more than one [[Staff]].
     * @returns {boolean}
     */
    isPartOfMultiStaffInstrument(): boolean;
    /**
     * Find the [[GraphicalStaffEntry]] closest to the given xPosition.
     * @param xPosition
     * @returns {GraphicalStaffEntry}
     */
    findClosestStaffEntry(xPosition: number): GraphicalStaffEntry;
}

declare class GraphicalComment {
    constructor(label: GraphicalLabel, settingsLabel: GraphicalLabel);
    label: GraphicalLabel;
    settings: GraphicalLabel;
}

declare class GraphicalRectangle extends GraphicalObject {
    constructor(upperLeftPoint: PointF2D, lowerRightPoint: PointF2D, parent: BoundingBox, style: OutlineAndFillStyleEnum);
    style: OutlineAndFillStyleEnum;
}

declare class GraphicalMarkedArea {
    constructor(systemRectangle: GraphicalRectangle, labelRectangle?: GraphicalRectangle, label?: GraphicalLabel, settingsLabel?: GraphicalLabel);
    systemRectangle: GraphicalRectangle;
    labelRectangle: GraphicalRectangle;
    label: GraphicalLabel;
    settings: GraphicalLabel;
}

declare enum SystemLinePosition {
    MeasureBegin = 0,
    MeasureEnd = 1
}

declare class SystemLine extends GraphicalObject {
    constructor(lineType: SystemLinesEnum, linePosition: SystemLinePosition, musicSystem: MusicSystem, topMeasure: GraphicalMeasure, bottomMeasure?: GraphicalMeasure);
    lineType: SystemLinesEnum;
    linePosition: SystemLinePosition;
    parentMusicSystem: MusicSystem;
    parentTopStaffLine: StaffLine;
    topMeasure: GraphicalMeasure;
    bottomMeasure: GraphicalMeasure;
    /**
     * Return the width of the SystemLinesContainer for the given SystemLineType.
     * @param rules
     * @param systemLineType
     * @returns {number}
     */
    static getObjectWidthForLineType(rules: EngravingRules, systemLineType: SystemLinesEnum): number;
}

/**
 * A MusicSystem contains the [[StaffLine]]s for all instruments, until a line break
 */
declare abstract class MusicSystem extends GraphicalObject {
    needsToBeRedrawn: boolean;
    rules: EngravingRules;
    protected parent: GraphicalMusicPage;
    protected id: number;
    protected staffLines: StaffLine[];
    protected graphicalMeasures: GraphicalMeasure[][];
    /** Dictionary of (Instruments and) labels.
     * note that the key needs to be unique, GraphicalLabel is not unique yet.
     * That is why the labels are labels.values() and not labels.keys().
     */
    protected labels: Dictionary<Instrument, GraphicalLabel>;
    protected measureNumberLabels: GraphicalLabel[];
    protected maxLabelLength: number;
    protected objectsToRedraw: [Object[], Object][];
    protected instrumentBrackets: GraphicalObject[];
    protected groupBrackets: GraphicalObject[];
    protected graphicalMarkedAreas: GraphicalMarkedArea[];
    protected graphicalComments: GraphicalComment[];
    protected systemLines: SystemLine[];
    breaksPage: boolean;
    constructor(id: number);
    get Parent(): GraphicalMusicPage;
    set Parent(value: GraphicalMusicPage);
    get NextSystem(): MusicSystem;
    get StaffLines(): StaffLine[];
    set StaffLines(value: StaffLine[]);
    get GraphicalMeasures(): GraphicalMeasure[][];
    get MeasureNumberLabels(): GraphicalLabel[];
    get Labels(): GraphicalLabel[];
    get ObjectsToRedraw(): [Object[], Object][];
    get InstrumentBrackets(): GraphicalObject[];
    get GroupBrackets(): GraphicalObject[];
    get GraphicalMarkedAreas(): GraphicalMarkedArea[];
    get GraphicalComments(): GraphicalComment[];
    get SystemLines(): SystemLine[];
    get Id(): number;
    /**
     * Create the left vertical Line connecting all staves of the [[MusicSystem]].
     * @param lineWidth
     * @param systemLabelsRightMargin
     */
    createSystemLeftLine(lineWidth: number, systemLabelsRightMargin: number, isFirstSystem: boolean): void;
    /**
     * Create the vertical Lines after the End of all [[StaffLine]]'s Measures
     * @param xPosition
     * @param lineWidth
     * @param lineType
     * @param linePosition indicates if the line belongs to start or end of measure
     * @param measureIndex the measure index within the staffline
     * @param measure
     */
    createVerticalLineForMeasure(xPosition: number, lineWidth: number, lineType: SystemLinesEnum, linePosition: SystemLinePosition, measureIndex: number, measure: GraphicalMeasure): void;
    /**
     * Set the y-Positions of all the system lines in the system and creates the graphical Lines and dots within.
     * @param rules
     */
    setYPositionsToVerticalLineObjectsAndCreateLines(rules: EngravingRules): void;
    calculateBorders(rules: EngravingRules): void;
    alignBeginInstructions(): void;
    GetLeftBorderAbsoluteXPosition(): number;
    GetRightBorderAbsoluteXPosition(): number;
    AddGraphicalMeasures(graphicalMeasures: GraphicalMeasure[]): void;
    GetSystemsFirstTimeStamp(): Fraction;
    GetSystemsLastTimeStamp(): Fraction;
    /**
     * Create an InstrumentBracket for each multiStave Instrument.
     * @param instruments
     * @param staffHeight
     */
    createInstrumentBrackets(instruments: Instrument[], staffHeight: number): void;
    /**
     * Create a GroupBracket for an [[InstrumentalGroup]].
     * @param instrumentGroups
     * @param staffHeight
     * @param recursionDepth
     */
    createGroupBrackets(instrumentGroups: InstrumentalGroup[], staffHeight: number, recursionDepth: number): void;
    /**
     * Create the Instrument's Labels (only for the first [[MusicSystem]] of the first MusicPage).
     * @param instrumentLabelTextHeight
     * @param systemLabelsRightMargin
     * @param labelMarginBorderFactor
     */
    createMusicSystemLabel(instrumentLabelTextHeight: number, systemLabelsRightMargin: number, labelMarginBorderFactor: number, isFirstSystem?: boolean): void;
    /**
     * Set the Y-Positions for the MusicSystem's Labels.
     */
    setMusicSystemLabelsYPosition(): void;
    /**
     * Check if two "adjacent" StaffLines have BOTH a StaffEntry with a StaffEntryLink.
     * This is needed for the y-spacing algorithm.
     * @returns {boolean}
     */
    checkStaffEntriesForStaffEntryLink(): boolean;
    getBottomStaffLine(topStaffLine: StaffLine): StaffLine;
    /**
     * Here the system line is generated, which acts as the container of graphical lines and dots that will be finally rendered.
     * It holds al the logical parameters of the system line.
     * @param xPosition The x position within the system
     * @param lineWidth The total x width
     * @param lineType The line type enum
     * @param linePosition indicates if the line belongs to start or end of measure
     * @param musicSystem
     * @param topMeasure
     * @param bottomMeasure
     */
    protected createSystemLine(xPosition: number, lineWidth: number, lineType: SystemLinesEnum, linePosition: SystemLinePosition, musicSystem: MusicSystem, topMeasure: GraphicalMeasure, bottomMeasure?: GraphicalMeasure): SystemLine;
    /**
     * Create all the graphical lines and dots needed to render a system line (e.g. bold-thin-dots..).
     * @param systemLine
     */
    protected createLinesForSystemLine(systemLine: SystemLine): void;
    /**
     * Calculates the summed x-width of a possibly given Instrument Brace and/or Group Bracket(s).
     * @returns {number} the x-width
     */
    protected calcBracketsWidth(): number;
    protected createInstrumentBracket(firstStaffLine: StaffLine, lastStaffLine: StaffLine): void;
    protected createGroupBracket(firstStaffLine: StaffLine, lastStaffLine: StaffLine, recursionDepth: number): void;
    private findFirstVisibleInstrumentInInstrumentalGroup;
    private findLastVisibleInstrumentInInstrumentalGroup;
    /**
     * Update the xPosition of the [[MusicSystem]]'s [[StaffLine]]'s due to [[Label]] positioning.
     * @param systemLabelsRightMargin
     */
    private updateMusicSystemStaffLineXPosition;
}

declare abstract class AbstractTempoExpression extends AbstractExpression {
    constructor(label: string, placement: PlacementEnum, staffNumber: number, parentMultiTempoExpression: MultiTempoExpression);
    protected label: string;
    protected staffNumber: number;
    protected parentMultiTempoExpression: MultiTempoExpression;
    get Label(): string;
    set Label(value: string);
    get Placement(): PlacementEnum;
    set Placement(value: PlacementEnum);
    get StaffNumber(): number;
    set StaffNumber(value: number);
    get ParentMultiTempoExpression(): MultiTempoExpression;
    protected static isStringInStringList(wordsToFind: string[], inputString: string): boolean;
    private static stringContainsSeparatedWord;
}

/** Tempo expressions that usually have an instantaneous and non-gradual effect on playback speed (e.g. Allegro),
 * or at least cover large sections, compared to the usually gradual effects or shorter sections of ContinuousExpressions.
 */
declare class InstantaneousTempoExpression extends AbstractTempoExpression {
    constructor(label: string, placement: PlacementEnum, staffNumber: number, soundTempo: number, parentMultiTempoExpression: MultiTempoExpression, isMetronomeMark?: boolean);
    dotted: boolean;
    beatUnit: string;
    isMetronomeMark: boolean;
    private static listInstantaneousTempoLarghissimo;
    private static listInstantaneousTempoGrave;
    private static listInstantaneousTempoLento;
    private static listInstantaneousTempoLargo;
    private static listInstantaneousTempoLarghetto;
    private static listInstantaneousTempoAdagio;
    private static listInstantaneousTempoAdagietto;
    private static listInstantaneousTempoAndanteModerato;
    private static listInstantaneousTempoAndante;
    private static listInstantaneousTempoAndantino;
    private static listInstantaneousTempoModerato;
    private static listInstantaneousTempoAllegretto;
    private static listInstantaneousTempoAllegroModerato;
    private static listInstantaneousTempoAllegro;
    private static listInstantaneousTempoVivace;
    private static listInstantaneousTempoVivacissimo;
    private static listInstantaneousTempoAllegrissimo;
    private static listInstantaneousTempoPresto;
    private static listInstantaneousTempoPrestissimo;
    private static listInstantaneousTempoChangesGeneral;
    private static listInstantaneousTempoAddons;
    private tempoEnum;
    private tempoInBpm;
    static getDefaultValueForTempoType(tempoEnum: TempoEnum): number;
    static isInputStringInstantaneousTempo(inputString: string): boolean;
    get Label(): string;
    set Label(value: string);
    get Placement(): PlacementEnum;
    set Placement(value: PlacementEnum);
    get StaffNumber(): number;
    set StaffNumber(value: number);
    get Enum(): TempoEnum;
    get TempoInBpm(): number;
    set TempoInBpm(value: number);
    get ParentMultiTempoExpression(): MultiTempoExpression;
    getAbsoluteTimestamp(): Fraction;
    getAbsoluteFloatTimestamp(): number;
    private setTempoAndTempoType;
}
declare enum TempoEnum {
    none = 0,
    larghissimo = 1,
    grave = 2,
    lento = 3,
    largo = 4,
    larghetto = 5,
    adagio = 6,
    adagietto = 7,
    andanteModerato = 8,
    andante = 9,
    andantino = 10,
    moderato = 11,
    allegretto = 12,
    allegroModerato = 13,
    allegro = 14,
    vivace = 15,
    vivacissimo = 16,
    allegrissimo = 17,
    presto = 18,
    prestissimo = 19,
    lastRealTempo = 20,
    addon = 21,
    changes = 22,
    metronomeMark = 23
}

/** Tempo expressions that usually have a continuous or gradual effect playback-wise (e.g. accelerando),
 * or describe shorter sections (e.g. meno mosso).
 */
declare class ContinuousTempoExpression extends AbstractTempoExpression {
    constructor(label: string, placement: PlacementEnum, staffNumber: number, parentMultiTempoExpression: MultiTempoExpression);
    private static listContinuousTempoFaster;
    private static listContinuousTempoSlower;
    private absoluteEndTimestamp;
    private tempoType;
    private startTempo;
    private endTempo;
    static isInputStringContinuousTempo(inputString: string): boolean;
    static isIncreasingTempo(tempoType: ContinuousTempoType): boolean;
    static isDecreasingTempo(tempoType: ContinuousTempoType): boolean;
    get TempoType(): ContinuousTempoType;
    set TempoType(value: ContinuousTempoType);
    get StartTempo(): number;
    set StartTempo(value: number);
    get EndTempo(): number;
    set EndTempo(value: number);
    get AbsoluteEndTimestamp(): Fraction;
    set AbsoluteEndTimestamp(value: Fraction);
    get AbsoluteTimestamp(): Fraction;
    getAbsoluteFloatTimestamp(): number;
    getInterpolatedTempo(currentAbsoluteTimestamp: Fraction): number;
    private setTempoType;
}
declare enum ContinuousTempoType {
    accelerando = 0,
    stretto = 1,
    stringendo = 2,
    mosso = 3,
    piuMosso = 4,
    allargando = 5,
    calando = 6,
    menoMosso = 7,
    rallentando = 8,
    ritardando = 9,
    ritard = 10,
    rit = 11,
    ritenuto = 12,
    rubato = 13,
    precipitando = 14
}

declare class MultiTempoExpression {
    constructor(sourceMeasure: SourceMeasure, timestamp: Fraction);
    private timestamp;
    private sourceMeasure;
    private instantaneousTempo;
    private continuousTempo;
    private expressions;
    private combinedExpressionsText;
    get Timestamp(): Fraction;
    get AbsoluteTimestamp(): Fraction;
    get SourceMeasureParent(): SourceMeasure;
    set SourceMeasureParent(value: SourceMeasure);
    get InstantaneousTempo(): InstantaneousTempoExpression;
    get ContinuousTempo(): ContinuousTempoExpression;
    get EntriesList(): TempoExpressionEntry[];
    get CombinedExpressionsText(): string;
    set CombinedExpressionsText(value: string);
    getPlacementOfFirstEntry(): PlacementEnum;
    getFontstyleOfFirstEntry(): FontStyles;
    addExpression(abstractTempoExpression: AbstractTempoExpression, prefix: string): void;
    CompareTo(other: MultiTempoExpression): number;
    private checkIfAlreadyExists;
}
declare class TempoExpressionEntry {
    prefix: string;
    protected expression: AbstractTempoExpression;
    label: string;
    get Expression(): AbstractTempoExpression;
    set Expression(value: AbstractTempoExpression);
}

interface IGraphicalSymbolFactory {
    createMusicSystem(systemIndex: number, rules: EngravingRules): MusicSystem;
    createStaffLine(parentSystem: MusicSystem, parentStaff: Staff): StaffLine;
    createGraphicalMeasure(sourceMeasure: SourceMeasure, staff: Staff): GraphicalMeasure;
    createMultiRestMeasure(sourceMeasure: SourceMeasure, staff: Staff): GraphicalMeasure;
    createTabStaffMeasure(sourceMeasure: SourceMeasure, staff: Staff): GraphicalMeasure;
    createExtraGraphicalMeasure(staffLine: StaffLine): GraphicalMeasure;
    createStaffEntry(sourceStaffEntry: SourceStaffEntry, measure: GraphicalMeasure): GraphicalStaffEntry;
    createVoiceEntry(parentVoiceEntry: VoiceEntry, parentStaffEntry: GraphicalStaffEntry): GraphicalVoiceEntry;
    createNote(note: Note, graphicalVoiceEntry: GraphicalVoiceEntry, activeClef: ClefInstruction, octaveShift: OctaveEnum, rules: EngravingRules, graphicalNoteLength?: Fraction): GraphicalNote;
    createGraceNote(note: Note, graphicalVoiceEntry: GraphicalVoiceEntry, activeClef: ClefInstruction, rules: EngravingRules, octaveShift?: OctaveEnum): GraphicalNote;
    addGraphicalAccidental(graphicalNote: GraphicalNote, pitch: Pitch): void;
    addFermataAtTiedEndNote(tiedNote: Note, graphicalStaffEntry: GraphicalStaffEntry): void;
    createGraphicalTechnicalInstruction(technicalInstruction: TechnicalInstruction, graphicalStaffEntry: GraphicalStaffEntry): void;
    createInStaffClef(graphicalStaffEntry: GraphicalStaffEntry, clefInstruction: ClefInstruction): void;
    createChordSymbols(sourceStaffEntry: SourceStaffEntry, graphicalStaffEntry: GraphicalStaffEntry, keyInstruction: KeyInstruction, transposeHalftones: number): void;
}

interface ITextMeasurer {
    fontSize: number;
    fontSizeStandard: number;
    computeTextWidthToHeightRatio(text: string, font: Fonts, style: FontStyles, fontFamily?: string, fontSize?: number): number;
    setFontSize(fontSize: number): number;
}

interface ITransposeCalculator {
    transposePitch(pitch: Pitch, currentKeyInstruction: KeyInstruction, halftones: number): Pitch;
    transposeKey(keyInstruction: KeyInstruction, transpose: number): void;
}

/**
 * Compute the accidentals for notes according to the current key instruction
 */
declare class AccidentalCalculator {
    private keySignatureNoteAlterationsDict;
    private currentAlterationsComparedToKeyInstructionList;
    private currentInMeasureNoteAlterationsDict;
    private activeKeyInstruction;
    Transpose: number;
    get ActiveKeyInstruction(): KeyInstruction;
    set ActiveKeyInstruction(value: KeyInstruction);
    /**
     * This method is called after each Measure
     * It clears the in-measure alterations dict for the next measure
     * and pre-loads with the alterations of the key signature
     */
    doCalculationsAtEndOfMeasure(): void;
    checkAccidental(graphicalNote: GraphicalNote, pitch: Pitch): void;
    private isAlterAmbiguousAccidental;
    private reactOnKeyInstructionChange;
}

declare class GraphicalInstantaneousDynamicExpression extends AbstractGraphicalExpression {
    protected mInstantaneousDynamicExpression: InstantaneousDynamicExpression;
    protected mMeasure: GraphicalMeasure;
    constructor(instantaneousDynamic: InstantaneousDynamicExpression, staffLine: StaffLine, measure: GraphicalMeasure);
    updateSkyBottomLine(): void;
}

interface ISqueezable {
    /**
     * Squeezes the wedge by the given amount.
     * @param value Squeeze amount. Positive values squeeze from the left, negative from the right
     */
    squeeze(value: number): void;
}

/**
 * This class prepares the graphical elements for a continuous expression. It calculates the wedges and
 * wrappings if they are split over system breaks.
 */
declare class GraphicalContinuousDynamicExpression extends AbstractGraphicalExpression implements ISqueezable {
    /** True if expression is split over system borders */
    private isSplittedPart;
    /** True if this expression should not be removed if re-rendered */
    private notToBeRemoved;
    /** Holds the line objects that can be drawn via implementation */
    private lines;
    private startMeasure;
    private endMeasure;
    IsSoftAccent: boolean;
    /**
     * Create a new instance of the GraphicalContinuousDynamicExpression
     * @param continuousDynamic The continuous dynamic instruction read via ExpressionReader
     * @param staffLine The staffline where the expression is attached
     */
    constructor(continuousDynamic: ContinuousDynamicExpression, staffLine: StaffLine, measure: SourceMeasure);
    /** The graphical measure where the parent continuous dynamic expression starts */
    get StartMeasure(): GraphicalMeasure;
    set StartMeasure(value: GraphicalMeasure);
    /** The graphical measure where the parent continuous dynamic expression ends */
    get EndMeasure(): GraphicalMeasure;
    set EndMeasure(value: GraphicalMeasure);
    /** The staff lin where the graphical dynamic expressions ends */
    get EndStaffLine(): StaffLine;
    /**  Is true if this continuous expression is a wedge, that reaches over a system border and needs to be split into two. */
    get IsSplittedPart(): boolean;
    set IsSplittedPart(value: boolean);
    /**  Is true if the dynamic is not a symbol but a text instruction. E.g. "decrescendo" */
    get IsVerbal(): boolean;
    /** True if this expression should not be removed if re-rendered */
    get NotToBeRemoved(): boolean;
    set NotToBeRemoved(value: boolean);
    /** Holds the line objects that can be drawn via implementation */
    get Lines(): GraphicalLine[];
    get ContinuousDynamic(): ContinuousDynamicExpression;
    updateSkyBottomLine(): void;
    /**
     * Calculate crescendo lines for (full).
     * @param startX left most starting point
     * @param endX right mist ending point
     * @param y y placement
     * @param wedgeOpeningLength length of the opening
     * @param wedgeLineWidth line width of the wedge
     */
    createCrescendoLines(startX: number, endX: number, y: number, wedgeOpeningLength?: number, wedgeLineWidth?: number): void;
    /**
     * Calculate crescendo lines for system break (first part).
     * @param startX left most starting point
     * @param endX right mist ending point
     * @param y y placement
     * @param wedgeMeasureEndOpeningLength length of opening at measure end
     * @param wedgeOpeningLength length of the opening
     * @param wedgeLineWidth line width of the wedge
     */
    createFirstHalfCrescendoLines(startX: number, endX: number, y: number, wedgeMeasureEndOpeningLength?: number, wedgeLineWidth?: number): void;
    /**
     * Calculate crescendo lines for system break (second part).
     * @param startX left most starting point
     * @param endX right mist ending point
     * @param y y placement
     * @param wedgeMeasureBeginOpeningLength length of opening at measure start
     * @param wedgeOpeningLength length of the opening
     * @param wedgeLineWidth line width of the wedge
     */
    createSecondHalfCrescendoLines(startX: number, endX: number, y: number, wedgeMeasureBeginOpeningLength?: number, wedgeOpeningLength?: number, wedgeLineWidth?: number): void;
    /**
     * This method recalculates the Crescendo Lines (for all cases).
     * @param startX left most starting point
     * @param endX right most ending point
     * @param y y placement
     */
    recalculateCrescendoLines(startX: number, endX: number, y: number): void;
    /**
     * Calculate diminuendo lines for system break (full).
     * @param startX left most starting point
     * @param endX right mist ending point
     * @param y y placement
     * @param wedgeOpeningLength length of the opening
     * @param wedgeLineWidth line width of the wedge
     */
    createDiminuendoLines(startX: number, endX: number, y: number, wedgeOpeningLength?: number, wedgeLineWidth?: number): void;
    /**
     * Calculate diminuendo lines for system break (first part).
     * @param startX left most starting point
     * @param endX right mist ending point
     * @param y y placement
     * @param wedgeOpeningLength length of the opening
     * @param wedgeMeasureEndOpeningLength length of opening at measure end
     * @param wedgeLineWidth line width of the wedge
     */
    createFirstHalfDiminuendoLines(startX: number, endX: number, y: number, wedgeOpeningLength?: number, wedgeMeasureEndOpeningLength?: number, wedgeLineWidth?: number): void;
    /**
     * Calculate diminuendo lines for system break (second part).
     * @param startX left most starting point
     * @param endX right mist ending point
     * @param y y placement
     * @param wedgeMeasureBeginOpeningLength length of opening at measure start
     * @param wedgeLineWidth line width of the wedge
     */
    createSecondHalfDiminuendoLines(startX: number, endX: number, y: number, wedgeMeasureBeginOpeningLength?: number, wedgeLineWidth?: number): void;
    /**
     * This method recalculates the diminuendo lines (for all cases).
     * @param startX left most starting point
     * @param endX right most ending point
     * @param y y placement
     */
    recalculateDiminuendoLines(startX: number, endX: number, yPosition: number): void;
    /** Wrapper for createFirstHalfCrescendoLines and createFirstHalfDiminuendoLines.
     * Checks whether `this` is crescendo or diminuendo, helps avoid code duplication.
     */
    createFirstHalfLines(startX: number, endX: number, y: number, wedgeOpeningLength?: number, wedgeMeasureEndOpeningLength?: number, wedgeLineWidth?: number): void;
    /** Wrapper for createSecondHalfCrescendoLines and createSecondHalfDiminuendoLines, see createFirstHalfLines. */
    createSecondHalfLines(startX: number, endX: number, y: number, wedgeMeasureBeginOpeningLength?: number, wedgeOpeningLength?: number, wedgeLineWidth?: number): void;
    /** Wrapper for createCrescendoLines and createDiminuendoLines, see createFirstHalfLines. */
    createLines(startX: number, endX: number, y: number, wedgeOpeningLength?: number, wedgeLineWidth?: number): void;
    /**
     * Calculate the BoundingBox (as a box around the Wedge).
     */
    calcPsi(): void;
    /**
     * Clear Lines
     */
    cleanUp(): void;
    /**
     * Shift wedge in y position
     * @param shift Number to shift
     */
    shiftYPosition(shift: number): void;
    squeeze(value: number): void;
    /**
     * Create lines from points and add them to the memory
     * @param wedgePoint start of the expression
     * @param upperWedgeEnd end of the upper line
     * @param lowerWedgeEnd end of lower line
     * @param wedgeLineWidth line width
     */
    private addWedgeLines;
    /**
     * Create top and bottom lines for continuing wedges
     * @param upperLineStart start of the upper line
     * @param upperLineEnd end of the upper line
     * @param lowerLineStart start of the lower line
     * @param lowerLineEnd end of lower line
     * @param wedgeLineWidth line width
     */
    private addDoubleLines;
}

interface IStafflineNoteCalculator {
    trackNote(graphicalNote: GraphicalNote): void;
    positionNote(graphicalNote: GraphicalNote): GraphicalNote;
    getStafflineUniquePositionCount(staffIndex: number): number;
}

/**
 * Class used to do all the calculations in a MusicSheet, which in the end populates a GraphicalMusicSheet.
 */
declare abstract class MusicSheetCalculator {
    static symbolFactory: IGraphicalSymbolFactory;
    static transposeCalculator: ITransposeCalculator;
    static stafflineNoteCalculator: IStafflineNoteCalculator;
    protected static textMeasurer: ITextMeasurer;
    protected staffEntriesWithGraphicalTies: GraphicalStaffEntry[];
    protected staffEntriesWithOrnaments: GraphicalStaffEntry[];
    protected staffEntriesWithChordSymbols: GraphicalStaffEntry[];
    protected staffLinesWithLyricWords: StaffLine[];
    protected graphicalLyricWords: GraphicalLyricWord[];
    protected graphicalMusicSheet: GraphicalMusicSheet;
    protected rules: EngravingRules;
    protected musicSystems: MusicSystem[];
    private abstractNotImplementedErrorMessage;
    static get TextMeasurer(): ITextMeasurer;
    static set TextMeasurer(value: ITextMeasurer);
    protected get leadSheet(): boolean;
    protected static setMeasuresMinStaffEntriesWidth(measures: GraphicalMeasure[], minimumStaffEntriesWidth: number): void;
    initialize(graphicalMusicSheet: GraphicalMusicSheet): void;
    /**
     * Build the 2D [[GraphicalMeasure]] list needed for the [[MusicSheetCalculator]].
     * Internally it creates [[GraphicalMeasure]]s, [[GraphicalStaffEntry]]'s and [[GraphicalNote]]s.
     */
    prepareGraphicalMusicSheet(): void;
    /**
     * The main method for the Calculator.
     */
    calculate(): void;
    calculateXLayout(graphicalMusicSheet: GraphicalMusicSheet, maxInstrNameLabelLength: number): void;
    calculateMeasureWidthFromStaffEntries(measuresVertical: GraphicalMeasure[], oldMinimumStaffEntriesWidth: number): number;
    protected formatMeasures(): void;
    /**
     * Calculates the x layout of the staff entries within the staff measures belonging to one source measure.
     * All staff entries are x-aligned throughout all the measures.
     * @param measures - The minimum required x width of the source measure
     */
    protected calculateMeasureXLayout(measures: GraphicalMeasure[]): number;
    /**
     * Called for every source measure when generating the list of staff measures for it.
     */
    protected initGraphicalMeasuresCreation(): void;
    protected handleBeam(graphicalNote: GraphicalNote, beam: Beam, openBeams: Beam[]): void;
    /**
     * Check if the tied graphical note belongs to any beams or tuplets and react accordingly.
     * @param tiedGraphicalNote
     * @param beams
     * @param activeClef
     * @param octaveShiftValue
     * @param graphicalStaffEntry
     * @param duration
     * @param openTie
     * @param isLastTieNote
     */
    protected handleTiedGraphicalNote(tiedGraphicalNote: GraphicalNote, beams: Beam[], activeClef: ClefInstruction, octaveShiftValue: OctaveEnum, graphicalStaffEntry: GraphicalStaffEntry, duration: Fraction, openTie: Tie, isLastTieNote: boolean): void;
    protected handleVoiceEntryLyrics(voiceEntry: VoiceEntry, graphicalStaffEntry: GraphicalStaffEntry, openLyricWords: LyricWord[]): void;
    protected handleVoiceEntryOrnaments(ornamentContainer: OrnamentContainer, voiceEntry: VoiceEntry, graphicalStaffEntry: GraphicalStaffEntry): void;
    protected handleVoiceEntryArticulations(articulations: Articulation[], voiceEntry: VoiceEntry, staffEntry: GraphicalStaffEntry): void;
    /**
     * Adds a technical instruction at the given staff entry.
     * @param technicalInstructions
     * @param voiceEntry
     * @param staffEntry
     */
    protected handleVoiceEntryTechnicalInstructions(technicalInstructions: TechnicalInstruction[], voiceEntry: VoiceEntry, staffEntry: GraphicalStaffEntry): void;
    protected handleTuplet(graphicalNote: GraphicalNote, tuplet: Tuplet, openTuplets: Tuplet[]): void;
    protected layoutVoiceEntry(voiceEntry: VoiceEntry, graphicalNotes: GraphicalNote[], graphicalStaffEntry: GraphicalStaffEntry, hasPitchedNote: boolean): void;
    protected layoutStaffEntry(graphicalStaffEntry: GraphicalStaffEntry): void;
    protected createGraphicalTie(tie: Tie, startGse: GraphicalStaffEntry, endGse: GraphicalStaffEntry, startNote: GraphicalNote, endNote: GraphicalNote): GraphicalTie;
    protected updateStaffLineBorders(staffLine: StaffLine): void;
    /**
     * Iterate through all Measures and calculates the MeasureNumberLabels.
     * @param musicSystem
     */
    protected calculateMeasureNumberPlacement(musicSystem: MusicSystem): void;
    private calculateSingleMeasureNumberPlacement;
    private calculateMeasureNumberSkyline;
    /**
     * Calculate the shape (Bézier curve) for this tie.
     * @param tie
     * @param tieIsAtSystemBreak
     */
    protected layoutGraphicalTie(tie: GraphicalTie, tieIsAtSystemBreak: boolean, isTab: boolean): void;
    /**
     * Calculate the Lyrics YPositions for a single [[StaffLine]].
     * @param staffLine
     * @param lyricVersesNumber
     */
    protected calculateSingleStaffLineLyricsPosition(staffLine: StaffLine, lyricVersesNumber: string[]): GraphicalStaffEntry[];
    /**
     * calculates the dashes of lyric words and the extending underscore lines of syllables sung on more than one note.
     * @param lyricsStaffEntries
     */
    protected calculateLyricsExtendsAndDashes(lyricsStaffEntries: GraphicalStaffEntry[]): void;
    /**
     * Calculate a single OctaveShift for a [[MultiExpression]].
     * @param sourceMeasure
     * @param multiExpression
     * @param measureIndex
     * @param staffIndex
     */
    protected calculateSingleOctaveShift(sourceMeasure: SourceMeasure, multiExpression: MultiExpression, measureIndex: number, staffIndex: number): void;
    /**
     * Calculate a single Pedal for a [[MultiExpression]].
     * @param sourceMeasure
     * @param multiExpression
     * @param measureIndex
     * @param staffIndex
     */
    protected abstract calculateSinglePedal(sourceMeasure: SourceMeasure, multiExpression: MultiExpression, measureIndex: number, staffIndex: number): void;
    /**
     * Calculate all the textual [[RepetitionInstruction]]s (e.g. dal segno) for a single [[SourceMeasure]].
     * @param repetitionInstruction
     * @param measureIndex
     */
    protected calculateWordRepetitionInstruction(repetitionInstruction: RepetitionInstruction, measureIndex: number): void;
    /**
     * Calculate all the Mood and Unknown Expressions for a single [[MultiExpression]].
     * @param multiExpression
     * @param measureIndex
     * @param staffIndex
     */
    protected calculateMoodAndUnknownExpression(multiExpression: MultiExpression, measureIndex: number, staffIndex: number): void;
    /**
     * Delete all Objects that must be recalculated.
     * If graphicalMusicSheet.reCalculate has been called, then this method will be called to reset or remove all flexible
     * graphical music symbols (e.g. Ornaments, Lyrics, Slurs) graphicalMusicSheet will have MusicPages, they will have MusicSystems etc...
     */
    protected clearRecreatedObjects(): void;
    /**
     * This method handles a [[StaffEntryLink]].
     * @param graphicalStaffEntry
     * @param staffEntryLinks
     */
    protected handleStaffEntryLink(graphicalStaffEntry: GraphicalStaffEntry, staffEntryLinks: StaffEntryLink[]): void;
    /**
     * Store the newly computed [[Measure]]s in newly created [[MusicSystem]]s.
     */
    protected calculateMusicSystems(): void;
    protected calculateMarkedAreas(): void;
    protected calculateComments(): void;
    protected calculateChordSymbols(): void;
    protected calculateAlignedChordSymbolsOffset(staffEntries: GraphicalStaffEntry[], sbc: SkyBottomLineCalculator): {
        minOffset: number;
        maxOffset: number;
    };
    /**
     * Do layout on staff measures which only consist of a full rest.
     * @param rest
     * @param gse
     * @param measure
     */
    protected layoutMeasureWithWholeRest(rest: GraphicalNote, gse: GraphicalStaffEntry, measure: GraphicalMeasure): void;
    protected layoutBeams(staffEntry: GraphicalStaffEntry): void;
    protected layoutArticulationMarks(articulations: Articulation[], voiceEntry: VoiceEntry, graphicalStaffEntry: GraphicalStaffEntry): void;
    protected layoutOrnament(ornaments: OrnamentContainer, voiceEntry: VoiceEntry, graphicalStaffEntry: GraphicalStaffEntry): void;
    protected calculateRestNotePlacementWithinGraphicalBeam(graphicalStaffEntry: GraphicalStaffEntry, restNote: GraphicalNote, previousNote: GraphicalNote, nextStaffEntry: GraphicalStaffEntry, nextNote: GraphicalNote): void;
    protected calculateTupletNumbers(): void;
    protected calculateSlurs(): void;
    protected calculateGlissandi(): void;
    protected calculateDynamicExpressionsForMultiExpression(multiExpression: MultiExpression, measureIndex: number, staffIndex: number): void;
    /**
     * This method calculates the RelativePosition of a single verbal GraphicalContinuousDynamic.
     * @param graphicalContinuousDynamic Graphical continous dynamic to be calculated
     * @param startPosInStaffline Starting point in staff line
     */
    protected calculateGraphicalVerbalContinuousDynamic(graphicalContinuousDynamic: GraphicalContinuousDynamicExpression, startPosInStaffline: PointF2D): void;
    /**
     * This method calculates the RelativePosition of a single GraphicalContinuousDynamic.
     * @param graphicalContinuousDynamic Graphical continous dynamic to be calculated
     * @param startPosInStaffline Starting point in staff line
     */
    calculateGraphicalContinuousDynamic(graphicalContinuousDynamic: GraphicalContinuousDynamicExpression, startPosInStaffline: PointF2D): void;
    /**
     * This method calculates the RelativePosition of a single GraphicalInstantaneousDynamicExpression.
     * @param graphicalInstantaneousDynamic Dynamic expression to be calculated
     * @param startPosInStaffline Starting point in staff line
     */
    protected calculateGraphicalInstantaneousDynamicExpression(graphicalInstantaneousDynamic: GraphicalInstantaneousDynamicExpression, startPosInStaffline: PointF2D, timestamp: Fraction): void;
    protected calcGraphicalRepetitionEndingsRecursively(repetition: Repetition): void;
    /**
     * Calculate a single GraphicalRepetition.
     * @param start
     * @param end
     * @param numberText
     * @param offset
     * @param leftOpen
     * @param rightOpen
     */
    protected layoutSingleRepetitionEnding(start: GraphicalMeasure, end: GraphicalMeasure, numberText: string, offset: number, leftOpen: boolean, rightOpen: boolean): void;
    protected calculateLabel(staffLine: StaffLine, relative: PointF2D, combinedString: string, style: FontStyles, placement: PlacementEnum, fontHeight: number, textAlignment?: TextAlignmentEnum, yPadding?: number): GraphicalLabel;
    protected calculateTempoExpressionsForMultiTempoExpression(sourceMeasure: SourceMeasure, multiTempoExpression: MultiTempoExpression, measureIndex: number): void;
    protected createMetronomeMark(metronomeExpression: InstantaneousTempoExpression): void;
    protected graphicalMeasureCreatedCalculations(measure: GraphicalMeasure): void;
    protected clearSystemsAndMeasures(): void;
    protected handleVoiceEntry(voiceEntry: VoiceEntry, graphicalStaffEntry: GraphicalStaffEntry, accidentalCalculator: AccidentalCalculator, openLyricWords: LyricWord[], activeClef: ClefInstruction, openTuplets: Tuplet[], openBeams: Beam[], octaveShiftValue: OctaveEnum, staffIndex: number, linkedNotes?: Note[], sourceStaffEntry?: SourceStaffEntry): OctaveEnum;
    protected resetYPositionForLeadSheet(psi: BoundingBox): void;
    protected layoutVoiceEntries(graphicalStaffEntry: GraphicalStaffEntry, staffIndex: number): void;
    protected maxInstrNameLabelLength(): number;
    protected calculateSheetLabelBoundingBoxes(): void;
    protected checkMeasuresForWholeRestNotes(): void;
    protected optimizeRestNotePlacement(graphicalStaffEntry: GraphicalStaffEntry, measure: GraphicalMeasure): void;
    protected getRelativePositionInStaffLineFromTimestamp(timestamp: Fraction, verticalIndex: number, staffLine: StaffLine, multiStaffInstrument: boolean, firstVisibleMeasureRelativeX?: number, useLeftStaffEntryBorder?: boolean): PointF2D;
    protected getRelativeXPositionFromTimestamp(timestamp: Fraction): number;
    protected calculatePageLabels(page: GraphicalMusicPage): void;
    protected createGraphicalTies(): void;
    private handleTie;
    private setTieDirections;
    private createAccidentalCalculators;
    private calculateVerticalContainersList;
    private setIndicesToVerticalGraphicalContainers;
    private createGraphicalMeasuresForSourceMeasure;
    private createGraphicalMeasure;
    private checkNoteForAccidental;
    private handleStaffEntries;
    protected calculateSkyBottomLines(): void;
    /**
     * Re-adjust the x positioning of expressions.
     */
    protected calculateExpressionAlignements(): void;
    private calculateStaffEntryArticulationMarks;
    private calculateOrnaments;
    private getFingeringPlacement;
    calculateFingerings(): void;
    private optimizeRestPlacement;
    private calculateTwoRestNotesPlacementWithCollisionDetection;
    private calculateRestNotePlacementWithCollisionDetectionFromGraphicalNote;
    private calculateTieCurves;
    private calculateLyricsPosition;
    /**
     * This method calculates the dashes within the syllables of a LyricWord
     * @param lyricEntry
     */
    private calculateSingleLyricWord;
    /**
     * This method calculates Dashes for a LyricWord.
     * @param staffLine
     * @param startX
     * @param endX
     * @param y
     */
    private calculateDashes;
    /**
     * This method calculates a single Dash for a LyricWord, positioned in the middle of the given distance.
     * @param {StaffLine} staffLine
     * @param {number} startX
     * @param {number} endX
     * @param {number} y
     */
    private calculateSingleDashForLyricWord;
    /**
     * Layouts the underscore line when a lyric entry is marked as extend
     * @param {GraphicalLyricEntry} lyricEntry
     */
    private calculateLyricExtend;
    /**
     * This method calculates a single underscoreLine.
     * @param staffLine
     * @param startX
     * @param end
     * @param y
     */
    private calculateSingleLyricWordWithUnderscore;
    /**
     * This method calculates two Dashes for a LyricWord, positioned at the the two ends of the given distance.
     * @param {StaffLine} staffLine
     * @param {number} startX
     * @param {number} endX
     * @param {number} y
     * @returns {number}
     */
    private calculateRightAndLeftDashesForLyricWord;
    protected dynamicExpressionMap: Map<number, BoundingBox>;
    private calculateDynamicExpressions;
    private calculateOctaveShifts;
    private calculatePedals;
    private getFirstLeftNotNullStaffEntryFromContainer;
    private getFirstRightNotNullStaffEntryFromContainer;
    private calculateWordRepetitionInstructions;
    private calculateRepetitionEndings;
    private calculateTempoExpressions;
    private calculateRehearsalMarks;
    protected calculateRehearsalMark(measure: SourceMeasure): void;
    private calculateMoodAndUnknownExpressions;
    /**
     * Calculates the desired stem direction depending on the number (or type) of voices.
     * If more than one voice is there, the main voice (typically the first or upper voice) will get stem up direction.
     * The others get stem down direction.
     * @param voiceEntry the voiceEntry for which the stem direction has to be calculated
     */
    private calculateStemDirectionFromVoices;
    /** Sets a voiceEntry's stem direction to one already set in other notes in its beam, if it has one. */
    private setBeamNotesWantedStemDirections;
}

declare class SelectionStartSymbol extends GraphicalObject {
    constructor(system: MusicSystem, xPosition: number);
    verticalLine: GraphicalLine;
    arrows: PointF2D[][];
}

declare class SelectionEndSymbol extends GraphicalObject {
    constructor(system: MusicSystem, xPosition: number);
    verticalLine: GraphicalLine;
    arrows: PointF2D[][];
    arrowlines: PointF2D[][];
}

/** Internal drawing/rendering parameters and broad modes like compact and thumbnail. Overlap with EngravingRules. */
declare class DrawingParameters {
    /** will set other settings if changed with set method */
    private drawingParametersEnum;
    private rules;
    drawHighlights: boolean;
    drawErrors: boolean;
    drawSelectionStartSymbol: boolean;
    drawSelectionEndSymbol: boolean;
    drawCursors: boolean;
    drawActivitySymbols: boolean;
    drawScrollIndicator: boolean;
    drawComments: boolean;
    drawMarkedAreas: boolean;
    drawTitle: boolean;
    drawSubtitle: boolean;
    drawLyricist: boolean;
    drawComposer: boolean;
    drawCopyright: boolean;
    drawCredits: boolean;
    drawPartNames: boolean;
    coloringMode: ColoringModes;
    fingeringPosition: PlacementEnum;
    /** Draw notes set to be invisible (print-object="no" in XML). */
    drawHiddenNotes: boolean;
    constructor(drawingParameters?: DrawingParametersEnum, rules?: EngravingRules);
    /** Sets drawing parameters enum and changes settings flags accordingly. */
    set DrawingParametersEnum(drawingParametersEnum: DrawingParametersEnum);
    get DrawingParametersEnum(): DrawingParametersEnum;
    setForAllOn(): void;
    setForDefault(): void;
    setForThumbnail(): void;
    setForCompactMode(): void;
    setForCompactTightMode(): void;
    setForLeadsheet(): void;
    get DrawCredits(): boolean;
    set DrawCredits(value: boolean);
    get DrawTitle(): boolean;
    /** Enable or disable drawing the Title of the piece. If disabled, will disable drawing Subtitle as well. */
    set DrawTitle(value: boolean);
    get DrawSubtitle(): boolean;
    /** Enable or disable drawing the Subtitle of the piece. If enabled, will enable drawing Title as well. */
    set DrawSubtitle(value: boolean);
    get DrawComposer(): boolean;
    /** Enable or disable drawing a label for the Composer of the piece. */
    set DrawComposer(value: boolean);
    get DrawLyricist(): boolean;
    set DrawLyricist(value: boolean);
    get DrawCopyright(): boolean;
    set DrawCopyright(value: boolean);
    get DrawPartNames(): boolean;
    set DrawPartNames(value: boolean);
    get FingeringPosition(): PlacementEnum;
    set FingeringPosition(value: PlacementEnum);
    get Rules(): EngravingRules;
    set Rules(value: EngravingRules);
}

declare enum DrawingMode {
    All = 0,
    NoOverlays = 1,
    Leadsheet = 2
}
declare enum MusicSymbolDrawingStyle {
    Normal = 0,
    Disabled = 1,
    Selected = 2,
    Clickable = 3,
    PlaybackSymbols = 4,
    FollowSymbols = 5,
    QFeedbackNotFound = 6,
    QFeedbackOk = 7,
    QFeedbackPerfect = 8,
    Debug1 = 9,
    Debug2 = 10,
    Debug3 = 11
}
declare enum PhonicScoreModes {
    Following = 0,
    Midi = 1,
    Manual = 2
}

/**
 * Draw a [[GraphicalMusicSheet]] (through the .drawSheet method)
 *
 * The drawing is implemented with a top-down approach, starting from a music sheet, going through pages, systems, staffs...
 * ... and ending in notes, beams, accidentals and other symbols.
 * It's worth to say, that this class just draws the symbols and graphical elements, using the positions that have been computed before.
 * But in any case, some of these previous positioning algorithms need the sizes of the concrete symbols (NoteHeads, sharps, flats, keys...).
 * Therefore, there are some static functions on the 'Bounding Boxes' section used to compute these symbol boxes at the
 * beginning for the later use in positioning algorithms.
 *
 * This class also includes the resizing and positioning of the symbols due to user interaction like zooming or panning.
 */
declare abstract class MusicSheetDrawer {
    drawingParameters: DrawingParameters;
    splitScreenLineColor: number;
    midiPlaybackAvailable: boolean;
    drawableBoundingBoxElement: string;
    skyLineVisible: boolean;
    bottomLineVisible: boolean;
    protected rules: EngravingRules;
    protected graphicalMusicSheet: GraphicalMusicSheet;
    protected textMeasurer: ITextMeasurer;
    private phonicScoreMode;
    constructor(textMeasurer: ITextMeasurer, drawingParameters: DrawingParameters);
    set Mode(value: PhonicScoreModes);
    drawSheet(graphicalMusicSheet: GraphicalMusicSheet): void;
    drawLineAsHorizontalRectangle(line: GraphicalLine, layer: number): void;
    drawLineAsVerticalRectangle(line: GraphicalLine, layer: number): void;
    drawLineAsHorizontalRectangleWithOffset(line: GraphicalLine, offset: PointF2D, layer: number): void;
    drawLineAsVerticalRectangleWithOffset(line: GraphicalLine, offset: PointF2D, layer: number): void;
    drawRectangle(rect: GraphicalRectangle, layer: number): void;
    calculatePixelDistance(unitDistance: number): number;
    drawLabel(graphicalLabel: GraphicalLabel, layer: number): Node;
    protected applyScreenTransformation(point: PointF2D): PointF2D;
    protected applyScreenTransformations(points: PointF2D[]): PointF2D[];
    protected applyScreenTransformationForRect(rectangle: RectangleF2D): RectangleF2D;
    protected drawSplitScreenLine(): void;
    protected renderRectangle(rectangle: RectangleF2D, layer: number, styleId: number, colorHex?: string, alpha?: number): Node;
    protected drawScrollIndicator(): void;
    protected drawSelectionStartSymbol(symbol: SelectionStartSymbol): void;
    protected drawSelectionEndSymbol(symbol: SelectionEndSymbol): void;
    protected renderLabel(graphicalLabel: GraphicalLabel, layer: number, bitmapWidth: number, bitmapHeight: number, heightInPixel: number, screenPosition: PointF2D): Node;
    protected renderSystemToScreen(system: MusicSystem, systemBoundingBoxInPixels: RectangleF2D, absBoundingRectWithMargin: RectangleF2D): void;
    protected drawMeasure(measure: GraphicalMeasure): void;
    protected drawSkyLine(staffLine: StaffLine): void;
    protected drawBottomLine(staffLine: StaffLine): void;
    protected drawInstrumentBrace(brace: GraphicalObject, system: MusicSystem): void;
    protected drawGroupBracket(bracket: GraphicalObject, system: MusicSystem): void;
    protected isVisible(psi: BoundingBox): boolean;
    protected drawMusicSystem(system: MusicSystem): void;
    protected getSytemBoundingBoxInPixels(absBoundingRectWithMargin: RectangleF2D): RectangleF2D;
    protected getSystemAbsBoundingRect(system: MusicSystem): RectangleF2D;
    protected drawMusicSystemComponents(musicSystem: MusicSystem, systemBoundingBoxInPixels: RectangleF2D, absBoundingRectWithMargin: RectangleF2D): void;
    protected activateSystemRendering(systemId: number, absBoundingRect: RectangleF2D, systemBoundingBoxInPixels: RectangleF2D, createNewImage: boolean): boolean;
    protected drawSystemLineObject(systemLine: SystemLine): void;
    protected drawStaffLine(staffLine: StaffLine): void;
    protected drawLyricLines(lyricLines: GraphicalLine[], staffLine: StaffLine): void;
    protected drawExpressions(staffline: StaffLine): void;
    protected drawGraphicalLine(graphicalLine: GraphicalLine, lineWidth: number, colorOrStyle?: string): Node;
    protected drawLine(start: PointF2D, stop: PointF2D, color: string, lineWidth: number): Node;
    /**
     * Draw all dashes to the canvas
     * @param lyricsDashes Array of lyric dashes to be drawn
     * @param layer Number of the layer that the lyrics should be drawn in
     */
    protected drawDashes(lyricsDashes: GraphicalLabel[]): void;
    protected drawOctaveShifts(staffLine: StaffLine): void;
    protected abstract drawPedals(staffLine: StaffLine): void;
    protected drawStaffLines(staffLine: StaffLine): void;
    /**
     * Draws an instantaneous dynamic expression (p, pp, f, ff, ...) to the canvas
     * @param instantaneousDynamic GraphicalInstantaneousDynamicExpression to be drawn
     */
    protected drawInstantaneousDynamic(instantaneousDynamic: GraphicalInstantaneousDynamicExpression): void;
    /**
     * Draws a continuous dynamic expression (wedges) to the canvas
     * @param expression GraphicalContinuousDynamicExpression to be drawn
     */
    protected drawContinuousDynamic(expression: GraphicalContinuousDynamicExpression): void;
    protected drawSymbol(symbol: MusicSymbol, symbolStyle: MusicSymbolDrawingStyle, position: PointF2D, scalingFactor?: number, layer?: number): void;
    protected get leadSheet(): boolean;
    protected set leadSheet(value: boolean);
    protected drawPage(page: GraphicalMusicPage): void;
    /**
     * Draw bounding boxes aroung GraphicalObjects
     * @param startBox Bounding Box that is used as a staring point to recursively go through all child elements
     * @param layer Layer to draw to
     * @param type Type of element to show bounding boxes for as string.
     */
    private drawBoundingBoxes;
    drawBoundingBox(bbox: BoundingBox, color?: string, drawCross?: boolean, labelText?: string, layer?: number): Node;
    private drawMarkedAreas;
    private drawComment;
    private drawStaffLineSymbols;
}

/**
 * The graphical counterpart of a [[MusicSheet]]
 */
declare class GraphicalMusicSheet {
    constructor(musicSheet: MusicSheet, calculator: MusicSheetCalculator);
    private musicSheet;
    private calculator;
    drawer: MusicSheetDrawer;
    private musicPages;
    /** measures (i,j) where i is the measure number and j the staff index (e.g. staff indices 0, 1 for two piano parts) */
    private measureList;
    private verticalGraphicalStaffEntryContainers;
    private title;
    private subtitle;
    private composer;
    private lyricist;
    private copyright;
    private cursors;
    private selectionStartSymbol;
    private selectionEndSymbol;
    private minAllowedSystemWidth;
    private numberOfStaves;
    private leadSheet;
    get ParentMusicSheet(): MusicSheet;
    get GetCalculator(): MusicSheetCalculator;
    get MusicPages(): GraphicalMusicPage[];
    set MusicPages(value: GraphicalMusicPage[]);
    get MeasureList(): GraphicalMeasure[][];
    set MeasureList(value: GraphicalMeasure[][]);
    get VerticalGraphicalStaffEntryContainers(): VerticalGraphicalStaffEntryContainer[];
    set VerticalGraphicalStaffEntryContainers(value: VerticalGraphicalStaffEntryContainer[]);
    get Title(): GraphicalLabel;
    set Title(value: GraphicalLabel);
    get Subtitle(): GraphicalLabel;
    set Subtitle(value: GraphicalLabel);
    get Composer(): GraphicalLabel;
    set Composer(value: GraphicalLabel);
    get Lyricist(): GraphicalLabel;
    set Lyricist(value: GraphicalLabel);
    get Copyright(): GraphicalLabel;
    set Copyright(value: GraphicalLabel);
    get Cursors(): GraphicalLine[];
    get SelectionStartSymbol(): SelectionStartSymbol;
    get SelectionEndSymbol(): SelectionEndSymbol;
    get MinAllowedSystemWidth(): number;
    set MinAllowedSystemWidth(value: number);
    get NumberOfStaves(): number;
    get LeadSheet(): boolean;
    set LeadSheet(value: boolean);
    /**
     * Calculate the Absolute Positions from the Relative Positions.
     * @param graphicalMusicSheet
     */
    static transformRelativeToAbsolutePosition(graphicalMusicSheet: GraphicalMusicSheet): void;
    Initialize(): void;
    reCalculate(): void;
    EnforceRedrawOfMusicSystems(): void;
    getClickedObject<T>(positionOnMusicSheet: PointF2D): T;
    findGraphicalMeasure(measureIndex: number, staffIndex: number): GraphicalMeasure;
    findGraphicalMeasureByMeasureNumber(measureNumber: number, staffIndex: number): GraphicalMeasure;
    /**
     * Search the MeasureList for a certain GraphicalStaffEntry with the given SourceStaffEntry,
     * at a certain verticalIndex (eg a corresponding Staff), starting at a specific horizontalIndex (eg specific GraphicalMeasure).
     * @param staffIndex
     * @param measureIndex
     * @param sourceStaffEntry
     * @returns {any}
     */
    findGraphicalStaffEntryFromMeasureList(staffIndex: number, measureIndex: number, sourceStaffEntry: SourceStaffEntry): GraphicalStaffEntry;
    /**
     * Return the next (to the right) not null GraphicalStaffEntry from a given Index.
     * @param staffIndex
     * @param measureIndex
     * @param graphicalStaffEntry
     * @returns {any}
     */
    findNextGraphicalStaffEntry(staffIndex: number, measureIndex: number, graphicalStaffEntry: GraphicalStaffEntry): GraphicalStaffEntry;
    getFirstVisibleMeasuresListFromIndices(start: number, end: number): GraphicalMeasure[];
    orderMeasuresByStaffLine(measures: GraphicalMeasure[]): GraphicalMeasure[][];
    /**
     * Return the active Clefs at the start of the first SourceMeasure.
     * @returns {ClefInstruction[]}
     */
    initializeActiveClefs(): ClefInstruction[];
    GetMainKey(): KeyInstruction;
    /**
     * Create the VerticalContainer and adds it to the List at the correct Timestamp position.
     * @param timestamp
     * @returns {any}
     */
    getOrCreateVerticalContainer(timestamp: Fraction): VerticalGraphicalStaffEntryContainer;
    /**
     * Does a binary search on the container list and returns the VerticalContainer with the given Timestamp.
     * The search begins at startIndex, if given.
     * If the timestamp cannot be found, null is returned.
     * @param timestamp - The timestamp for which the container shall be found.
     * @param startIndex - The index from which the search starts in the container list.
     * @returns {any}
     * @constructor
     */
    GetVerticalContainerFromTimestamp(timestamp: Fraction, startIndex?: number): VerticalGraphicalStaffEntryContainer;
    /**
     * Perform a binary search for the absolute given Timestamp in all the GraphicalVerticalContainers.
     * @param musicTimestamp
     * @returns {number}
     * @constructor
     */
    GetInterpolatedIndexInVerticalContainers(musicTimestamp: Fraction): number;
    /**
     * Get a List with the indices of all the visible GraphicalMeasures and calculates their
     * corresponding indices in the first SourceMeasure, taking into account Instruments with multiple Staves.
     * @param visibleMeasures
     * @returns {number[]}
     */
    getVisibleStavesIndicesFromSourceMeasure(visibleMeasures: GraphicalMeasure[]): number[];
    /**
     * Returns the GraphicalMeasure with the given SourceMeasure as Parent at the given staff index.
     * @param sourceMeasure
     * @param staffIndex
     * @returns {any}
     */
    getGraphicalMeasureFromSourceMeasureAndIndex(sourceMeasure: SourceMeasure, staffIndex: number): GraphicalMeasure;
    getLastGraphicalMeasureFromIndex(staffIndex: number, lastRendered?: boolean): GraphicalMeasure;
    getMeasureIndex(graphicalMeasure: GraphicalMeasure, measureIndex: number, inListIndex: number): boolean;
    /**
     * Generic method to find graphical objects on the sheet at a given location.
     * @param clickPosition Position in units where we are searching on the sheet
     * @param className String representation of the class we want to find. Must extend GraphicalObject
     * @param startSearchArea The area in units around our point to look for our graphical object, default 5
     * @param maxSearchArea The max area we want to search around our point
     * @param searchAreaIncrement The amount we expand our search area for each iteration that we don't find an object of the given type
     * @param shouldBeIncludedTest A callback that determines if the object should be included in our results- return false for no, true for yes
     */
    private GetNearestGraphicalObject;
    GetNearestVoiceEntry(clickPosition: PointF2D): GraphicalVoiceEntry;
    GetNearestNote(clickPosition: PointF2D, maxClickDist: PointF2D): GraphicalNote;
    domToSvg(point: PointF2D): PointF2D;
    svgToDom(point: PointF2D): PointF2D;
    svgToOsmd(point: PointF2D): PointF2D;
    private domToSvgTransform;
    GetClickableLabel(clickPosition: PointF2D): GraphicalLabel;
    GetNearestStaffEntry(clickPosition: PointF2D): GraphicalStaffEntry;
    /** Returns nearest object of type T near clickPosition.
     * E.g. GetNearestObject<GraphicalMeasure>(pos, GraphicalMeasure.name) returns the nearest measure.
     * Note that there is also GetNearestStaffEntry(), which has a bit more specific code for staff entries.
     * */
    GetNearestObject<T extends GraphicalObject>(clickPosition: PointF2D, className: string): T;
    GetPossibleCommentAnchor(clickPosition: PointF2D): SourceStaffEntry;
    getClickedObjectOfType<T>(positionOnMusicSheet: PointF2D): T;
    tryGetTimestampFromPosition(positionOnMusicSheet: PointF2D): Fraction;
    tryGetClickableLabel(positionOnMusicSheet: PointF2D): GraphicalLabel;
    tryGetTimeStampFromPosition(positionOnMusicSheet: PointF2D): Fraction;
    /**
     * Get visible staffentry for the container given by the index.
     * @param index
     * @returns {GraphicalStaffEntry}
     */
    getStaffEntry(index: number): GraphicalStaffEntry;
    /**
     * Returns the index of the closest previous (earlier) vertical container which has at least some visible staff entry, with respect to the given index.
     * @param index
     * @returns {number}
     * @constructor
     */
    GetPreviousVisibleContainerIndex(index: number): number;
    /**
     * Returns the index of the closest next (later) vertical container which has at least some visible staff entry, with respect to the given index.
     * @param index
     * @returns {number}
     * @constructor
     */
    GetNextVisibleContainerIndex(index: number): number;
    findClosestLeftStaffEntry(fractionalIndex: number, searchOnlyVisibleEntries: boolean): GraphicalStaffEntry;
    findClosestRightStaffEntry(fractionalIndex: number, returnOnlyVisibleEntries: boolean): GraphicalStaffEntry;
    calculateCursorLineAtTimestamp(musicTimestamp: Fraction, styleEnum: OutlineAndFillStyleEnum): GraphicalLine;
    calculateXPositionFromTimestamp(timeStamp: Fraction): [number, MusicSystem];
    GetNumberOfVisibleInstruments(): number;
    GetNumberOfFollowedInstruments(): number;
    GetGraphicalFromSourceStaffEntry(sourceStaffEntry: SourceStaffEntry): GraphicalStaffEntry;
    private CalculateDistance;
    /**
     * Return the longest StaffEntry duration from a GraphicalVerticalContainer.
     * @param index the index of the vertical container
     * @returns {Fraction}
     */
    private getLongestStaffEntryDuration;
}
declare class SystemImageProperties {
    positionInPixels: PointF2D;
    systemImageId: number;
    system: MusicSystem;
}

declare class GraphicalMusicPage extends GraphicalObject {
    private musicSystems;
    private labels;
    private parent;
    private pageNumber;
    constructor(parent: GraphicalMusicSheet);
    get MusicSystems(): MusicSystem[];
    set MusicSystems(value: MusicSystem[]);
    get Labels(): GraphicalLabel[];
    set Labels(value: GraphicalLabel[]);
    get Parent(): GraphicalMusicSheet;
    set Parent(value: GraphicalMusicSheet);
    get PageNumber(): number;
    set PageNumber(value: number);
    /**
     * This method calculates the absolute Position of each GraphicalMusicPage according to a given placement
     * @param pageIndex
     * @param rules
     * @returns {PointF2D}
     */
    setMusicPageAbsolutePosition(pageIndex: number, rules: EngravingRules): PointF2D;
}
declare enum PagePlacementEnum {
    Down = 0,
    Right = 1,
    RightDown = 2
}

declare enum CursorType {
    Standard = 0,
    ThinLeft = 1,
    ShortThinTopLeft = 2,
    CurrentArea = 3,
    CurrentAreaLeft = 4
}
/** Possible options for the OpenSheetMusicDisplay constructor and osmd.setOptions(). None are mandatory.
 *  Note that after using setOptions(), you have to call osmd.render() again to make changes visible.
 *  Example: osmd.setOptions({defaultColorRest: "#AAAAAA", drawSubtitle: false}); osmd.render();
 *
 *  Note that some additional, usually more small scale options are available in EngravingRules,
 *  though not all of them are meant to be manipulated.
 *  The OSMDOptions are the main options we support.
 */
interface IOSMDOptions {
    /** Whether to let Vexflow align rests to preceding or following notes (Vexflow option). Default false (0).
     * This can naturally reduce collisions of rest notes with other notes.
     * Auto mode (2) only aligns rests when there are multiple voices in a measure,
     * and at least once at the same x-coordinate.
     * Auto is the recommended setting, and would be default,
     * if it couldn't in rare cases deteriorate rest placement for existing users.
     * The on mode (1) always aligns rests,
     * also changing their position when there is no simultaneous note at the same x-coordinate,
     * which is nonstandard.
     */
    alignRests?: AlignRestOption | number;
    /** Whether to automatically create beams for notes that don't have beams set in XML. */
    autoBeam?: boolean;
    /** Options for autoBeaming like whether to beam over rests. See AutoBeamOptions interface. */
    autoBeamOptions?: AutoBeamOptions;
    /** Automatically resize score with canvas size. Default is true. */
    autoResize?: boolean;
    /** Render Backend, will be SVG if given undefined, "SVG" or "svg", otherwise Canvas. */
    backend?: string;
    /** Defines the mode that is used for coloring: XML (0), Boomwhacker(1), CustomColorSet (2). Default XML.
     *  If coloringMode.CustomColorSet (2) is chosen, a coloringSetCustom parameter must be added.
     */
    coloringMode?: ColoringModes;
    /** Set of 8 colors for automatic coloring of 7 notes from C to B + rest note in HTML form (e.g. "#00ff00" for green).  */
    coloringSetCustom?: string[];
    /** Whether to enable coloring noteheads and stems, depending on coloringMode. */
    coloringEnabled?: boolean;
    /** Whether to color the stems of notes the same as their noteheads. Default false. */
    colorStemsLikeNoteheads?: boolean;
    /** Dark mode (black background, white notes). Simply sets defaultColorMusic and EngravingRules.PageBackgroundColor. */
    darkMode?: boolean;
    /** Default color for all musical elements including key signature etc. Can be used for dark mode etc. Default undefined. */
    defaultColorMusic?: string;
    /** Default color for a note head (without stem). Default black (undefined).
     * Only considered before loading a sample, not before render.
     * To change the color after loading a sample and before render, use note(.sourceNote).NoteheadColor.
     * The format is Vexflow format, either "#rrggbb" or "#rrggbboo" where <oo> is opacity (00 = transparent). All hex values.
     * E.g., a half-transparent red would be "#FF000080", invisible/transparent would be "#00000000" or "#12345600".
     */
    defaultColorNotehead?: string;
    /** Default color for a note stem. Default black (undefined). */
    defaultColorStem?: string;
    /** Default color for rests. Default black (undefined). */
    defaultColorRest?: string;
    /** Default color for Labels like title or lyrics. Default black (undefined). */
    defaultColorLabel?: string;
    /** Default color for labels in the title. Overrides defaultColorLabel for title labels like composer. Default black (undefined). */
    defaultColorTitle?: string;
    /** Default font used for text and labels, e.g. title or lyrics. Default Times New Roman
     * Note that OSMD originally always used Times New Roman,
     * so things like layout and spacing may still be optimized for it.
     * Valid options are CSS font families available in the browser used for rendering,
     * e.g. Times New Roman, Helvetica.
     */
    defaultFontFamily?: string;
    /** Default font style, e.g. FontStyles.Bold (1). Default Regular (0). */
    defaultFontStyle?: FontStyles;
    /** Don't show/load cursor. Will override disableCursor in drawingParameters. */
    disableCursor?: boolean;
    /** Follow Cursor: Scroll the page when cursor.next() is called and the cursor moves into a new system outside of the current view frame. */
    followCursor?: boolean;
    /** Broad Parameters like compact or preview mode.
     * Also try "compacttight", which is like compact but also reduces margins.
     * To see what this mode does and maybe adjust the spacing parameters yourself instead of using the mode,
     * see DrawingParameters.ts:setForCompactTightMode().
     */
    drawingParameters?: string | DrawingParametersEnum;
    /** Whether to draw credits (title, subtitle, composer, lyricist) (in future: copyright etc., see <credit>). */
    drawCredits?: boolean;
    /** Whether to draw the title of the piece. If false, disables drawing Subtitle as well. */
    drawTitle?: boolean;
    /** Whether to draw the subtitle of the piece. If true, enables drawing Title as well. */
    drawSubtitle?: boolean;
    /** Whether to draw the composer name (top right of the score). */
    drawComposer?: boolean;
    /** Whether to draw the lyricist's name, if given (top left of the score). */
    drawLyricist?: boolean;
    /** Whether to draw metronome marks. Default true. (currently OSMD can only draw one at the beginning) */
    drawMetronomeMarks?: boolean;
    /** Whether to draw part (instrument) names. Setting this to false also disables drawPartAbbreviations,
     *  unless explicitly enabled (drawPartNames: false, drawPartAbbreviations: true).
     */
    drawPartNames?: boolean;
    /** Whether to draw part (instrument) name abbreviations each system after the first. Only draws if drawPartNames. Default true. */
    drawPartAbbreviations?: boolean;
    /** Whether to draw measure numbers (labels). Default true.
     * Draws a measure number label at first measure, system start measure,
     * and every [measureNumberInterval] measures.
     * See the [measureNumberInterval] option, default is 2.
     */
    drawMeasureNumbers?: boolean;
    /** Whether to only draw measure numbers at the start of a system ("new line"), instead of every [measureNumberInterval] measures. Default false. */
    drawMeasureNumbersOnlyAtSystemStart?: boolean;
    /** Whether to draw time signatures (e.g. 4/4). Default true. */
    drawTimeSignatures?: boolean;
    /** The interval of measure numbers to draw, i.e. it draws the measure number above the beginning label every x measures. Default 2. */
    measureNumberInterval?: number;
    /** Whether to read measure numbers from the "number" attribute in the xml file as opposed to defaulting to start at measure 1. Default true. */
    useXMLMeasureNumbers?: boolean;
    /** Whether to draw fingerings (only left to the note for now). Default true (unless solo part). */
    drawFingerings?: boolean;
    /** Where to draw fingerings (above, below, aboveorbelow, left, right, or auto).
     * Default AboveOrBelow. Auto experimental
     */
    fingeringPosition?: string;
    /** For above/below fingerings, whether to draw them directly above/below notes (default), or above/below staffline. */
    fingeringInsideStafflines?: boolean;
    /** Whether to draw hidden/invisible notes (print-object="no" in XML). Default false. Not yet supported. */ drawHiddenNotes?: boolean;
    /** Whether to draw lyrics (and their extensions and dashes). */
    drawLyrics?: boolean;
    /** Whether to calculate extra slurs with bezier curves not covered by Vexflow slurs. Default true. */
    drawSlurs?: boolean;
    /** Only draw measure n to m, where m is the number specified. (for n, see drawFromMeasureNumber) */
    drawUpToMeasureNumber?: number;
    /** Only draw the first n systems, where n is the number specified. */
    drawUpToSystemNumber?: number;
    /** Only draw the first n pages, where n is the number specified. */
    drawUpToPageNumber?: number;
    /** Only draw measure n to m, where n is the number you specify. (for m, see drawUpToMeasureNumber) */
    drawFromMeasureNumber?: number;
    /** Whether to fill measures that don't have notes given in the XML with whole rests (visible = 1, invisible = 2, for layouting). Default No (0). */
    fillEmptyMeasuresWithWholeRest?: FillEmptyMeasuresWithWholeRests | number;
    /** Whether to set the wanted stem direction by xml (default) or automatically. */
    setWantedStemDirectionByXml?: boolean;
    /** Whether tuplets are labeled with ratio (e.g. 5:2 instead of 5 for quintuplets). Default false. */
    tupletsRatioed?: boolean;
    /** Whether all tuplets should be bracketed (e.g. |--5--| instead of 5). Default false.
     * If false, only tuplets given as bracketed in XML (bracket="yes") will be bracketed.
     */
    tupletsBracketed?: boolean;
    /** Whether all triplets should be bracketed. Overrides tupletsBracketed for triplets.
     * If false, only triplets given as bracketed in XML (bracket="yes") will be bracketed.
     * (Bracketing all triplets can be cluttering)
     */
    tripletsBracketed?: boolean;
    /** See OpenSheetMusicDisplay.PageFormatStandards for standard options like "A4 P" or "Endless".
     *  Default Endless.
     *  Uses OpenSheetMusicDisplay.StringToPageFormat().
     *  Unfortunately it would be error-prone to set a PageFormat type directly.
     */
    pageFormat?: string;
    /** A custom page/canvas background color. Default undefined/transparent.
     *  Example: "#FFFFFF" = white. "#12345600" = transparent.
     *  This can be useful when you want to export an image with e.g. white background color
     * instead of transparent, from a CanvasBackend.
     *  Note: Using a background color will prevent the cursor from being visible for now
     * (will be fixed at some point).
     */
    pageBackgroundColor?: string;
    /** This makes OSMD render on one single horizontal (staff-)line.
     * This option should be set before loading a score. It only starts working after load(),
     * calling setOptions() after load and then render() doesn't work in this case.
     */
    renderSingleHorizontalStaffline?: boolean;
    /** Whether to begin a new system ("line break") when given in XML ('new-system="yes"').
     *  Default false, because OSMD does its own layout that will do line breaks interactively
     *  at different measures. So this option may result in a system break after a single measure in a system.
     */
    newSystemFromXML?: boolean;
    /** Whether to begin a new system ("line break") when given a new page in XML ('new-page="yes"'), but newPageFromXML is false.
     *  Default false, because OSMD does its own layout that will do line breaks interactively
     *  at different measures. So this option may result in a system break after a single measure in a system.
     */
    newSystemFromNewPageInXML?: boolean;
    /** Whether to begin a new page ("page break") when given in XML ('new-page="yes"').
     *  Default false, because OSMD does its own layout that will do page breaks interactively
     * (when given a PageFormat) at different measures.
     * So this option may result in a page break after a single measure on a page.
     */
    newPageFromXML?: boolean;
    /** A custom function that is executed when the xml is read, modifies it, and returns a new xml string that OSMD then parses. */
    onXMLRead?(xml: string): string;
    /** The cutoff number for rendering percussion clef stafflines as a single line. Default is 4.
     *  This is number of instruments specified, e.g. a drumset:
     *     <score-part id="P1">
     *       <part-name>Drumset</part-name>
     *       <part-abbreviation>D. Set</part-abbreviation>
     *       <score-instrument id="P1-I36">
     *           <instrument-name>Acoustic Bass Drum</instrument-name>
     *           </score-instrument>
     *       <score-instrument id="P1-I37">
     *           <instrument-name>Bass Drum 1</instrument-name>
     *           </score-instrument>
     *       <score-instrument id="P1-I38">
     *           <instrument-name>Side Stick</instrument-name>
     *           </score-instrument>
     *       <score-instrument id="P1-I39">
     *           <instrument-name>Acoustic Snare</instrument-name>
     *           </score-instrument>
     *           ...
     *   Would still render as 5 stafflines by default, since we have 4 (or greater) instruments in this part.
     *   While a snare:
     *   <score-part id="P2">
     *   <part-name>Concert Snare Drum</part-name>
     *   <part-abbreviation>Con. Sn.</part-abbreviation>
     *   <score-instrument id="P2-I38">
     *       <instrument-name>Side Stick</instrument-name>
     *       </score-instrument>
     *   <score-instrument id="P2-I39">
     *       <instrument-name>Acoustic Snare</instrument-name>
     *       </score-instrument>
     *       ...
     *   Would render with 1 line on the staff, since we only have 2 voices.
     *   If this value is 0, the feature is turned off.
     *   If this value is -1, it will render all percussion clefs as a single line.
     */
    percussionOneLineCutoff?: number;
    /** This property is only active if the above property is active (percussionOneLineCutoff)
     *  This is the cutoff for forcing all voices to the single line, instead of rendering them at different
     *  positions above/below the line.
     *  The default is 3, so if a part has less than voices, all of them will be rendered on the line.
     *  This is for cases like a Concert snare, which has multiple 'instruments' available (snare, side stick)
     *  should still render only on the line since there is no ambiguity.
     *  If this value is 0, the feature is turned off.
     *  IF this value is -1, it will render all percussion clef voices on the single line.
     */
    percussionForceVoicesOneLineCutoff?: number;
    /** The softmaxFactor for Vexflow's formatter. Default is 5, default in Vexflow is 100 (voice.js).
     *  Lowering this factor makes the spacing between individual notes smaller (especially from one half note to the next).
     *  So, to get more compact scores, try lowering this value (or set osmd.zoom, which simply scales),
     *  or try 100 for a more expansive layout.
     *  Setting this is the same as setting osmd.EngravingRules.SoftmaxFactorVexFlow.
     */
    spacingFactorSoftmax?: number;
    /**
     * Number in pixels, of spacing between multi-line labels
     */
    spacingBetweenTextLines?: number;
    /**
     * Set to true if the last system line should be streched across the whole page just as the other systems. Default is false
     */
    stretchLastSystemLine?: boolean;
    /**
     * Set to true if subsequent measures full of rests should be auto-converted to multi-rest measure. Default is true
     * This works across instruments- If all instruments have subsequent measures with nothing but rests, multirest measures are generated
     */
    autoGenerateMultipleRestMeasuresFromRestMeasures?: boolean;
    /**
     * Defines multiple simultaneous cursors. If left undefined the standard cursor will be used.
     */
    cursorsOptions?: CursorOptions[];
    /**
     * Defines which skyline and bottom-line batch calculation algorithm to use.
     */
    preferredSkyBottomLineBatchCalculatorBackend?: SkyBottomLineBatchCalculatorBackendType;
    /**
     * Defines the minimum number of measures in the entire sheet music where the skyline and bottom-line batch calculation is enabled.
     */
    skyBottomLineBatchMinMeasures?: number;
}
declare enum AlignRestOption {
    Never = 0,// false should also work
    Always = 1,// true should also work
    Auto = 2
}
declare enum FillEmptyMeasuresWithWholeRests {
    No = 0,
    YesVisible = 1,
    YesInvisible = 2
}
declare enum BackendType {
    SVG = 0,
    Canvas = 1
}
declare enum SkyBottomLineBatchCalculatorBackendType {
    Plain = 0,
    WebGL = 1
}
/** Handles [[IOSMDOptions]], e.g. returning default options with OSMDOptionsStandard() */
declare class OSMDOptions {
    /** Returns the default options for OSMD.
     * These are e.g. used if no options are given in the [[OpenSheetMusicDisplay]] constructor.
     */
    static OSMDOptionsStandard(): IOSMDOptions;
    static BackendTypeFromString(value: string): BackendType;
}
interface AutoBeamOptions {
    /** Whether to extend beams over rests. Default false. */
    beam_rests?: boolean;
    /** Whether to extend beams only over rests that are in the middle of a potential beam. Default false. */
    beam_middle_rests_only?: boolean;
    /** Whether to maintain stem direction of autoBeamed notes. Discouraged, reduces beams. Default false. */
    maintain_stem_directions?: boolean;
    /** Groups of notes (fractions) to beam within a measure.
     * List of fractions, each fraction being [nominator, denominator].
     * E.g. [[3,4],[1,4]] will beam the first 3 quarters of a measure, then the last quarter.
     */
    groups?: [number[]];
}
interface CursorOptions {
    /**
     * Type of cursor:
     * 0: Standard highlighting current notes
     * 1: Thin line left to the current notes
     * 2: Short thin line on top of stave and left to the current notes
     * 3: Current measure
     * 4: Current measure to left of current notes
     */
    type: CursorType;
    /** Color to draw the cursor */
    color: string;
    /** alpha value to be used with color (0.0 transparent, 0.5 medium, 1.0 opaque). */
    alpha: number;
    /** If true, this cursor will be followed. */
    follow: boolean;
}

/** Rendering and Engraving options, more fine-grained than [[IOSMDOptions]].
 *  Not all of these options are meant to be modified by users of the library,
 *  full support is only given for [[IOSMDOptions]].
 *  Nevertheless, there are many useful options here,
 *  like Render* to (not) render certain elements (e.g. osmd.rules.RenderRehearsalMarks = false)
 */
declare class EngravingRules {
    /** A unit of distance. 1.0 is the distance between lines of a stave for OSMD, which is 10 pixels in Vexflow. */
    static unit: number;
    SamplingUnit: number;
    StaccatoShorteningFactor: number;
    /** Height (size) of the sheet title. */
    SheetTitleHeight: number;
    SheetSubtitleHeight: number;
    SheetMinimumDistanceBetweenTitleAndSubtitle: number;
    SheetComposerHeight: number;
    SheetAuthorHeight: number;
    SheetCopyrightHeight: number;
    SheetCopyrightMargin: number;
    /** Whether to use the (deprecated) OSMD < 1.8.6 way of parsing and displaying subtitles and composer,
     * which did not read multiple lines from XML credit-words tags.
     * Option will probably be removed soon.
     * @deprecated
     */
    SheetComposerSubtitleUseLegacyParsing: boolean;
    CompactMode: boolean;
    PagePlacementEnum: PagePlacementEnum;
    PageHeight: number;
    PageTopMargin: number;
    PageTopMarginNarrow: number;
    PageBottomMargin: number;
    PageLeftMargin: number;
    PageRightMargin: number;
    TitleTopDistance: number;
    TitleBottomDistance: number;
    SystemLeftMargin: number;
    SystemRightMargin: number;
    SystemLabelsRightMargin: number;
    SystemComposerDistance: number;
    SystemLyricistDistance: number;
    InstrumentLabelTextHeight: number;
    MinimumDistanceBetweenSystems: number;
    MinSkyBottomDistBetweenSystems: number;
    LastSystemMaxScalingFactor: number;
    StaffDistance: number;
    BetweenStaffDistance: number;
    StaffHeight: number;
    TabStaffInterlineHeight: number;
    TabStaffInterlineHeightForBboxes: number;
    BetweenStaffLinesDistance: number;
    /** Whether to automatically beam notes that don't already have beams in XML. */
    AutoBeamNotes: boolean;
    /** Options for autoBeaming like whether to beam over rests. See AutoBeamOptions interface. */
    AutoBeamOptions: AutoBeamOptions;
    /** Whether to automatically generate new beams for tabs. Also see TabBeamsRendered for existing XML beams. */
    AutoBeamTabs: boolean;
    BeamWidth: number;
    BeamSpaceWidth: number;
    BeamForwardLength: number;
    FlatBeams: boolean;
    FlatBeamOffset: number;
    FlatBeamOffsetPerBeam: number;
    ClefLeftMargin: number;
    ClefRightMargin: number;
    /** How many unique note positions a percussion score needs to have to not be rendered on one line.
     * To always use 5 lines for percussion, set this to 0. (works unless the XML says <staff-lines>1)
     */
    PercussionOneLineCutoff: number;
    PercussionForceVoicesOneLineCutoff: number;
    PercussionUseXMLDisplayStep: boolean;
    PercussionXMLDisplayStepNoteValueShift: number;
    PercussionOneLineXMLDisplayStepOctaveOffset: number;
    /** Makes the score position notes on the 2 cajon stafflines, and use 2 stafflines even if PercussionOneLineCutoff set.
     * Should only be set for cajon scores, as this will disable the PercussionOneLineCutoff.
     */
    PercussionUseCajon2NoteSystem: boolean;
    BetweenKeySymbolsDistance: number;
    KeyRightMargin: number;
    RhythmRightMargin: number;
    ShowRhythmAgainAfterPartEndOrFinalBarline: boolean;
    NewPartAndSystemAfterFinalBarline: boolean;
    InStaffClefScalingFactor: number;
    DistanceBetweenNaturalAndSymbolWhenCancelling: number;
    NoteHelperLinesOffset: number;
    MeasureLeftMargin: number;
    MeasureRightMargin: number;
    DistanceBetweenLastInstructionAndRepetitionBarline: number;
    ArpeggioDistance: number;
    IdealStemLength: number;
    StemNoteHeadBorderYOffset: number;
    StemWidth: number;
    StemMargin: number;
    StemMinLength: number;
    StemMaxLength: number;
    BeamSlopeMaxAngle: number;
    StemMinAllowedDistanceBetweenNoteHeadAndBeamLine: number;
    SetWantedStemDirectionByXml: boolean;
    GraceNoteScalingFactor: number;
    GraceNoteXOffset: number;
    /** Set this to e.g. -0.5 or -0.8 to put grace notes a lot closer to the main note. */
    GraceNoteGroupXMargin: number;
    WedgeOpeningLength: number;
    WedgeMeasureEndOpeningLength: number;
    WedgeMeasureBeginOpeningLength: number;
    WedgePlacementAboveY: number;
    WedgePlacementBelowY: number;
    WedgeHorizontalMargin: number;
    WedgeVerticalMargin: number;
    DistanceOffsetBetweenTwoHorizontallyCrossedWedges: number;
    WedgeMinLength: number;
    WedgeEndDistanceBetweenTimestampsFactor: number;
    /** Whether an accent should by default be placed above the note if its note stem is above. Default false (below).
     * Applies to accents (>/^), staccato (.), pizzicato (+), mainly (in our samples)
     * Note that this can be overwritten if the MusicXML says "placement='below'".
     */
    ArticulationAboveNoteForStemUp: boolean;
    SoftAccentWedgePadding: number;
    SoftAccentSizeFactor: number;
    DistanceBetweenAdjacentDynamics: number;
    TempoChangeMeasureValidity: number;
    TempoContinousFactor: number;
    StaccatoScalingFactor: number;
    BetweenDotsDistance: number;
    OrnamentAccidentalScalingFactor: number;
    ChordSymbolTextHeight: number;
    ChordSymbolTextAlignmentTop: TextAlignmentEnum;
    ChordSymbolTextAlignmentBottom: TextAlignmentEnum;
    ChordSymbolBottomMargin: number;
    ChordSymbolRelativeXOffset: number;
    /** Additional x-shift for short chord symbols (e.g. C, but not Eb/7), to appear more centered. */
    ChordSymbolExtraXShiftForShortChordSymbols: number;
    /** Threshold width below which to apply ChordSymbolExtraXShiftForShortChordSymbols. */
    ChordSymbolExtraXShiftWidthThreshold: number;
    ChordSymbolXSpacing: number;
    ChordOverlapAllowedIntoNextMeasure: number;
    ChordSymbolYOffset: number;
    ChordSymbolYPadding: number;
    ChordSymbolYAlignment: boolean;
    ChordSymbolYAlignmentScope: string;
    /** Offset to start of measure (barline) when chord symbol is on whole measure rest.
     * An offset of 0 would place the chord symbol directly above the barline, so the default is ~1.2.
     */
    ChordSymbolWholeMeasureRestXOffset: number;
    ChordSymbolWholeMeasureRestXOffsetMeasure1: number;
    ChordSymbolLabelTexts: Dictionary<ChordSymbolEnum, string>;
    ChordAccidentalTexts: Dictionary<AccidentalEnum, string>;
    CustomChords: CustomChord[];
    /** Not always a symbol, can also be text (RepetitionInstruction). Keeping the name for backwards compatibility. */
    RepetitionSymbolsYOffset: number;
    /** Adds a percent of the stave's width (e.g. 0.4 = 40%) to the x position of end instructions like Fine or D.C. al fine */
    RepetitionEndInstructionXShiftAsPercentOfStaveWidth: number;
    RehearsalMarkXOffset: number;
    RehearsalMarkXOffsetDefault: number;
    RehearsalMarkXOffsetSystemStartMeasure: number;
    RehearsalMarkYOffset: number;
    RehearsalMarkYOffsetDefault: number;
    /** y offset added to avoid collisions of rehearsal marks (e.g. "A" or "Verse") with multiple measure rest numbers. */
    RehearsalMarkYOffsetAddedForRehearsalMarks: number;
    RehearsalMarkFontSize: number;
    MeasureNumberLabelHeight: number;
    MeasureNumberLabelOffset: number;
    MeasureNumberLabelXOffset: number;
    /** Whether tuplets should display ratio (3:2 instead of 3 for triplet). Default false. */
    TupletsRatioed: boolean;
    /** Whether to show a ratio when the XML says "show-number: both". Otherwise uses the default TupletsRatioed. */
    TupletsRatioedUseXMLValue: boolean;
    /** Whether tuplets (except triplets) should be bracketed (e.g. |--5--| instead of 5). Default false.
     * Note that this doesn't affect triplets (|--3--|), which have their own setting TripletsBracketed.
     * If false, only tuplets given as bracketed in XML (bracket="yes") will be bracketed.
     * (If not given in XML, bracketing is implementation-dependent according to standard)
     */
    TupletsBracketed: boolean;
    /** Whether all triplets should be bracketed. Overrides tupletsBracketed for triplets.
     * If false, only triplets given as bracketed in XML (bracket="yes") will be bracketed.
     * (Bracketing all triplets can be cluttering)
     */
    TripletsBracketed: boolean;
    /** Whether to bracket like the XML says when 'bracket="no"' or "yes" is given.
     * Otherwise, OSMD decides bracket usage.
     * Note that sometimes the XML doesn't have any 'bracket' value. */
    TupletsBracketedUseXMLValue: boolean;
    TupletNumberLabelHeight: number;
    TupletNumberYOffset: number;
    TupletNumberLimitConsecutiveRepetitions: boolean;
    TupletNumberMaxConsecutiveRepetitions: number;
    TupletNumberAlwaysDisableAfterFirstMax: boolean;
    /** Whether to use the <tuplet show-number="value"> value or to ignore it. */
    TupletNumberUseShowNoneXMLValue: boolean;
    LabelMarginBorderFactor: number;
    TupletVerticalLineLength: number;
    /** Whether to show tuplet numbers (and brackets) in tabs. Brackets can be disabled via TabTupletsBracketed. */
    TupletNumbersInTabs: boolean;
    /** Whether to show brackets in tab tuplets. To not render tab tuplets entirely, set TupletNumbersInTabs = false. */
    TabTupletsBracketed: boolean;
    TabTupletYOffsetBottom: number;
    /** Additional offset applied to top tuplets (added to TabTupletYOffset).
     * You could apply a negative offset if the piece doesn't have effects like bends,
     * which often take some vertical space.
     */
    TabTupletYOffsetTop: number;
    TabTupletYOffsetEffects: number;
    TabBeamsRendered: boolean;
    TabKeySignatureRendered: boolean;
    /** Whether space should be reserved as if there was a key signature.
     * False basically only works for tab-only scores, as it prevents vertical x-alignment with other staves.
     * False is more compact for tab-only scores.
     */
    TabKeySignatureSpacingAdded: boolean;
    TabTimeSignatureRendered: boolean;
    /** Whether space should be reserved as if there was a key signature.
     * False basically only works for tab-only scores, as it prevents vertical x-alignment with other staves.
     * False is more compact for tab-only scores.
     */
    TabTimeSignatureSpacingAdded: boolean;
    TabFingeringsRendered: boolean;
    /** Use an X in tabs when the note has an X notehead, e.g. in the staff above in the classical notes, instead of the fret number */
    TabUseXNoteheadShapeForTabNote: boolean;
    TabUseXNoteheadAlternativeGlyph: boolean;
    TabXNoteheadScale: number;
    RepetitionAllowFirstMeasureBeginningRepeatBarline: boolean;
    RepetitionEndingLabelHeight: number;
    RepetitionEndingLabelXOffset: number;
    RepetitionEndingLabelYOffset: number;
    RepetitionEndingLineYLowerOffset: number;
    RepetitionEndingLineYUpperOffset: number;
    VoltaOffset: number;
    /** Default alignment of lyrics.
     * Left alignments will extend text to the right of the bounding box,
     * which facilitates spacing by extending measure width.
     */
    LyricsAlignmentStandard: TextAlignmentEnum;
    LyricsHeight: number;
    LyricsYOffsetToStaffHeight: number;
    LyricsYMarginToBottomLine: number;
    /** Extra x-shift (to the right) for short lyrics to be better vertically aligned.
     * Also see ChordSymbolExtraXShiftForShortChordSymbols, same principle, same default value.
     */
    LyricsExtraXShiftForShortLyrics: number;
    /** Threshold of the lyric entry's width below which the x-shift is applied. Default 1.4. */
    LyricsExtraXShiftForShortLyricsWidthThreshold: number;
    /** Whether to enable x padding (to the right) for notes with long lyrics, see LyricsXPaddingFactorForLongLyrics for the degree.
     * This helps avoid overlaps and shorten measures, because otherwise the whole measure needs to be stretched to avoid overlaps,
     * see MaximumLyricsElongationFactor */
    LyricsUseXPaddingForLongLyrics: boolean;
    /** How much spacing/padding should be added after notes with long lyrics on short notes
     * (>4 characters on <8th note),
     * so that the measure doesn't need to be elongated too much to avoid lyrics collisions.
     * Default 1 = 10 pixels */
    LyricsXPaddingFactorForLongLyrics: number;
    /** How wide a text needs to be to trigger lyrics padding for short notes.
     * This is visual width, not number of characters, as e.g. 'zzz' is wider than 'iii'.
     * Default 3.3.
     */
    LyricsXPaddingWidthThreshold: number;
    /** Long notes need less padding than short ones, by default we use 0.7 less padding. */
    LyricsXPaddingReductionForLongNotes: number;
    /** Last note in measure needs less padding because of measure bar and bar start/end padding. */
    LyricsXPaddingReductionForLastNoteInMeasure: number;
    LyricsXPaddingForLastNoteInMeasure: boolean;
    VerticalBetweenLyricsDistance: number;
    HorizontalBetweenLyricsDistance: number;
    BetweenSyllableMaximumDistance: number;
    BetweenSyllableMinimumDistance: number;
    LyricOverlapAllowedIntoNextMeasure: number;
    MinimumDistanceBetweenDashes: number;
    MaximumLyricsElongationFactor: number;
    SlurPlacementFromXML: boolean;
    SlurPlacementAtStems: boolean;
    SlurPlacementUseSkyBottomLine: boolean;
    BezierCurveStepSize: number;
    TPower3: number[];
    OneMinusTPower3: number[];
    FactorOne: number[];
    FactorTwo: number[];
    TieGhostObjectWidth: number;
    TieYPositionOffsetFactor: number;
    MinimumNeededXspaceForTieGhostObject: number;
    TieHeightMinimum: number;
    TieHeightMaximum: number;
    TieHeightInterpolationK: number;
    TieHeightInterpolationD: number;
    SlurNoteHeadYOffset: number;
    SlurEndArticulationYOffset: number;
    SlurStartArticulationYOffsetOfArticulation: number;
    SlurStemXOffset: number;
    SlurSlopeMaxAngle: number;
    SlurTangentMinAngle: number;
    SlurTangentMaxAngle: number;
    SlurHeightFactor: number;
    SlurHeightFlattenLongSlursFactorByWidth: number;
    SlurHeightFlattenLongSlursFactorByAngle: number;
    SlurHeightFlattenLongSlursCutoffAngle: number;
    SlurHeightFlattenLongSlursCutoffWidth: number;
    SlursStartingAtSameStaffEntryYOffset: number;
    SlurMaximumYControlPointDistance: number;
    GlissandoNoteOffset: number;
    GlissandoStafflineStartMinimumWidth: number;
    GlissandoStafflineStartYDistanceToNote: number;
    GlissandoStafflineEndOffset: number;
    GlissandoDefaultWidth: number;
    TempoYSpacing: number;
    InstantaneousTempoTextHeight: number;
    ContinuousDynamicTextHeight: number;
    /** Whether to use the XML offset value for expressions, especially wedges (crescendo). See #1477 */
    UseEndOffsetForExpressions: boolean;
    MoodTextHeight: number;
    UnknownTextHeight: number;
    ContinuousTempoTextHeight: number;
    VexFlowDefaultNotationFontScale: number;
    VexFlowDefaultTabFontScale: number;
    TremoloStrokeScale: number;
    TremoloYSpacingScale: number;
    TremoloBuzzRollThickness: number;
    StaffLineWidth: number;
    StaffLineColor: string;
    LedgerLineWidth: number;
    LedgerLineStrokeStyle: string;
    LedgerLineColorDefault: string;
    WedgeLineWidth: number;
    TupletLineWidth: number;
    LyricUnderscoreLineWidth: number;
    SystemThinLineWidth: number;
    SystemBoldLineWidth: number;
    SystemRepetitionEndingLineWidth: number;
    SystemDotWidth: number;
    MultipleRestMeasureDefaultWidth: number;
    MultipleRestMeasureAddKeySignature: boolean;
    /** Use the same measure width for all measures (experimental).
     *  Note that this will use the largest width of all measures,
     *  as Vexflow will mess up the layout with overlays if using less than minimum width.
     *  See formatter.preCalculateMinTotalWidth()
     */
    FixedMeasureWidth: boolean;
    /** Use a fixed width for all measures (experimental).
     *  This is mostly for debugging or for when you already know how big the measures
     *  in the target score are, because using a too low width will cause overlaps in Vexflow.
     */
    FixedMeasureWidthFixedValue: number;
    FixedMeasureWidthUseForPickupMeasures: boolean;
    DistanceBetweenVerticalSystemLines: number;
    DistanceBetweenDotAndLine: number;
    RepeatEndStartPadding: number;
    OctaveShiftLineWidth: number;
    OctaveShiftVerticalLineLength: number;
    OctaveShiftOnWholeMeasureNoteUntilEndOfMeasure: boolean;
    GraceLineWidth: number;
    MinimumStaffLineDistance: number;
    MinSkyBottomDistBetweenStaves: number;
    MinimumCrossedBeamDifferenceMargin: number;
    /** Maximum width of sheet / HTMLElement containing the score. Canvas is limited to 32767 in current browsers, though SVG isn't.
     *  Setting this to > 32767 will break the canvas backend (no problem if you only use SVG).
     */
    SheetMaximumWidth: number;
    VoiceSpacingMultiplierVexflow: number;
    VoiceSpacingAddendVexflow: number;
    PickupMeasureWidthMultiplier: number;
    /** The spacing between a repetition that is followed by an implicit/pickup/incomplete measure.
     *  (E.g. in a 4/4 time signature, a measure that repeats after the 3rd beat, continuing with a pickup measure)
     */
    PickupMeasureRepetitionSpacing: number;
    /** Multiplier for PickupMeasureRepetitionSpacing if there is only one note in the pickup measure. This usually needs a lot more space. */
    PickupMeasureSpacingSingleNoteAddend: number;
    DisplacedNoteMargin: number;
    MinNoteDistance: number;
    SubMeasureXSpacingThreshold: number;
    MeasureDynamicsMaxScalingFactor: number;
    WholeRestXShiftVexflow: number;
    MetronomeMarksDrawn: boolean;
    MetronomeMarkXShift: number;
    MetronomeMarkYShift: number;
    SoftmaxFactorVexFlow: number;
    /** Stagger (x-shift) whole notes that are the same note, but in different voices (show 2 instead of 1). */
    StaggerSameWholeNotes: boolean;
    MaxInstructionsConstValue: number;
    NoteDistances: number[];
    NoteDistancesScalingFactors: number[];
    DurationDistanceDict: {
        [_: number]: number;
    };
    DurationScalingDistanceDict: {
        [_: number]: number;
    };
    /** Whether to align rests. 0 = Never, 1 = Always, 2 = Auto.
     * Currently not recommended because rests are now positioned to avoid collisions with notes. */
    AlignRests: AlignRestOption;
    RestCollisionYPadding: number;
    FillEmptyMeasuresWithWholeRest: FillEmptyMeasuresWithWholeRests | number;
    ArpeggiosGoAcrossVoices: boolean;
    RenderArpeggios: boolean;
    RenderSlurs: boolean;
    RenderGlissandi: boolean;
    ColoringMode: ColoringModes;
    ColoringEnabled: boolean;
    ColorStemsLikeNoteheads: boolean;
    ColorFlags: boolean;
    ColorBeams: boolean;
    ColoringSetCurrent: Dictionary<NoteEnum | number, string>;
    /** Default color for all musical elements including key signature etc. Default undefined. */
    DefaultColorMusic: string;
    DefaultColorNotehead: string;
    DefaultColorRest: string;
    DefaultColorStem: string;
    DefaultColorLabel: string;
    DefaultColorLyrics: string;
    DefaultColorChordSymbol: string;
    DefaultColorTitle: string;
    DefaultColorCursor: string;
    DefaultFontFamily: string;
    DefaultFontStyle: FontStyles;
    DefaultVexFlowNoteFont: string;
    MaxMeasureToDrawIndex: number;
    /** The setting given in osmd.setOptions(), which may lead to a different index if there's a pickup measure. */
    MaxMeasureToDrawNumber: number;
    MinMeasureToDrawIndex: number;
    /** The setting given in osmd.setOptions(), which may lead to a different index if there's a pickup measure.
     * If there's a pickup measure (measure 0), and we want to draw from measure number 2,
     *   we need to skip measure index 0 (the pickup measure).
     */
    MinMeasureToDrawNumber: number;
    MaxPageToDrawNumber: number;
    MaxSystemToDrawNumber: number;
    /** Whether to render a label for the composer of the piece at the top of the sheet. */
    RenderComposer: boolean;
    RenderTitle: boolean;
    RenderSubtitle: boolean;
    RenderLyricist: boolean;
    RenderCopyright: boolean;
    RenderPartNames: boolean;
    RenderPartAbbreviations: boolean;
    /** Whether two render system labels on page 2+. This doesn't affect the default endless PageFormat. */
    RenderSystemLabelsAfterFirstPage: boolean;
    RenderFingerings: boolean;
    RenderMeasureNumbers: boolean;
    RenderMeasureNumbersOnlyAtSystemStart: boolean;
    UseXMLMeasureNumbers: boolean;
    RenderLyrics: boolean;
    RenderChordSymbols: boolean;
    RenderMultipleRestMeasures: boolean;
    AutoGenerateMultipleRestMeasuresFromRestMeasures: boolean;
    RenderRehearsalMarks: boolean;
    RenderClefsAtBeginningOfStaffline: boolean;
    RenderKeySignatures: boolean;
    RenderTimeSignatures: boolean;
    RenderFirstTempoExpression: boolean;
    RenderPedals: boolean;
    DynamicExpressionMaxDistance: number;
    DynamicExpressionSpacer: number;
    IgnoreRepeatedDynamics: boolean;
    ExpressionsUseXMLColor: boolean;
    ArticulationPlacementFromXML: boolean;
    /** Percent distance of breath marks to next note or end of staff, e.g. 0.8 = 80%. */
    BreathMarkDistance: number;
    /** Where to draw fingerings (Above, Below, AboveOrBelow, Left, Right, or Auto).
     * Default AboveOrBelow. Auto experimental. */
    FingeringPosition: PlacementEnum;
    FingeringPositionFromXML: boolean;
    FingeringPositionGrace: PlacementEnum;
    FingeringInsideStafflines: boolean;
    FingeringLabelFontHeight: number;
    FingeringOffsetX: number;
    FingeringOffsetY: number;
    FingeringPaddingY: number;
    FingeringTextSize: number;
    /** Whether to render string numbers in classical scores, i.e. not the string numbers in tabs, but e.g. for violin. */
    RenderStringNumbersClassical: boolean;
    /** This is not for tabs, but for classical scores, especially violin. */
    StringNumberOffsetY: number;
    NewSystemAtXMLNewSystemAttribute: boolean;
    /** Whether to begin a new system when a page break is given in XML ('new-page="yes"'), but newPageFromXML is false.
     *  Default false, because it can lead to nonsensical system breaks after a single measure,
     *  as OSMD does a different layout than the original music program exported from.
     * */
    NewSystemAtXMLNewPageAttribute: boolean;
    NewPageAtXMLNewPageAttribute: boolean;
    /** Force OSMD to render only x measures per line/system, creating line breaks / system breaks. Disabled if set to 0. */
    RenderXMeasuresPerLineAkaSystem: number;
    PageFormat: PageFormat;
    PageBackgroundColor: string;
    /** Whether dark mode is enabled. This is read-only, to set this, please use osmd.setOptions({darkMode: true}). */
    DarkModeEnabled: boolean;
    UsePageBackgroundColorForTabNotes: boolean;
    RenderSingleHorizontalStaffline: boolean;
    RestoreCursorAfterRerender: boolean;
    StretchLastSystemLine: boolean;
    /** Ignore brackets - e.g. `( )` - that were supposed to be around a note,
     * but were inserted as a words element in the MusicXML, which can't be matched to the note anymore,
     * and would otherwise just be placed somewhere else. See OSMD Issue 1251. */
    IgnoreBracketsWords: boolean;
    PlaceWordsInsideStafflineFromXml: boolean;
    PlaceWordsInsideStafflineYOffset: number;
    SpacingBetweenTextLines: number;
    NoteToGraphicalNoteMap: Dictionary<number, GraphicalNote>;
    NoteToGraphicalNoteMapObjectCount: number;
    /** How many times osmd.render() was already called on the currently loaded score.
     * Resets after osmd.load() (via osmd.reset()).
     * Can be relevant for transposition or generally informative.
     */
    RenderCount: number;
    /** The skyline and bottom-line batch calculation algorithm to use.
     *  Note that this can be overridden if AlwaysSetPreferredSkyBottomLineBackendAutomatically is true (which is the default).
     */
    PreferredSkyBottomLineBatchCalculatorBackend: SkyBottomLineBatchCalculatorBackendType;
    /** Whether to consider using WebGL in Firefox in EngravingRules.setPreferredSkyBottomLineBackendAutomatically() */
    DisableWebGLInFirefox: boolean;
    /** Whether to consider using WebGL in Safari/iOS in EngravingRules.setPreferredSkyBottomLineBackendAutomatically() */
    DisableWebGLInSafariAndIOS: boolean;
    /** The minimum number of measures in the sheet where the skyline and bottom-line batch calculation is enabled.
     *  Batch is faster for medium to large size scores, but slower for very short scores.
     */
    SkyBottomLineBatchMinMeasures: number;
    /** The minimum number of measures in the sheet where WebGL will be used. WebGL is slower for short scores, but much faster for large ones.
     * Note that WebGL is currently never used in Safari and Firefox, because it's always slower there.
     */
    SkyBottomLineWebGLMinMeasures: number;
    /** Whether to always set preferred backend (WebGL or Plain) automatically, depending on browser and number of measures. */
    AlwaysSetPreferredSkyBottomLineBackendAutomatically: boolean;
    constructor();
    loadDefaultValues(): void;
    setPreferredSkyBottomLineBackendAutomatically(numberOfGraphicalMeasures?: number): void;
    /** Makes it so that all musical elements (including key/time signature)
     *  are colored with the given color by default,
     *  unless an element has a different color set (e.g. VoiceEntry.StemColor).
     */
    applyDefaultColorMusic(color: string): void;
    addGraphicalNoteToNoteMap(note: Note, graphicalNote: GraphicalNote): void;
    /** Returns the GraphicalNote corresponding to (its) note. Also used by Cursor.GNotesUnderCursor().
     *  We don't want to save a GraphicalNote reference in Note, see Note.NoteToGraphicalNoteObjectId.
     */
    GNote(note: Note): GraphicalNote;
    /** This should be done before a new sheet is loaded, not each re-render (otherwise the map would end empty). */
    clearMusicSheetObjects(): void;
    resetChordAccidentalTexts(chordAccidentalTexts: Dictionary<AccidentalEnum, string>, useChordAccidentalsUnicode: boolean): void;
    setChordSymbolLabelText(key: ChordSymbolEnum, value: string): void;
    resetChordSymbolLabelTexts(chordtexts: Dictionary<ChordSymbolEnum, string>): Dictionary<ChordSymbolEnum, string>;
    addChordName(altName: string, chordKindText: string, adds: string[], alts: string[], subs: string[]): void;
    renameChord(altName: string, newAltName: string): void;
    resetChordNames(): void;
    /**
     * This method maps NoteDurations to Distances and DistancesScalingFactors.
     */
    /**
     * Calculate Curve-independend factors, to be used later in the Slur- and TieCurvePoints calculation
     */
    private calculateCurveParametersArrays;
}
declare class PageFormat {
    constructor(width: number, height: number, idString?: string);
    width: number;
    height: number;
    idString: string;
    get aspectRatio(): number;
    /** Undefined page format: use default page format. */
    get IsUndefined(): boolean;
    static get UndefinedPageFormat(): PageFormat;
    Equals(otherPageFormat: PageFormat): boolean;
}

declare class ChordSymbolContainer {
    private rootPitch;
    private chordKind;
    NumeralText: string;
    private bassPitch;
    private degrees;
    private rules;
    Placement: PlacementEnum;
    constructor(rootPitch: Pitch, chordKind: ChordSymbolEnum, bassPitch: Pitch, chordDegrees: Degree[], rules: EngravingRules, placement?: PlacementEnum);
    get RootPitch(): Pitch;
    get ChordKind(): ChordSymbolEnum;
    get BassPitch(): Pitch;
    get ChordDegrees(): Degree[];
    static calculateChordText(chordSymbol: ChordSymbolContainer, transposeHalftones: number, keyInstruction: KeyInstruction): string;
    private getTextForAccidental;
    private getTextFromChordKindEnum;
}
declare class Degree {
    constructor(value: number, alteration: AccidentalEnum, text: ChordDegreeText);
    value: number;
    alteration: AccidentalEnum;
    text: ChordDegreeText;
}
interface DegreesInfo {
    adds?: string[];
    alts?: string[];
    subs?: string[];
}
declare class CustomChord {
    alternateName: string;
    chordKind: ChordSymbolEnum;
    degrees: DegreesInfo;
    constructor(alternateName: string, chordKind: ChordSymbolEnum, degrees: DegreesInfo);
    static createCustomChord(altName: string, chordKind: ChordSymbolEnum, degrees: DegreesInfo): CustomChord;
    static renameCustomChord(altName: string, newAltName: string, customChords: CustomChord[]): void;
}
declare enum ChordDegreeText {
    add = 0,
    alter = 1,
    subtract = 2
}
declare enum ChordSymbolEnum {
    major = 0,
    minor = 1,
    augmented = 2,
    diminished = 3,
    dominant = 4,
    majorseventh = 5,
    minorseventh = 6,
    diminishedseventh = 7,
    augmentedseventh = 8,
    halfdiminished = 9,
    majorminor = 10,
    majorsixth = 11,
    minorsixth = 12,
    dominantninth = 13,
    majorninth = 14,
    minorninth = 15,
    dominant11th = 16,
    major11th = 17,
    minor11th = 18,
    dominant13th = 19,
    major13th = 20,
    minor13th = 21,
    suspendedsecond = 22,
    suspendedfourth = 23,
    Neapolitan = 24,
    Italian = 25,
    French = 26,
    German = 27,
    pedal = 28,
    power = 29,
    Tristan = 30,
    none = 31
}

/**
 * A [[SourceStaffEntry]] is a container spanning all the [[VoiceEntry]]s at one timestamp for one [[StaffLine]].
 */
declare class SourceStaffEntry {
    constructor(verticalContainerParent: VerticalSourceStaffEntryContainer, parentStaff: Staff);
    private parentStaff;
    private verticalContainerParent;
    private voiceEntries;
    private staffEntryLink;
    private instructions;
    private chordSymbolContainers;
    get ParentStaff(): Staff;
    get VerticalContainerParent(): VerticalSourceStaffEntryContainer;
    get Timestamp(): Fraction;
    get AbsoluteTimestamp(): Fraction;
    get VoiceEntries(): VoiceEntry[];
    set VoiceEntries(value: VoiceEntry[]);
    get Link(): StaffEntryLink;
    set Link(value: StaffEntryLink);
    get Instructions(): AbstractNotationInstruction[];
    set Instructions(value: AbstractNotationInstruction[]);
    get ChordContainers(): ChordSymbolContainer[];
    set ChordContainers(value: ChordSymbolContainer[]);
    removeAllInstructionsOfTypeClefInstruction(): number;
    /**
     * Similar to RemoveAllInstructionsOfType but faster,
     * because it stops searching when the first instruction of the given type is found.
     * @returns {boolean}
     */
    removeFirstInstructionOfTypeClefInstruction(): boolean;
    removeAllInstructionsOfTypeKeyInstruction(): number;
    /**
     * Similar to RemoveAllInstructionsOfType but faster,
     * because it stops searching when the first instruction of the given type is found.
     * @returns {boolean}
     */
    removeFirstInstructionOfTypeKeyInstruction(): boolean;
    removeAllInstructionsOfTypeRhythmInstruction(): number;
    removeFirstInstructionOfTypeRhythmInstruction(): boolean;
    /**
     * Calculate the [[SourceStaffEntry]]'s minimum NoteLength.
     * @returns {Fraction}
     */
    calculateMinNoteLength(): Fraction;
    calculateMaxNoteLength(untilEndOfTie?: boolean): Fraction;
    hasNotes(): boolean;
    hasTie(): boolean;
    findLinkedNotes(linkedNotes: Note[]): void;
    get hasOnlyRests(): boolean;
}

/**
 * A [[VerticalSourceStaffEntryContainer]] contains the [[StaffEntry]]s at one timestamp through all the [[StaffLine]]s.
 */
declare class VerticalSourceStaffEntryContainer {
    constructor(parentMeasure: SourceMeasure, timestamp: Fraction, size: number);
    private timestamp;
    private staffEntries;
    private comments;
    private parentMeasure;
    $get$(index: number): SourceStaffEntry;
    $set$(index: number, value: SourceStaffEntry): void;
    get Timestamp(): Fraction;
    set Timestamp(value: Fraction);
    get StaffEntries(): SourceStaffEntry[];
    set StaffEntries(value: SourceStaffEntry[]);
    get Comments(): Comment[];
    set Comments(value: Comment[]);
    get ParentMeasure(): SourceMeasure;
    set ParentMeasure(value: SourceMeasure);
    getAbsoluteTimestamp(): Fraction;
}

declare class RehearsalExpression extends AbstractExpression {
    constructor(label: string, placement: PlacementEnum);
    label: string;
}

/**
 * The Source Measure represents the source data of a unique measure, including all instruments with their staves.
 * There exists one source measure per XML measure or per paper sheet measure (e.g. the source measures are not doubled in repetitions)
 */
declare class SourceMeasure {
    /**
     * The data entries and data lists will be filled with null values according to the total number of staves,
     * so that existing objects can be referred to by staff index.
     * @param completeNumberOfStaves
     * @param rules
     */
    constructor(completeNumberOfStaves: number, rules: EngravingRules);
    /**
     * The unique measure list index starting with 0.
     */
    measureListIndex: number;
    /**
     * The style of the ending bar line.
     */
    endingBarStyleXml: string;
    endingBarStyleEnum: SystemLinesEnum;
    /** Whether the MusicXML says to print a new system (line break). See OSMDOptions.newSystemFromXML */
    printNewSystemXml: boolean;
    /** Whether the MusicXML says to print a new page (page break). See OSMDOptions.newPageFromXML */
    printNewPageXml: boolean;
    IsSystemStartMeasure: boolean;
    /** The graphical measure width will be multiplied by this factor.
     * E.g. factor 0.6 = 60% will make the measure only 60% as long as before.
     * Note that this potentially causes issues by counteracting systems like lyrics overlap prevention,
     * and if you give Vexflow too little width to render it will eventually cause other layout issues too.
     * This factor is also read by a custom XML attribute osmdWidthFactor in the measure node,
     *   e.g. <measure number="1" osmdWidthFactor="0.6">
     * This will either be multiplicative with a sheet-wide widthFactor or override it, depending on settings.
     *   (TODO sheet-wide widthFactor not yet implemented)
     */
    WidthFactor: number;
    private measureNumber;
    MeasureNumberXML: number;
    MeasureNumberPrinted: number;
    RhythmPrinted: RhythmInstruction;
    multipleRestMeasures: number;
    private absoluteTimestamp;
    private completeNumberOfStaves;
    private duration;
    private activeTimeSignature;
    hasLyrics: boolean;
    hasMoodExpressions: boolean;
    /** Whether the SourceMeasure only has rests, no other entries.
     *  Not the same as GraphicalMeasure.hasOnlyRests, because one SourceMeasure can have many GraphicalMeasures (staffs).
     */
    allRests: boolean;
    isReducedToMultiRest: boolean;
    /** If this measure is a MultipleRestMeasure, this is the number of the measure in that sequence of measures. */
    multipleRestMeasureNumber: number;
    private staffLinkedExpressions;
    private tempoExpressions;
    rehearsalExpression: RehearsalExpression;
    private verticalSourceStaffEntryContainers;
    private implicitMeasure;
    private hasEndLine;
    hasEndClef: boolean;
    private graphicalMeasureErrors;
    private firstInstructionsStaffEntries;
    private lastInstructionsStaffEntries;
    private firstRepetitionInstructions;
    private lastRepetitionInstructions;
    private rules;
    private tempoInBPM;
    private verticalMeasureList;
    get MeasureNumber(): number;
    set MeasureNumber(value: number);
    getPrintedMeasureNumber(): number;
    get AbsoluteTimestamp(): Fraction;
    set AbsoluteTimestamp(value: Fraction);
    get CompleteNumberOfStaves(): number;
    get Duration(): Fraction;
    set Duration(value: Fraction);
    get ActiveTimeSignature(): Fraction;
    set ActiveTimeSignature(value: Fraction);
    get ImplicitMeasure(): boolean;
    set ImplicitMeasure(value: boolean);
    get HasEndLine(): boolean;
    set HasEndLine(value: boolean);
    get StaffLinkedExpressions(): MultiExpression[][];
    get TempoExpressions(): MultiTempoExpression[];
    get VerticalSourceStaffEntryContainers(): VerticalSourceStaffEntryContainer[];
    get FirstInstructionsStaffEntries(): SourceStaffEntry[];
    get LastInstructionsStaffEntries(): SourceStaffEntry[];
    get FirstRepetitionInstructions(): RepetitionInstruction[];
    get LastRepetitionInstructions(): RepetitionInstruction[];
    getErrorInMeasure(staffIndex: number): boolean;
    setErrorInGraphicalMeasure(staffIndex: number, hasError: boolean): void;
    getNextMeasure(measures: SourceMeasure[]): SourceMeasure;
    getPreviousMeasure(measures: SourceMeasure[]): SourceMeasure;
    get Rules(): EngravingRules;
    get VerticalMeasureList(): GraphicalMeasure[];
    set VerticalMeasureList(value: GraphicalMeasure[]);
    get TempoInBPM(): number;
    set TempoInBPM(value: number);
    /**
     * Check at the given timestamp if a VerticalContainer exists, if not creates a new, timestamp-ordered one,
     * and at the given index, if a [[SourceStaffEntry]] exists, and if not, creates a new one.
     * @param inMeasureTimestamp
     * @param inSourceMeasureStaffIndex
     * @param staff
     * @returns {{createdNewContainer: boolean, staffEntry: SourceStaffEntry}}
     */
    findOrCreateStaffEntry(inMeasureTimestamp: Fraction, inSourceMeasureStaffIndex: number, staff: Staff): {
        createdNewContainer: boolean;
        staffEntry: SourceStaffEntry;
    };
    /**
     * Check if a VerticalContainer, a staffEntry and a voiceEntry exist at the given timestamp.
     * If not, create the necessary entries.
     * @param sse
     * @param voice
     * @returns {{createdVoiceEntry: boolean, voiceEntry: VoiceEntry}}
     */
    findOrCreateVoiceEntry(sse: SourceStaffEntry, voice: Voice): {
        createdVoiceEntry: boolean;
        voiceEntry: VoiceEntry;
    };
    /**
     * Search for a non-null [[SourceStaffEntry]] at the given verticalIndex,
     * starting from the given horizontalIndex and moving backwards. If none is found, then return undefined.
     * @param verticalIndex
     * @param horizontalIndex
     * @returns {any}
     */
    getPreviousSourceStaffEntryFromIndex(verticalIndex: number, horizontalIndex: number): SourceStaffEntry;
    /**
     * Return the index of the existing VerticalContainer at the given timestamp.
     * @param musicTimestamp
     * @returns {number}
     */
    getVerticalContainerIndexByTimestamp(musicTimestamp: Fraction): number;
    /**
     * Return the existing VerticalContainer at the given timestamp.
     * @param musicTimestamp
     * @returns {any}
     */
    getVerticalContainerByTimestamp(musicTimestamp: Fraction): VerticalSourceStaffEntryContainer;
    /**
     * Check the [[SourceMeasure]] for a possible VerticalContainer with all of its [[StaffEntry]]s undefined,
     * and if found, remove the VerticalContainer from the [[SourceMeasure]].
     * @param index
     */
    checkForEmptyVerticalContainer(index: number): void;
    /**
     * This method is used for handling a measure with the following error (in the procedure of finding out the Instrument's Duration):
     * If the LastStaffEntry is missing (implied restNote or error), then go back the StaffEntries until you find a TiedNote (tie Start),
     * which gives the correct MeasureDuration.
     * @param musicSheet
     * @param maxInstDuration
     * @returns {Fraction}
     */
    reverseCheck(musicSheet: MusicSheet, maxInstDuration: Fraction): Fraction;
    /**
     * Calculate all the [[Instrument]]'s NotesDurations for this Measures.
     * @param musicSheet
     * @param instrumentMaxTieNoteFractions
     * @returns {Fraction[]}
     */
    calculateInstrumentsDuration(musicSheet: MusicSheet, instrumentMaxTieNoteFractions: Fraction[]): Fraction[];
    getEntriesPerStaff(staffIndex: number): SourceStaffEntry[];
    /**
     *
     * @returns {boolean} true iff some measure begin instructions have been found for at least one staff
     */
    hasBeginInstructions(): boolean;
    beginsWithLineRepetition(): boolean;
    /**
     * Check if this measure is a Repetition Ending.
     * @returns {boolean}
     */
    endsWithLineRepetition(): boolean;
    /**
     * Check if a Repetition starts at the next Measure.
     * @returns {boolean}
     */
    beginsWithWordRepetition(): boolean;
    /**
     * Check if this Measure ends a Repetition.
     * @returns {boolean}
     */
    endsWithWordRepetition(): boolean;
    beginsRepetitionEnding(): boolean;
    endsRepetitionEnding(): boolean;
    getKeyInstruction(staffIndex: number): KeyInstruction;
    /**
     * Return the first non-null [[SourceStaffEntry]] at the given InstrumentIndex.
     * @param instrumentIndex
     * @returns {SourceStaffEntry}
     */
    private getLastSourceStaffEntryForInstrument;
    canBeReducedToMultiRest(): boolean;
}

declare class DynamicsContainer {
    constructor(dynamicExpression: ContinuousDynamicExpression | InstantaneousDynamicExpression, staffNumber: number);
    continuousDynamicExpression: ContinuousDynamicExpression;
    instantaneousDynamicExpression: InstantaneousDynamicExpression;
    staffNumber: number;
    parMultiExpression(): MultiExpression;
    CompareTo(other: DynamicsContainer): number;
}

declare class MusicSheetErrors {
    measureErrors: {
        [n: number]: string[];
    };
    private errors;
    private tempErrors;
    finalizeMeasure(measureNumber: number): void;
    pushMeasureError(errorMsg: string): void;
    push(errorMsg: string): void;
}

declare class PlaybackSettings {
    rhythm: Fraction;
}
/**
 * This is the representation of a complete piece of sheet music.
 * It includes the contents of a MusicXML file after the reading.
 * Notes: the musicsheet might not need the Rules, e.g. in the testframework. The EngravingRules Constructor
 * fails when no FontInfo exists, which needs a TextMeasurer
 */
declare class MusicSheet {
    constructor();
    static defaultTitle: string;
    userStartTempoInBPM: number;
    pageWidth: number;
    private idString;
    private sourceMeasures;
    private repetitions;
    private dynListStaves;
    private timestampSortedDynamicExpressionsList;
    private timestampSortedTempoExpressionsList;
    private instrumentalGroups;
    /** The parts in the sheet, e.g. piano left hand, or piano right hand, or violin. */
    private instruments;
    private playbackSettings;
    private path;
    private title;
    private subtitle;
    private composer;
    private lyricist;
    private copyright;
    private musicPartManager;
    private musicSheetErrors;
    private staves;
    private selectionStart;
    private selectionEnd;
    private transpose;
    private defaultStartTempoInBpm;
    private drawErroneousMeasures;
    private hasBeenOpenedForTheFirstTime;
    private currentEnrolledPosition;
    private rules;
    private hasBPMInfo;
    /** Global factor / scale by which all measure widths will be scaled.
     * (e.g. 0.7 = all measures are only 70% as long)
     * This is similar to SourceMeasure.widthFactor,
     *   which only applies to one measure and is multiplicative to the global factor.
     *   (so if globalWidthFactor is 0.7 and measure.widthFactor is 0.7, that measure's length will be 49% as long)
     * As with measure.widthFactor, use this with caution, as it can cause overlaps, especially with lyrics.
     */
    MeasureWidthFactor: number;
    /**
     * Get the global index within the music sheet for this staff.
     * @param staff
     * @returns {number}
     */
    static getIndexFromStaff(staff: Staff): number;
    get SourceMeasures(): SourceMeasure[];
    set SourceMeasures(value: SourceMeasure[]);
    get Repetitions(): Repetition[];
    set Repetitions(value: Repetition[]);
    get DynListStaves(): DynamicsContainer[][];
    get TimestampSortedTempoExpressionsList(): MultiTempoExpression[];
    get TimestampSortedDynamicExpressionsList(): DynamicsContainer[];
    get InstrumentalGroups(): InstrumentalGroup[];
    get Parts(): Instrument[];
    get Instruments(): Instrument[];
    get SheetPlaybackSetting(): PlaybackSettings;
    set SheetPlaybackSetting(value: PlaybackSettings);
    get DrawErroneousMeasures(): boolean;
    set DrawErroneousMeasures(value: boolean);
    get HasBeenOpenedForTheFirstTime(): boolean;
    set HasBeenOpenedForTheFirstTime(value: boolean);
    InitializeStartTempoInBPM(startTempo: number): void;
    get DefaultStartTempoInBpm(): number;
    set DefaultStartTempoInBpm(value: number);
    get Path(): string;
    set Path(value: string);
    get Staves(): Staff[];
    get TitleString(): string;
    set TitleString(value: string);
    get SubtitleString(): string;
    set SubtitleString(value: string);
    get ComposerString(): string;
    set ComposerString(value: string);
    get LyricistString(): string;
    set LyricistString(value: string);
    get CopyrightString(): string;
    set CopyrightString(value: string);
    get Title(): Label;
    set Title(value: Label);
    get Subtitle(): Label;
    set Subtitle(value: Label);
    get Composer(): Label;
    set Composer(value: Label);
    get Lyricist(): Label;
    set Lyricist(value: Label);
    get Copyright(): Label;
    set Copyright(value: Label);
    get Rules(): EngravingRules;
    set Rules(value: EngravingRules);
    get SheetErrors(): MusicSheetErrors;
    get SelectionStart(): Fraction;
    set SelectionStart(value: Fraction);
    get SelectionEnd(): Fraction;
    set SelectionEnd(value: Fraction);
    set HasBPMInfo(value: boolean);
    get HasBPMInfo(): boolean;
    addMeasure(measure: SourceMeasure): void;
    checkForInstrumentWithNoVoice(): void;
    /**
     *
     * @param staffIndexInMusicSheet - The global staff index, iterating through all staves of all instruments.
     * @returns {Staff}
     */
    getStaffFromIndex(staffIndexInMusicSheet: number): Staff;
    fillStaffList(): void;
    get MusicPartManager(): MusicPartManager;
    set MusicPartManager(value: MusicPartManager);
    getCompleteNumberOfStaves(): number;
    /**
     * Return a sourceMeasureList, where the given indices correspond to the whole SourceMeasureList of the MusicSheet.
     * @param start
     * @param end
     * @returns {SourceMeasure[]}
     */
    getListOfMeasuresFromIndeces(start: number, end: number): SourceMeasure[];
    /**
     * Returns the next SourceMeasure from a given SourceMeasure.
     * @param measure
     */
    getNextSourceMeasure(measure: SourceMeasure): SourceMeasure;
    /**
     * Returns the first SourceMeasure of MusicSheet.
     */
    getFirstSourceMeasure(): SourceMeasure;
    /**
     * Returns the last SourceMeasure of MusicSheet.
     */
    getLastSourceMeasure(): SourceMeasure;
    resetAllNoteStates(): void;
    getMusicSheetInstrumentIndex(instrument: Instrument): number;
    getGlobalStaffIndexOfFirstStaff(instrument: Instrument): number;
    /**
     * Set to the index-given Repetition a new (set from user) value.
     * @param index
     * @param value
     */
    setRepetitionNewUserNumberOfRepetitions(index: number, value: number): void;
    /**
     * Return the [[Repetition]] from the given index.
     * @param index
     * @returns {any}
     */
    getRepetitionByIndex(index: number): Repetition;
    CompareTo(other: MusicSheet): number;
    getExpressionsStartTempoInBPM(): number;
    get Errors(): {
        [n: number]: string[];
    };
    get FirstMeasureNumber(): number;
    get LastMeasureNumber(): number;
    get CurrentEnrolledPosition(): Fraction;
    set CurrentEnrolledPosition(value: Fraction);
    get Transpose(): number;
    /** Sets the number of halftones for transposition.
     * E.g. +1 halftone will transpose Eb major to E major.
     * also see Instrument.Transpose (e.g. osmd.Sheet.Instruments[0].Transpose will additionally transpose this instrument only)
     * osmd.TransposeCaculator needs to be defined/created for this to take effect. (just set it with new TransposeCalculator())
     */
    set Transpose(value: number);
    get FullNameString(): string;
    get IdString(): string;
    set IdString(value: string);
    getEnrolledSelectionStartTimeStampWorkaround(): Fraction;
    get SheetEndTimestamp(): Fraction;
    /**
     * Works only if the [[SourceMeasure]]s are already filled with VerticalStaffEntryContainers!
     * @param timeStamp
     * @returns {SourceMeasure}
     */
    getSourceMeasureFromTimeStamp(timeStamp: Fraction): SourceMeasure;
    findSourceMeasureFromTimeStamp(timestamp: Fraction): SourceMeasure;
    getVisibleInstruments(): Instrument[];
}

declare abstract class PartListEntry {
    constructor(musicSheet: MusicSheet);
    absoluteTimestamp: Fraction;
    startIndex: number;
    endIndex: number;
    protected enrolledTimestamps: Fraction[];
    protected visible: boolean;
    protected musicSheet: MusicSheet;
    get Visible(): boolean;
    set Visible(value: boolean);
    getFirstSourceMeasure(): SourceMeasure;
    getLastSourceMeasure(): SourceMeasure;
}

declare class SourceMusicPart extends PartListEntry {
    constructor(musicSheet: MusicSheet, startIndex?: number, endIndex?: number);
    protected parentRepetition: Repetition;
    get MeasuresCount(): number;
    get StartIndex(): number;
    get EndIndex(): number;
    get ParentRepetition(): Repetition;
    set ParentRepetition(value: Repetition);
    get AbsoluteTimestamp(): Fraction;
    setStartIndex(startIndex: number): void;
    setEndIndex(index: number): void;
}

declare class Repetition extends PartListEntry {
    constructor(musicSheet: MusicSheet, virtualOverallRepetition: boolean);
    startMarker: RepetitionInstruction;
    endMarker: RepetitionInstruction;
    forwardJumpInstruction: RepetitionInstruction;
    private backwardJumpInstructions;
    private endingParts;
    private endingIndexDict;
    private userNumberOfRepetitions;
    private visibles;
    private fromWords;
    private musicSheet2;
    private repetitonIterationOrder;
    private numberOfEndings;
    private virtualOverallRepetition;
    get BackwardJumpInstructions(): RepetitionInstruction[];
    get EndingIndexDict(): {
        [_: number]: RepetitionEndingPart;
    };
    get EndingParts(): RepetitionEndingPart[];
    get Visibles(): boolean[];
    set Visibles(value: boolean[]);
    get DefaultNumberOfRepetitions(): number;
    get UserNumberOfRepetitions(): number;
    set UserNumberOfRepetitions(value: number);
    getForwardJumpTargetForIteration(iteration: number): number;
    getBackwardJumpTarget(): number;
    SetEndingStartIndex(endingNumbers: number[], startIndex: number): void;
    setEndingEndIndex(endingNumber: number, endIndex: number): void;
    get NumberOfEndings(): number;
    get FromWords(): boolean;
    set FromWords(value: boolean);
    get AbsoluteTimestamp(): Fraction;
    get StartIndex(): number;
    get EndIndex(): number;
    private checkRepetitionForMultipleLyricVerses;
    get FirstSourceMeasureNumber(): number;
    get LastSourceMeasureNumber(): number;
}
declare class RepetitionEndingPart {
    constructor(endingPart: SourceMusicPart);
    part: SourceMusicPart;
    endingIndices: number[];
    ToString(): string;
}

declare class MusicPartManagerIterator {
    constructor(musicSheet: MusicSheet, startTimestamp?: Fraction, endTimestamp?: Fraction);
    backJumpOccurred: boolean;
    forwardJumpOccurred: boolean;
    private musicSheet;
    private currentMappingPart;
    private currentMeasure;
    private currentMeasureIndex;
    private currentPartIndex;
    private currentVoiceEntryIndex;
    private currentDynamicEntryIndex;
    private currentTempoEntryIndex;
    private currentVoiceEntries;
    private currentDynamicChangingExpressions;
    private currentTempoChangingExpression;
    private repetitionIterationCountDictKeys;
    private repetitionIterationCountDictValues;
    private currentRepetition;
    private endReached;
    private frontReached;
    currentTimeStamp: Fraction;
    private currentEnrolledMeasureTimestamp;
    private currentRelativeInMeasureTimestamp;
    private currentVerticalContainerInMeasureTimestamp;
    private jumpResponsibleRepetition;
    private currentBpm;
    private activeDynamicExpressions;
    private activeTempoExpression;
    SkipInvisibleNotes: boolean;
    get EndReached(): boolean;
    get FrontReached(): boolean;
    get CurrentMeasure(): SourceMeasure;
    get CurrentRepetition(): Repetition;
    get CurrentRepetitionIteration(): number;
    get CurrentJumpResponsibleRepetitionIterationBeforeJump(): number;
    get CurrentBpm(): number;
    get CurrentVoiceEntries(): VoiceEntry[];
    get CurrentMeasureIndex(): number;
    get CurrentEnrolledTimestamp(): Fraction;
    get CurrentSourceTimestamp(): Fraction;
    get CurrentRelativeInMeasureTimestamp(): Fraction;
    get JumpOccurred(): boolean;
    get ActiveTempoExpression(): MultiTempoExpression;
    get ActiveDynamicExpressions(): AbstractExpression[];
    get CurrentTempoChangingExpression(): MultiTempoExpression;
    get JumpResponsibleRepetition(): Repetition;
    /**
     * Creates a clone of this iterator which has the same actual position.
     */
    clone(startTimeStamp?: Fraction, endTimeStamp?: Fraction): MusicPartManagerIterator;
    /**
     * Returns the visible voice entries for the provided instrument of the current iterator position.
     * @param instrument
     * Returns: A List of voiceEntries. If there are no entries the List has a Count of 0 (it does not return null).
     */
    CurrentVisibleVoiceEntries(instrument?: Instrument): VoiceEntry[];
    /**
     * Returns the visible voice entries for the provided instrument of the current iterator position.
     * @param instrument
     * Returns: A List of voiceEntries. If there are no entries the List has a Count of 0 (it does not return null).
     */
    CurrentAudibleVoiceEntries(instrument?: Instrument): VoiceEntry[];
    /**
     * Returns the audible dynamics of the current iterator position.
     * Returns: A List of Dynamics. If there are no entries the List has a Count of 0 (it does not return null).
     */
    getCurrentDynamicChangingExpressions(): DynamicsContainer[];
    /**
     * Returns the score following voice entries for the provided instrument of the current iterator position.
     * @param instrument
     * Returns: A List of voiceEntries. If there are no entries the List has a Count of 0
     * (it does not return null).
     */
    CurrentScoreFollowingVoiceEntries(instrument?: Instrument): VoiceEntry[];
    moveToPrevious(): void;
    moveToPreviousVisibleVoiceEntry(notesOnly: boolean): void;
    moveToNext(): void;
    moveToNextVisibleVoiceEntry(notesOnly: boolean): void;
    private resetRepetitionIterationCount;
    private incrementRepetitionIterationCount;
    private setRepetitionIterationCount;
    private getRepetitionIterationCount;
    private handleRepetitionsAtMeasureBegin;
    private handleRepetitionsAtMeasureEnd;
    private doBackJump;
    private activateCurrentRhythmInstructions;
    private activateCurrentDynamicOrTempoInstructions;
    private recursiveMoveBack;
    private recursiveMove;
    /**
     * helper function for moveToNextVisibleVoiceEntry and moveToPreviousVisibleVoiceEntry
     * Get all entries and check if there is at least one valid entry in the list
     * @param notesOnly
     */
    private checkEntries;
    private getVisibleEntries;
    private getAudibleEntries;
    private getScoreFollowingEntries;
    private getVoiceEntries;
}

import VF$c = Vex.Flow;

/**
 * The VexFlow version of a [[GraphicalNote]].
 */
declare class VexFlowGraphicalNote extends GraphicalNote {
    constructor(note: Note, parent: GraphicalVoiceEntry, activeClef: ClefInstruction, octaveShift: OctaveEnum, rules: EngravingRules, graphicalNoteLength?: Fraction);
    octaveShift: OctaveEnum;
    vfpitch: [string, string, ClefInstruction];
    vfnote: [VF$c.StemmableNote, number];
    vfnoteIndex: number;
    private clef;
    /**
     * Update the pitch of this note. Necessary in order to display accidentals correctly.
     * This is called by VexFlowGraphicalSymbolFactory.addGraphicalAccidental.
     * @param pitch
     */
    setAccidental(pitch: Pitch): void;
    drawPitch(pitch: Pitch): Pitch;
    Transpose(keyInstruction: KeyInstruction, activeClef: ClefInstruction, halfTones: number, octaveEnum: OctaveEnum): Pitch;
    /**
     * Set the VexFlow StaveNote corresponding to this GraphicalNote, together with its index in the chord.
     * @param note
     * @param index
     */
    setIndex(note: VF$c.StemmableNote, index: number): void;
    notehead(vfNote?: VF$c.StemmableNote): {
        line: number;
    };
    /**
     * Gets the clef for this note
     */
    Clef(): ClefInstruction;
    /**
     * Gets the id of the SVGGElement containing this note, given the SVGRenderer is used.
     * This is for low-level rendering hacks and should be used with caution.
     */
    getSVGId(): string;
    /** Toggle visibility of the note, making it and its stem and beams invisible for `false`.
     * By default, this will also hide the note's slurs and ties (see visibilityOptions).
     * (This only works with the default SVG backend, not with the Canvas backend/renderer)
     * To get a GraphicalNote from a Note, use osmd.EngravingRules.GNote(note).
     */
    setVisible(visible: boolean, visibilityOptions?: VisibilityOptions): void;
    /**
     * Gets the SVGGElement containing this note, given the SVGRenderer is used.
     * This is for low-level rendering hacks and should be used with caution.
     */
    getSVGGElement(): SVGGElement;
    /** Gets the SVG path element of the note's stem. */
    getStemSVG(): HTMLElement;
    /** Gets the SVG path elements of the beams starting on this note. */
    getBeamSVGs(): HTMLElement[];
    /** Gets the SVG path elements of the note's ledger lines. */
    getLedgerLineSVGs(): HTMLElement[];
    /** Gets the SVG path elements of the note's tie curves. */
    getTieSVGs(): HTMLElement[];
    /** Gets the SVG path elements of the note's slur curve. */
    getSlurSVGs(): HTMLElement[];
    getNoteheadSVGs(): HTMLElement[];
    getFlagSVG(): HTMLElement;
    getVFNoteSVG(): HTMLElement;
    getModifierSVGs(): HTMLElement[];
    /** Change the color of a note (without re-rendering). See ColoringOptions for options like applyToBeams etc.
     * This requires the SVG backend (default, instead of canvas backend).
     */
    setColor(color: string, coloringOptions?: ColoringOptions): void;
}

import VF$b = Vex.Flow;

declare class VexFlowBackends {
    static CANVAS: 0;
    static RAPHAEL: 1;
    static SVG: 2;
    static VML: 3;
}
declare abstract class VexFlowBackend {
    /** The GraphicalMusicPage the backend is drawing from. Each backend only renders one GraphicalMusicPage, to which the coordinates are relative. */
    graphicalMusicPage: GraphicalMusicPage;
    protected rules: EngravingRules;
    width: number;
    height: number;
    abstract initialize(container: HTMLElement, zoom: number): void;
    getInnerElement(): HTMLElement;
    getCanvas(): HTMLElement;
    abstract getCanvasSize(): number;
    getRenderElement(): HTMLElement;
    getRenderer(): VF$b.Renderer;
    removeAllChildrenFromContainer(container: HTMLElement): void;
    removeFromContainer(container: HTMLElement): void;
    abstract getContext(): Vex.IRenderContext;
    abstract scale(k: number): void;
    resize(width: number, height: number): void;
    abstract clear(): void;
    /** (Try to) free memory. Currently only relevant on iOS. */
    abstract free(): void;
    abstract translate(x: number, y: number): void;
    abstract renderText(fontHeight: number, fontStyle: FontStyles, font: Fonts, text: string, heightInPixel: number, screenPosition: PointF2D, color?: string, fontFamily?: string): Node;
    /**
     * Renders a rectangle with the given style to the screen.
     * It is given in screen coordinates.
     * @param rectangle the rect in screen coordinates
     * @param layer is the current rendering layer. There are many layers on top of each other to which can be rendered. Not needed for now.
     * @param styleId the style id
     * @param alpha alpha value between 0 and 1
     */
    abstract renderRectangle(rectangle: RectangleF2D, styleId: number, colorHex: string, alpha: number): Node;
    abstract renderLine(start: PointF2D, stop: PointF2D, color: string, lineWidth: number, id?: string): Node;
    abstract renderCurve(points: PointF2D[], isSlur?: boolean, startNote?: VexFlowGraphicalNote): Node;
    abstract renderPath(points: PointF2D[], fill: boolean, id?: string): Node;
    abstract getVexflowBackendType(): VF$b.Renderer.Backends;
    /** The general type of backend: Canvas or SVG.
     * This is not used for now (only VexflowBackendType used), but it may be useful when we don't want to use a Vexflow class.
     */
    abstract getOSMDBackendType(): BackendType;
    protected renderer: VF$b.Renderer;
    protected inner: HTMLElement;
    protected canvas: HTMLElement;
}

import VF$a = Vex.Flow;

declare class VexFlowVoiceEntry extends GraphicalVoiceEntry {
    private mVexFlowStaveNote;
    vfGhostNotes: VF$a.GhostNote[];
    constructor(parentVoiceEntry: VoiceEntry, parentStaffEntry: GraphicalStaffEntry, rules?: EngravingRules);
    applyBordersFromVexflow(): void;
    set vfStaveNote(value: VF$a.StemmableNote);
    get vfStaveNote(): VF$a.StemmableNote;
    /** Apply custom noteheads from Note.CustomNoteheadVFCode. This should happen before color(). */
    applyCustomNoteheads(): void;
    /** (Re-)color notes and stems by setting their Vexflow styles.
     * Could be made redundant by a Vexflow PR, but Vexflow needs more solid and permanent color methods/variables for that
     * See VexFlowConverter.StaveNote()
     */
    color(): void;
}

import VF$9 = Vex.Flow;

declare class VexFlowMeasure extends GraphicalMeasure {
    constructor(staff: Staff, sourceMeasure?: SourceMeasure, staffLine?: StaffLine);
    /** octaveOffset according to active clef */
    octaveOffset: number;
    /** The VexFlow Voices in the measure */
    vfVoices: {
        [voiceID: number]: VF$9.Voice;
    };
    /** Call this function (if present) to x-format all the voices in the measure */
    formatVoices?: (width: number, parent: VexFlowMeasure) => void;
    /** The VexFlow Ties in the measure */
    vfTies: VF$9.StaveTie[];
    /** The repetition instructions given as words or symbols (coda, dal segno..) */
    vfRepetitionWords: VF$9.Repetition[];
    hasMetronomeMark: boolean;
    /** The VexFlow Stave (= one measure in a staffline) */
    protected stave: VF$9.Stave;
    /** VexFlow StaveConnectors (vertical lines) */
    protected connectors: VF$9.StaveConnector[];
    /** Intermediate object to construct beams */
    private beams;
    /** Beams created by (optional) autoBeam function. */
    private autoVfBeams;
    /** Beams of tuplet notes created by (optional) autoBeam function. */
    private autoTupletVfBeams;
    /** VexFlow Beams */
    private vfbeams;
    /** Intermediate object to construct tuplets */
    protected tuplets: {
        [voiceID: number]: [Tuplet, VexFlowVoiceEntry[]][];
    };
    /** VexFlow Tuplets */
    private vftuplets;
    rules: EngravingRules;
    setAbsoluteCoordinates(x: number, y: number): void;
    /**
     * Reset all the geometric values and parameters of this measure and put it in an initialized state.
     * This is needed to evaluate a measure a second time by system builder.
     */
    resetLayout(): void;
    clean(): void;
    /**
     * returns the x-width (in units) of a given measure line {SystemLinesEnum}.
     * @param line
     * @returns the x-width in osmd units
     */
    getLineWidth(line: SystemLinesEnum): number;
    /**
     * adds the given clef to the begin of the measure.
     * This has to update/increase BeginInstructionsWidth.
     * @param clef
     */
    addClefAtBegin(clef: ClefInstruction): void;
    /**
     * Sets the number of stafflines that are rendered, so that they are centered properly
     * @param lineNumber
     */
    setLineNumber(lineNumber: number): void;
    /**
     * adds the given key to the begin of the measure.
     * This has to update/increase BeginInstructionsWidth.
     * @param currentKey the new valid key.
     * @param previousKey the old cancelled key. Needed to show which accidentals are not valid any more.
     * @param currentClef the valid clef. Needed to put the accidentals on the right y-positions.
     */
    addKeyAtBegin(currentKey: KeyInstruction, previousKey: KeyInstruction, currentClef: ClefInstruction): void;
    /**
     * adds the given rhythm to the begin of the measure.
     * This has to update/increase BeginInstructionsWidth.
     * @param rhythm
     */
    addRhythmAtBegin(rhythm: RhythmInstruction): void;
    /**
     * adds the given clef to the end of the measure.
     * This has to update/increase EndInstructionsWidth.
     * @param clef
     */
    addClefAtEnd(clef: ClefInstruction, visible?: boolean): void;
    addMeasureLine(lineType: SystemLinesEnum, linePosition: SystemLinePosition, renderInitialLine?: boolean): void;
    /**
     * Adds a measure number to the top left corner of the measure
     * This method is not used currently in favor of the calculateMeasureNumberPlacement
     * method in the MusicSheetCalculator.ts
     */
    addMeasureNumber(): void;
    addWordRepetition(repetitionInstruction: RepetitionInstruction): void;
    protected addVolta(repetitionInstruction: RepetitionInstruction): void;
    /**
     * Sets the overall x-width of the measure.
     * @param width
     */
    setWidth(width: number): void;
    /**
     * This method is called after the StaffEntriesScaleFactor has been set.
     * Here the final x-positions of the staff entries have to be set.
     * (multiply the minimal positions with the scaling factor, considering the BeginInstructionsWidth)
     */
    layoutSymbols(): void;
    /**
     * Draw this measure on a VexFlow CanvasContext
     * @param ctx
     */
    draw(ctx: Vex.IRenderContext): void;
    format(): void;
    correctNotePositions(): void;
    /**
     * Returns all the voices that are present in this measure
     */
    getVoicesWithinMeasure(): Voice[];
    /**
     * Returns all the graphicalVoiceEntries of a given Voice.
     * @param voice the voice for which the graphicalVoiceEntries shall be returned.
     */
    getGraphicalVoiceEntriesPerVoice(voice: Voice): GraphicalVoiceEntry[];
    /**
     * Finds the gaps between the existing notes within a measure.
     * Problem here is, that the graphicalVoiceEntry does not exist yet and
     * that Tied notes are not present in the normal voiceEntries.
     * To handle this, calculation with absolute timestamps is needed.
     * And the graphical notes have to be analysed directly (and not the voiceEntries, as it actually should be -> needs refactoring)
     * @param voice the voice for which the ghost notes shall be searched.
     */
    protected getRestFilledVexFlowStaveNotesPerVoice(voice: Voice): GraphicalVoiceEntry[];
    private createGhostGves;
    /**
     * Add a note to a beam
     * @param graphicalNote
     * @param beam
     */
    handleBeam(graphicalNote: GraphicalNote, beam: Beam): void;
    handleTuplet(graphicalNote: GraphicalNote, tuplet: Tuplet): void;
    /**
     * Complete the creation of VexFlow Beams in this measure
     */
    finalizeBeams(): void;
    /** Automatically creates beams for notes except beamedNotes, using Vexflow's Beam.generateBeams().
     *  Takes options from this.rules.AutoBeamOptions.
     * @param beamedNotes notes that will not be autobeamed (usually because they are already beamed)
     */
    private autoBeamNotes;
    /**
     * Complete the creation of VexFlow Tuplets in this measure
     */
    finalizeTuplets(): void;
    layoutStaffEntry(graphicalStaffEntry: GraphicalStaffEntry): void;
    graphicalMeasureCreatedCalculations(): void;
    private createArpeggio;
    /**
     * Copy the stem directions chosen by VexFlow to the StemDirection variable of the graphical notes
     */
    private setStemDirectionFromVexFlow;
    /**
     * Create the articulations for all notes of the current staff entry
     */
    protected createArticulations(): void;
    /**
     * Create the ornaments for all notes of the current staff entry
     */
    protected createOrnaments(): void;
    /** Creates vexflow fingering elements.
     * Note that this is currently only used for Left and Right fingering positions, not Above and Below,
     * in which case they are instead added via MusicSheetCalculator.calculateFingerings() as Labels with bounding boxes.
     */
    protected createFingerings(voiceEntry: GraphicalVoiceEntry): void;
    protected createStringNumber(voiceEntry: GraphicalVoiceEntry): void;
    /**
     * Creates a line from 'top' to this measure, of type 'lineType'
     * @param top
     * @param lineType
     */
    lineTo(top: VexFlowMeasure, lineType: any): void;
    /**
     * Return the VexFlow Stave corresponding to this graphicalMeasure
     * @returns {VF.Stave}
     */
    getVFStave(): VF$9.Stave;
    /**
     * After re-running the formatting on the VexFlow Stave, update the
     * space needed by Instructions (in VexFlow: StaveModifiers)
     */
    protected updateInstructionWidth(): void;
    addStaveTie(stavetie: VF$9.StaveTie, graphicalTie: GraphicalTie): void;
}
declare enum StavePositionEnum {
    LEFT = 1,
    RIGHT = 2,
    ABOVE = 3,
    BELOW = 4,
    BEGIN = 5,
    END = 6
}

/**
 * This class extends the GraphicalContinuousDynamicExpression and creates all necessary methods for drawing
 */
declare class VexFlowContinuousDynamicExpression extends GraphicalContinuousDynamicExpression {
    constructor(continuousDynamic: ContinuousDynamicExpression, staffLine: StaffLine, measure: SourceMeasure, textHeight?: number);
}

/**
 * This is a global constant which denotes the height in pixels of the space between two lines of the stave
 * (when zoom = 1.0)
 * @type number
 */
declare const unitInPixels: number;
declare class VexFlowMusicSheetDrawer extends MusicSheetDrawer {
    private backend;
    private backends;
    private zoom;
    private pageIdx;
    constructor(drawingParameters?: DrawingParameters);
    get Backends(): VexFlowBackend[];
    drawSheet(graphicalMusicSheet: GraphicalMusicSheet): void;
    protected drawPage(page: GraphicalMusicPage): void;
    clear(): void;
    setZoom(zoom: number): void;
    /**
     * Converts a distance from unit to pixel space.
     * @param unitDistance the distance in units
     * @returns {number} the distance in pixels
     */
    calculatePixelDistance(unitDistance: number): number;
    protected drawStaffLine(staffLine: StaffLine): void;
    private drawSlurs;
    private drawGlissandi;
    private drawGlissando;
    private drawSlur;
    protected drawMeasure(measure: VexFlowMeasure): void;
    protected drawBuzzRolls(staffEntry: GraphicalStaffEntry, newBuzzRollId: any): number;
    /** Draws a line in the current backend. Only usable while pages are drawn sequentially, because backend reference is updated in that process.
     *  To add your own lines after rendering, use DrawOverlayLine.
     */
    protected drawLine(start: PointF2D, stop: PointF2D, color?: string, lineWidth?: number): Node;
    /** Lets a user/developer draw an overlay line on the score. Use this instead of drawLine, which is for OSMD internally only.
     *  The MusicPage has to be specified, because each page and Vexflow backend has its own relative coordinates.
     *  (the AbsolutePosition of a GraphicalNote is relative to its backend)
     *  To get a MusicPage, use GraphicalNote.ParentMusicPage.
     */
    DrawOverlayLine(start: PointF2D, stop: PointF2D, musicPage: GraphicalMusicPage, color?: string, lineWidth?: number, id?: string): Node;
    DrawPath(inputPoints: PointF2D[], musicPage: GraphicalMusicPage, fill?: boolean, id?: string): Node;
    protected drawSkyLine(staffline: StaffLine): void;
    protected drawBottomLine(staffline: StaffLine): void;
    /**
     * Draw a line with a width and start point in a chosen color (used for skyline/bottom line debugging) from
     * a simple array
     * @param line numeric array. 0 marks the base line. Direction given by sign. Dimensions in units
     * @param startPosition Start position in units
     * @param width Max line width in units
     * @param color Color to paint in. Default is red
     */
    private drawSampledLine;
    private drawStaffEntry;
    /**
     * Draw all lyrics to the canvas
     * @param lyricEntries Array of lyric entries to be drawn
     * @param layer Number of the layer that the lyrics should be drawn in
     */
    private drawLyrics;
    protected drawInstrumentBrace(brace: GraphicalObject, system: MusicSystem): void;
    protected drawGroupBracket(bracket: GraphicalObject, system: MusicSystem): void;
    protected drawOctaveShifts(staffLine: StaffLine): void;
    protected drawPedals(staffLine: StaffLine): void;
    protected drawExpressions(staffline: StaffLine): void;
    protected drawInstantaneousDynamic(instantaneousDynamic: GraphicalInstantaneousDynamicExpression): void;
    protected drawContinuousDynamic(graphicalExpression: VexFlowContinuousDynamicExpression): void;
    /**
     * Renders a Label to the screen (e.g. Title, composer..)
     * @param graphicalLabel holds the label string, the text height in units and the font parameters
     * @param layer is the current rendering layer. There are many layers on top of each other to which can be rendered. Not needed for now.
     * @param bitmapWidth Not needed for now.
     * @param bitmapHeight Not needed for now.
     * @param heightInPixel the height of the text in screen coordinates
     * @param screenPosition the position of the lower left corner of the text in screen coordinates
     */
    protected renderLabel(graphicalLabel: GraphicalLabel, layer: number, bitmapWidth: number, bitmapHeight: number, fontHeightInPixel: number, screenPosition: PointF2D): Node;
    /**
     * Renders a rectangle with the given style to the screen.
     * It is given in screen coordinates.
     * @param rectangle the rect in screen coordinates
     * @param layer is the current rendering layer. There are many layers on top of each other to which can be rendered. Not needed for now.
     * @param styleId the style id
     * @param alpha alpha value between 0 and 1
     */
    protected renderRectangle(rectangle: RectangleF2D, layer: number, styleId: number, colorHex: string, alpha: number): Node;
    /**
     * Converts a point from unit to pixel space.
     * @param point
     * @returns {PointF2D}
     */
    protected applyScreenTransformation(point: PointF2D): PointF2D;
    /**
     * Converts a rectangle from unit to pixel space.
     * @param rectangle
     * @returns {RectangleF2D}
     */
    protected applyScreenTransformationForRect(rectangle: RectangleF2D): RectangleF2D;
}

/**
 * The main class and control point of OpenSheetMusicDisplay.<br>
 * It can display MusicXML sheet music files in an HTML element container.<br>
 * After the constructor, use load() and render() to load and render a MusicXML file.
 */
declare class OpenSheetMusicDisplay {
    protected version: string;
    /**
     * Creates and attaches an OpenSheetMusicDisplay object to an HTML element container.<br>
     * After the constructor, use load() and render() to load and render a MusicXML file.
     * @param container The container element OSMD will be rendered into.<br>
     *                  Either a string specifying the ID of an HTML container element,<br>
     *                  or a reference to the HTML element itself (e.g. div)
     * @param options An object for rendering options like the backend (svg/canvas) or autoResize.<br>
     *                For defaults see the OSMDOptionsStandard method in the [[OSMDOptions]] class.
     */
    constructor(container: string | HTMLElement, options?: IOSMDOptions);
    /** Options from which OSMD creates cursors in enableOrDisableCursors(). */
    cursorsOptions: CursorOptions[];
    cursors: Cursor[];
    get cursor(): Cursor;
    get Cursor(): Cursor;
    zoom: number;
    protected zoomUpdated: boolean;
    /** Timeout in milliseconds used in osmd.load(string) when string is a URL. */
    loadUrlTimeout: number;
    protected container: HTMLElement;
    protected backendType: BackendType;
    protected needBackendUpdate: boolean;
    protected sheet: MusicSheet;
    protected drawer: VexFlowMusicSheetDrawer;
    protected drawBoundingBox: string;
    protected drawSkyLine: boolean;
    protected drawBottomLine: boolean;
    protected graphic: GraphicalMusicSheet;
    protected drawingParameters: DrawingParameters;
    protected rules: EngravingRules;
    protected autoResizeEnabled: boolean;
    protected resizeHandlerAttached: boolean;
    protected followCursor: boolean;
    /** A function that is executed when the XML has been read.
     * The return value will be used as the actual XML OSMD parses,
     * so you can make modifications to the xml that OSMD will use.
     * Note that this is (re-)set on osmd.setOptions as `{return xml}`, unless you specify the function in the options. */
    OnXMLRead: (xml: string) => string;
    /**
     * Load a MusicXML file
     * @param content is either the url of a file, or the root node of a MusicXML document, or the string content of a .xml/.mxl file
     * @param tempTitle is used as the title for the piece if there is no title in the XML.
     */
    load(content: string | Document, tempTitle?: string): Promise<{}>;
    /**
     * (Re-)creates the graphic sheet from the music sheet
     */
    updateGraphic(): void;
    /** Render the loaded music sheet to the container. */
    render(): void;
    protected createOrRefreshRenderBackend(): void;
    exportSVG(): void;
    /** States whether the render() function can be safely called. */
    IsReadyToRender(): boolean;
    /** Clears what OSMD has drawn on its canvas. */
    clear(): void;
    /** Set OSMD rendering options using an IOSMDOptions object.
     *  Can be called during runtime. Also called by constructor.
     *  For example, setOptions({autoResize: false}) will disable autoResize even during runtime.
     */
    setOptions(options: IOSMDOptions): void;
    setColoringMode(options: IOSMDOptions): void;
    /**
     * Sets the logging level for this OSMD instance. By default, this is set to `warn`.
     *
     * @param: content can be `trace`, `debug`, `info`, `warn` or `error`.
     */
    setLogLevel(level: string): void;
    getLogLevel(): number;
    /**
     * Initialize this object to default values
     * FIXME: Probably unnecessary
     */
    protected reset(): void;
    /**
     * Attach the appropriate handler to the window.onResize event
     */
    protected autoResize(): void;
    /** Re-render and scroll back to previous scroll bar y position in percent.
     * If the document keeps the same height/length, the scroll bar position will basically be unchanged.
     * For example, if you scroll to the bottom of the page, resize by one pixel (or enable dark mode) and call this,
     *   for the human eye there will be no detectable scrolling or change in the scroll position at all.
     * If you just call render() instead of renderAndScrollBack(),
     *   it will scroll you back to the top of the page, even if you were scrolled to the bottom before. */
    renderAndScrollBack(): void;
    /**
     * Helper function for managing window's onResize events
     * @param startCallback is the function called when resizing starts
     * @param endCallback is the function called when resizing (kind-of) ends
     */
    protected handleResize(startCallback: () => void, endCallback: () => void): void;
    /** Enable or disable (hide) the cursor.
     * @param enable whether to enable (true) or disable (false) the cursor
     */
    enableOrDisableCursors(enable: boolean): void;
    createBackend(type: BackendType, page: GraphicalMusicPage): VexFlowBackend;
    /** Standard page format options like A4 or Letter, in portrait and landscape. E.g. PageFormatStandards["A4_P"] or PageFormatStandards["Letter_L"]. */
    static PageFormatStandards: {
        [type: string]: PageFormat;
    };
    static StringToPageFormat(pageFormatString: string): PageFormat;
    /** Sets page format by string. Used by setOptions({pageFormat: "A4_P"}) for example. */
    setPageFormat(formatId: string): void;
    setCustomPageFormat(width: number, height: number): void;
    set DrawSkyLine(value: boolean);
    get DrawSkyLine(): boolean;
    set DrawBottomLine(value: boolean);
    get DrawBottomLine(): boolean;
    set DrawBoundingBox(value: string);
    get DrawBoundingBox(): string;
    setDrawBoundingBox(value: string, render?: boolean): void;
    get AutoResizeEnabled(): boolean;
    set AutoResizeEnabled(value: boolean);
    get Zoom(): number;
    set Zoom(value: number);
    set FollowCursor(value: boolean);
    get FollowCursor(): boolean;
    set TransposeCalculator(calculator: ITransposeCalculator);
    get TransposeCalculator(): ITransposeCalculator;
    get Sheet(): MusicSheet;
    get Drawer(): VexFlowMusicSheetDrawer;
    get GraphicSheet(): GraphicalMusicSheet;
    get DrawingParameters(): DrawingParameters;
    get EngravingRules(): EngravingRules;
    /** Returns the version of OSMD this object is built from (the version you are using). */
    get Version(): string;
}

/** A cursor which can iterate through the music sheet. */
declare class Cursor {
    constructor(container: HTMLElement, openSheetMusicDisplay: OpenSheetMusicDisplay, cursorOptions: CursorOptions);
    adjustToBackgroundColor(): void;
    private container;
    cursorElement: HTMLImageElement;
    /** a unique id of the cursor's HTMLElement in the document.
     * Should be constant between re-renders and backend changes,
     * but different between different OSMD objects on the same page.
     */
    cursorElementId: string;
    /** The desired zIndex (layer) of the cursor when no background color is set.
     *  When a background color is set, using a negative zIndex would make the cursor invisible.
     */
    wantedZIndex: string;
    private openSheetMusicDisplay;
    private rules;
    private manager;
    iterator: MusicPartManagerIterator;
    private graphic;
    hidden: boolean;
    currentPageNumber: number;
    private cursorOptions;
    private cursorOptionsRendered;
    private skipInvisibleNotes;
    /** Initialize the cursor. Necessary before using functions like show() and next(). */
    init(manager: MusicPartManager, graphic: GraphicalMusicSheet): void;
    /** Make the cursor visible. */
    show(): void;
    resetIterator(): void;
    private getStaffEntryFromVoiceEntry;
    /** Moves the cursor to the current position of the iterator (visually), e.g. after next(). */
    update(): void;
    private findVisibleGraphicalMeasure;
    updateWidthAndStyle(measurePositionAndShape: BoundingBox, x: number, y: number, height: number): void;
    /** Hide the cursor. */
    hide(): void;
    /** Go to previous entry / note / vertical position. */
    previous(): void;
    /** Go to next entry / note / vertical position. */
    next(): void;
    /** reset cursor to start position (start of sheet or osmd.Sheet.SelectionStart if set). */
    reset(): void;
    /** updates cursor style (visually), e.g. cursor.cursorOptions.type or .color. */
    private updateStyle;
    get Iterator(): MusicPartManagerIterator;
    get Hidden(): boolean;
    /** returns voices under the current Cursor position. Without instrument argument, all voices are returned. */
    VoicesUnderCursor(instrument?: Instrument): VoiceEntry[];
    NotesUnderCursor(instrument?: Instrument): Note[];
    GNotesUnderCursor(instrument?: Instrument): GraphicalNote[];
    /** Check if there was a change in current page, and attach cursor element to the corresponding HTMLElement (div).
     *  This is only necessary if using PageFormat (multiple pages).
     */
    updateCurrentPage(): number;
    get SkipInvisibleNotes(): boolean;
    set SkipInvisibleNotes(value: boolean);
    get CursorOptions(): CursorOptions;
    set CursorOptions(value: CursorOptions);
    /** Hides and removes the cursor element, deletes object variables. */
    Dispose(): void;
    nextMeasure(): void;
    previousMeasure(): void;
}

declare class MusicSheetReadingException implements Error {
    name: string;
    message: string;
    constructor(message: string, e?: Error);
}
declare class ArgumentOutOfRangeException implements Error {
    name: string;
    message: string;
    constructor(message: string);
}
declare class InvalidEnumArgumentException implements Error {
    name: string;
    message: string;
    constructor(message: string);
}

declare class LinkedVoice extends Voice {
    constructor(parent: Instrument, voiceId: number, master: Voice);
    private master;
    get Master(): Voice;
}

declare class MappingSourceMusicPart {
    constructor(sourceMusicPart: SourceMusicPart, startTimestamp: Fraction, parentPartListEntry?: Repetition, repetitionRun?: number, isEnding?: boolean);
    private sourceMusicPart;
    private parentRepetition;
    private parentPartListEntry;
    private startTimestamp;
    private repetitionRun;
    private isEnding;
    get IsRepetition(): boolean;
    get IsEnding(): boolean;
    get IsLastRepetitionRun(): boolean;
    get RepetitionRun(): number;
    get ParentPartListEntry(): PartListEntry;
    get SourceMusicPart(): SourceMusicPart;
    get StartTimestamp(): Fraction;
    CompareTo(comp: MappingSourceMusicPart): number;
}

/**
 * IXmlAttribute is just the standard Attr
 */
type IXmlAttribute = Attr;
/**
 * Just a wrapper for an XML Element object.
 * It facilitates handling of XML elements by OSMD
 */
declare class IXmlElement {
    name: string;
    value: string;
    hasAttributes: boolean;
    firstAttribute: IXmlAttribute;
    hasElements: boolean;
    private attrs;
    private elem;
    /**
     * Wraps 'elem' Element in a IXmlElement
     * @param elem
     */
    constructor(elem: Element);
    /**
     * Get the attribute with the given name
     * @param attributeName
     * @returns {Attr}
     */
    attribute(attributeName: string): IXmlAttribute;
    /**
     * Get all attributes
     * @returns {IXmlAttribute[]}
     */
    attributes(): IXmlAttribute[];
    /**
     * Get the first child element with the given node name
     * @param elementName
     * @returns {IXmlElement}
     */
    element(elementName: string): IXmlElement;
    /**
     * Get the children with the given node name (if given, otherwise all child elements)
     * @param nodeName
     * @returns {IXmlElement[]}
     */
    elements(nodeName?: string): IXmlElement[];
    /**
     * Get the first child element with the given node name
     * with all the children of consequent child elements with the same node name.
     * for example two <notations> tags will be combined for better processing
     * @param elementName
     * @returns {IXmlElement}
     */
    combinedElement(elementName: string): IXmlElement;
}

declare class RepetitionInstructionReader {
    /**
     * A global list of all repetition instructions in the musicsheet.
     */
    repetitionInstructions: RepetitionInstruction[];
    xmlMeasureList: IXmlElement[][];
    private musicSheet;
    private currentMeasureIndex;
    set MusicSheet(value: MusicSheet);
    /**
     * is called when starting reading an xml measure
     * @param measure
     * @param currentMeasureIndex
     */
    prepareReadingMeasure(measure: SourceMeasure, currentMeasureIndex: number): void;
    handleLineRepetitionInstructions(barlineNode: IXmlElement): boolean;
    handleRepetitionInstructionsFromWordsOrSymbols(directionTypeNode: IXmlElement, relativeMeasurePosition: number): boolean;
    removeRedundantInstructions(): void;
    private findInstructionInPreviousMeasure;
    private backwardSearchForPreviousIdenticalInstruction;
    private addInstruction;
}

interface IVoiceMeasureReadPlugin {
    measureReadCalculations(measureVoiceEntries: VoiceEntry[], activeKey: KeyInstruction, activeRhythm: RhythmInstruction): void;
}

declare class ReaderPluginManager {
    private voiceMeasureReadPlugins;
    addVoiceMeasureReadPlugin(plugin: IVoiceMeasureReadPlugin): void;
    processVoiceMeasureReadPlugins(measureVoiceEntries: VoiceEntry[], activeKey: KeyInstruction, currentRhythm: RhythmInstruction): void;
}

/**
 * An InstrumentReader is used during the reading phase to keep parsing new measures from the MusicXML file
 * with the readNextXmlMeasure method.
 */
declare class InstrumentReader {
    constructor(pluginManager: ReaderPluginManager, repetitionInstructionReader: RepetitionInstructionReader, xmlMeasureList: IXmlElement[], instrument: Instrument);
    private repetitionInstructionReader;
    private xmlMeasureList;
    private musicSheet;
    private slurReader;
    pluginManager: ReaderPluginManager;
    private instrument;
    private voiceGeneratorsDict;
    private staffMainVoiceGeneratorDict;
    private inSourceMeasureInstrumentIndex;
    private divisions;
    private currentMeasure;
    private previousMeasure;
    private currentClefNumber;
    private currentXmlMeasureIndex;
    private currentStaff;
    private currentStaffEntry;
    private activeClefs;
    private activeKey;
    private activeRhythm;
    private activeClefsHaveBeenInitialized;
    private activeKeyHasBeenInitialized;
    private abstractInstructions;
    private expressionReaders;
    private currentVoiceGenerator;
    private maxTieNoteFraction;
    private currentMultirestStartMeasure;
    private followingMultirestMeasures;
    get ActiveKey(): KeyInstruction;
    get MaxTieNoteFraction(): Fraction;
    get ActiveRhythm(): RhythmInstruction;
    set ActiveRhythm(value: RhythmInstruction);
    /**
     * Main CreateSheet: read the next XML Measure and save all data to the given [[SourceMeasure]].
     * @param currentMeasure
     * @param measureStartAbsoluteTimestamp - Using this instead of currentMeasure.AbsoluteTimestamp as it isn't set yet
     * @param octavePlusOne Software like Guitar Pro gives one octave too low, so we need to add one
     * @returns {boolean}
     */
    readNextXmlMeasure(currentMeasure: SourceMeasure, measureStartAbsoluteTimestamp: Fraction, octavePlusOne: boolean): boolean;
    private getStemDirectionAndColors;
    /** Parse a color in XML format. Can be #ARGB or #RGB format, colors as byte hex values.
     *  @return color in Vexflow format #[A]RGB or undefined for invalid xmlColorString
     */
    parseXmlColor(xmlColorString: string): string;
    doCalculationsAfterDurationHasBeenSet(): void;
    /**
     * Get or create the passing [[VoiceGenerator]].
     * @param voiceId
     * @param staffId
     * @returns {VoiceGenerator}
     */
    private getOrCreateVoiceGenerator;
    private createExpressionGenerators;
    /**
     * Create the default [[ClefInstruction]] for the given staff index.
     * @param staffIndex
     */
    private createDefaultClefInstruction;
    /**
     * Create the default [[KeyInstruction]] in case no [[KeyInstruction]] is given in the whole [[Instrument]].
     */
    private createDefaultKeyInstruction;
    /**
     * Check if the given attributesNode is at the begin of a XmlMeasure.
     * @param parentNode
     * @param attributesNode
     * @returns {boolean}
     */
    private isAttributesNodeAtBeginOfMeasure;
    /**
     * Check if the given attributesNode is at the end of a XmlMeasure.
     * @param parentNode
     * @param attributesNode
     * @returns {boolean}
     */
    private isAttributesNodeAtEndOfMeasure;
    /**
     * Called only when no noteDuration is given in XML.
     * @param xmlNode
     * @returns {Fraction}
     */
    private getNoteDurationFromTypeNode;
    /**
     * Add (the three basic) Notation Instructions to a list
     * @param attrNode
     * @param guitarPro
     */
    private addAbstractInstruction;
    /**
     * Save the current AbstractInstructions to the corresponding [[StaffEntry]]s.
     * @param numberOfStaves
     * @param beginOfMeasure
     */
    private saveAbstractInstructionList;
    /**
     * Save any ClefInstruction given - exceptionally - at the end of the currentMeasure.
     */
    private saveClefInstructionAtEndOfMeasure;
    /**
     * In case of a [[Tuplet]], read NoteDuration from type.
     * @param xmlNode
     * @returns {Fraction}
     */
    private getNoteDurationForTuplet;
    private readExpressionStaffNumber;
    /**
     * Calculate the divisions value from the type and duration of the first MeasureNote that makes sense
     * (meaning itself hasn't any errors and it doesn't belong to a [[Tuplet]]).
     *
     * If all the MeasureNotes belong to a [[Tuplet]], then we read the next XmlMeasure (and so on...).
     * If we have reached the end of the [[Instrument]] and still the divisions aren't set, we throw an exception
     * @returns {number}
     */
    private readDivisionsFromNotes;
    private getCueNoteAndNoteTypeXml;
    private getStemDirectionType;
    private getNoteHeadColorXml;
    private getNoteColorXml;
    private getTremoloInfo;
    private getVibratoStrokes;
    private getNoteStaff;
}

/**
 * Created by Matthias on 22.02.2017.
 */
interface IAfterSheetReadingModule {
    calculate(musicSheet: MusicSheet): void;
}

declare class MusicSheetReader {
    constructor(afterSheetReadingModules?: IAfterSheetReadingModule[], rules?: EngravingRules);
    private repetitionInstructionReader;
    private repetitionCalculator;
    private afterSheetReadingModules;
    private musicSheet;
    private completeNumberOfStaves;
    private currentMeasure;
    private previousMeasure;
    private currentFraction;
    private pluginManager;
    rules: EngravingRules;
    get PluginManager(): ReaderPluginManager;
    get CompleteNumberOfStaves(): number;
    static doCalculationsAfterDurationHasBeenSet(instrumentReaders: InstrumentReader[]): void;
    /**
     * Read a music XML file and saves the values in the MusicSheet class.
     * @param root
     * @param path
     * @returns {MusicSheet}
     */
    createMusicSheet(root: IXmlElement, path: string): MusicSheet;
    private _removeFromArray;
    private trimString;
    private _lastElement;
    private _createMusicSheet;
    private initializeReading;
    /**
     * Check if all (should there be any apart from the first Measure) [[RhythmInstruction]]s in the [[SourceMeasure]] are the same.
     *
     * If not, then the max [[RhythmInstruction]] (Fraction) is set to all staves.
     * Also, if it happens to have the same [[RhythmInstruction]]s in RealValue but given in Symbol AND Fraction, then the Fraction prevails.
     * @param instrumentReaders
     */
    private checkIfRhythmInstructionsAreSetAndEqual;
    /**
     * True in case of 4/4 and COMMON TIME (or 2/2 and CUT TIME)
     * @param rhythmInstructions
     * @returns {boolean}
     */
    private areRhythmInstructionsMixed;
    /**
     * Set the [[Measure]]'s duration taking into account the longest [[Instrument]] duration and the active Rhythm read from XML.
     * @param instrumentReaders
     * @param sourceMeasureCounter
     * @returns {number}
     */
    private setSourceMeasureDuration;
    /**
     * Check the Fractions for Equivalence and if so, sets maxInstrumentDuration's members accordingly.
     * *
     * Example: if maxInstrumentDuration = 1/1 and sourceMeasureDuration = 4/4, maxInstrumentDuration becomes 4/4.
     * @param maxInstrumentDuration
     * @param activeRhythm
     */
    private checkFractionsForEquivalence;
    /**
     * Handle the case of an implicit [[SourceMeasure]].
     * @param maxInstrumentDuration
     * @param activeRhythm
     * @returns {boolean}
     */
    private checkIfMeasureIsImplicit;
    /**
     * Check the Duration of all the given Instruments.
     * @param instrumentsDurations
     * @param maxInstrumentDuration
     * @returns {boolean}
     */
    private allInstrumentsHaveSameDuration;
    private graphicalMeasureIsEmpty;
    /**
     * Check a [[SourceMeasure]] for possible empty / undefined entries ([[VoiceEntry]], [[SourceStaffEntry]], VerticalContainer)
     * (caused from TieAlgorithm removing EndTieNote) and removes them if completely empty / null
     */
    private checkSourceMeasureForNullEntries;
    /**
     * Read the XML file and creates the main sheet Labels.
     * @param root
     * @param filePath
     */
    private pushSheetLabels;
    private presentAttrsWithValue;
    private readComposer;
    private readCopyright;
    private readTitleAndComposerFromCredits;
    /** @deprecated Old OSMD < 1.8.6 way of parsing composer + subtitles,
     * ignores multiline composer + subtitles, uses XML identification tags instead.
     * Will probably be removed soon.
     */
    private readTitleAndComposerFromCreditsLegacy;
    private computeSystemYCoordinates;
    private readTitle;
    /**
     * Build the [[InstrumentalGroup]]s and [[Instrument]]s.
     * @param entryList
     * @returns {{}}
     */
    private createInstrumentGroups;
    /**
     * Read from each xmlInstrumentPart the first xmlMeasure in order to find out the [[Instrument]]'s number of Staves
     * @param partInst
     * @returns {number} - Complete number of Staves for all Instruments.
     */
    private getCompleteNumberOfStavesFromXml;
    /**
     * Read from XML for a single [[Instrument]] the first xmlMeasure in order to find out the Instrument's number of Staves.
     * @param partNode
     * @returns {number}
     */
    private getInstrumentNumberOfStavesFromXml;
}

declare class RepetitionCalculator {
    private musicSheet;
    private repetitionInstructions;
    private currentMeasure;
    private currentMeasureIndex;
    /**
     * Is called when all repetition symbols have been read from xml.
     * Creates the repetition instructions and adds them to the corresponding measure.
     * Creates the logical repetition objects for iteration and playback.
     * @param musicSheet
     * @param repetitionInstructions
     */
    calculateRepetitions(musicSheet: MusicSheet, repetitionInstructions: RepetitionInstruction[]): void;
    private handleRepetitionInstructions;
}

declare class MusicSymbolModuleFactory {
    static createRepetitionInstructionReader(): RepetitionInstructionReader;
    static createRepetitionCalculator(): RepetitionCalculator;
}

declare class SlurReader {
    private musicSheet;
    private openSlurDict;
    constructor(musicSheet: MusicSheet);
    addSlur(slurNodes: IXmlElement[], currentNote: Note): void;
}

declare class VoiceGenerator {
    constructor(pluginManager: ReaderPluginManager, staff: Staff, voiceId: number, slurReader: SlurReader, mainVoice?: Voice);
    pluginManager: ReaderPluginManager;
    private slurReader;
    private lyricsReader;
    private articulationReader;
    private musicSheet;
    private voice;
    private currentVoiceEntry;
    private currentNote;
    private currentMeasure;
    private currentStaffEntry;
    private staff;
    private instrument;
    private openBeams;
    private beamNumberOffset;
    private get openTieDict();
    private currentOctaveShift;
    private tupletDict;
    private openTupletNumber;
    get GetVoice(): Voice;
    get OctaveShift(): number;
    set OctaveShift(value: number);
    /**
     * Create new [[VoiceEntry]], add it to given [[SourceStaffEntry]] and if given so, to [[Voice]].
     * @param musicTimestamp
     * @param parentStaffEntry
     * @param addToVoice
     * @param isGrace States whether the new VoiceEntry (only) has grace notes
     */
    createVoiceEntry(musicTimestamp: Fraction, parentStaffEntry: SourceStaffEntry, addToVoice: boolean, isGrace?: boolean, graceNoteSlash?: boolean, graceSlur?: boolean): void;
    /**
     * Create [[Note]]s and handle Lyrics, Articulations, Beams, Ties, Slurs, Tuplets.
     * @param noteNode
     * @param noteDuration
     * @param divisions
     * @param restNote
     * @param parentStaffEntry
     * @param parentMeasure
     * @param measureStartAbsoluteTimestamp
     * @param maxTieNoteFraction
     * @param chord
     * @param octavePlusOne Software like Guitar Pro gives one octave too low, so we need to add one
     * @param printObject whether the note should be rendered (true) or invisible (false)
     * @returns {Note}
     */
    read(noteNode: IXmlElement, noteDuration: Fraction, typeDuration: Fraction, noteTypeXml: NoteType, normalNotes: number, restNote: boolean, parentStaffEntry: SourceStaffEntry, parentMeasure: SourceMeasure, measureStartAbsoluteTimestamp: Fraction, maxTieNoteFraction: Fraction, chord: boolean, octavePlusOne: boolean, printObject: boolean, isCueNote: boolean, isGraceNote: boolean, stemDirectionXml: StemDirectionType, tremoloInfo: TremoloInfo, stemColorXml: string, noteheadColorXml: string, vibratoStrokes: boolean, dotsXml: number): Note;
    /**
     * Create a new [[StaffEntryLink]] and sets the currenstStaffEntry accordingly.
     * @param index
     * @param currentStaff
     * @param currentStaffEntry
     * @param currentMeasure
     * @returns {SourceStaffEntry}
     */
    checkForStaffEntryLink(index: number, currentStaff: Staff, currentStaffEntry: SourceStaffEntry, currentMeasure: SourceMeasure): SourceStaffEntry;
    checkForOpenBeam(): void;
    /** Check/delete open ties that don't exceed measure duration. Currently unused as it's incorrect, see below. */
    checkOpenTies(): void;
    hasVoiceEntry(): boolean;
    private readArticulations;
    /**
     * Create a new [[Note]] and adds it to the currentVoiceEntry
     * @param node
     * @param noteDuration
     * @param divisions
     * @param chord
     * @param octavePlusOne Software like Guitar Pro gives one octave too low, so we need to add one
     * @returns {Note}
     */
    private addSingleNote;
    /**
     * Create a new rest note and add it to the currentVoiceEntry.
     * @param noteDuration
     * @param divisions
     * @returns {Note}
     */
    private addRestNote;
    private addNoteInfo;
    /**
     * Handle the currentVoiceBeam.
     * @param node
     * @param note
     */
    private createBeam;
    private endBeam;
    /**
     * Check for open [[Beam]]s at end of [[SourceMeasure]] and closes them explicity.
     */
    private handleOpenBeam;
    /**
     * Create a [[Tuplet]].
     * @param node
     * @param tupletNodeList
     * @returns {number}
     */
    private addTuplet;
    private readShowNumberNoneGiven;
    /**
     * This method handles the time-modification IXmlElement for the Tuplet case (tupletNotes not at begin/end of Tuplet).
     * @param noteNode
     */
    private handleTimeModificationNode;
    private addTie;
    private getTieDirection;
    /**
     * Find the next free int (starting from 0) to use as key in TieDict.
     * @returns {number}
     */
    private getNextAvailableNumberForTie;
    /**
     * Search the tieDictionary for the corresponding candidateNote to the currentNote (same FundamentalNote && Octave).
     * @param candidateNote
     * @returns {number}
     */
    private findCurrentNoteInTieDict;
    /**
     * Calculate the normal duration of a [[Tuplet]] note.
     * @param xmlNode
     * @returns {any}
     */
    private getTupletNoteDurationFromType;
}

declare class ArticulationReader {
    private rules;
    constructor(rules: EngravingRules);
    private getAccEnumFromString;
    /**
     * This method adds an Articulation Expression to the currentVoiceEntry.
     * @param node
     * @param currentVoiceEntry
     */
    addArticulationExpression(node: IXmlElement, currentVoiceEntry: VoiceEntry): void;
    /**
     * This method add a Fermata to the currentVoiceEntry.
     * @param xmlNode
     * @param currentVoiceEntry
     */
    addFermata(xmlNode: IXmlElement, currentVoiceEntry: VoiceEntry): void;
    /**
     * This method add a technical Articulation to the currentVoiceEntry.
     * @param technicalNode
     * @param currentVoiceEntry
     */
    addTechnicalArticulations(technicalNode: IXmlElement, currentVoiceEntry: VoiceEntry, currentNote: Note): void;
    private createTechnicalInstruction;
    private getPlacement;
    /**
     * This method adds an Ornament to the currentVoiceEntry.
     * @param ornamentsNode
     * @param currentVoiceEntry
     */
    addOrnament(ornamentsNode: IXmlElement, currentVoiceEntry: VoiceEntry): void;
}

declare class ChordSymbolReader {
    static readChordSymbol(xmlNode: IXmlElement, musicSheet: MusicSheet, activeKey: KeyInstruction): ChordSymbolContainer;
    static readPlacement(node: IXmlElement): PlacementEnum;
}

declare class ExpressionReader {
    private musicSheet;
    private placement;
    private soundTempo;
    private soundDynamic;
    private divisions;
    private offsetDivisions;
    private staffNumber;
    private globalStaffIndex;
    private directionTimestamp;
    private currentMultiTempoExpression;
    private openContinuousDynamicExpressions;
    private openContinuousTempoExpression;
    private activeInstantaneousDynamic;
    private openOctaveShift;
    private lastWedge;
    private WedgeYPosXml;
    private openPedal;
    constructor(musicSheet: MusicSheet, instrument: Instrument, staffNumber: number);
    getMultiExpression: MultiExpression;
    readExpressionParameters(xmlNode: IXmlElement, currentInstrument: Instrument, divisions: number, inSourceMeasureCurrentFraction: Fraction, inSourceMeasureFormerFraction: Fraction, currentMeasureIndex: number, ignoreDivisionsOffset: boolean): void;
    read(directionNode: IXmlElement, currentMeasure: SourceMeasure, inSourceMeasureCurrentFraction: Fraction, inSourceMeasurePreviousFraction?: Fraction): void;
    /** Usually called at end of last measure. */
    closeOpenExpressions(sourceMeasure: SourceMeasure, timestamp: Fraction): void;
    addOctaveShift(directionNode: IXmlElement, currentMeasure: SourceMeasure, endTimestamp: Fraction): void;
    addPedalMarking(directionNode: IXmlElement, currentMeasure: SourceMeasure, endTimestamp: Fraction): void;
    private endOpenPedal;
    private initialize;
    private readPlacement;
    private readExpressionPlacement;
    private readPosition;
    private interpretInstantaneousDynamics;
    private interpretWords;
    private readNumber;
    private interpretWedge;
    private interpretRehearsalMark;
    private createNewMultiExpressionIfNeeded;
    private createNewTempoExpressionIfNeeded;
    private addWedge;
    private fillMultiOrTempoExpression;
    private createExpressionFromString;
    private closeOpenContinuousDynamic;
    private closeOpenContinuousTempo;
    private checkIfWordsNodeIsRepetitionInstruction;
    private hasDigit;
}

declare class LyricsReader {
    private openLyricWords;
    private currentLyricWord;
    private musicSheet;
    constructor(musicSheet: MusicSheet);
    /**
     * This method adds a single LyricEntry to a VoiceEntry
     * @param {IXmlElement[]} lyricNodeList
     * @param {VoiceEntry} currentVoiceEntry
     */
    addLyricEntry(lyricNodeList: IXmlElement[], currentVoiceEntry: VoiceEntry): void;
}

declare class AlignmentManager {
    private parentStaffline;
    private rules;
    constructor(staffline: StaffLine);
    alignDynamicExpressions(): void;
    /**
     * Get distance between two bounding boxes
     * @param a First bounding box
     * @param b Second bounding box
     */
    private getDistance;
    /**
     * Get overlap of two bounding boxes
     * @param a First bounding box
     * @param b Second bounding box
     */
    private getOverlap;
}

declare class GraphicalInstantaneousTempoExpression extends AbstractGraphicalExpression {
    constructor(tempoExpresssion: AbstractTempoExpression, label: GraphicalLabel);
    get GraphicalLabel(): GraphicalLabel;
    updateSkyBottomLine(): void;
}

declare class MusicSystemBuilder {
    protected measureList: GraphicalMeasure[][];
    protected graphicalMusicSheet: GraphicalMusicSheet;
    protected currentSystemParams: SystemBuildParameters;
    protected numberOfVisibleStaffLines: number;
    protected rules: EngravingRules;
    protected measureListIndex: number;
    protected musicSystems: MusicSystem[];
    /**
     * Does the mapping from the currently visible staves to the global staff-list of the music sheet.
     */
    protected visibleStaffIndices: number[];
    protected activeRhythm: RhythmInstruction[];
    protected activeKeys: KeyInstruction[];
    protected activeClefs: ClefInstruction[];
    protected globalSystemIndex: number;
    protected leadSheet: boolean;
    initialize(graphicalMusicSheet: GraphicalMusicSheet, measureList: GraphicalMeasure[][], numberOfStaffLines: number): void;
    buildMusicSystems(): MusicSystem[];
    /**
     * calculates the y positions of the staff lines within a system and
     * furthermore the y positions of the systems themselves.
     */
    calculateSystemYLayout(): void;
    /**
     * Set the Width of the staff-Measures of one source measure.
     * @param graphicalMeasures
     * @param width
     * @param beginInstrWidth
     * @param endInstrWidth
     */
    protected setMeasureWidth(graphicalMeasures: GraphicalMeasure[], width: number, beginInstrWidth: number, endInstrWidth: number): void;
    /**
     * When the actual source measure doesn't fit any more, this method finalizes the current system and
     * opens up a new empty system, where the actual measure will be added in the next iteration.
     * @param measures
     * @param isPartEndingSystem
     */
    protected finalizeCurrentAndCreateNewSystem(measures: GraphicalMeasure[], systemEndsPart?: boolean, checkExtraInstructionMeasure?: boolean, startNewPage?: boolean): void;
    protected finalizeCurrentSystem(measures: GraphicalMeasure[], systemEndsPart?: boolean, checkExtraInstructionMeasure?: boolean, startNewPage?: boolean): void;
    /**
     * If a line repetition is ending and a new line repetition is starting at the end of the system,
     * the double repetition line has to be split into two: one at the currently ending system and
     * one at the next system.
     * (this should be refactored at some point to not use a combined end/start line but always separated lines)
     */
    protected adaptRepetitionLineWithIfNeeded(): void;
    protected addMeasureToSystem(graphicalMeasures: GraphicalMeasure[], measureStartLine: SystemLinesEnum, measureEndLine: SystemLinesEnum, totalMeasureWidth: number, currentMeasureBeginInstructionsWidth: number, currentVarWidth: number, currentMeasureEndInstructionsWidth: number): void;
    /**
     * Initialize a new [[MusicSystem]].
     * @returns {MusicSystem}
     */
    protected initMusicSystem(): MusicSystem;
    /**
     * Get the width the system should have for a given page width.
     * @returns {number}
     */
    protected getFullPageSystemWidth(): number;
    protected layoutSystemStaves(musicSystem: MusicSystem): void;
    /**
     * Calculate the [[StaffLine]](s) needed for a [[MusicSystem]].
     * @param musicSystem
     * @param relativeYPosition
     * @param staff
     */
    protected addStaffLineToMusicSystem(musicSystem: MusicSystem, relativeYPosition: number, staff: Staff): void;
    /**
     * Initialize the active Instructions from the first [[SourceMeasure]] of first [[SourceMusicPart]].
     * @param measureList
     */
    protected initializeActiveInstructions(measureList: GraphicalMeasure[]): void;
    protected transposeKeyInstruction(keyInstruction: KeyInstruction, graphicalMeasure: GraphicalMeasure): KeyInstruction;
    /**
     * Calculate the width needed for Instructions (Key, Clef, Rhythm, Repetition) for the measure.
     * @param measures
     * @param isSystemFirstMeasure
     * @param isFirstSourceMeasure
     * @returns {number}
     */
    protected addBeginInstructions(measures: GraphicalMeasure[], isSystemFirstMeasure: boolean, isFirstSourceMeasure: boolean): number;
    /**
     * Calculates the width needed for Instructions (Clef, Repetition) for the measure.
     * @param measures
     * @returns {number}
     */
    protected addEndInstructions(measures: GraphicalMeasure[]): number;
    protected AddInstructionsAtMeasureBegin(firstEntry: SourceStaffEntry, measure: GraphicalMeasure, visibleStaffIdx: number, isFirstSourceMeasure: boolean, isSystemStartMeasure: boolean): number;
    protected addInstructionsAtMeasureEnd(lastEntry: SourceStaffEntry, measure: GraphicalMeasure, measures: GraphicalMeasure[]): number;
    /**
     * Track down and update the active ClefInstruction in Measure's StaffEntries.
     * This has to be done after the measure is added to a system
     * (otherwise already the check if the measure fits to the system would update the active clefs..)
     * @param measure
     * @param graphicalMeasures
     */
    protected updateActiveClefs(measure: SourceMeasure, graphicalMeasures: GraphicalMeasure[]): void;
    /**
     * Check if an extra Instruction [[Measure]] is needed.
     * @param measures
     */
    protected checkAndCreateExtraInstructionMeasure(measures: GraphicalMeasure[]): void;
    protected addExtraInstructionMeasure(visStaffIdx: number, keyInstruction: KeyInstruction, rhythmInstruction: RhythmInstruction): number;
    /**
     * Add all current vertical Measures to currentSystem.
     * @param graphicalMeasures
     */
    protected addStaveMeasuresToSystem(graphicalMeasures: GraphicalMeasure[]): void;
    /**
     * Return the width of the corresponding [[SystemLine]] and set the corresponding [[SystemLineEnum]].
     * @returns {SystemLinesEnum}
     */
    protected getMeasureStartLine(): SystemLinesEnum;
    protected getMeasureEndLine(): SystemLinesEnum;
    /**
     * Return the width of the corresponding [[SystemLine]] and sets the corresponding [[SystemLineEnum]].
     * @param measure
     * @param systemLineEnum
     * @param isSystemStartMeasure
     * @returns {number}
     */
    protected getLineWidth(measure: GraphicalMeasure, systemLineEnum: SystemLinesEnum, isSystemStartMeasure: boolean): number;
    protected previousMeasureEndsLineRepetition(): boolean;
    /**
     * Check if at this [[Measure]] starts a [[Repetition]].
     * @returns {boolean}
     */
    protected thisMeasureBeginsLineRepetition(): boolean;
    /**
     * Check if a [[Repetition]] starts at the next [[Measure]].
     * @returns {boolean}
     */
    protected nextMeasureBeginsLineRepetition(): boolean;
    /**
     * Check if this [[Measure]] is a [[Repetition]] ending.
     * @returns {boolean}
     */
    protected thisMeasureEndsLineRepetition(): boolean;
    /**
     * Check if a [[Repetition]] starts at the next [[Measure]].
     * @returns {boolean}
     */
    protected nextMeasureBeginsWordRepetition(): boolean;
    /**
     * Check if this [[Measure]] is a [[Repetition]] ending.
     * @returns {boolean}
     */
    protected thisMeasureEndsWordRepetition(): boolean;
    /**
     * Check if the next [[Measure]] has a [[KeyInstruction]] change.
     * @returns {boolean}
     */
    protected nextMeasureHasKeyInstructionChange(): boolean;
    protected getNextMeasureKeyInstruction(): KeyInstruction;
    /**
     * Calculate the X ScalingFactor in order to strech the whole System.
     * @param systemFixWidth
     * @param systemVarWidth
     * @returns {number}
     */
    protected calculateXScalingFactor(systemFixWidth: number, systemVarWidth: number): number;
    /**
     * Stretch the whole System so that no white space is left at the end.
     * @param systemEndsPart
     */
    protected stretchMusicSystem(systemEndsPart: boolean): void;
    /**
     * If the last [[MusicSystem]] doesn't need stretching, then this method decreases the System's Width,
     * the [[StaffLine]]'s Width and the 5 [[StaffLine]]s length.
     */
    protected decreaseMusicSystemBorders(): void;
    /**
     * This method updates the System's StaffLine's RelativePosition (starting from the given index).
     * @param musicSystem
     * @param index
     * @param value
     */
    protected updateStaffLinesRelativePosition(musicSystem: MusicSystem, index: number, value: number): void;
    /**
     * Create a new [[GraphicalMusicPage]]
     * (for now only one long page is used per music sheet, as we scroll down and have no page flips)
     * @returns {GraphicalMusicPage}
     */
    protected createMusicPage(): GraphicalMusicPage;
    protected addSystemToPage(page: GraphicalMusicPage, system: MusicSystem): void;
    /**
     * This method checks the distances between any two consecutive StaffLines of a System and if needed, shifts the lower one down.
     * @param musicSystem
     */
    protected optimizeDistanceBetweenStaffLines(musicSystem: MusicSystem): void;
    /** Calculates the relative Positions of all MusicSystems.
     *
     */
    protected calculateMusicSystemsRelativePositions(): void;
    /**
     * Finds the minimum required distance between two systems
     * with the help of the sky- and bottom lines
     * @param upperSystem
     * @param lowerSystem
     */
    private findRequiredDistanceWithSkyBottomLine;
}
declare class SystemBuildParameters {
    currentSystem: MusicSystem;
    systemMeasures: MeasureBuildParameters[];
    systemMeasureIndex: number;
    currentWidth: number;
    currentSystemFixWidth: number;
    currentSystemVarWidth: number;
    maxLabelLength: number;
    IsSystemStartMeasure(): boolean;
}
declare class MeasureBuildParameters {
    beginLine: SystemLinesEnum;
    endLine: SystemLinesEnum;
}

declare class OctaveShiftParams {
    constructor(openOctaveShift: OctaveShift, absoluteStartTimestamp: Fraction, absoluteEndTimestamp: Fraction);
    getOpenOctaveShift: OctaveShift;
    getAbsoluteStartTimestamp: Fraction;
    getAbsoluteEndTimestamp: Fraction;
}

declare class StaffLineActivitySymbol extends GraphicalObject {
    constructor(staffLine: StaffLine);
    parentStaffLine: StaffLine;
}

import VF$8 = Vex.Flow;

declare class CanvasVexFlowBackend extends VexFlowBackend {
    private zoom;
    constructor(rules: EngravingRules);
    getVexflowBackendType(): VF$8.Renderer.Backends;
    getOSMDBackendType(): BackendType;
    getCanvasSize(): number;
    initialize(container: HTMLElement, zoom: number): void;
    /**
     * Initialize a canvas without attaching it to a DOM node. Can be used to draw in background
     * @param width Width of the canvas
     * @param height Height of the canvas
     */
    initializeHeadless(width?: number, height?: number): void;
    getContext(): VF$8.CanvasContext;
    free(): void;
    clear(): void;
    scale(k: number): void;
    translate(x: number, y: number): void;
    renderText(fontHeight: number, fontStyle: FontStyles, font: Fonts, text: string, heightInPixel: number, screenPosition: PointF2D, color?: string, fontFamily?: string): Node;
    renderRectangle(rectangle: RectangleF2D, styleId: number, colorHex: string, alpha?: number): Node;
    renderLine(start: PointF2D, stop: PointF2D, color?: string, lineWidth?: number, id?: string): Node;
    renderCurve(points: PointF2D[]): Node;
    renderPath(points: PointF2D[], fill?: boolean, id?: string): Node;
    private ctx;
    get CanvasRenderingCtx(): CanvasRenderingContext2D;
}

import VF$7 = Vex.Flow;

declare class SvgVexFlowBackend extends VexFlowBackend {
    private ctx;
    zoom: number;
    constructor(rules: EngravingRules);
    getVexflowBackendType(): VF$7.Renderer.Backends;
    getOSMDBackendType(): BackendType;
    getCanvasSize(): number;
    initialize(container: HTMLElement, zoom: number): void;
    getContext(): VF$7.SVGContext;
    getSvgElement(): SVGElement;
    removeNode(node: Node): boolean;
    free(): void;
    clear(): void;
    scale(k: number): void;
    translate(x: number, y: number): void;
    renderText(fontHeight: number, fontStyle: FontStyles, font: Fonts, text: string, heightInPixel: number, screenPosition: PointF2D, color?: string, fontFamily?: string): Node;
    renderRectangle(rectangle: RectangleF2D, styleId: number, colorHex: string, alpha?: number): Node;
    renderLine(start: PointF2D, stop: PointF2D, color?: string, lineWidth?: number, id?: string): Node;
    renderCurve(points: PointF2D[], isSlur?: boolean, startNote?: VexFlowGraphicalNote): Node;
    renderPath(points: PointF2D[], fill?: boolean, id?: string): Node;
    export(): void;
}

import VF$6 = Vex.Flow;

/**
 * Helper class, which contains static methods which actually convert
 * from OSMD objects to VexFlow objects.
 */
declare class VexFlowConverter {
    /**
     * Mapping from numbers of alterations on the key signature to major keys
     * @type {[alterationsNo: number]: string; }
     */
    private static majorMap;
    /**
     * Mapping from numbers of alterations on the key signature to minor keys
     * @type {[alterationsNo: number]: string; }
     */
    private static minorMap;
    /**
     * Convert a fraction to Vexflow string durations.
     * A duration like 5/16 (5 16th notes) can't be represented by a single (dotted) note,
     *   so we need to return multiple durations (e.g. for 5/16th ghost notes).
     * Currently, for a dotted quarter ghost note, we return a quarter and an eighth ghost note.
     *   We could return a dotted quarter instead, but then the code would need to distinguish between
     *   notes that can be represented as dotted notes and notes that can't, which would complicate things.
     *   We could e.g. add a parameter "allowSingleDottedNote" which makes it possible to return single dotted notes instead.
     * But currently, this is only really used for Ghost notes, so it doesn't make a difference visually.
     *   (for other uses like StaveNotes, we calculate the dots separately)
     * @param fraction a fraction representing the duration of a note
     * @returns {string[]} Vexflow note type strings (e.g. "h" = half note)
     */
    static durations(fraction: Fraction, isTuplet: boolean): string[];
    /**
     * Takes a Pitch and returns a string representing a VexFlow pitch,
     * which has the form "b/4", plus its alteration (accidental)
     * @param pitch
     * @returns {string[]}
     */
    static pitch(pitch: Pitch, isRest: boolean, clef: ClefInstruction, notehead?: Notehead, octaveOffsetGiven?: number): [string, string, ClefInstruction];
    static restToNotePitch(pitch: Pitch, clefType: ClefEnum): Pitch;
    /** returns the Vexflow code for a note head. Some are still unsupported, see Vexflow/tables.js */
    static NoteHeadCode(notehead: Notehead): string;
    static GhostNotes(frac: Fraction): VF$6.GhostNote[];
    /**
     * Convert a GraphicalVoiceEntry to a VexFlow StaveNote
     * @param gve the GraphicalVoiceEntry which can hold a note or a chord on the staff belonging to one voice
     * @returns {VF.StaveNote}
     */
    static StaveNote(gve: GraphicalVoiceEntry): VF$6.StaveNote;
    static generateArticulations(vfnote: VF$6.StemmableNote, gNote: GraphicalNote, rules: EngravingRules): void;
    static generateOrnaments(vfnote: VF$6.StemmableNote, oContainer: OrnamentContainer): void;
    static StrokeTypeFromArpeggioType(arpeggioType: ArpeggioType): VF$6.Stroke.Type;
    /**
     * Convert a set of GraphicalNotes to a VexFlow StaveNote
     * @param notes form a chord on the staff
     * @returns {VF.StaveNote}
     */
    static CreateTabNote(gve: GraphicalVoiceEntry): VF$6.TabNote;
    /**
     * Convert a ClefInstruction to a string represention of a clef type in VexFlow.
     *
     * @param clef The OSMD object to be converted representing the clef
     * @param size The VexFlow size to be used. Can be `default` or `small`.
     * As soon as #118 is done, this parameter will be dispensable.
     * @returns    A string representation of a VexFlow clef
     * @see        https://github.com/0xfe/vexflow/blob/master/src/clef.js
     * @see        https://github.com/0xfe/vexflow/blob/master/tests/clef_tests.js
     */
    static Clef(clef: ClefInstruction, size?: string): {
        type: string;
        size: string;
        annotation: string;
    };
    /**
     * Convert a RhythmInstruction to a VexFlow TimeSignature object
     * @param rhythm
     * @returns {VF.TimeSignature}
     * @constructor
     */
    static TimeSignature(rhythm: RhythmInstruction): VF$6.TimeSignature;
    /**
     * Convert a KeyInstruction to a string representing in VexFlow a key
     * @param key
     * @returns {string}
     */
    static keySignature(key: KeyInstruction): string;
    /**
     * Converts a lineType to a VexFlow StaveConnector type
     * @param lineType
     * @returns {any}
     */
    static line(lineType: SystemLinesEnum, linePosition: SystemLinePosition): any;
    /**
     * Construct a string which can be used in a CSS font property
     * @param fontSize
     * @param fontStyle
     * @param font
     * @returns {string}
     */
    static font(fontSize: number, fontStyle: FontStyles, font: Fonts, rules: EngravingRules, fontFamily?: string): string;
    /**
     * Converts the style into a string that VexFlow RenderContext can understand
     * as the weight of the font
     */
    static fontStyle(style: FontStyles): string;
    /**
     * Convert OutlineAndFillStyle to CSS properties
     * @param styleId
     * @returns {string}
     */
    static style(styleId: OutlineAndFillStyleEnum): string;
}

import VF$5 = Vex.Flow;
declare class VexFlowGlissando extends GraphicalGlissando {
    vfTie: VF$5.StaveTie;
}

declare class VexFlowGraphicalSymbolFactory implements IGraphicalSymbolFactory {
    /**
     * Create a new music system for the given page.
     * Currently only one vertically endless page exists where all systems are put to.
     * @param page
     * @param systemIndex
     * @returns {VexFlowMusicSystem}
     */
    createMusicSystem(systemIndex: number, rules: EngravingRules): MusicSystem;
    /**
     * Create a staffline object containing all staff measures belonging to a given system and staff.
     * @param parentSystem
     * @param parentStaff
     * @returns {VexFlowStaffLine}
     */
    createStaffLine(parentSystem: MusicSystem, parentStaff: Staff): StaffLine;
    /**
     * Construct an empty graphicalMeasure from the given source measure and staff.
     * @param sourceMeasure
     * @param staff
     * @returns {VexFlowMeasure}
     */
    createGraphicalMeasure(sourceMeasure: SourceMeasure, staff: Staff, isTabMeasure?: boolean): GraphicalMeasure;
    /**
     * Construct a MultiRestMeasure from the given source measure and staff.
     * @param sourceMeasure
     * @param staff
     * @returns {VexFlowMultiRestMeasure}
     */
    createMultiRestMeasure(sourceMeasure: SourceMeasure, staff: Staff, staffLine?: StaffLine): GraphicalMeasure;
    /**
     * Construct an empty Tab staffMeasure from the given source measure and staff.
     * @param sourceMeasure
     * @param staff
     * @returns {VexFlowTabMeasure}
     */
    createTabStaffMeasure(sourceMeasure: SourceMeasure, staff: Staff): GraphicalMeasure;
    /**
     * Create empty measure, which will be used to show key, rhythm changes at the end of the system.
     * @param staffLine
     * @returns {VexFlowMeasure}
     */
    createExtraGraphicalMeasure(staffLine: StaffLine): GraphicalMeasure;
    /**
     * Create a staffEntry in the given measure for a given sourceStaffEntry.
     * @param sourceStaffEntry
     * @param measure
     * @returns {VexFlowStaffEntry}
     */
    createStaffEntry(sourceStaffEntry: SourceStaffEntry, measure: GraphicalMeasure): GraphicalStaffEntry;
    createVoiceEntry(parentVoiceEntry: VoiceEntry, parentStaffEntry: GraphicalStaffEntry): GraphicalVoiceEntry;
    /**
     * Create a Graphical Note for given note and clef and as part of graphicalStaffEntry.
     * @param note
     * @param numberOfDots  The number of dots the note has to increase its musical duration.
     * @param graphicalStaffEntry
     * @param activeClef    The currently active clef, needed for positioning the note vertically
     * @param octaveShift   The currently active octave transposition enum, needed for positioning the note vertically
     * @returns {GraphicalNote}
     */
    createNote(note: Note, graphicalVoiceEntry: GraphicalVoiceEntry, activeClef: ClefInstruction, octaveShift: OctaveEnum, rules: EngravingRules, graphicalNoteLength?: Fraction): GraphicalNote;
    /**
     * Create a Graphical Grace Note (smaller head, stem...) for given note and clef and as part of graphicalStaffEntry.
     * @param note
     * @param numberOfDots
     * @param graphicalVoiceEntry
     * @param activeClef
     * @param octaveShift
     * @returns {GraphicalNote}
     */
    createGraceNote(note: Note, graphicalVoiceEntry: GraphicalVoiceEntry, activeClef: ClefInstruction, rules: EngravingRules, octaveShift?: OctaveEnum): GraphicalNote;
    /**
     * Sets a pitch which will be used for rendering the given graphical note (not changing the original pitch of the note!!!).
     * Will be only called if the displayed accidental is different from the original (e.g. a C# with C# as key instruction)
     * @param graphicalNote
     * @param pitch The pitch which will be rendered.
     */
    addGraphicalAccidental(graphicalNote: GraphicalNote, pitch: Pitch): void;
    /**
     * Adds a Fermata symbol at the last note of the given tied Note.
     * The last graphical note of this tied note is located at the given graphicalStaffEntry.
     * A Fermata has to be located at the last tied note.
     * @param tiedNote
     * @param graphicalStaffEntry
     */
    addFermataAtTiedEndNote(tiedNote: Note, graphicalStaffEntry: GraphicalStaffEntry): void;
    /**
     * Adds a clef change within a measure before the given staff entry.
     * @param graphicalStaffEntry
     * @param clefInstruction
     */
    createInStaffClef(graphicalStaffEntry: GraphicalStaffEntry, clefInstruction: ClefInstruction): void;
    /**
     * Adds a chord symbol at the given staff entry
     * @param sourceStaffEntry
     * @param graphicalStaffEntry
     * @param transposeHalftones
     */
    createChordSymbols(sourceStaffEntry: SourceStaffEntry, graphicalStaffEntry: GraphicalStaffEntry, keyInstruction: KeyInstruction, transposeHalftones: number): void;
    /**
     * Adds a technical instruction at the given staff entry.
     * @param technicalInstruction
     * @param graphicalStaffEntry
     */
    createGraphicalTechnicalInstruction(technicalInstruction: TechnicalInstruction, graphicalStaffEntry: GraphicalStaffEntry): void;
}

declare class VexFlowInstantaneousDynamicExpression extends GraphicalInstantaneousDynamicExpression {
    constructor(instantaneousDynamicExpression: InstantaneousDynamicExpression, staffLine: StaffLine, measure: GraphicalMeasure);
    get InstantaneousDynamic(): InstantaneousDynamicExpression;
    get Expression(): string;
}

import VF$4 = Vex.Flow;

interface ICurveOptions {
    spacing: number;
    thickness: number;
    x_shift: number;
    y_shift: number;
    position: CurvePositionEnum;
    position_end: CurvePositionEnum;
    invert: boolean;
    cps: [{
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }];
}
declare enum CurvePositionEnum {
    NEAR_HEAD = 1,
    NEAR_TOP = 2
}
declare class VexFlowSlur {
    constructor(parentslur: Slur);
    /**
     * Copy constructor: generate a VexFlowSlur from an existing one
     */
    static createFromVexflowSlur(vfSlur: VexFlowSlur): VexFlowSlur;
    get vfSlur(): Slur;
    private parentSlur;
    vfStartNote: VF$4.StemmableNote;
    vfEndNote: VF$4.StemmableNote;
    vfCurve: VF$4.Curve;
    curve_Options(): ICurveOptions;
    createVexFlowCurve(): void;
}

declare class VexFlowStaffLine extends StaffLine {
    constructor(parentSystem: MusicSystem, parentStaff: Staff);
    protected slursInVFStaffLine: VexFlowSlur[];
    protected alignmentManager: AlignmentManager;
    get SlursInVFStaffLine(): VexFlowSlur[];
    addVFSlurToVFStaffline(vfSlur: VexFlowSlur): void;
    get AlignmentManager(): AlignmentManager;
}

import VF$3 = Vex.Flow;

/**
 * Class that defines a instrument bracket at the beginning of a line.
 */
declare class VexFlowInstrumentBracket extends GraphicalObject {
    vexflowConnector: VF$3.StaveConnector;
    Visible: boolean;
    constructor(firstVexFlowStaffLine: VexFlowStaffLine, lastVexFlowStaffLine: VexFlowStaffLine, depth?: number);
    /**
     * Render the bracket using the given backend
     * @param ctx Render Vexflow context
     */
    draw(ctx: Vex.IRenderContext): void;
    /**
     * Adds a connector between two staves
     *
     * @param {Stave} stave1: First stave
     * @param {Stave} stave2: Second stave
     * @param {Flow.StaveConnector.type} type: Type of connector
     */
    private addConnector;
}

/**
 * Class that defines a instrument bracket at the beginning of a line.
 */
declare class VexFlowInstrumentBrace extends VexFlowInstrumentBracket {
    constructor(firstVexFlowStaffLine: VexFlowStaffLine, lastVexFlowStaffLine: VexFlowStaffLine, depth?: number);
}

import VF$2 = Vex.Flow;

/** A GraphicalMeasure drawing a multiple-rest measure in Vexflow.
 *  Mostly copied from VexFlowMeasure.
 *  Even though most of those functions aren't needed, apparently you can't remove the layoutStaffEntry function.
 */
declare class VexFlowMultiRestMeasure extends VexFlowMeasure {
    multiRestElement: any;
    multiRestElementSVG: SVGGElement;
    constructor(staff: Staff, sourceMeasure?: SourceMeasure, staffLine?: StaffLine);
    /**
     * Draw this measure on a VexFlow CanvasContext
     * @param ctx
     */
    draw(ctx: Vex.IRenderContext): void;
    format(): void;
    /**
     * Returns all the voices that are present in this measure
     */
    getVoicesWithinMeasure(): Voice[];
    /**
     * Returns all the graphicalVoiceEntries of a given Voice.
     * @param voice the voice for which the graphicalVoiceEntries shall be returned.
     */
    getGraphicalVoiceEntriesPerVoice(voice: Voice): GraphicalVoiceEntry[];
    /**
     * Finds the gaps between the existing notes within a measure.
     * Problem here is, that the graphicalVoiceEntry does not exist yet and
     * that Tied notes are not present in the normal voiceEntries.
     * To handle this, calculation with absolute timestamps is needed.
     * And the graphical notes have to be analysed directly (and not the voiceEntries, as it actually should be -> needs refactoring)
     * @param voice the voice for which the ghost notes shall be searched.
     */
    protected getRestFilledVexFlowStaveNotesPerVoice(voice: Voice): GraphicalVoiceEntry[];
    /**
     * Add a note to a beam
     * @param graphicalNote
     * @param beam
     */
    handleBeam(graphicalNote: GraphicalNote, beam: Beam): void;
    handleTuplet(graphicalNote: GraphicalNote, tuplet: Tuplet): void;
    /**
     * Complete the creation of VexFlow Beams in this measure
     */
    finalizeBeams(): void;
    /**
     * Complete the creation of VexFlow Tuplets in this measure
     */
    finalizeTuplets(): void;
    layoutStaffEntry(graphicalStaffEntry: GraphicalStaffEntry): void;
    graphicalMeasureCreatedCalculations(): void;
    /**
     * Create the articulations for all notes of the current staff entry
     */
    protected createArticulations(): void;
    /**
     * Create the ornaments for all notes of the current staff entry
     */
    protected createOrnaments(): void;
    protected createFingerings(voiceEntry: GraphicalVoiceEntry): void;
    /**
     * Return the VexFlow Stave corresponding to this graphicalMeasure
     * @returns {VF.Stave}
     */
    getVFStave(): VF$2.Stave;
}

declare class VexFlowMusicSheetCalculator extends MusicSheetCalculator {
    /** space needed for a dash for lyrics spacing, calculated once */
    private dashSpace;
    beamsNeedUpdate: boolean;
    constructor(rules: EngravingRules);
    protected clearRecreatedObjects(): void;
    protected formatMeasures(): void;
    /**
     * Calculates the x layout of the staff entries within the staff measures belonging to one source measure.
     * All staff entries are x-aligned throughout all vertically aligned staff measures.
     * This method is called within calculateXLayout.
     * The staff entries are aligned with minimum needed x distances.
     * The MinimumStaffEntriesWidth of every measure will be set - needed for system building.
     * Prepares the VexFlow formatter for later formatting
     * Does not calculate measure width from lyrics (which is called from MusicSheetCalculator)
     * @param measures
     * @returns the minimum required x width of the source measure (=list of staff measures)
     */
    protected calculateMeasureXLayout(measures: GraphicalMeasure[]): number;
    private calculateElongationFactor;
    calculateElongationFactorFromStaffEntries(staffEntries: GraphicalStaffEntry[], oldMinimumStaffEntriesWidth: number, elongationFactorForMeasureWidth: number, measureNumber: number): number;
    calculateMeasureWidthFromStaffEntries(measuresVertical: GraphicalMeasure[], oldMinimumStaffEntriesWidth: number): number;
    protected createGraphicalTie(tie: Tie, startGse: GraphicalStaffEntry, endGse: GraphicalStaffEntry, startNote: GraphicalNote, endNote: GraphicalNote): GraphicalTie;
    protected updateStaffLineBorders(staffLine: StaffLine): void;
    protected graphicalMeasureCreatedCalculations(measure: GraphicalMeasure): void;
    /**
     * Can be used to calculate articulations, stem directions, helper(ledger) lines, and overlapping note x-displacement.
     * Is Excecuted per voice entry of a staff entry.
     * After that layoutStaffEntry is called.
     * @param voiceEntry
     * @param graphicalNotes
     * @param graphicalStaffEntry
     * @param hasPitchedNote
     */
    protected layoutVoiceEntry(voiceEntry: VoiceEntry, graphicalNotes: GraphicalNote[], graphicalStaffEntry: GraphicalStaffEntry, hasPitchedNote: boolean): void;
    /**
     * Do all layout calculations that have to be done per staff entry, like dots, ornaments, arpeggios....
     * This method is called after the voice entries are handled by layoutVoiceEntry().
     * @param graphicalStaffEntry
     */
    protected layoutStaffEntry(graphicalStaffEntry: GraphicalStaffEntry): void;
    /**
     * Is called at the begin of the method for creating the vertically aligned staff measures belonging to one source measure.
     */
    protected initGraphicalMeasuresCreation(): void;
    /**
     * add here all given articulations to the VexFlowGraphicalStaffEntry and prepare them for rendering.
     * @param articulations
     * @param voiceEntry
     * @param graphicalStaffEntry
     */
    protected layoutArticulationMarks(articulations: Articulation[], voiceEntry: VoiceEntry, graphicalStaffEntry: GraphicalStaffEntry): void;
    /**
     * Calculate the shape (Bezier curve) for this tie.
     * @param tie
     * @param tieIsAtSystemBreak
     * @param isTab Whether this tie is for a tab note (guitar tabulature)
     */
    protected layoutGraphicalTie(tie: GraphicalTie, tieIsAtSystemBreak: boolean, isTab: boolean): void;
    protected calculateDynamicExpressionsForMultiExpression(multiExpression: MultiExpression, measureIndex: number, staffIndex: number): void;
    protected createMetronomeMark(metronomeExpression: InstantaneousTempoExpression): void;
    protected calculateRehearsalMark(measure: SourceMeasure): void;
    /**
     * Calculate a single OctaveShift for a [[MultiExpression]].
     * @param sourceMeasure
     * @param multiExpression
     * @param measureIndex
     * @param staffIndex
     */
    protected calculateSingleOctaveShift(sourceMeasure: SourceMeasure, multiExpression: MultiExpression, measureIndex: number, staffIndex: number): void;
    /** Finds the last staffline measure that has staffentries. (staffentries necessary for octaveshift and pedal) */
    protected findLastStafflineMeasure(staffline: StaffLine): GraphicalMeasure;
    protected calculateSinglePedal(sourceMeasure: SourceMeasure, multiExpression: MultiExpression, measureIndex: number, staffIndex: number): void;
    private calculatePedalSkyBottomLine;
    private calculateOctaveShiftSkyBottomLine;
    /**
     * Calculate all the textual and symbolic [[RepetitionInstruction]]s (e.g. dal segno) for a single [[SourceMeasure]].
     * @param repetitionInstruction
     * @param measureIndex
     */
    protected calculateWordRepetitionInstruction(repetitionInstruction: RepetitionInstruction, measureIndex: number): void;
    protected calculateSkyBottomLines(): void;
    /**
     * Re-adjust the x positioning of expressions. Update the skyline afterwards
     */
    protected calculateExpressionAlignements(): void;
    /**
     * Check if the tied graphical note belongs to any beams or tuplets and react accordingly.
     * @param tiedGraphicalNote
     * @param beams
     * @param activeClef
     * @param octaveShiftValue
     * @param graphicalStaffEntry
     * @param duration
     * @param openTie
     * @param isLastTieNote
     */
    protected handleTiedGraphicalNote(tiedGraphicalNote: GraphicalNote, beams: Beam[], activeClef: ClefInstruction, octaveShiftValue: OctaveEnum, graphicalStaffEntry: GraphicalStaffEntry, duration: Fraction, openTie: Tie, isLastTieNote: boolean): void;
    /**
     * Is called if a note is part of a beam.
     * @param graphicalNote
     * @param beam
     * @param openBeams a list of all currently open beams
     */
    protected handleBeam(graphicalNote: GraphicalNote, beam: Beam, openBeams: Beam[]): void;
    protected handleVoiceEntryLyrics(voiceEntry: VoiceEntry, graphicalStaffEntry: GraphicalStaffEntry, lyricWords: LyricWord[]): void;
    protected handleVoiceEntryOrnaments(ornamentContainer: OrnamentContainer, voiceEntry: VoiceEntry, graphicalStaffEntry: GraphicalStaffEntry): void;
    /**
     * Add articulations to the given vexflow staff entry.
     * @param articulations
     * @param voiceEntry
     * @param graphicalStaffEntry
     */
    protected handleVoiceEntryArticulations(articulations: Articulation[], voiceEntry: VoiceEntry, staffEntry: GraphicalStaffEntry): void;
    /**
     * Add technical instructions to the given vexflow staff entry.
     * @param technicalInstructions
     * @param voiceEntry
     * @param staffEntry
     */
    protected handleVoiceEntryTechnicalInstructions(technicalInstructions: TechnicalInstruction[], voiceEntry: VoiceEntry, staffEntry: GraphicalStaffEntry): void;
    /**
     * Is called if a note is part of a tuplet.
     * @param graphicalNote
     * @param tuplet
     * @param openTuplets a list of all currently open tuplets
     */
    protected handleTuplet(graphicalNote: GraphicalNote, tuplet: Tuplet, openTuplets: Tuplet[]): void;
    /**
     * Find the Index of the item of the array of all VexFlow Slurs that holds a specified slur
     * @param gSlurs
     * @param slur
     */
    findIndexGraphicalSlurFromSlur(gSlurs: GraphicalSlur[], slur: Slur): number;
    indexOfGraphicalGlissFromGliss(gGlissandi: GraphicalGlissando[], glissando: Glissando): number;
    protected calculateSlurs(): void;
    calculateGlissandi(): void;
}

declare class VexFlowMusicSystem extends MusicSystem {
    constructor(id: number, rules: EngravingRules);
    calculateBorders(rules: EngravingRules): void;
    /**
     * This method creates all the graphical lines and dots needed to render a system line (e.g. bold-thin-dots..).
     * @param xPosition
     * @param lineWidth
     * @param lineType
     * @param linePosition indicates if the line belongs to start or end of measure
     * @param musicSystem
     * @param topMeasure
     * @param bottomMeasure
     */
    protected createSystemLine(xPosition: number, lineWidth: number, lineType: SystemLinesEnum, linePosition: SystemLinePosition, musicSystem: MusicSystem, topMeasure: GraphicalMeasure, bottomMeasure?: GraphicalMeasure): SystemLine;
    /**
     * creates an instrument brace for the given dimension.
     * The height and positioning can be inferred from the given staff lines.
     * @param firstStaffLine the upper StaffLine (use a cast to get the VexFlowStaffLine) of the brace to create
     * @param lastStaffLine the lower StaffLine (use a cast to get the VexFlowStaffLine) of the brace to create
     */
    protected createInstrumentBracket(firstStaffLine: StaffLine, lastStaffLine: StaffLine): void;
    /**
     * creates an instrument group bracket for the given dimension.
     * There can be cascaded bracket (e.g. a group of 2 in a group of 4) -
     * The recursion depth informs about the current depth level (needed for positioning)
     * @param firstStaffLine the upper staff line of the bracket to create
     * @param lastStaffLine the lower staff line of the bracket to create
     * @param recursionDepth
     */
    protected createGroupBracket(firstStaffLine: StaffLine, lastStaffLine: StaffLine, recursionDepth: number): void;
}

import VF$1 = Vex.Flow;

/**
 * The vexflow adaptation of a graphical shift.
 */
declare class VexFlowOctaveShift extends GraphicalOctaveShift {
    /** Defines the note where the octave shift starts */
    startNote: VF$1.StemmableNote;
    /** Defines the note where the octave shift ends */
    endNote: VF$1.StemmableNote;
    /** Top or bottom of the staffline */
    private position;
    /** Supscript is a smaller text after the regular text (e.g. va after 8) */
    private supscript;
    /** Main text element */
    private text;
    /**
     * Create a new vexflow ocatve shift
     * @param octaveShift the object read by the ExpressionReader
     * @param parent the bounding box of the parent
     */
    constructor(octaveShift: OctaveShift, parent: BoundingBox);
    /**
     * Set a start note using a staff entry
     * @param graphicalStaffEntry the staff entry that holds the start note
     */
    setStartNote(graphicalStaffEntry: GraphicalStaffEntry): boolean;
    /**
     * Set an end note using a staff entry
     * @param graphicalStaffEntry the staff entry that holds the end note
     */
    setEndNote(graphicalStaffEntry: GraphicalStaffEntry): boolean;
    /**
     * Get the actual vexflow text bracket used for drawing
     */
    getTextBracket(): VF$1.TextBracket;
}

import VF = Vex.Flow;

declare class VexFlowStaffEntry extends GraphicalStaffEntry {
    constructor(measure: VexFlowMeasure, sourceStaffEntry: SourceStaffEntry, staffEntryParent: VexFlowStaffEntry);
    vfClefBefore: VF.ClefNote;
    /**
     * Calculates the staff entry positions from the VexFlow stave information and the tickabels inside the staff.
     * This is needed in order to set the OSMD staff entries (which are almost the same as tickables) to the correct positions.
     * It is also needed to be done after formatting!
     */
    calculateXPosition(): void;
    setMaxAccidentals(): number;
    setModifierXOffsets(): void;
    /**
     * Calculate x offsets for overlapping string and fingering modifiers in a chord.
     */
    private calculateModifierXOffsets;
}

declare class VexflowStafflineNoteCalculator implements IStafflineNoteCalculator {
    private rules;
    private staffPitchListMapping;
    private baseLineNote;
    private baseLineOctave;
    constructor(rules: EngravingRules);
    /**
     * This method is called for each note during the calc phase. We want to track all possible positions to make decisions
     * during layout about where notes should be positioned.
     * This directly puts notes that share a line to the same position, regardless of voice
     * @param graphicalNote The note to be checked/positioned
     * @param staffIndex The staffline the note is on
     */
    trackNote(graphicalNote: GraphicalNote): void;
    private static PitchIndexOf;
    private static findOrInsert;
    /**
     * This method is called for each note, and should make any necessary position changes based on the number of stafflines, clef, etc.
     * @param graphicalNote The note to be checked/positioned
     * @param staffIndex The staffline that this note exists on
     * @returns the newly positioned note
     */
    positionNote(graphicalNote: GraphicalNote): GraphicalNote;
    /**
     * Get the number of unique "voices" or note positions
     * @param staffIndex The Staffline to get the count of
     */
    getStafflineUniquePositionCount(staffIndex: number): number;
}

declare class VexFlowTabMeasure extends VexFlowMeasure {
    multiRestElement: any;
    constructor(staff: Staff, sourceMeasure?: SourceMeasure, staffLine?: StaffLine);
    /**
     * Reset all the geometric values and parameters of this measure and put it in an initialized state.
     * This is needed to evaluate a measure a second time by system builder.
     */
    resetLayout(): void;
    graphicalMeasureCreatedCalculations(): void;
    addClefAtBegin(clef: ClefInstruction): void;
    draw(ctx: Vex.IRenderContext): void;
}

/**
 * Created by Matthias on 21.06.2016.
 */
declare class VexFlowTextMeasurer implements ITextMeasurer {
    constructor(rules: EngravingRules);
    private context;
    fontSize: number;
    fontSizeStandard: number;
    private rules;
    computeTextWidthToHeightRatio(text: string, font: Fonts, style: FontStyles, fontFamily?: string, fontSize?: number): number;
    setFontSize(fontSize?: number): number;
}

interface IQualityFeedbackTone {
    ParentNote: Note;
    TimingScore: number;
    PitchScore: number;
    getOverallQualityFeedbackScore(): number;
}

declare class ITextTranslation {
    static defaultTextTranslation: ITextTranslation;
    static translateText(tag: string, text: string): string;
}

declare global {
    interface Array<T> {
        /** Returns the last element from an array */
        last(): T;
        /** Deletes all elements from an array */
        clear(): void;
        /** Returns true if the element is found in the array */
        contains(elem: T): boolean;
    }
}
/**
 * This class implements static methods to perform useful operations on lists, dictionaries, ...
 */
declare class CollectionUtil {
    static contains2(array: any[], object: any): boolean;
    static last(array: any[]): any;
    /** Array.flat(), introduced in ES2019, polyfilled here to stick with ES2017 target in tsconfig.json.
     *  Performance tests: https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/issues/1299#issuecomment-1399062038
     */
    static flat(array: any[]): any;
    /**
     * Iterates through a dictionary and calls iterationFunction.
     * If iterationFunction returns true the key gets stored.
     * all stored key will finally be removed from the dictionary.
     * @param dict
     * @param iterationFunction
     */
    static removeDictElementIfTrue<S, T, V>(thisPointer: S, dict: Dictionary<T, V>, iterationFunction: (thisPointer: S, key: T, value: V) => boolean): void;
    static getLastElement<T>(array: T[]): T;
    static binarySearch<T>(array: T[], element: T, cmp: (elem1: T, elem2: T) => number, startIndex?: number, endIndex?: number): number;
}

/**
 * Some useful Maths methods.
 */
declare class PSMath {
    static log(base: number, x: number): number;
    static log10(x: number): number;
    static meanSimple(values: number[]): number;
    static meanWeighted(values: number[], weights: number[]): number;
}

declare class Matrix2D {
    private matrix;
    constructor();
    static getRotationMatrix(angle: number): Matrix2D;
    scalarMultiplication(scalar: number): void;
    getTransposeMatrix(): Matrix2D;
    vectorMultiplication(point: PointF2D): PointF2D;
}

/**
 * Some helper methods to handle MXL files.
 */
declare class MXLHelper {
    /** Returns the documentElement of MXL data. */
    static MXLtoIXmlElement(data: string): Promise<IXmlElement>;
    static MXLtoXMLstring(data: string): Promise<string>;
}

/** Calculates transposition of individual notes and keys,
 * which is used by multiple OSMD classes to transpose the whole sheet.
 * Note: This class may not look like much, but a lot of thought has gone into the algorithms,
 * and the exact usage within OSMD classes. */
declare class TransposeCalculator implements ITransposeCalculator {
    private static keyMapping;
    private static noteEnums;
    transposePitch(pitch: Pitch, currentKeyInstruction: KeyInstruction, halftones: number): Pitch;
    transposeKey(keyInstruction: KeyInstruction, transpose: number): void;
}

export { AClassHierarchyTrackable, AJAX, AbstractGraphicalExpression, AbstractGraphicalInstruction, AbstractNotationInstruction, AccidentalCalculator, AccidentalEnum, AlignRestOption, AlignmentManager, AlignmentType, Appearance, ArgumentOutOfRangeException, Arpeggio, ArpeggioType, ArticulationEnum, ArticulationReader, AutoColorSet, BackendType, Beam, BeamEnum, BoundingBox, CanvasVexFlowBackend, ChordDegreeText, ChordSymbolContainer, ChordSymbolEnum, ChordSymbolReader, ClefEnum, ClefInstruction, Clickable, ColDirEnum, CollectionUtil, ColoringModes, Cursor, CursorType, CurvePositionEnum, CustomChord, Degree, DrawingMode, DrawingParameters, DrawingParametersEnum, EngravingRules, ExpressionReader, FillEmptyMeasuresWithWholeRests, FontStyles, Fonts, Fraction, Glissando, GraphicalChordSymbolContainer, GraphicalComment, GraphicalContinuousDynamicExpression, GraphicalCurve, GraphicalGlissando, GraphicalInstantaneousDynamicExpression, GraphicalInstantaneousTempoExpression, GraphicalLabel, GraphicalLayers, GraphicalLine, GraphicalLyricEntry, GraphicalLyricWord, GraphicalMarkedArea, GraphicalMeasure, GraphicalMusicPage, GraphicalMusicSheet, GraphicalNote, GraphicalObject, GraphicalOctaveShift, GraphicalRectangle, GraphicalSlur, GraphicalStaffEntry, GraphicalStaffEntryLink, GraphicalTie, GraphicalVoiceEntry, ITextTranslation, IXmlElement, Instrument, InstrumentReader, InstrumentalGroup, InvalidEnumArgumentException, KeyEnum, KeyInstruction, Label, LinkedVoice, LyricsReader, MXLHelper, MappingSourceMusicPart, Matrix2D, MeasureBuildParameters, MidiInstrument, MusicPartManager, MusicPartManagerIterator, MusicSheet, MusicSheetCalculator, MusicSheetDrawer, MusicSheetErrors, MusicSheetReader, MusicSheetReadingException, MusicSymbol, MusicSymbolDrawingStyle, MusicSymbolModuleFactory, MusicSystem, MusicSystemBuilder, Note, NoteEnum, NoteEnumToHalfToneLink, NoteHeadShape, NoteState, NoteType, NoteTypeHandler, Notehead, OSMDColor, OSMDOptions, OUTLINE_AND_FILL_STYLE_DICT, OctaveShiftParams, OpenSheetMusicDisplay, OrnamentContainer, OrnamentEnum, OutlineAndFillStyleEnum, PSMath, PageFormat, PagePlacementEnum, PartListEntry, PhonicScoreModes, Pitch, PlaybackSettings, PointF2D, ReaderPluginManager, RectangleF2D, Repetition, RepetitionCalculator, RepetitionEndingPart, RepetitionInstruction, RepetitionInstructionComparer, RepetitionInstructionEnum, RepetitionInstructionReader, RhythmInstruction, RhythmSymbolEnum, SelectionEndSymbol, SelectionStartSymbol, SizeF2D, SkyBottomLineBatchCalculatorBackendType, SkyBottomLineCalculator, SlurReader, SourceMeasure, SourceMusicPart, SourceStaffEntry, Staff, StaffEntryLink, StaffLine, StaffLineActivitySymbol, StavePositionEnum, StemDirectionType, StyleSets, SubInstrument, SvgVexFlowBackend, SystemBuildParameters, SystemImageProperties, SystemLine, SystemLinePosition, SystemLinesEnum, SystemLinesEnumHelper, TechnicalInstruction, TechnicalInstructionType, TextAlignment, TextAlignmentEnum, Tie, TieTypes, TimestampTransform, TransposeCalculator, Tuplet, VerticalGraphicalStaffEntryContainer, VerticalSourceStaffEntryContainer, VexFlowBackend, VexFlowBackends, VexFlowContinuousDynamicExpression, VexFlowConverter, VexFlowGlissando, VexFlowGraphicalNote, VexFlowGraphicalSymbolFactory, VexFlowInstantaneousDynamicExpression, VexFlowInstrumentBrace, VexFlowInstrumentBracket, VexFlowMeasure, VexFlowMultiRestMeasure, VexFlowMusicSheetCalculator, VexFlowMusicSheetDrawer, VexFlowMusicSystem, VexFlowOctaveShift, VexFlowSlur, VexFlowStaffEntry, VexFlowStaffLine, VexFlowTabMeasure, VexFlowTextMeasurer, VexFlowVoiceEntry, VexflowStafflineNoteCalculator, Voice, VoiceEntry, VoiceGenerator, unitInPixels };
export type { AutoBeamOptions, ColoringOptions, CursorOptions, DegreesInfo, IAfterSheetReadingModule, ICurveOptions, IGraphicalSymbolFactory, IOSMDOptions, IQualityFeedbackTone, ISqueezable, IStafflineNoteCalculator, ITextMeasurer, ITransposeCalculator, IVoiceMeasureReadPlugin, IXmlAttribute, NoteIndexToPlacementEnum, TremoloInfo, VisibilityOptions };
