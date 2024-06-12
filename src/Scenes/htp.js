class HTP extends Phaser.Scene {
    constructor() {
        super("howScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("backimg", "htp.png")
    }

    create(){

        this.background = this.add.image(0,0, "backimg").setOrigin(0,0);  
        this.input.on('pointerup',this.handleClick, this);
    }


   handleClick(pointer) {
        //Get Coordinates
        let x = pointer.x;
        let y = pointer.y;
        if (x < 385 && x > 27 && y > 682 && y < 793){ /* Basic Shoes BUTTON */
            this.scene.start("menuScene");
        }
    }

}