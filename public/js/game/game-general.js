// game-general.js: Lógica da seção Geral

let isResting = false; 
let restInterval = null;

function updateGeralSection() { 
    // Requer: uiElements, playerState
    if (!uiElements.geralStatusCompleto || !uiElements.geralEquipamentosAtivos || !playerState.id) return;
    let statusHtml = `
        <p><strong>Nome:</strong> ${playerState.name}</p>
        <p><strong>Classe:</strong> ${playerState.class}</p>
        <p><strong>Nível:</strong> ${playerState.level}</p>
        <p><strong>HP:</strong> ${playerState.hp}/${playerState.maxHp}</p>
        <p><strong>MP:</strong> ${playerState.mp}/${playerState.maxMp}</p>
        <p><strong>EXP:</strong> ${playerState.exp}/${playerState.maxExp}</p>
        <p><strong>Ouro:</strong> ${playerState.gold}</p>
        <p><strong>Atributos:</strong> Força(${playerState.attributes.strength}), Agilidade(${playerState.attributes.agility}), Inteligência(${playerState.attributes.intelligence}), Vitalidade(${playerState.attributes.vitality})</p>
    `;
    uiElements.geralStatusCompleto.innerHTML = statusHtml;
    let equipHtml = "<h4>Equipamentos Ativos:</h4>";
    for (const slot in playerState.equipment) {
        const item = playerState.equipment[slot];
        equipHtml += `<p><strong>${slot.charAt(0).toUpperCase() + slot.slice(1)}:</strong> ${item ? item.name : "Nenhum"}</p>`;
    }
    uiElements.geralEquipamentosAtivos.innerHTML = equipHtml;
}

function toggleRest() {
    // Requer: playerState, uiElements, showNotification, updateUI (global ou passada)
    if (!playerState.id) return;
    if (isResting) {
        clearInterval(restInterval);
        isResting = false;
        if (uiElements.descansarBtn) uiElements.descansarBtn.textContent = "Descansar";
        showNotification("Você parou de descansar.", "info");
    } else {
        isResting = true;
        if (uiElements.descansarBtn) uiElements.descansarBtn.textContent = "Parar Descanso";
        showNotification("Você começou a descansar. HP e MP serão recuperados lentamente.", "info");
        restInterval = setInterval(() => {
            let recovered = false;
            if (playerState.hp < playerState.maxHp) {
                playerState.hp = Math.min(playerState.maxHp, playerState.hp + Math.ceil(playerState.maxHp * 0.05)); 
                recovered = true;
            }
            if (playerState.mp < playerState.maxMp) {
                playerState.mp = Math.min(playerState.maxMp, playerState.mp + Math.ceil(playerState.maxMp * 0.05)); 
                recovered = true;
            }
            if (recovered) {
                // Assumindo que updateUI será uma função global em game-main.js
                if (typeof updateUI === 'function') updateUI(); 
            }
            if (playerState.hp === playerState.maxHp && playerState.mp === playerState.maxMp) {
                clearInterval(restInterval);
                isResting = false;
                if (uiElements.descansarBtn) uiElements.descansarBtn.textContent = "Descansar";
                showNotification("HP e MP totalmente recuperados!", "success");
            }
        }, 3000); 
    }
}

// Para que o botão de descanso funcione, o event listener precisa ser configurado em game-main.js
// após a inicialização, ou este módulo precisa expor uma função de inicialização.
// Exemplo de como poderia ser em game-main.js, dentro de setupActionButtons ou similar:
// if (uiElements.descansarBtn && typeof toggleRest === 'function') {
//     uiElements.descansarBtn.removeEventListener("click", toggleRest);
//     uiElements.descansarBtn.addEventListener("click", toggleRest);
// }

