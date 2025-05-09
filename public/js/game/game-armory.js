// game-armory.js: Lógica da seção Armeiro

console.log("game-armory.js: Carregado.");

function populateArmeiroShop() {
    // Requer: uiElements, WEAPON_CATALOG_DATA (globais de game-main.js)
    // Requer: populateShop (função global de game-main.js ou de um futuro game-shop-utils.js)
    if (typeof populateShop === 'function') {
        populateShop(uiElements.armeiroShopContent, WEAPON_CATALOG_DATA, "Armas Disponíveis");
    } else {
        console.error("populateShop function is not defined. Make sure it's loaded from game-main.js or a shared shop utility file.");
    }
}

// A função populateArmeiroShop será chamada por updateUI em game-main.js
// quando playerState.activeSection === "armeiro".
// Os event listeners para os botões de compra dentro da loja são configurados por populateShop.

