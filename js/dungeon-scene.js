import Player from "./player.js";
import TILES from "./tile-mapping.js";
import TilemapVisibility from "./tilemap-visibility.js";

/**
 * Scene that generates a new dungeon
 */
export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super();
    this.level = 0; 
    this.playerStats = {};
    this.playerStats.gold = 0;
    this.playerStats.health = 50;
    this.playerStats.armor = 0;
    this.playerStats.mana = 0;
    this.playerStats.speed = 150;
    this.playerStats.inventory =[]; // array of objects
    this.infotext ;

   }

  preload() {
    this.load.image("tiles", "./assets/tilesets/ProjectUtumno_.png");
    this.load.spritesheet(
      "characters",
      "./assets/spritesheets/buch-characters-64px-extruded.png",
      {
        frameWidth: 64,
        frameHeight: 64,
        margin: 1,
        spacing: 2
      }
    );
       
    if (typeof(Storage) !== "undefined")
    {
    let statsData =  localStorage.getItem("stats");
      if(statsData!=undefined)
      {
//        this.playerStats = statsData;

        console.log(this.playerStats);
      }
       localStorage.setItem("Stats", this.playerStats);  // Code for localStorage/sessionStorage.
    } else
     {
       console.log("Sorry I cant save your game with your browser");
      // Sorry! No Web Storage support..
     }
  }

  saveStats()
  {
//    console.log("TODO");
//    console.log(this.playerStats);
    if (typeof(Storage) !== "undefined")
    {
      // localStorage.setItem("health", this.playerStats.health);   
      // localStorage.setItem("mana", this.playerStats.mana);   
      // localStorage.setItem("gold", this.playerStats.gold);   
      // localStorage.setItem("armor", this.playerStats.armor);   
       
//      sessionStorage.pushArrayItem('stats',this.playerStats);
    } 
  }

 

  stringify(array)
  { //TODO:
    // pipette seperated fields
    // first field speaks to the number of fields
    // all even fields speak to what kind of field follows
    // number, text, other?
  }

    
    updateText()
    {
            //  Updates the stats text
            if(this.infotext==undefined)
            { 
             this.add
              .text(16, 82, `Health: ${this.playerStats.health} \n  Gold: ${this.playerStats.gold}  `, {
              font: "18px monospace",
              fill: "#000000",
              padding: { x: 10, y: 10 },
              backgroundColor: "#ffffff"
              })
             .setScrollFactor(0); 
            }
            else
            {
              this.infotext.setText( `Health: ${this.playerStats.health} \n  Gold: ${this.playerStats.gold}  `);
            }
          this.saveStats();
    }
    addGold(amount)
    {
        this.playerStats.gold += amount;
    }
    healthAltarHeal()
    {
      if(this.playerStats.health < 100)
       {  this.playerStats.health += 20;}
       else
       {this.playerStats.health+=5;}
    }
    takeDamage(amount)
    {
      amount = amount - this.playerStats.armor;
      if(amount>0)
        addHealth( -amount);

        this.saveStats();
    }
    addHealth(amount)
    {
      this.playerStats.health+=amount;
      if(this.playerStats.health>100)
      {
        this.playerStats.health=100;
      }
    }

  create() {
    this.level++;

    this.hasPlayerReachedStairs = false;

    this.input.addPointer(5); // for multitouch 

    // Generate a random world with a few extra options:
    //  - Rooms should only have odd number dimensions so that they have a center tile.
    //  - Doors should be at least 2 tiles away from corners, so that we can place a corner tile on
    //    either side of the door location
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 7, max: 17, onlyOdd: true },
        height: { min: 7, max: 17, onlyOdd: true }
      }
    });

    this.dungeon.drawToConsole();

    // Creating a blank tilemap with dimensions matching the dungeon
    const map = this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: this.dungeon.width,
      height: this.dungeon.height
    });
    const tileset = map.addTilesetImage("tiles", null, 32, 32, 0,0); // 1px margin, 2px spacing
    this.groundLayer = map.createBlankDynamicLayer("Ground", tileset).fill(TILES.BLANK);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);
    const shadowLayer = map.createBlankDynamicLayer("Shadow", tileset).fill(TILES.BLANK);

    this.tilemapVisibility = new TilemapVisibility(shadowLayer);

    // Use the array of rooms generated to place tiles in the map
    // Note: using an arrow function here so that "this" still refers to our scene
    this.dungeon.rooms.forEach(room => {
      const { x, y, width, height, left, right, top, bottom } = room;

      // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
      // See "Weighted Randomize" example for more information on how to use weightedRandomize.
      this.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, TILES.FLOOR);

      // Place the room corners tiles
      this.groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
      this.groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
      this.groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
      this.groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

      // Fill the walls with mostly clean tiles, but occasionally place a dirty tile
      this.groundLayer.weightedRandomize(left + 1, top, width - 2, 1, TILES.WALL.TOP);
      this.groundLayer.weightedRandomize(left + 1, bottom, width - 2, 1, TILES.WALL.BOTTOM);
      this.groundLayer.weightedRandomize(left, top + 1, 1, height - 2, TILES.WALL.LEFT);
      this.groundLayer.weightedRandomize(right, top + 1, 1, height - 2, TILES.WALL.RIGHT);

      // Dungeons have rooms that are connected with doors. Each door has an x & y relative to the
      // room's location. Each direction has a different door to tile mapping.
      var doors = room.getDoorLocations(); // → Returns an array of {x, y} objects
      for (var i = 0; i < doors.length; i++) {
        if (doors[i].y === 0) {
          this.groundLayer.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
        } else if (doors[i].y === room.height - 1) {
          this.groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
        } else if (doors[i].x === 0) {
          this.groundLayer.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
        } else if (doors[i].x === room.width - 1) {
          this.groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
        }
      }
    });

    // Separate out the rooms into:
    //  - The starting room (index = 0)
    //  - A random room to be designated as the end room (with stairs and nothing else)
    //  - An array of 90% of the remaining rooms, for placing random stuff (leaving 10% empty)
    const rooms = this.dungeon.rooms.slice();
    const startRoom = rooms.shift();
    const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);

    // Place the stairs
    this.stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX, endRoom.centerY);

    // Place stuff in the 90% "otherRooms"
    otherRooms.forEach(room => {
      var rand = Math.random();
      if (rand <= 0.3) {
        // 30% chance of chest
        this.stuffLayer.putTileAt(TILES.CHEST, room.centerX, room.centerY);
      } else if (rand <= 0.8) {
        // 80% chance of a health fountian anywhere in the room... except don't block a door!
      //  const x = Phaser.Math.Between(room.left + 2, room.right - 2);
      //  const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
        this.stuffLayer.putTileAt(TILES.HEALTHALTAR, room.centerX, room.centerY);
        
//        this.stuffLayer.weightedRandomize(x, y, 1, 1, TILES.HEALTHALTAR);
      } else {
        // 25% of either 2 or 4 towers, depending on the room size
        if (room.height >= 9) {
          this.stuffLayer.putTilesAt(TILES.CHEST, room.centerX - 1, room.centerY + 1);
          this.stuffLayer.putTilesAt(TILES.CHEST, room.centerX + 1, room.centerY + 1);
          this.stuffLayer.putTilesAt(TILES.CHEST, room.centerX - 1, room.centerY - 2);
          this.stuffLayer.putTilesAt(TILES.CHEST, room.centerX + 1, room.centerY - 2);
          // this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY + 1);
          // this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY + 1);
          // this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 2);
          // this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 2);
        } else {
          this.stuffLayer.putTilesAt(TILES.CHEST, room.centerX - 1, room.centerY - 1);
          this.stuffLayer.putTilesAt(TILES.HEALTHALTAR, room.centerX + 1, room.centerY - 1);
          // this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
          // this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 1);
        }
      }
    });

    // Not exactly correct for the tileset since there are more possible floor tiles, but this will
    // do for the example.
    this.groundLayer.setCollisionByExclusion([-1,1,2,3, 6, 7, 8,9, 26,617,619,490,491,492,493]);
    this.stuffLayer.setCollisionByExclusion([-1, 1,2,3, 6, 7, 8,9, 26,617,619,490,491,492,493]);

    this.stuffLayer.setTileIndexCallback(TILES.HEALTHALTAR, (test,test2) => {
      
    this.healthAltarHeal(); 

    this.stuffLayer.putTileAt(9,test2.x,test2.y);
    this.updateText();
  });  


    this.stuffLayer.setTileIndexCallback(TILES.CHEST, (test,test2) => {
        this.addGold((Math.random()*(30+this.level*5))|0); 
        this.stuffLayer.putTileAt(8,test2.x,test2.y);
        this.updateText();
    });  


    this.stuffLayer.setTileIndexCallback(TILES.STAIRS, () => {
      this.stuffLayer.setTileIndexCallback(TILES.STAIRS, null);
      this.addGold(100);
      this.updateText();
      this.hasPlayerReachedStairs = true;
      this.player.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => {
        this.player.destroy();
        this.scene.restart();
      });
    });
 

    // Place the player in the first room
    const playerRoom = startRoom;
    const x = map.tileToWorldX(playerRoom.centerX);
    const y = map.tileToWorldY(playerRoom.centerY);
    this.player = new Player(this, x, y);
    this.stuffLayer.putTileAt(758, startRoom.centerX, startRoom.centerY);

    // Watch the player and tilemap layers for collisions, for the duration of the scene:
    this.physics.add.collider(this.player.sprite, this.groundLayer);
    this.physics.add.collider(this.player.sprite, this.stuffLayer);
    
    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(this.player.sprite);

    // Help text that has a "fixed" position on the screen
     this.add
      .text(16, 16, `Find the stairs. Go deeper.\nCurrent level: ${this.level}`, {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0); 
      
      this.updateText();
  }

 
    
  update(time, delta) {
    if (this.hasPlayerReachedStairs) return;

 
    this.player.update(this.input.pointer1);

 
    // Find the player's room using another helper method from the dungeon that converts from
    // dungeon XY (in grid units) to the corresponding room object
    const playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
    const playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);
    const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);

    this.tilemapVisibility.setActiveRoom(playerRoom);
  }
}

 
    Storage.prototype.getArray = function(arrayName) {
    var thisArray = [];
    var fetchArrayObject = this.getItem(arrayName);
    if (typeof fetchArrayObject !== 'undefined') {
      if (fetchArrayObject !== null) { thisArray = JSON.parse(fetchArrayObject); }
    }
    return thisArray;
  }
  
  Storage.prototype.pushArrayItem = function(arrayName,arrayItem) {
    var existingArray = this.getArray(arrayName);
    existingArray.push(arrayItem);
    this.setItem(arrayName,JSON.stringify(existingArray));
  }
  
  Storage.prototype.popArrayItem = function(arrayName) {
    var arrayItem = {};
    var existingArray = this.getArray(arrayName);
    if (existingArray.length > 0) {
      arrayItem = existingArray.pop();
      this.setItem(arrayName,JSON.stringify(existingArray));
    }
    return arrayItem;
  }
  
  Storage.prototype.shiftArrayItem = function(arrayName) {
    var arrayItem = {};
    var existingArray = this.getArray(arrayName);
    if (existingArray.length > 0) {
      arrayItem = existingArray.shift();
      this.setItem(arrayName,JSON.stringify(existingArray));
    }
    return arrayItem;
  }
  
  Storage.prototype.unshiftArrayItem = function(arrayName,arrayItem) {
    var existingArray = this.getArray(arrayName);
    existingArray.unshift(arrayItem);
    this.setItem(arrayName,JSON.stringify(existingArray));
  }
  
  Storage.prototype.deleteArray = function(arrayName) {
    this.removeItem(arrayName);
  } 
 