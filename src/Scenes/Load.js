class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load townsfolk
        this.load.image("purple", "purple_townie.png");
        this.load.image("blue", "blue_townie.png");
        this.load.image("cannon", "cannon.png");
        this.load.image("cannonBall","cannonBall.png");
        this.load.image("coin","coin.png");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilesheet_complete.png");                   // Packed tilemap
        this.load.tilemapTiledJSON("basic-map", "basic-map.tmj");   // Tilemap in JSON
    }

    create() {
        globalThis.coin = 0;
        globalThis.topRun = 0;
        globalThis.level = 0;
        globalThis.firstPlay = true;
        globalThis.upgradeCount = 0;

        //Set upgrade variables
        globalThis.basicShoeUpgrade = false;
        globalThis.coinDupeUpgrade = false;
        globalThis.energyDrinkUpgrade = false;
        globalThis.coolShoesUpgrade = false;
        globalThis.stopWatchUpgrade = false;
        globalThis.shieldUpgrade = false;



         // ...and pass to the next Scene
         this.scene.start("menuScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}