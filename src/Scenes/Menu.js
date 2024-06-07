class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load townsfolk
        this.load.image("background", "DodgerMenu.png");

    }

    create() {
        this.background = this.add.image(0,0, "background").setOrigin(0,0);  
        this.background.setScale(1.2);      


        this.input.on('pointerup',this.handleClick, this);
        //  this.scene.start("pathfinderScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }



    handleClick(pointer) {
        let x = pointer.x;
        let y = pointer.y;
        if (x < 855 && x > 484 && y > 225 && y < 327){
            //Play button pressed
            this.scene.start("pathfinderScene");
        }
        else if (x < 855 && x > 484 && y > 410 && y < 515){
            //Shop button pressed
            console.log("shop button pressed");
        }
        else if (x < 855 && x > 484 && y > 600 && y < 700){
            //Shop button pressed
            console.log("settings button pressed");
        }
    }
}