// game-armor-shop.js: Lógica da seção Loja de Armaduras

console.log("game-armor-shop.js: Carregado.");

import { uiElements, playerState } from "js/game/game-main.js"; // Requer: game-main.js'

function populateArmadurasShop() {
    // Requer: uiElements, ARMOR_CATALOG_DATA (globais de game-main.js)
    // Requer: populateShop (função global de game-main.js ou de um futuro game-shop-utils.js)
    if (typeof populateShop === 'function') {
        populateShop(uiElements.armadurasShopContent, ARMOR_CATALOG_DATA, "Armaduras Disponíveis");
    } else {
        console.error("populateShop function is not defined. Make sure it's loaded from game-main.js or a shared shop utility file.");
    }
}

// A função populateArmadurasShop será chamada por updateUI em game-main.js
// quando playerState.activeSection === "armaduras".
// Os event listeners para os botões de compra dentro da loja são configurados por populateShop.

