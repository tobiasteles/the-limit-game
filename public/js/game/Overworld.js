class Overworld {
    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        
    }

    init() {
        const image = new Image();
        image.onload = () => {
            this.ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.canvas.width, this.canvas.height);
        };
        image.src = "/public/assets/maps/DemoLower.png";


        const x = 0;
        const y = 0;
        const hero = new Image();
        hero.onload = () => {
            this.ctx.drawImage(
                hero, 
                0, 
                0, 
                1000, 
                1000, 
                x, 
                y, 
                32, 
                32);
        }
        hero.src = "/public/assets/sprites/SpriteSheet/Assassin.png";
    }

}