class Shop extends Phaser.Scene {
    constructor() {
        super("shopScene");
    }

    preload() {
        this.load.setPath("./assets/");
        // Load the image
        this.load.image("Shop", "Shop.png");
        this.load.image("basicShoe", "greenshoe.png");
        this.load.image("coolshoe","cooler_shoes.png");
        this.load.image("coindupe","coinDupe.png");
        this.load.image("stopWatch","stopWatch.png");
        this.load.image("enDrink","energyDrink.png");
        this.load.image("shield","shield.png");
        this.load.image("soldOut","SoldOut.png");
    }

    create() {
        //Variables for shop
        this.basicShoeCost = 25;
        this.coinDupeCost = 75;
        this.enDrinkCost = 150;
        this.coolerShoeCost = 200;
        this.stopWatchCost = 80;
        this.shieldCost = 150;


        let scenevar = this;
        //Set canvas as image.
        this.background = this.add.image(0,0, "Shop").setOrigin(0,0);  

        this.basicShoeSprite = this.add.sprite(220,220,"basicShoe");
        this.basicShoeText = this.add.text(130,280," Basic Shoes\n+ Move Speed\n  "+this.basicShoeCost+" Coins",{
            fontSize: '28px',
            color: 'Black'
        })
        this.basicShoeSprite.setScale(5.5);

        this.coinDupeSprite = this.add.sprite(640,230,"coindupe");
        this.coinDupeText = this.add.text(510,290," Coin Duplicator\n+ 1 coin per coin\n    "+this.coinDupeCost+" Coins",{
            fontSize: '24px',
            color: 'Black'
        })
        this.coinDupeSprite.setScale(5.5);

        this.enDrinkSprite = this.add.sprite(1035,230,"enDrink");
        this.enDrinkText = this.add.text(940,290," Energy Drink\nFurther & more\n   Dashes!\n  "+this.enDrinkCost+" Coins",{
            fontSize: '24px',
            color: 'Black'
        })
        this.enDrinkSprite.setScale(5.5);


        this.coolerShoesSprite = this.add.sprite(220,560,"coolshoe");
        this.coolerShoesText = this.add.text(100,600,"  Cooler Shoes\n + Move Speed\nIgnore Obstacles\n   "+this.coolerShoeCost+" Coins",{
            fontSize: '26px',
            color: 'Black'
        })
        this.coolerShoesSprite.setScale(5.5);

        this.stopWatchSprite = this.add.sprite(630,560,"stopWatch");
        this.stopWatchShoes = this.add.text(510,610,"   Stop Watch\n Increased Coin \n   Streak Time\n    "+this.stopWatchCost+" Coins",{
            fontSize: '26px',
            color: 'Black'
        })
        this.stopWatchSprite.setScale(5.5);

        this.shieldSprite = this.add.sprite(1035,540,"shield");
        this.shieldText = this.add.text(945,610,"   Shield\n Block first\ndamage taken\n  "+this.shieldCost+" Coins",{
            fontSize: '26px',
            color: 'Black'
        })
        this.shieldSprite.setScale(5);


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


        this.calibrateScene();
        //Setup click input
        this.input.on('pointerup',this.handleClick, this);
    }

    update(){



    }


    calibrateScene(){
        if (globalThis.basicShoeUpgrade){
            this.soldOut1 = this.add.sprite(230,250,"soldOut").setOrigin(.5);
            this.soldOut1.setRotation(.4)
            this.soldOut1.setScale(0.8);
        }
        if (globalThis.coinDupeUpgrade){
            this.soldOut1 = this.add.sprite(640,250,"soldOut").setOrigin(.5);
            this.soldOut1.setRotation(.4)
            this.soldOut1.setScale(0.8);
        }
        if (globalThis.energyDrinkUpgrade){
            this.soldOut1 = this.add.sprite(1050,250,"soldOut").setOrigin(.5);
            this.soldOut1.setRotation(.4)
            this.soldOut1.setScale(0.8);
        }
        if (globalThis.coolShoesUpgrade){
            this.soldOut1 = this.add.sprite(230,580,"soldOut").setOrigin(.5);
            this.soldOut1.setRotation(.4)
            this.soldOut1.setScale(0.8);
        }
        if (globalThis.stopWatchUpgrade){
            this.soldOut1 = this.add.sprite(640,580,"soldOut").setOrigin(.5);
            this.soldOut1.setRotation(.4)
            this.soldOut1.setScale(0.8);
        }
        if (globalThis.shieldUpgrade){
            this.soldOut1 = this.add.sprite(1050,580,"soldOut").setOrigin(.5);
            this.soldOut1.setRotation(.4)
            this.soldOut1.setScale(0.8);
        }
    }



    //On Click
    handleClick(pointer) {
        //Get Coordinates
        let x = pointer.x;
        let y = pointer.y;
        if (x < 356 && x > 93 && y > 140 && y < 397){ /* Basic Shoes BUTTON */
            if (!globalThis.basicShoeUpgrade){
                if (globalThis.coin >= this.basicShoeCost){
                    globalThis.basicShoeUpgrade = true;
                    globalThis.coin -= this.basicShoeCost;
                    globalThis.upgradeCount++;
                    this.updateCoins();
                    this.calibrateScene();
                }
            }
        }
        else if (x < 766 && x > 504 && y > 140 && y < 397){/* Coin Duplicator BUTTON */
            if (!globalThis.coinDupeUpgrade){
                if (globalThis.coin >= this.coinDupeCost){
                    globalThis.coinDupeUpgrade = true;
                    globalThis.coin -= this.coinDupeCost;
                    globalThis.upgradeCount++;
                    this.updateCoins();
                    this.calibrateScene();
                }
            }
        }
        else if (x < 1176 && x > 913 && y > 140 && y < 397){/* Energy Drink BUTTON */
            if (!globalThis.energyDrinkUpgrade){
                if (globalThis.coin >= this.enDrinkCost){
                    globalThis.energyDrinkUpgrade = true;
                    globalThis.coin -= this.enDrinkCost;
                    globalThis.upgradeCount++;
                    this.updateCoins();
                    this.calibrateScene();
                }
            }
        }
        else if (x < 356 && x > 9 && y > 467 && y < 722){/* Cooler Shoes BUTTON */
            if (!globalThis.coolShoesUpgrade){
                if (globalThis.coin >= this.coolerShoeCost){
                    globalThis.coolShoesUpgrade = true;
                    globalThis.coin -= this.coolerShoeCost;
                    globalThis.upgradeCount++;
                    this.updateCoins();
                    this.calibrateScene();
                }
            }
        }
        else if (x < 766 && x > 504 && y > 467 && y < 722){/* StopWatch BUTTON */
            if (!globalThis.stopWatchUpgrade){
                if (globalThis.coin >= this.stopWatchCost){
                    globalThis.stopWatchUpgrade = true;
                    globalThis.coin -= this.stopWatchCost;
                    globalThis.upgradeCount++;
                    this.updateCoins();
                    this.calibrateScene();
                }
            }
        }
        else if (x < 1176 && x > 913 && y > 467 && y < 722){/* Shield BUTTON */
            if (!globalThis.shieldUpgrade){
                if (globalThis.coin >= this.shieldCost){
                    globalThis.shieldUpgrade = true;
                    globalThis.coin -= this.shieldCost;
                    globalThis.upgradeCount++;
                    this.updateCoins();
                    this.calibrateScene();
                }
            }
        }
        else if ((x > 1 && x < 93 && y > 724 && y < 791) || (x > 93 && x < 280 && y < 791 && y > 732))
        {
            this.scene.start("menuScene");
        }
    }

}