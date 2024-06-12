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
        this.dashDistance = 200;
        this.dashDuration = 200;
        this.currentCoinCollected = 0;

        this.cannonTimer = 0;
        this.cannonRespawn = 90;
        this.spawnCounter = 0;
        this.targetSpawn = 5;
        this.playerHP = 3;
        this.hasArmor = false;
        this.coinDuplicator = false;

        this.cannonShootTimer = 180;
        this.cannonCount = 100;
        this.cannonBallSpeed = 5;
        this.cannonSpawnPerSpawn = 2;
        this.shield = false;


        this.dashCooldown = 0;
        this.dashCooldownReset = 300;
        this.dashing = false;
        this.exitVisible = false;
        this.coinExitGoal = 20;
        this.coinStreak = 0;
        this.coinStreakTracker = 0;
        this.coinStreakReset = 180;
        this.barWidth = 40; 
        this.barHeight = 10; 
    }

    create() {
        let scenevar = this;
        // Create a new tilemap which uses 64x64 tiles, and is 20 tiles wide and 20 tiles tall
        this.map = this.add.tilemap("basic-map", this.TILESIZE, this.TILESIZE, this.TILEWIDTH, this.TILEHEIGHT);
        console.log(this.map)
        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("tilesheet_complete", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Obstacles", this.tileset, 0, 0);
        this.exitLayer = this.map.createLayer("Exit", this.tileset, 0, 0);
        this.exitLayer.setVisible(false);

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
        my.sprite.coin = [];
        for (let i = 0; i < 6; i++){
            my.sprite.coin[i] = this.add.sprite(0,0,"coin").setOrigin(.5);
            my.sprite.coin[i].setVisible(false);
            my.sprite.coin[i].setScale(0.15);
        }

        this.setLevel();


        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        console.log("bounds:" + this.map.widthInPixels + "," + this.map.heightInPixels)
        this.cameras.main.startFollow(my.sprite.purpleTownie, true, 0.5, 0.5);
        this.cameras.main.setDeadzone(25, 25);
        this.cameras.main.setZoom(this.SCALE / 2);

        // Create grid of visible tiles for use with path planning
        let tinyTownGrid = this.layersToGrid();
        console.log(tinyTownGrid)

        //Collision Check Function.
        this.runCollisionCheck = (spriteA,spriteB) => {
            const boundsA = spriteA.getBounds();
            const boundsB = spriteB.getBounds();

            return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
        }

        this.updateSpaceCooldown = function() {
            if (my.sprite.spaceCooldown) {
                my.sprite.spaceCooldown.destroy(true);
            }
            my.sprite.spaceCooldown = scenevar.add.text(0,750,"Dash Cooldown: "+(this.dashCooldown/60).toFixed(1)+" SPACE",{
            color: "Gold",
            fontSize: '40px',
            strokeThickness: 0.3,
            stroke: "Black"
        }).setScrollFactor(0);
        if (this.dashCooldown == 0){
            my.sprite.spaceCooldown.setColor('GreenYellow');
        }
    }
        this.updateSpaceCooldown();

        this.updateHealth = function() {
            if (my.sprite.healthText) {
                my.sprite.healthText.destroy(true);
            }
            if (!this.shield){
            my.sprite.healthText = scenevar.add.text(0,0,"Health: "+this.playerHP,{
            color: "Red",
            fontSize: '40px',
            strokeThickness: 0.5,
            stroke: "Black"
        }).setScrollFactor(0);
    }
        if (this.shield) {
            my.sprite.healthText = scenevar.add.text(0,0,"Health: "+this.playerHP+ " (SHIELDED)",{
                color: "Blue",
                fontSize: '40px',
                strokeThickness: 0.5,
                stroke: "Black"
            }).setScrollFactor(0);
        }


    }
        this.updateHealth();

        this.updateCoinStreak = function() {
            if (my.sprite.coinStreakText) {
                my.sprite.coinStreakText.destroy(true);
            }
            my.sprite.coinStreakText = scenevar.add.text(this.cameras.main.scrollX + my.sprite.purpleTownie.x-25,my.sprite.purpleTownie.y - this.cameras.main.scrollY - 70,this.coinStreak+"x",{
            color: "Yellow",
            fontSize: '30px',
            strokeThickness: 0.5,
            stroke: "Black"
        }).setScrollFactor(0);
            if (this.coinStreak < 4){
                my.sprite.coinStreakText.setVisible(false);
            }
    }
        this.updateCoinStreak();
        
        this.updateCoins = function() {
            if (my.sprite.coinText) {
                my.sprite.coinText.destroy(true);
            }
            my.sprite.coinText = scenevar.add.text(this.map.widthInPixels-250,0,"Coins: "+globalThis.coin,{
            color: "Gold",
            fontSize: '40px',
            strokeThickness: 0.5,
            stroke: "Black"
        }).setScrollFactor(0);
    }
        this.updateCoins();

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
        this.input.keyboard.on('keydown-SPACE', this.dashTowardsPointer, this);


        this.calibrateScene();
        this.frameTime = 0;
        this.bar = this.add.graphics();
        this.updateBar();
        console.log("Level: "+globalThis.level);
    }

    update(time, delta) {
        this.updateCoinStreak();
        this.updateBar();
        this.frameTime += delta
        if (this.frameTime > 16.5) {
            if (this.coinStreakTracker > 0) this.coinStreakTracker -= 1;
            this.cannonTimer++;
            if (this.dashCooldown > 0) {
                this.dashCooldown--;
                this.updateSpaceCooldown();
            }
            if (this.cannonTimer > this.cannonRespawn) {
                this.spawnCannon(this.cannonSpawnPerSpawn);    //Spawn 2 cannons.
                this.cannonTimer = 0;
                // this.spawnCounter += 2;
                //Spawn a coin when a cannon spawns
                this.spawnCoin();
                if (this.spawnCounter >= this.targetSpawn){
                    if (this.cannonRespawn > 10) this.cannonRespawn -= 7;
                    this.targetSpawn += 4;
                    this.spawnCounter = 0;
                }
            }
            
            if (this.coinStreakTracker <= 0){
                this.coinStreak = 0;
            }

            for (let coin of my.sprite.coin){
                if (coin.visible){
                    if (this.runCollisionCheck(my.sprite.purpleTownie,coin)){
                        //When player hits coin
                        this.coinStreakTracker = this.coinStreakReset;
                        this.coinStreak++;
                        if (this.coinStreak >= 10){
                            let temp = Math.random() * (5 - 1) + 1;
                            temp = Math.floor(temp)
                            if (temp == 1){
                                globalThis.coin++; //20% chance you get 2 coins if your streak is above 10.
                                this.currentCoinCollected++; 
                            }
                        }
                        if (this.coinDuplicator){   //If the player has purhcased the coin duplicator they get +1 coin per coin.
                            globalThis.coin++;
                            this.currentCoinCollected++;
                        }
                        globalThis.coin++;
                        this.currentCoinCollected++;
                        coin.setVisible(false);
                        this.updateCoins();
                        this.spawnCannon(this.cannonSpawnPerSpawn);
                    }
                }
            }

            if (!this.exitVisible){
                if (this.currentCoinCollected >= this.coinExitGoal) {
                    this.exitLayer.setVisible(true);
                    this.exitVisible = true;
                }

            }
            else {
                if (my.sprite.purpleTownie.x > 576 && my.sprite.purpleTownie.x < 704 && my.sprite.purpleTownie.y < 192){    //If it is where my exit is
                    if (this.currentCoinCollected > globalThis.topRun){
                        globalThis.topRun = this.currentCoinCollected;
                    }   //Save top score.
                    this.scene.start("menuScene");
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
                        //Set Visible
                        can.setVisible(false);
                    }


                }
            }

            for (let ball of my.sprite.cannonball){
                if (ball.visible){
                    //Move every visible ball in a direction based on its stored variable.
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
                    }   //When its out of bounds make it invisible/despawn it
                    if (ball.x < 0 || ball.x > this.map.widthInPixels || ball.y < 0 || ball.y > this.map.heightInPixels){
                        ball.setVisible(false);
                    }

                    if (!this.dashing){
                        if (this.runCollisionCheck(ball,my.sprite.purpleTownie)) {
                            if (this.shield) {
                                this.shield = false;
                                //Play shield particle? 
                            }
                            else this.playerHP--;
                            this.updateHealth();
                            ball.setVisible(false);
                        }
                    }


                }
            }
            //If we get hit 3 times go back to the menu (for now)
            if (this.playerHP <= 0){
                if (this.currentCoinCollected > globalThis.topRun){ 
                    globalThis.topRun = this.currentCoinCollected;  //Save run if best score
                }
                globalThis.coin -= 10; //Lose 10 coins when u die.
                if (globalThis.coin < 0) globalThis.coin = 0; 
                //Go to menu scene again.
                this.scene.start("menuScene");
            }
            this.frameTime = 0;
        }
    }
    //Not used but keeping just in case. Sets the cost of all the tiles on the map to be 1 so every tile is walkable.
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

    calibrateScene(){
        if (globalThis.basicShoeUpgrade){
            this.playerSpeed += 35;
        }
        if (globalThis.coinDupeUpgrade){
            this.coinDuplicator = true;
        }
        if (globalThis.energyDrinkUpgrade){
            this.dashCooldownReset = 210;
            this.dashDistance = 300;
        }
        if (globalThis.coolShoesUpgrade){
            this.playerSpeed += 35;
            this.resetCost(this.tileset);
        }
        if (globalThis.stopWatchUpgrade){
            this.coinStreakReset += 90;
        }
        if (globalThis.shieldUpgrade){
            this.shield = true;
            this.updateHealth();
        }

        if (globalThis.upgradeCount >= 5){
            globalThis.level = 3;
        }
        else if (globalThis.upgradeCount >= 3){
            globalThis.level = 2;
        }
        else if (globalThis.upgradeCount >= 1){
            globalThis.level = 1;
        }
        this.setLevel();
    }

    updateBar() {
        // Clear the previous bar
        this.bar.clear();

        // Calculate the current width of the bar based on the current value
        let currentBarWidth = (this.coinStreakTracker / this.coinStreakReset) * this.barWidth;

        // Draw the background of the bar (e.g., gray)
        this.bar.fillStyle(0x808080);
        this.bar.fillRect(20, 20, this.barWidth, this.barHeight);

        // Draw the current value of the bar (e.g., green)
        this.bar.fillStyle(0x00ff00);
        this.bar.fillRect(20, 20, currentBarWidth, this.barHeight);

        if (this.coinStreak < 4) {
            this.bar.setVisible(false);
        }
        else this.bar.setVisible(true);

        this.bar.setX(this.cameras.main.scrollX + my.sprite.purpleTownie.x-40)
        this.bar.setY(my.sprite.purpleTownie.y - 60)
    }

    //Convert coordinate to tile
    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }
    //Convert coordinate to tile
    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }

    spawnCoin(){
        let tempX = Math.random() * (1048 - 128) + 128;
        let tempY = Math.random() * (1048 - 130) + 130;
        for (let coin of my.sprite.coin){
            if (!coin.visible){
                coin.setPosition(tempX,tempY);
                coin.setVisible(true);
                break;
        }}

    }

    // layersToGrid
    //
    // Uses the tile layer information in this.map and outputs
    // an array which contains the tile ids of the visible tiles on screen.
    // This array can then be given to Easystar for use in path finding.
    layersToGrid() {
        //Create array
        let grid = [];
        //save variables to make it easier
        let width = this.map.width;
        let height = this.map.height;
        //Create 2D array
        for (let j = 0; j < height; j++) {
            grid[j] = [];
        }
        //Save layers into an array
        let arrayOfLayers = this.map.layers;
        //Cycle through  array and for every tile save a tile index at it.
        for (let layer of arrayOfLayers) {
            for (let i = 0; i < height; i++) {
                for (let w = 0; w < width; w++) {
                    let tile = layer.tilemapLayer.getTileAt(w, i);
                    if (tile) grid[i][w] = tile.index;
                }
            }
        }
        return grid;
    }


    handleClick(pointer) {
        //Save the x and y of where the player clicked.
        let x = this.cameras.main.scrollX + pointer.x;
        let y = this.cameras.main.scrollY +pointer.y;
        // Convert it to tiles.
        let toX = Math.floor(x/this.TILESIZE);
        var toY = Math.floor(y/this.TILESIZE);
        //Get players current location
        var fromX = Math.floor(this.activeCharacter.x/this.TILESIZE);
        var fromY = Math.floor(this.activeCharacter.y/this.TILESIZE);

        this.finder.findPath(fromX, fromY, toX, toY, (path) => {
            if (path === null) {
                console.warn("Path was not found.");
            } else {
                this.moveCharacter(path, this.activeCharacter, x, y);
            }
        });
        this.finder.calculate(); // ask EasyStar to compute the path
        // When the path computing is done, the arrow function given with
        // this.finder.findPath() will be called.
    }

    moveCharacter(path, character, mouseX, mouseY) {
        if (this.pathTween) this.pathTween.stop();  //If the path exists we immediately stop it to avoid conflicts
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for (var i = 0; i < path.length - 2; i++) {
            //Move along path, a little bit of random numbers to make the player not walk straight.
            var ex = path[i + 1].x * this.TILESIZE + this.TILESIZE / 2;
            // var ey = path[i + 1].y * this.TILESIZE + this.TILESIZE/4 + Math.random() * this.TILESIZE/2;
            var ey = path[i+1].y * this.TILESIZE + this.TILESIZE / 2;
            //Push numbers to the tween
            tweens.push({
                x: ex,
                y: ey,
                duration: 225  - this.playerSpeed
            });
        }
        //Last point in the travel will be exactly where the player clicked.
        tweens.push({
            x: mouseX,
            y: mouseY,
            duration: 225 - this.playerSpeed
        })
        //Run's the tween.
        this.pathTween = this.tweens.chain({
            targets: character,
            tweens: tweens,
            onComplete: () => {
                // this.destroy();
                this.pathTween = undefined;
            }
        });

    }

    dashTowardsPointer() {
        if (this.dashCooldown > 0) return;
        this.dashCooldown = this.dashCooldownReset;
        if (this.pathTween) this.pathTween.stop();
        let pointer = this.input.activePointer;
        let mouseX = this.cameras.main.scrollX + pointer.x;
        let mouseY = this.cameras.main.scrollY + pointer.y;
        //Dont dash out of the map :(
        if (mouseX < 128) mouseX = 135;
        else if (mouseX > 1152) mouseX = 1148;
        if (mouseY < 128) mouseY = 135;
        else if (mouseY > 1152) mouseY = 1148; 

        let direction = new Phaser.Math.Vector2(mouseX - this.activeCharacter.x, mouseY - this.activeCharacter.y);
        direction.normalize();
        
        let dashX = this.activeCharacter.x + direction.x * this.dashDistance;
        let dashY = this.activeCharacter.y + direction.y * this.dashDistance;

        if (this.dashTween) this.dashTween.stop();
        this.dashing = true;

        this.dashTween = this.tweens.add({
            targets: this.activeCharacter,
            x: dashX,
            y: dashY,
            duration: this.dashDuration,
            ease: 'Power2',
            onComplete: () => {
                //TP player back after they dash out.
                if (my.sprite.purpleTownie.x < 128) my.sprite.purpleTownie.setX(135);
                else if (my.sprite.purpleTownie.x > 1152) my.sprite.purpleTownie.setX(1148);
                if (my.sprite.purpleTownie.y < 128) my.sprite.purpleTownie.setY(135);
                else if (my.sprite.purpleTownie.y > 1152) my.sprite.purpleTownie.setY(1148);
                //This is used to disable collision checks on cannon balls during the dash.
                this.dashing = false; 
                this.dashTween = undefined;
            }
        });
    }


    //Level Manager. Here we can adjust the values of the game when the difficulty increases.
    setLevel(){
        switch(globalThis.level) {
            case 1: 
                this.cannonSpawnPerSpawn = 3;
                this.targetSpawn = 10;
                this.coinExitGoal = 25;
                this.cannonShootTimer = 170;
                break;
            case 2: 
                this.cannonSpawnPerSpawn = 4;
                this.targetSpawn = 12;
                this.coinExitGoal = 30;
                this.cannonShootTimer = 160;
                break;
            case 3: 
                this.cannonSpawnPerSpawn = 5;
                this.targetSpawn = 15;
                this.coinExitGoal = 35;
                this.cannonShootTimer = 150;
                break;
            default:
                break;
            
        }



    }

    //Spawns a cannon on a random part of the map,  using the restrictions i gave it.
    spawnCannon(number = 1){
        let tempY;
        let tempX;
        let tempRotation;
        let tempSide;
        for (let i = 0; i < number; i++){
            this.spawnCounter++;
            //Get and save coordinates so we can spawn.
            if (Math.floor(Math.random() * 2) == 1) {   //50/50 for if it'll appear on the sides or top/bottom.
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
        }}

        //Spawn the cannons. Cycle through our cannon objects.
        for (let can of my.sprite.cannon){
            //Find the first one thats not currently on screen.
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
                    if (props.cost < 100 || props.cost > 400)acceptableTiles.push(tileID)
                    this.finder.setTileCost(tileID, props.cost);
                }
            }
        }
        console.log(acceptableTiles)
        this.finder.setAcceptableTiles(acceptableTiles)
    }



}
