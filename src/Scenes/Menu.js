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
        //Set canvas as image.
        this.background = this.add.image(0,0, "background").setOrigin(0,0);  
        this.background.setScale(1.2);      

        //Setup click input
        this.input.on('pointerup',this.handleClick, this);
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
            this.scene.start("pathfinderScene"); //Goto start scene. Might add more here later.
        }
        else if (x < 855 && x > 484 && y > 410 && y < 515){/* SHOP BUTTON */
            console.log("shop button pressed"); //No shop created yet
        }
        else if (x < 855 && x > 484 && y > 600 && y < 700){/* SETTINGS BUTTON */
            console.log("settings button pressed"); //No settings created yet
        }
    }
}