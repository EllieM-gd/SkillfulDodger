class Pathfinder extends Phaser.Scene {
    constructor() {
        super("pathfinderScene");
    }

    preload() {
    }

    init() {
        this.TILESIZE = 64;
        this.SCALE = 2.0;
        this.TILEWIDTH = 20;
        this.TILEHEIGHT = 20;
        this.playerSpeed = 0;
        this.globalIsWalking = false;

        this.cannonTimer = 0;
        this.cannonRespawn = 90;
        this.spawnCounter = 0;
        this.targetSpawn = 5;

        this.cannonShootTimer = 180;
        this.cannonCount = 30;
        this.cannonBallSpeed = 4;
    }

    create() {
        // Create a new tilemap which uses 64x64 tiles, and is 20 tiles wide and 20 tiles tall
        this.map = this.add.tilemap("basic-map", this.TILESIZE, this.TILESIZE, this.TILEWIDTH, this.TILEHEIGHT);
        console.log(this.map)
        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("tilesheet_complete", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Obstacles", this.tileset, 0, 0);

        // Create townsfolk sprite
        // Use setOrigin() to ensure the tile space computations work well
        my.sprite.purpleTownie = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(5), "purple").setOrigin(0.5);
        // my.sprite.purpleTownie = this.add.sprite(0,0, "purple").setOrigin(0, 0);
        my.sprite.purpleTownie.setScale(4.0);

        my.sprite.cannon = [];
        my.sprite.cannonball = [];
        //Create the cannons and do stuff idk
        for (let i = 0; i < this.cannonCount; i++){
            my.sprite.cannon[i] = this.add.sprite(0,0,"cannon").setOrigin(.5);
            my.sprite.cannon[i].setVisible(false);
            my.sprite.cannon[i].setScale(2.5)
        }
        for (let i = 0; i < this.cannonCount*2; i++){
            my.sprite.cannonball[i] = this.add.sprite(0,0,"cannonBall").setOrigin(.5);
            my.sprite.cannonball[i].setVisible(false);
            my.sprite.cannonball[i].setScale(2)
        }


        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        console.log("bounds:" + this.map.widthInPixels + "," + this.map.heightInPixels)
        this.cameras.main.startFollow(my.sprite.purpleTownie, true, 0.5, 0.5);
        this.cameras.main.setDeadzone(25, 25);
        this.cameras.main.setZoom(this.SCALE / 2);

        // Create grid of visible tiles for use with path planning
        let tinyTownGrid = this.layersToGrid();
        console.log(tinyTownGrid)
        

        // Initialize EasyStar pathfinder
        this.finder = new EasyStar.js();

        // Pass grid information to EasyStar
        // EasyStar doesn't natively understand what is currently on-screen,
        // so, you need to provide it that information
        this.finder.setGrid(tinyTownGrid);
        this.activeCharacter = my.sprite.purpleTownie;
        this.setCost(this.tileset);

        // Handle mouse clicks
        // Handles the clicks on the map to make the character move
        // The this parameter passes the current "this" context to the
        // function this.handleClick()
        this.input.on('pointerdown', this.handleClick, this);
    }

    update() {
        this.cannonTimer++;
        if (this.cannonTimer > this.cannonRespawn) {
            this.spawnCannon();
            this.cannonTimer = 0;
            this.spawnCounter++;
            if (this.spawnCounter >= this.targetSpawn){
                if (this.cannonRespawn > 10) this.cannonRespawn -= 8;
                this.targetSpawn += 2;
                this.spawnCounter = 0;
            }
        }




        for (let can of my.sprite.cannon){
            if (can.visible){
                can.shootTimer--;
                if (can.shootTimer < 0){
                    //SHOOT BULLET
                    for (let ball of my.sprite.cannonball){
                        if (!ball.visible){
                            ball.setPosition(can.x,can.y);
                            ball.dir = can.side;
                            ball.setVisible(true);
                            break;
                        }
                    }
                    console.log("Bang!");

                    //Set Visible
                    can.setVisible(false);
                }


            }
        }

        for (let ball of my.sprite.cannonball){
            if (ball.visible){
                if (ball.dir == "top"){
                    ball.setY(ball.y+this.cannonBallSpeed)
                }
                else if (ball.dir == "bot") {
                    ball.setY(ball.y-this.cannonBallSpeed)
                }
                else if (ball.dir == "left") {
                    ball.setX(ball.x+this.cannonBallSpeed)
                }
                else if (ball.dir == "right") {
                    ball.setX(ball.x-this.cannonBallSpeed)
                }
                if (ball.x < 0 || ball.x > this.map.widthInPixels || ball.y < 0 || ball.y > this.map.heightInPixels){
                    ball.setVisible(false);
                }


            }
        }


    }

    resetCost(tileset) {
        for (let tileID = tileset.firstgid; tileID < tileset.total; tileID++) {
            let props = tileset.getTileProperties(tileID);
            if (props != null) {
                if (props.cost != null) {
                    this.finder.setTileCost(tileID, 1);
                }
            }
        }
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }

    // layersToGrid
    //
    // Uses the tile layer information in this.map and outputs
    // an array which contains the tile ids of the visible tiles on screen.
    // This array can then be given to Easystar for use in path finding.
    layersToGrid() {
        let grid = [];

        let width = this.map.width;
        let height = this.map.height;
        for (let j = 0; j < height; j++) {
            grid[j] = [];
        }
        let arrayOfLayers = this.map.layers;
        console.log(arrayOfLayers);

        for (let layer of arrayOfLayers) {
            for (let i = 0; i < height; i++) {
                for (let w = 0; w < width; w++) {
                    let tile = layer.tilemapLayer.getTileAt(w, i);
                    if (tile) grid[i][w] = tile.index;
                }
            }
        }
        console.log(grid);
        return grid;
    }


    handleClick(pointer) {
        let x = this.cameras.main.scrollX + pointer.x;
        let y = this.cameras.main.scrollY +pointer.y;
        // console.log(x + "," + y)
        let toX = Math.floor(x/this.TILESIZE);
        var toY = Math.floor(y/this.TILESIZE);
        var fromX = Math.floor(this.activeCharacter.x/this.TILESIZE);
        var fromY = Math.floor(this.activeCharacter.y/this.TILESIZE);
        // console.log('going from (' + fromX + ',' + fromY + ') to (' + toX + ',' + toY + ')');

        this.finder.findPath(fromX, fromY, toX, toY, (path) => {
            if (path === null) {
                console.warn("Path was not found.");
            } else {
                console.log(path);
                this.moveCharacter(path, this.activeCharacter, x, y);
            }
        });
        this.finder.calculate(); // ask EasyStar to compute the path
        // When the path computing is done, the arrow function given with
        // this.finder.findPath() will be called.
    }

    moveCharacter(path, character, mouseX, mouseY) {

        if (this.pathTween) this.pathTween.stop();
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for (var i = 0; i < path.length - 2; i++) {
            var ex = path[i + 1].x * this.TILESIZE + this.TILESIZE/4 + Math.random() * this.TILESIZE/2;
            var ey = path[i + 1].y * this.TILESIZE + this.TILESIZE/4 + Math.random() * this.TILESIZE/2;
            tweens.push({
                x: ex,
                y: ey,
                duration: 120  - this.playerSpeed
            });
        }
        tweens.push({
            x: mouseX,
            y: mouseY,
            duration: 120 - this.playerSpeed
        })

        this.pathTween = this.tweens.chain({
            targets: character,
            tweens: tweens,
            onComplete: () => {
                // this.destroy();
                this.pathTween = undefined;
            }
        });

    }

    spawnCannon(){
        let tempY;
        let tempX;
        let tempRotation;
        let tempSide;
        if (Math.floor(Math.random() * 2) == 1) {   //If true then we spawn on top of map.
            if (Math.floor(Math.random() * 2) == 1){
                tempY = 91;
                tempRotation = 1.58;
                tempSide = "top"
            }
            else{ 
                tempY = 1193;
                tempRotation = -1.58;
                tempSide = "bot"
            }
            tempX = Math.random() * (1152 - 128) + 128;

        }
        else {                                      //Spawn on side of map
            if (Math.floor(Math.random() * 2) == 1){ 
                tempX = 91;
                tempRotation = 0;
                tempSide = "left";
            }
            else{ tempX = 1193;
                tempRotation = 3.16;
                tempSide = "right";
            }
        

        tempY = Math.random() * (1152 - 128) + 128;
        }

        for (let can of my.sprite.cannon){
            if (!can.visible){
                //Set Rotation and Coordinates
                can.setX(tempX);
                can.setY(tempY);
                can.setRotation(tempRotation);
                //Set what side it is(for later shooting code)
                can.side = tempSide;
                //Make Visible
                can.setVisible(true);
                //set timer
                can.shootTimer = this.cannonShootTimer;
                break;
            }
        }


    }


    // A function which takes as input a tileset and then iterates through all
    // of the tiles in the tileset to retrieve the cost property, and then 
    // uses the value of the cost property to inform EasyStar, using EasyStar's
    // setTileCost(tileID, tileCost) function.
    setCost(tileset) {
        var acceptableTiles = [];
        for (let tileID = tileset.firstgid; tileID < tileset.total; tileID++) {
            let props = tileset.getTileProperties(tileID);
            if (props != null) {
                if (props.cost != null) {
                    if (props.cost < 100)acceptableTiles.push(tileID)
                    this.finder.setTileCost(tileID, props.cost);
                }
            }
        }
        console.log(acceptableTiles)
        this.finder.setAcceptableTiles(acceptableTiles)
    }



}
