import { DisplayBezierCurve, DisplayBitmap } from "../DisplayManager.ts";
import { concatenateArrayBuffers } from "./ArrayBufferUtils.ts";
import { createConsole } from "./Console.ts";
import { quantizeCanvas } from "./DisplayBitmapUtils.ts";
import {
  DisplayContextCommand,
  serializeContextCommands,
} from "./DisplayContextCommand.ts";
import { DisplayManagerInterface } from "./DisplayManagerInterface.ts";
import opentype, { Glyph, Font } from "opentype.js";
import { decompress } from "woff2-encoder";
import RangeHelper from "./RangeHelper.ts";
import { pointInPolygon, Vector2 } from "./MathUtils.ts";
import { simplifyPath } from "./PathUtils.ts";
import { DisplayBoundingBox } from "./DisplayCanvasHelper.ts";
import {
  DisplayContextState,
  isDirectionHorizontal,
  isDirectionPositive,
} from "./DisplayContextState.ts";

const _console = createConsole("DisplaySpriteSheetUtils", { log: true });

export type DisplaySpriteSubLine = {
  spriteSheetName: string;
  spriteNames: string[];
};
export type DisplaySpriteLine = DisplaySpriteSubLine[];
export type DisplaySpriteLines = DisplaySpriteLine[];

export type DisplaySpriteSerializedSubLine = {
  spriteSheetIndex: number;
  spriteIndices: number[];
  use2Bytes: boolean;
};
export type DisplaySpriteSerializedLine = DisplaySpriteSerializedSubLine[];
export type DisplaySpriteSerializedLines = DisplaySpriteSerializedLine[];

export type DisplaySpritePaletteSwap = {
  name: string;
  numberOfColors: number;
  spriteColorIndices: number[];
};
export type DisplaySprite = {
  name: string;
  width: number;
  height: number;
  paletteSwaps?: DisplaySpritePaletteSwap[];
  commands: DisplayContextCommand[];
};
export type DisplaySpriteSheetPaletteSwap = {
  name: string;
  numberOfColors: number;
  spriteColorIndices: number[];
};
export type DisplaySpriteSheetPalette = {
  name: string;
  numberOfColors: number;
  colors: string[];
  opacities?: number[];
};
export type DisplaySpriteSheet = {
  name: string;
  palettes?: DisplaySpriteSheetPalette[];
  paletteSwaps?: DisplaySpriteSheetPaletteSwap[];
  sprites: DisplaySprite[];
};

export const spriteHeaderLength = 3 * 2; // width, height, commandsLength
export function calculateSpriteSheetHeaderLength(numberOfSprites: number) {
  // numberOfSprites, spriteOffsets, spriteHeader
  return 2 + numberOfSprites * 2 + numberOfSprites * spriteHeaderLength;
}
export function serializeSpriteSheet(
  displayManager: DisplayManagerInterface,
  spriteSheet: DisplaySpriteSheet
) {
  const { name, sprites } = spriteSheet;
  _console.log(`serializing ${name} spriteSheet`, spriteSheet);

  const numberOfSprites = sprites.length;
  const numberOfSpritesDataView = new DataView(new ArrayBuffer(2));
  numberOfSpritesDataView.setUint16(0, numberOfSprites, true);

  const spritePayloads = sprites.map((sprite, index) => {
    const commandsData = serializeContextCommands(
      displayManager,
      sprite.commands
    );
    const dataView = new DataView(new ArrayBuffer(spriteHeaderLength));
    dataView.setUint16(0, sprite.width, true);
    dataView.setUint16(2, sprite.height, true);
    dataView.setUint16(4, commandsData.byteLength, true);
    const serializedSprite = concatenateArrayBuffers(dataView, commandsData);
    _console.log("serializedSprite", sprite, serializedSprite);
    return serializedSprite;
  });
  const spriteOffsetsDataView = new DataView(
    new ArrayBuffer(sprites.length * 2)
  );
  let offset =
    numberOfSpritesDataView.byteLength + spriteOffsetsDataView.byteLength;
  spritePayloads.forEach((spritePayload, index) => {
    //_console.log("spritePayloads", index, offset, spritePayload);
    spriteOffsetsDataView.setUint16(index * 2, offset, true);
    offset += spritePayload.byteLength;
  });

  // [numberOfSprites, ...spriteOffsets, ...[width, height, commands]]
  const serializedSpriteSheet = concatenateArrayBuffers(
    numberOfSpritesDataView,
    spriteOffsetsDataView,
    spritePayloads
  );
  _console.log("serializedSpriteSheet", serializedSpriteSheet);

  return serializedSpriteSheet;
}

