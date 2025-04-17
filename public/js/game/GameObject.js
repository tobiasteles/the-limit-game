class GameObject {
    constructor(config) {
      this.x = config.x || 0;
      this.y = config.y || 0;
      // Use Sprite como padrão se config.sprite não existir
      const SpriteClass = config.sprite || Sprite;
      this.sprite = new SpriteClass({
        gameObject: this,
        src: config.src || "/public/assets/sprites/SpriteSheet/Assassin/assassin.png",
      });
    }
  }