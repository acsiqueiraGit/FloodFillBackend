'use strict';

import { FloodFillNotFoundError } from './floodfill-not-found-error.js';

export class FloodFillsService {
  constructor() {
    //Todo: type this object
    this.floodfills = [
      {
        id: 0,
        userId: 'Antonio',
        name: 'Sample test panel',
        sizeX: 1,
        sizeY: 1,
        colors: ["red", "blue", "yellow"],
        pixels: [{x:1, y:1, color:"red"}]
      }
    ];
  }

  async getAll(userId) {
    var result = this.floodfills.filter(e => e.userId === userId);
    return result;
  }

  async get(userId, floodfillId) {
    var floodFills = await this.getAll(userId);
    const floodfill = floodFills.find(e => e.id === floodfillId);
    if (!floodfill) throw new FloodFillNotFoundError(floodfillId);
    return floodfill;
  }

  async add(userId, floodfillDetails) {
    const maximumId = this.floodfills
      .map(e => e.id)
      .reduce((maxId, currentId) => currentId > maxId ? currentId : maxId);
    const floodfillId = maximumId + 1;
    var pixels = FloodFillsHelper.CreateMatrix(floodfillDetails.sizeX, floodfillDetails.sizeY, floodfillDetails.colors);

    this.floodfills.push({
      id: floodfillId,
      userId: userId,
      pixels: pixels,
      ...floodfillDetails
    });
    return floodfillId;
  }

  async update(userId, floodfillId, floodfillDetailsToUpdate) {
    var floodfillIndex = this.#getIndex(userId, floodfillId);
    var floodfill = this.floodfills[floodfillIndex];
    FloodFillsHelper.Paint(floodfill, floodfillDetailsToUpdate.x, floodfillDetailsToUpdate.y, floodfillDetailsToUpdate.color);
    this.floodfills[floodfillIndex] = {
      ...floodfill,
      ...floodfillDetailsToUpdate
    };
  }

  async delete(userId, floodfillId) {
    var floodfillIndex = this.#getIndex(userId, floodfillId);
    this.floodfills.splice(floodfillIndex, 1);
  }


  #getIndex(userId, floodfillId) {
    const floodfillIndex = this.floodfills.findIndex(e => e.id === floodfillId && e.userId === userId);
    if (floodfillIndex === -1) throw new FloodFillNotFoundError(floodfillId);
    return floodfillIndex;
   }

}


class FloodFillsHelper {
  static CreateMatrix(sizeX, sizeY, colors)
  {
    var pixels = [];
    var rows = sizeY;
    var columns = sizeX;

    for (var row = 1; row <= rows; row++) {
      for (var column = 1; column <= columns; column++) {
        var color = this.GetRandomColor(colors);
        var pixel = {x:column, y:row, color: color};
        pixels.push(pixel);
      }
    }

    return pixels;
  }

  static Paint(floodfill, x, y , newColor)
  {
    var pixels = floodfill.pixels;    
    const currentPixel = this.getPixel(pixels, x, y);
    
    if(currentPixel.color === newColor){
        return floodfill;
    }
    
    var oldColor = currentPixel.color;
    var sizeX = floodfill.sizeX;
    var sizeY = floodfill.sizeY;

    this.flood(pixels, x, y , oldColor, newColor, currentPixel, sizeX, sizeY);

    pixels.forEach((pixel) => {
      pixel.visited = false;
    });    
  }

  static flood(pixels, x, y , oldColor, newColor, selectedPixel, sizeX, sizeY)
  {
    if(x < 1){
      return;
    }

    if(y < 1){
      return;
    }

    if(y > sizeY){
        return;
    }

    if(x > sizeX){
        return;
    }

    //If the current pixel is not which needs to be replaced
    const pixelIndex = pixels.findIndex(e => e.x === x && e.y === y);
    if(pixelIndex === -1)
    {
      return;
    }

    if(pixels[pixelIndex].visited)
    {
      return;
    }

    //if it not the first interaction
    if(pixels[pixelIndex] != selectedPixel)
    {
      if(pixels[pixelIndex].color != oldColor)
      {
        return;
      }
    }

    pixels[pixelIndex].color = newColor;
    pixels[pixelIndex].visited = true;
    
    var directions = [
      {x: x-1, y:y}, 
      {x: x+1, y:y}, 
      {x: x, y: y-1}, 
      {x: x, y: y+1},

      //Diagonals
      {x: x-1, y: y-1},
      {x: x+1, y: y-1},
      {x: x-1, y: y+1},
      {x: x+1, y: y+1},
    ];
    
    //Recursive calls in all directions
    directions.forEach((direction) => {
      this.flood(pixels, direction.x, direction.y, oldColor, newColor, selectedPixel, sizeX, sizeY);
    });
  }

  static getPixel(pixels, x, y)
  {
    var result = pixels.find(e => e.x === x && e.y === y);
    return result;
  }

  static GetRandomColor(colors)
  {
    var randomIndex = Math.floor(Math.random()*colors.length);
    var result = colors[randomIndex];
    return result;
  }
}
