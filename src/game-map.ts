import type { Tile } from './tile-types';
import { WALL_TILE } from './tile-types';
import { Display } from 'rot-js';
import * as ROT from 'rot-js';
import { Entity } from './entity';

export class GameMap {

  tiles: Tile[][];

  constructor(
    public width: number,
    public height: number,
    public display: Display,
  ) {
    this.width = width;
    this.height = height;
    this.display = display;
    this.tiles = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      const row = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        row[x] = { ...WALL_TILE };
      }
      this.tiles[y] = row;
    }
}

  isInBounds(x: number, y: number) {
    return 0 <= x && x < this.width && 0 <= y && y < this.height;
  }

  render() {
    for (let y = 0; y < this.tiles.length; y++) {
      const row = this.tiles[y];
      for (let x = 0; x < row.length; x++) {
        const tile = row[x];
        let char = ' ';
        let fg = '#fff';
        let bg = '#000';

        if (tile.visible) {
          char = tile.light.char;
          fg = tile.light.fg;
          bg = tile.light.bg;
        } else if (tile.seen) {
          char = tile.dark.char;
          fg = tile.dark.fg;
          bg = tile.dark.bg;
        }

        this.display.draw(x, y, char, fg, bg);
      }
    }
  }
  addRoom(x: number, y: number, roomTiles: Tile[][]) {
    for (let curY = y; curY < y + roomTiles.length; curY++) {
      const mapRow = this.tiles[curY];
      const roomRow = roomTiles[curY - y];
      for (let curX = x; curX < x + roomRow.length; curX++) {
        mapRow[curX] = roomRow[curX - x];
      }
    }
  }
  lightPasses(x: number, y: number): boolean {
    if (this.isInBounds(x, y)) {
      return this.tiles[y][x].transparent;
    }
    return false;
  }
  updateFov(player: Entity) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x].visible = false;
      }
    }
  
    const fov = new ROT.FOV.PreciseShadowcasting(this.lightPasses.bind(this));
    fov.compute(player.x, player.y, 8, (x, y, _r, visibility) => {
      if (visibility === 1) {
        this.tiles[y][x].visible = true;
        this.tiles[y][x].seen = true;
      }
    });
  }
}
