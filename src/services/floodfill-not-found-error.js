'use strict';

export class FloodFillNotFoundError extends Error {
  constructor(floodfillsId) {
    super(`FloodFill with ID ${floodfillsId} not found.`);
  }
}