export function parseSpriteSheet(dataView: DataView) {
  // FILL
}

export type FontToSpriteSheetOptions = {
  stroke?: boolean;
  strokeWidth?: number;
  unicodeOnly?: boolean;
  englishOnly?: boolean;
  usePath?: boolean;
  script?: string;
  string?: string;
};
export const defaultFontToSpriteSheetOptions: FontToSpriteSheetOptions = {
  stroke: false,
  strokeWidth: 1,
  unicodeOnly: true,
  englishOnly: true,
  usePath: false,
};

function isWoff2(arrayBuffer: ArrayBuffer) {
  if (arrayBuffer.byteLength < 4) return false;

  const header = new Uint8Array(arrayBuffer, 0, 4);
  return (
    header[0] === 0x77 && // 'w'
    header[1] === 0x4f && // 'O'
    header[2] === 0x46 && // 'F'
    header[3] === 0x32 // '2'
  );
}
export async function parseFont(arrayBuffer: ArrayBuffer) {
  if (isWoff2(arrayBuffer)) {
    const result = await decompress(arrayBuffer);
    arrayBuffer = result.buffer;
  }
  const font = opentype.parse(arrayBuffer);
  //_console.log("font", font);
  return font;
}

export function getFontUnicodeRange(font: Font) {
  const rangeHelper = new RangeHelper();

  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    if (!glyph.unicodes || glyph.unicodes.length === 0) continue;

    glyph.unicodes
      .filter((unicode) => {
        const char = String.fromCodePoint(unicode);
        // Keep only letters (any language)
        return /\p{Letter}/u.test(char);
      })
      .forEach((unicode) => rangeHelper.update(unicode));
  }

  //_console.log("range", rangeHelper.range);
  return rangeHelper.span > 0 ? rangeHelper.range : undefined;
}

const englishRegex = /^[A-Za-z0-9 !"#$%&'()*+,\-./:;?@[\]^_`{|}~\\]+$/;

function contourArea(points: Vector2[]) {
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    area += (points[j].x - points[i].x) * (points[j].y + points[i].y);
  }
  return area;
}

