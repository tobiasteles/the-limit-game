// game-armory.js

function initializeArmory() {
    // Lógica de inicialização para a seção de Armeiro, se necessário
    console.log("Armory initialized");
}

// Exemplo de função para exibir itens no Armeiro
function displayArmoryItems() {
    const armoryContent = document.getElementById('content-armory');
    if (!armoryContent) return;

    // Limpa conteúdo anterior
    armoryContent.innerHTML = '';

    // Supondo que WEAPON_CATALOG e ARMOR_CATALOG sejam acessíveis globalmente
    // ou passados de alguma forma para esta função/módulo.
    // Esta é uma simplificação. Em um aplicativo real, você gerenciaria o estado de forma mais robusta.

    const weaponsTitle = document.createElement('h4');
    weaponsTitle.textContent = "Armas Disponíveis";
    armoryContent.appendChild(weaponsTitle);

    WEAPON_CATALOG.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item'; // Para estilização
        itemDiv.innerHTML = `<strong>${item.name}</strong><br>
                             Custo: ${item.cost} Ouro<br>
                             Ataque: ${item.stats.attack || 'N/A'}<br>
                             <button class="buy-btn" data-item-id="${item.id}" data-item-type="weapon">Comprar</button>`;
        armoryContent.appendChild(itemDiv);
    });

    const armorTitle = document.createElement('h4');
    armorTitle.textContent = "Armaduras Disponíveis";
    armoryContent.appendChild(armorTitle);

    ARMOR_CATALOG.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item'; // Para estilização
        itemDiv.innerHTML = `<strong>${item.name}</strong><br>
                             Defesa: ${item.stats.defense || 'N/A'}<br>
                             Custo: ${item.cost} Ouro<br>
                             <button class="buy-btn" data-item-id="${item.id}" data-item-type="armor">Comprar</button>`;
        armoryContent.appendChild(itemDiv);
    });

    // Adiciona event listeners aos novos botões de compra
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Lógica para comprar o item, por exemplo, chamar uma função handlePurchase
            // que você definiria, passando o ID do item e o tipo.
            console.log(`Tentando comprar ${button.dataset.itemId} do tipo ${button.dataset.itemType}`);
            // Exemplo: handlePurchase(button.dataset.itemId, button.dataset.itemType);
        });
    });
}

// Expor funções se necessário, por exemplo, para serem chamadas de outros módulos ou HTML
window.initializeArmory = initializeArmory;
window.displayArmoryItems = displayArmoryItems;

