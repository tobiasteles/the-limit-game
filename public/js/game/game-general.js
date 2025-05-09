// game-general.js: Lógica da seção Geral

console.log("game-general.js: Carregado.");

let isResting = false;
let restInterval = null;

function updateGeralSection() {
    // Requer: window.uiElements, window.playerState (globais de game-main.js)
    if (!window.uiElements || !window.uiElements.geralStatusCompleto || !window.uiElements.geralEquipamentosAtivos || !window.playerState || !window.playerState.id) {
        console.warn("updateGeralSection: Dependências globais não encontradas ou estado do jogador inválido.");
        return;
    }

    let statusHtml = `
        <p><strong>Nome:</strong> ${window.playerState.name}</p>
        <p><strong>Classe:</strong> ${window.playerState.class}</p>
        <p><strong>Nível:</strong> ${window.playerState.level}</p>
        <p><strong>HP:</strong> ${window.playerState.hp}/${window.playerState.maxHp}</p>
        <p><strong>MP:</strong> ${window.playerState.mp}/${window.playerState.maxMp}</p>
        <p><strong>EXP:</strong> ${window.playerState.exp}/${window.playerState.maxExp}</p>
        <p><strong>Ouro:</strong> ${window.playerState.gold}</p>
        <p><strong>Atributos:</strong> Força(${window.playerState.attributes.strength}), Agilidade(${window.playerState.attributes.agility}), Inteligência(${window.playerState.attributes.intelligence}), Vitalidade(${window.playerState.attributes.vitality})</p>
    `;
    window.uiElements.geralStatusCompleto.innerHTML = statusHtml;

    let equipHtml = "<h4>Equipamentos Ativos:</h4>";
    if (window.playerState.equipment) {
        for (const slot in window.playerState.equipment) {
            const item = window.playerState.equipment[slot];
            equipHtml += `<p><strong>${slot.charAt(0).toUpperCase() + slot.slice(1)}:</strong> ${item ? item.name : "Nenhum"}</p>`;
        }
    }
    window.uiElements.geralEquipamentosAtivos.innerHTML = equipHtml;
    console.log("Seção Geral atualizada.");
}

function toggleRest() {
    // Requer: window.playerState, window.uiElements, window.showNotification, window.updateUI (globais de game-main.js)
    if (!window.playerState || !window.playerState.id || !window.uiElements || typeof window.showNotification !== 'function' || typeof window.updateUI !== 'function') {
        console.warn("toggleRest: Dependências globais não encontradas ou estado do jogador inválido.");
        return;
    }

    if (isResting) {
        clearInterval(restInterval);
        isResting = false;
        if (window.uiElements.descansarBtn) window.uiElements.descansarBtn.textContent = "Descansar";
        window.showNotification("Você parou de descansar.", "info");
    } else {
        isResting = true;
        if (window.uiElements.descansarBtn) window.uiElements.descansarBtn.textContent = "Parar Descanso";
        window.showNotification("Você começou a descansar. HP e MP serão recuperados lentamente.", "info");
        restInterval = setInterval(() => {
            let recovered = false;
            if (window.playerState.hp < window.playerState.maxHp) {
                window.playerState.hp = Math.min(window.playerState.maxHp, window.playerState.hp + Math.ceil(window.playerState.maxHp * 0.05));
                recovered = true;
            }
            if (window.playerState.mp < window.playerState.maxMp) {
                window.playerState.mp = Math.min(window.playerState.maxMp, window.playerState.mp + Math.ceil(window.playerState.maxMp * 0.05));
                recovered = true;
            }

            if (recovered) {
                window.updateUI();
                if (typeof window.savePlayerCharacterData === 'function') {
                    window.savePlayerCharacterData(); // Salva o estado após a recuperação
                }
            }

            if (window.playerState.hp === window.playerState.maxHp && window.playerState.mp === window.playerState.maxMp) {
                clearInterval(restInterval);
                isResting = false;
                if (window.uiElements.descansarBtn) window.uiElements.descansarBtn.textContent = "Descansar";
                window.showNotification("HP e MP totalmente recuperados!", "success");
            }
        }, 3000);
    }
}

// Expor funções para game-main.js
window.updateGeralSection = updateGeralSection;
window.toggleRest = toggleRest;