export async function fontToSpriteSheet(
  font: Font | Font[],
  fontSize: number,
  spriteSheetName?: string,
  options?: FontToSpriteSheetOptions
) {
  _console.assertTypeWithError(fontSize, "number");

  options = options
    ? { ...defaultFontToSpriteSheetOptions, ...options }
    : defaultFontToSpriteSheetOptions;

  const fonts = Array.isArray(font) ? font : [font];
  font = fonts[0];
  spriteSheetName = spriteSheetName || font.getEnglishName("fullName");
  const spriteSheet: DisplaySpriteSheet = {
    name: spriteSheetName,
    sprites: [],
  };
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  for (let font of fonts) {
    const fontScale = (1 / font.unitsPerEm) * fontSize;

    let minSpriteY = Infinity;
    let maxSpriteY = -Infinity;

    const glyphs: Glyph[] = [];
    let filteredGlyphs: Glyph[] | undefined;
    if (options.string) {
      filteredGlyphs = font
        .stringToGlyphs(options.string)
        .filter((glyph) => glyph.unicode != undefined);
    }
    for (let index = 0; index < font.glyphs.length; index++) {
      const glyph = font.glyphs.get(index);
      const hasUnicode = glyph.unicode != undefined;
      if (hasUnicode) {
        //_console.log(String.fromCharCode(glyph.unicode!), glyph);
      } else {
        //_console.log("no unicode", glyph);
      }

      if (filteredGlyphs) {
        if (!filteredGlyphs.includes(glyph)) {
          continue;
        }
      }

      if (options.unicodeOnly || options.englishOnly) {
        if (!hasUnicode) {
          continue;
        }
      }
      if (options.script && hasUnicode) {
        const regex = new RegExp(`\\p{Script=${options.script}}`, "u");
        if (!regex.test(String.fromCharCode(glyph.unicode!))) {
          continue;
        }
      }
      if (options.englishOnly) {
        if (!englishRegex.test(String.fromCharCode(glyph.unicode!))) {
          continue;
        }
      }

      const bbox = glyph.getBoundingBox();
      minSpriteY = Math.min(minSpriteY, bbox.y1 * fontScale);
      maxSpriteY = Math.max(maxSpriteY, bbox.y2 * fontScale);

      glyphs.push(glyph);
    }

    const maxSpriteHeight = maxSpriteY - minSpriteY;

    // _console.log({
    //   fontName: font.getEnglishName("fullName"),
    //   maxSpriteHeight,
    // });

    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];

      let name = glyph.name;
      if (glyph.unicode != undefined) {
        name = String.fromCharCode(glyph.unicode);
      }
      //_console.log(name, glyph);
      if (typeof name != "string") {
        continue;
      }

      const bbox = glyph.getBoundingBox();

      const spriteWidth = Math.floor(
        Math.max(
          Math.max(bbox.x2, bbox.x2 - bbox.x1),
          glyph.advanceWidth || 0
        ) * fontScale
      );
      const spriteHeight = Math.floor(maxSpriteHeight);

      const commands: DisplayContextCommand[] = [];

      const path = glyph.getPath(
        -bbox.x1 * fontScale,
        bbox.y2 * fontScale,
        fontSize
      );
      if (options.stroke) {
        path.stroke = "white";
        const strokeWidth = options.strokeWidth || 1;
        path.strokeWidth = strokeWidth;
        commands.push({ type: "setLineWidth", lineWidth: strokeWidth });
        // FIX - lineColor and fillColor
      } else {
        path.fill = "white";
      }

      const bitmapWidth = Math.floor((bbox.x2 - bbox.x1) * fontScale);
      const bitmapHeight = Math.floor((bbox.y2 - bbox.y1) * fontScale);

      const bitmapX = Math.floor((spriteWidth - bitmapWidth) / 2);
      const bitmapY = Math.floor(
        (spriteHeight - bitmapHeight) / 2 - (bbox.y1 * fontScale - minSpriteY)
      );

      if (options.usePath) {
        const pathOffset: Vector2 = {
          x: -bitmapWidth / 2 + bitmapX,
          y: -bitmapHeight / 2 + bitmapY,
        };
        //_console.log(`${name} path.commands`, path.commands);
        let curves: DisplayBezierCurve[] = [];
        let startPoint: Vector2 = { x: 0, y: 0 };

        const pathCommandObjects: {
          command: DisplayContextCommand;
          area: number;
          points: Vector2[];
        }[] = [];

        let pathCommands = path.commands;
        pathCommands = simplifyPath(pathCommands);
        pathCommands.forEach((cmd) => {
          switch (cmd.type) {
            case "M": // moveTo
              startPoint.x = cmd.x;
              startPoint.y = cmd.y;
              break;

            case "L": // lineTo
              {
                const controlPoints: Vector2[] = [{ x: cmd.x, y: cmd.y }];
                if (curves.length === 0)
                  controlPoints.unshift({ ...startPoint });
                curves.push({ type: "segment", controlPoints });
              }
              break;

            case "C": // cubic Bezier
              {
                const controlPoints: Vector2[] = [
                  { x: cmd.x1, y: cmd.y1 },
                  { x: cmd.x2, y: cmd.y2 },
                  { x: cmd.x, y: cmd.y },
                ];
                if (curves.length === 0)
                  controlPoints.unshift({ ...startPoint });
                curves.push({ type: "cubic", controlPoints });
              }
              break;

            case "Q": // quadratic Bezier
              {
                const controlPoints: Vector2[] = [
                  { x: cmd.x1, y: cmd.y1 },
                  { x: cmd.x, y: cmd.y },
                ];
                if (curves.length === 0)
                  controlPoints.unshift({ ...startPoint });
                curves.push({ type: "quadratic", controlPoints });
              }
              break;

            case "Z": // closePath
              if (curves.length === 0) break;

              // Flatten all control points
              const controlPoints = curves.flatMap((c) => c.controlPoints);

              // Apply path offset
              controlPoints.forEach((pt) => {
                pt.x = Math.floor(pt.x + pathOffset.x);
                pt.y = Math.floor(pt.y + pathOffset.y);
              });

              const area = contourArea(controlPoints);

              const isSegments = curves.every((c) => c.type === "segment");
              if (isSegments) {
                pathCommandObjects.push({
                  command: {
                    type: "drawPolygon",
                    points: controlPoints,
                  },
                  points: controlPoints,
                  area,
                });
              } else {
                pathCommandObjects.push({
                  command: {
                    type: "drawClosedPath",
                    curves,
                  },
                  area,
                  points: controlPoints,
                });
              }

              // Reset curves
              curves = [];
              break;
          }
        });

        if (pathCommandObjects.length > 0) {
          pathCommandObjects.sort((a, b) => {
            return a.points.every((aPoint) => pointInPolygon(aPoint, b.points))
              ? 1
              : -1;
          });

          let isDrawingHole = false;
          let isHoleAreaPositive = pathCommandObjects[0].area < 0;
          pathCommandObjects.forEach(({ area, command }) => {
            const isHole = isHoleAreaPositive ? area > 0 : area < 0;
            if (isDrawingHole != isHole) {
              isDrawingHole = isHole;
              commands.push({
                type: "selectFillColor",
                fillColorIndex: isHole ? 0 : 1,
              });
            }
            commands.push(command);
          });
        }
      } else {
        if (bitmapWidth > 0 && bitmapHeight > 0) {
          canvas.width = bitmapWidth;
          canvas.height = bitmapHeight;
          ctx.imageSmoothingEnabled = false;

          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          path.draw(ctx);
          const { colorIndices } = await quantizeCanvas(canvas, 2, [
            "#000000",
            "#ffffff",
          ]);
          const bitmap: DisplayBitmap = {
            width: bitmapWidth,
            height: bitmapHeight,
            numberOfColors: 2,
            pixels: colorIndices,
          };

          commands.push({
            type: "selectBitmapColor",
            bitmapColorIndex: 1,
            colorIndex: 1,
          });
          if (false) {
            // debugging
            commands.push({
              type: "selectFillColor",
              fillColorIndex: 2,
            });
            commands.push({
              type: "drawRect",
              offsetX: 0,
              offsetY: 0,
              width: spriteWidth,
              height: spriteHeight,
            });
          }

          commands.push({
            type: "drawBitmap",
            offsetX: bitmapX,
            offsetY: bitmapY,
            bitmap,
          });
        }
      }

      const sprite: DisplaySprite = {
        name,
        commands,
        width: spriteWidth,
        height: spriteHeight,
      };

      spriteSheet.sprites.push(sprite);
    }
  }

  return spriteSheet;
}

