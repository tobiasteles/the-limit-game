// game-inventory.js: Lógica da seção Inventário

console.log("game-inventory.js: Carregado.");

function renderInventory() {
    // Requer: uiElements, playerState (globais de game-main.js)
    if (!uiElements.inventoryGrid || !playerState.id) return;
    uiElements.inventoryGrid.innerHTML = ""; 
    if(uiElements.inventoryGoldDisplay) uiElements.inventoryGoldDisplay.textContent = `Ouro: ${playerState.gold}`;

    for (let i = 0; i < playerState.inventory.length; i++) {
        const item = playerState.inventory[i];
        const slotDiv = document.createElement("div");
        slotDiv.classList.add("inventory-slot");
        slotDiv.dataset.slotIndex = i;

        if (item) {
            const itemImg = document.createElement("img");
            // Assumindo que os sprites dos itens estão em ./assets/sprites/items/
            itemImg.src = `./assets/sprites/items/${item.sprite || "default_item.png"}`;
            itemImg.alt = item.name;
            itemImg.classList.add("item-sprite");
            slotDiv.appendChild(itemImg);
            
            const tooltip = document.createElement("div");
            tooltip.classList.add("tooltip");
            let tooltipText = `<strong>${item.name}</strong><br>Tipo: ${item.type}<br>`;
            if(item.stats) {
                for(const stat in item.stats) {
                    tooltipText += `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${item.stats[stat]}<br>`;
                }
            }
            if(item.cost) tooltipText += `Valor: ${item.cost} Ouro`; // Alterado de Custo para Valor no tooltip do inventário
            tooltip.innerHTML = tooltipText;
            slotDiv.appendChild(tooltip);

            // Adicionar funcionalidade de clique para equipar/usar (a ser implementado)
            slotDiv.addEventListener("click", () => handleInventoryItemClick(i));
        } else {
            slotDiv.classList.add("empty-slot");
        }
        uiElements.inventoryGrid.appendChild(slotDiv);
    }
}

function handleInventoryItemClick(slotIndex) {
    // Requer: playerState, showNotification, updateUI, savePlayerCharacterData (globais de game-main.js)
    const item = playerState.inventory[slotIndex];
    if (!item) return;

    // Lógica de confirmação e equipar/usar item
    // Exemplo simples: Equipar se for equipamento, consumir se for consumível
    if (["weapon", "helmet", "chest", "gloves", "boots"].includes(item.type)) {
        // Lógica para equipar
        const currentEquipped = playerState.equipment[item.type];
        playerState.equipment[item.type] = item; // Equipa o novo item
        playerState.inventory[slotIndex] = currentEquipped; // Coloca o item antigo no inventário (ou null se não havia)
        showNotification(`${item.name} equipado.`, "info");
    } else if (item.type === "consumable") {
        // Lógica para consumir (ex: poção de HP)
        // playerState.hp = Math.min(playerState.maxHp, playerState.hp + item.effect.hpBoost);
        // playerState.inventory[slotIndex] = null; // Remove do inventário
        // showNotification(`${item.name} consumido.`, "info");
        showNotification(`Funcionalidade de consumir ${item.name} ainda não implementada.`, "warning");
    } else {
        showNotification(`Não é possível usar/equipar ${item.name} diretamente daqui.`, "warning");
    }
    
    if (typeof updateUI === 'function') updateUI();
    if (typeof savePlayerCharacterData === 'function') savePlayerCharacterData();
}

// A função renderInventory será chamada por updateUI em game-main.js
// quando playerState.activeSection === "inventario".

