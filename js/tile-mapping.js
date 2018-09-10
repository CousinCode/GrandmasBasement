// Our custom tile mapping with:
// - Single index for putTileAt
// - Array of weights for weightedRandomize
// - Array or 2D array for putTilesAt
const TILE_MAPPING = {
  BLANK: 900,
  WALL: {
    TOP_LEFT: 921,
    TOP_RIGHT: 921,
    BOTTOM_RIGHT: 921,
    BOTTOM_LEFT: 921,
    TOP: [{ index: 921, weight: 4 }, { index: [921, 921, 921], weight: 1 }],
    LEFT: [{ index: 921, weight: 4 }, { index: [921, 921, 921], weight: 1 }],
    RIGHT: [{ index: 921, weight: 4 }, { index: [921, 921, 921], weight: 1 }],
    BOTTOM: [{ index: 921, weight: 4 }, { index: [921, 921, 921], weight: 1 }]
  },
  FLOOR: [{ index: 490, weight: 7 }, { index: [491, 492, 493], weight: 1 }],
  HEALTHALTAR: 2,
  DOOR: {
    TOP: [490, 490, 490],
    // prettier-ignore
    LEFT: [
      [490], 
      [490], 
      [490]
    ],
    BOTTOM: [490, 490, 490],
    // prettier-ignore
    RIGHT: [
      [490], 
      [490], 
      [490]
    ]
  },
  CHEST: 7,
  OPENCHEST: 9,
  STAIRS: 676,
  // prettier-ignore
  TOWER: [
    [617],
    [617]
  ]
};

export default TILE_MAPPING;
