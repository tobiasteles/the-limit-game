// game-armor-shop.js: Lógica da seção Loja de Armaduras

console.log("game-armor-shop.js: Carregado.");

function initializeArmorShop() {
    // Lógica de inicialização para a seção de Loja de Armaduras, se necessário
    console.log("Armor Shop initialized");
}

// Função para popular a loja de armaduras
function populateArmorShop() {
    // Requer: uiElements, ARMOR_CATALOG_DATA, populateShop (globais de game-main.js)
    if (typeof window.populateShop === 'function' && window.uiElements && window.uiElements.armadurasShopContent && window.ARMOR_CATALOG_DATA) {
        window.populateShop(window.uiElements.armadurasShopContent, window.ARMOR_CATALOG_DATA, "Armaduras Disponíveis");
    } else {
        console.error("Erro em populateArmorShop: window.populateShop, window.uiElements.armadurasShopContent ou window.ARMOR_CATALOG_DATA não definidos.");
        if (typeof window.showNotification === 'function') {
            window.showNotification("Erro ao carregar a Loja de Armaduras. Verifique o console.", "error");
        }
    }
}

// Expor funções se necessário
window.initializeArmorShop = initializeArmorShop;
window.populateArmorShop = populateArmorShop; // Expondo para ser chamado pelo game-main.js ou outros módulos

// Chamar populateArmorShop quando o DOM estiver pronto e os dados carregados, 
// ou quando a seção for ativada (controlado por game-main.js)
// Exemplo de como pode ser chamado em game-main.js na função updateUI:
// if (playerState.activeSection === "armaduras" && typeof window.populateArmorShop === "function") window.populateArmorShop();

