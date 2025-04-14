export class MapGenerator {
    constructor(width, height) {
        this.tileSize = 64;
        this.tiles = this.generateMap(width, height);
    }

    generateMap(width, height) {
        // Gerar mapa procedural com diferentes biomas
        const map = [];
        // Lógica de geração de mapa aqui...
        return map;
    }

    draw(ctx, player) {
        // Renderizar tiles visíveis apenas
        const startX = Math.max(0, Math.floor(player.x / this.tileSize) - 10);
        const startY = Math.max(0, Math.floor(player.y / this.tileSize) - 10);
        
        for(let y = startY; y < startY + 20; y++) {
            for(let x = startX; x < startX + 20; x++) {
                // Desenhar tile
                ctx.fillStyle = this.getTileColor(x, y);
                ctx.fillRect(
                    x * this.tileSize - player.x + ctx.canvas.width/2,
                    y * this.tileSize - player.y + ctx.canvas.height/2,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
    }

    getTileColor(x, y) {
        // Lógica de biomas
        return '#1B1B2F'; // Exemplo
    }
}