export function stringToSprites(
  string: string,
  spriteSheet: DisplaySpriteSheet,
  requireAll = false
) {
  const sprites: DisplaySprite[] = [];
  let substring = string;
  while (substring.length > 0) {
    let longestSprite: DisplaySprite | undefined;

    spriteSheet.sprites.forEach((sprite) => {
      if (substring.startsWith(sprite.name)) {
        if (!longestSprite || sprite.name.length > longestSprite.name.length) {
          longestSprite = sprite;
        }
      }
    });

    // _console.log("longestSprite", longestSprite);
    if (requireAll) {
      _console.assertWithError(
        longestSprite,
        `couldn't find sprite with name prefixing "${substring}"`
      );
    }

    if (longestSprite) {
      sprites.push(longestSprite);
      substring = substring.substring(longestSprite!.name.length);
    } else {
      substring = substring.substring(1);
    }
    //_console.log("new substring", substring);
  }

  //_console.log(`string "${string}" to sprites`, sprites);
  return sprites;
}

export function getReferencedSprites(
  sprite: DisplaySprite,
  spriteSheet: DisplaySpriteSheet
) {
  const sprites: DisplaySprite[] = [];
  sprite.commands
    .filter((command) => command.type == "drawSprite")
    .map((command) => command.spriteIndex)
    .map((spriteIndex) => spriteSheet.sprites[spriteIndex])
    .forEach((_sprite) => {
      if (!sprites.includes(_sprite)) {
        sprites.push(_sprite);
        sprites.push(...getReferencedSprites(_sprite, spriteSheet));
      }
    });
  _console.log("referencedSprites", sprite, sprites);
  return sprites;
}
export function reduceSpriteSheet(
  spriteSheet: DisplaySpriteSheet,
  spriteNames: string | string[],
  requireAll = false
) {
  const reducedSpriteSheet = Object.assign({}, spriteSheet);
  if (!(spriteNames instanceof Array)) {
    spriteNames = stringToSprites(spriteNames, spriteSheet, requireAll).map(
      (sprite) => sprite.name
    );
  }
  _console.log("reducingSpriteSheet", spriteSheet, spriteNames);
  reducedSpriteSheet.sprites = [];
  spriteSheet.sprites.forEach((sprite) => {
    if (spriteNames.includes(sprite.name)) {
      reducedSpriteSheet.sprites.push(sprite);
      reducedSpriteSheet.sprites.push(
        ...getReferencedSprites(sprite, spriteSheet)
      );
    }
  });
  _console.log("reducedSpriteSheet", reducedSpriteSheet);
  return reducedSpriteSheet;
}

