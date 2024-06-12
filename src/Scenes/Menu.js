class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    preload() {
        this.load.setPath("./assets/");
        // Load the image
        this.load.image("background", "DodgerMenu.png");

    }

    create() {
        let scenevar = this;
        //Set canvas as image.
        this.background = this.add.image(0,0, "background").setOrigin(0,0);  
        this.background.setScale(1.2);      
        this.coinsNeeded = 20;
        console.log(globalThis.coin);

        //Load Fonts into the game
        function loadFont(name, url) {
            var newFont = new FontFace(name, `url(${url})`);
            newFont.load().then(function (loaded) {
                document.fonts.add(loaded);
            }).catch(function (error) {
                return error;
            });
        }

        loadFont("electrox", "assets/electrox.ttf");

        //Setup click input
        this.input.on('pointerup',this.handleClick, this);

        this.updateCoins = function() {
            if (my.sprite.coinText) {
                my.sprite.coinText.destroy(true);
            }
            my.sprite.coinText = scenevar.add.text(970,0,"Coins: "+globalThis.coin,{
            color: "Gold",
            fontSize: '40px',
            strokeThickness: 0.5,
            stroke: "Black"
        })
    }
        this.updateCoins();

        if (!globalThis.firstPlay){
            my.sprite.bestRunText = this.add.text(100,300,"Best Run: "+globalThis.topRun,{
                fontFamily: 'electrox',
                fontSize: '70px',
                color: "red"
            });
        }


    }

    // Update isn't currently used.
    update() {
    }


    //On Click
    handleClick(pointer) {
        //Get Coordinates
        let x = pointer.x;
        let y = pointer.y;
        if (x < 855 && x > 484 && y > 225 && y < 327){ /* PLAY BUTTON */
            globalThis.firstPlay = false;
            this.scene.start("pathfinderScene"); //Goto start scene. Might add more here later.
        }
        else if (x < 855 && x > 484 && y > 410 && y < 515){/* SHOP BUTTON */
            this.scene.start("shopScene");
        }
        else if (x < 855 && x > 484 && y > 600 && y < 700){/* SETTINGS BUTTON */
            console.log("settings button pressed"); //No settings created yet
        }
    }
}