export function stringToSpriteLines(
  string: string,
  spriteSheets: Record<string, DisplaySpriteSheet>,
  contextState: DisplayContextState,
  requireAll = false,
  maxLineBreadth = Infinity,
  separators = [" "]
): DisplaySpriteLines {
  _console.log("stringToSpriteLines", string);
  const isSpritesDirectionHorizontal = isDirectionHorizontal(
    contextState.spritesDirection
  );
  const isSpritesLineDirectionHorizontal = isDirectionHorizontal(
    contextState.spritesLineDirection
  );
  const areSpritesDirectionsOrthogonal =
    isSpritesDirectionHorizontal != isSpritesLineDirectionHorizontal;

  const lineStrings = string.split("\n");
  let lineBreadth = 0;

  if (isSpritesLineDirectionHorizontal) {
    maxLineBreadth /= contextState.spriteScaleX;
  } else {
    maxLineBreadth /= contextState.spriteScaleY;
  }

  const sprites: {
    sprite: DisplaySprite;
    spriteSheet: DisplaySpriteSheet;
  }[][] = [];
  let latestSeparatorIndex = -1;
  let latestSeparator: string | undefined;
  let latestSeparatorLineBreadth: number | undefined;
  let latestSeparatorBreadth: number | undefined;
  const spritesLineIndices: number[][] = [];

  lineStrings.forEach((lineString) => {
    sprites.push([]);
    spritesLineIndices.push([]);
    const i = sprites.length - 1;
    if (areSpritesDirectionsOrthogonal) {
      lineBreadth = 0;
    } else {
      lineBreadth += contextState.spritesLineSpacing;
    }

    let lineSubstring = lineString;
    while (lineSubstring.length > 0) {
      let longestSprite: DisplaySprite | undefined;
      let longestSpriteSheet: DisplaySpriteSheet | undefined;
      for (let spriteSheetName in spriteSheets) {
        const spriteSheet = spriteSheets[spriteSheetName];
        spriteSheet.sprites.forEach((sprite) => {
          if (lineSubstring.startsWith(sprite.name)) {
            if (
              !longestSprite ||
              sprite.name.length > longestSprite.name.length
            ) {
              longestSprite = sprite;
              longestSpriteSheet = spriteSheet;
            }
          }
        });
      }
      //_console.log("longestSprite", longestSprite);
      if (requireAll) {
        _console.assertWithError(
          longestSprite,
          `couldn't find sprite with name prefixing "${lineSubstring}"`
        );
      }

      if (longestSprite && longestSpriteSheet) {
        const isSeparator =
          separators.length > 0
            ? separators.includes(longestSprite.name)
            : true;

        sprites[i].push({
          sprite: longestSprite,
          spriteSheet: longestSpriteSheet,
        });

        // _console.log({
        //   name: longestSprite!.name,
        //   isSeparator,
        //   lineBreadth,
        //   latestSeparatorIndex,
        //   latestSeparatorLineBreadth,
        //   latestSeparator,
        //   index: sprites[i].length - 1,
        // });

        let newLineBreadth = lineBreadth;
        const longestSpriteBreadth = isSpritesDirectionHorizontal
          ? longestSprite.width
          : longestSprite.height;
        newLineBreadth += longestSpriteBreadth;
        newLineBreadth += contextState.spritesSpacing;
        if (newLineBreadth >= maxLineBreadth) {
          if (isSeparator) {
            if (longestSprite.name.trim().length == 0) {
              sprites[i].pop();
            }
            spritesLineIndices[i].push(sprites[i].length);
            lineBreadth = 0;
          } else {
            if (latestSeparatorIndex != -1) {
              if (latestSeparator!.trim().length == 0) {
                sprites[i].splice(latestSeparatorIndex, 1);
                lineBreadth -= latestSeparatorBreadth!;
                latestSeparatorIndex;
              }
              spritesLineIndices[i].push(latestSeparatorIndex);
              lineBreadth = newLineBreadth - latestSeparatorLineBreadth!;
            } else {
              spritesLineIndices[i].push(sprites[i].length - 1);
              lineBreadth = 0;
            }
          }
          latestSeparatorIndex = -1;
          latestSeparator = undefined;
        } else {
          lineBreadth = newLineBreadth;

          if (isSeparator) {
            latestSeparator = longestSprite.name;
            latestSeparatorIndex = sprites[i].length - 1;
            //_console.log({ latestSeparatorIndex });
            latestSeparatorLineBreadth = lineBreadth;
            latestSeparatorBreadth = longestSpriteBreadth;
          }
        }

        lineSubstring = lineSubstring.substring(longestSprite!.name.length);
      } else {
        lineSubstring = lineSubstring.substring(1);
      }
    }
  });

  const spriteLines: DisplaySpriteLine[] = [];
  sprites.forEach((_sprites, i) => {
    let spriteLine: DisplaySpriteLine = [];
    spriteLines.push(spriteLine);

    let spriteSubLine: DisplaySpriteSubLine | undefined;

    _sprites.forEach(({ sprite, spriteSheet }, index) => {
      if (spritesLineIndices[i].includes(index)) {
        spriteLine = [];
        spriteLines.push(spriteLine);
        spriteSubLine = undefined;
      }

      if (!spriteSubLine || spriteSubLine.spriteSheetName != spriteSheet.name) {
        spriteSubLine = {
          spriteSheetName: spriteSheet.name,
          spriteNames: [],
        };
        spriteLine.push(spriteSubLine);
      }
      spriteSubLine.spriteNames.push(sprite.name);
    });
  });
  _console.log(`spriteLines for "${string}"`, spriteLines);
  return spriteLines;
}

export function getSpriteLinesBoundingBox(
  spriteLines: DisplaySpriteLines,
  spriteSheets: Record<string, DisplaySpriteSheet>,
  contextState: DisplayContextState
): DisplayBoundingBox {
  const boundingBox: DisplayBoundingBox = { x: 0, y: 0, width: 0, height: 0 };
  // FILL
  return boundingBox;
}
export function getSpriteLinesOffset(
  spriteLines: DisplaySpriteLines,
  lineIndex: number,
  subLineIndex: number,
  contextState: DisplayContextState
): Vector2 {
  const offset: Vector2 = { x: 0, y: 0 };
  // FILL -
  return offset;
}
export function splitStringInto(
  string: string,
  spriteSheets: Record<string, DisplaySpriteSheet>,
  separators = [" ", "\n"],
  requireAll = false
) {
  // FILL
}
