// game-dungeon.js: Lógica da seção Calabouço e combate

console.log("game-dungeon.js: Carregado.");

// Variáveis de estado do combate (movidas de game-main.js para cá, mas ainda acessadas globalmente via window.combatState)
window.combatState = {
    active: false,
    playerTurn: true,
    currentMonster: null,
    monsterCurrentHp: 0,
    log: [],
    playerOriginalStats: null, // Para restaurar após o combate
    monsterOriginalStats: null // Para referência
};

function initializeDungeon() {
    // Lógica de inicialização para a seção de Calabouço, se necessário
    console.log("Dungeon section initialized");

    // Configurar event listener para o botão de iniciar calabouço (se existir)
    const startDungeonBtn = document.getElementById("start-normal-dungeon-btn"); // Assumindo que este é o ID
    if (startDungeonBtn) {
        startDungeonBtn.addEventListener("click", () => startCombat("normal"));
    }
    // Adicionar listeners para outros botões de dificuldade, se houver
    // Ex: document.getElementById("start-hard-dungeon-btn").addEventListener("click", () => startCombat("hard"));
}

function prepareDungeonScreen() {
    // Requer: uiElements (globais de game-main.js)
    if (!window.uiElements || !window.uiElements.dungeonSectionContent) {
        console.warn("prepareDungeonScreen: Dependências globais não encontradas.");
        return;
    }
    const dungeonContent = window.uiElements.dungeonSectionContent;
    if (window.combatState.active) {
        // Se o combate estiver ativo, a UI de combate deve ser exibida
        renderCombatUI();
    } else {
        // Se não houver combate ativo, mostrar tela de seleção de dificuldade
        dungeonContent.innerHTML = `
            <h2>Calabouço</h2>
            <p>Escolha a dificuldade:</p>
            <button id="start-normal-dungeon-btn" class="action-btn hexagonal-border">Normal</button>
            <button id="start-hard-dungeon-btn" class="action-btn hexagonal-border" disabled>Difícil (Em Breve)</button>
            <button id="start-nightmare-dungeon-btn" class="action-btn hexagonal-border" disabled>Pesadelo (Em Breve)</button>
            <div id="battle-log-container" class="hidden">
                <h3>Log de Batalha</h3>
                <div id="battle-log"></div>
            </div>
            <div id="combat-ui-container"></div>
        `;
        // Re-adicionar event listeners pois o innerHTML foi reescrito
        document.getElementById("start-normal-dungeon-btn").addEventListener("click", () => startCombat("normal"));
    }
    console.log("Tela do Calabouço preparada.");
}

function startCombat(difficulty) {
    if (window.combatState.active) {
        window.showNotification("Você já está em combate!", "warning");
        return;
    }
    if (!window.playerState || !window.playerState.id || !window.MONSTER_CATALOG_DATA) {
        window.showNotification("Não é possível iniciar o combate: Dados do jogador ou monstros não carregados.", "error");
        return;
    }

    // Selecionar um monstro aleatório (pode ser mais complexo com base na dificuldade)
    const availableMonsters = window.MONSTER_CATALOG_DATA.filter(m => {
        // Lógica de filtro de dificuldade (exemplo simples)
        if (difficulty === "normal") return m.level <= 5;
        if (difficulty === "hard") return m.level > 5 && m.level <= 10;
        if (difficulty === "nightmare") return m.level > 10;
        return true;
    });

    if (availableMonsters.length === 0) {
        window.showNotification(`Nenhum monstro encontrado para a dificuldade ${difficulty}.`, "error");
        return;
    }

    const monster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    window.combatState.currentMonster = { ...monster }; // Copia para não modificar o catálogo
    window.combatState.monsterCurrentHp = monster.hp;
    window.combatState.monsterOriginalStats = { ...monster }; // Salva stats originais
    window.combatState.active = true;
    window.combatState.playerTurn = true;
    window.combatState.log = [];

    // Salvar stats originais do jogador para restaurar buffs/debuffs depois
    window.combatState.playerOriginalStats = {
        hp: window.playerState.hp,
        mp: window.playerState.mp,
        attributes: { ...window.playerState.attributes }
    };

    addLogMessage(`Um ${window.combatState.currentMonster.name} (Nível ${window.combatState.currentMonster.level}) apareceu!`);
    window.showNotification(`Combate iniciado contra ${window.combatState.currentMonster.name}!`, "info");
    renderCombatUI();
    if (typeof window.updateUI === 'function') window.updateUI(); // Atualiza HP/MP do jogador na UI principal
}

function renderCombatUI() {
    if (!window.combatState.active || !window.combatState.currentMonster || !window.uiElements || !window.uiElements.dungeonSectionContent) {
        prepareDungeonScreen(); // Volta para a tela de seleção se o combate não estiver ativo
        return;
    }

    const dungeonContent = window.uiElements.dungeonSectionContent;
    const monster = window.combatState.currentMonster;
    const player = window.playerState;

    let combatHtml = `
        <div id="combat-area">
            <div id="monster-info">
                <h4>${monster.name} (Nível ${monster.level})</h4>
                <img src="./assets/sprites/monsters/${monster.sprite}" alt="${monster.name}" class="monster-sprite">
                <p>HP: ${window.combatState.monsterCurrentHp}/${monster.hp}</p>
            </div>
            <div id="player-combat-actions">
                <h4>Ações de ${player.name}</h4>
                <button id="attack-btn" class="action-btn combat-btn hexagonal-border">Atacar</button>
                <button id="skill-btn" class="action-btn combat-btn hexagonal-border">Habilidade</button>
                <button id="item-btn" class="action-btn combat-btn hexagonal-border">Item</button>
                <button id="flee-btn" class="action-btn combat-btn hexagonal-border cancel-btn">Fugir</button>
            </div>
        </div>
        <div id="battle-log-container">
            <h3>Log de Batalha</h3>
            <div id="battle-log">
                ${window.combatState.log.join("")}
            </div>
        </div>
    `;
    dungeonContent.innerHTML = combatHtml;

    // Adicionar event listeners aos botões de combate
    document.getElementById("attack-btn").addEventListener("click", playerAttack);
    document.getElementById("skill-btn").addEventListener("click", playerUseSkill); // Implementar playerUseSkill
    document.getElementById("item-btn").addEventListener("click", playerUseItem);   // Implementar playerUseItem
    document.getElementById("flee-btn").addEventListener("click", playerFlee);

    console.log("UI de combate renderizada.");
}

function addLogMessage(message, type = "info") {
    const logEntry = `<p class="log-${type}">${new Date().toLocaleTimeString()}: ${message}</p>`;
    window.combatState.log.unshift(logEntry); // Adiciona no início para o log mais recente aparecer no topo
    if (window.combatState.log.length > 20) {
        window.combatState.log.pop(); // Limita o tamanho do log
    }
    const battleLogElement = document.getElementById("battle-log");
    if (battleLogElement) {
        battleLogElement.innerHTML = window.combatState.log.join("");
    }
}

function playerAttack() {
    if (!window.combatState.active || !window.combatState.playerTurn) return;

    const player = window.playerState;
    const monster = window.combatState.currentMonster;
    let damage = Math.max(1, player.attributes.strength + (player.equipment.weapon ? player.equipment.weapon.stats.attack || 0 : 0) - (monster.defense || 0));
    // Adicionar alguma variação de dano
    damage = Math.floor(damage * (Math.random() * 0.2 + 0.9)); // 90% a 110% do dano

    window.combatState.monsterCurrentHp -= damage;
    addLogMessage(`${player.name} ataca ${monster.name} causando ${damage} de dano.`, "player-attack");

    checkCombatEnd();
    if (window.combatState.active) {
        window.combatState.playerTurn = false;
        if (typeof window.updateUI === 'function') window.updateUI();
        renderCombatUI(); // Atualiza HP do monstro
        setTimeout(monsterAttack, 1000); // Monstro ataca após 1 segundo
    }
}

function monsterAttack() {
    if (!window.combatState.active || window.combatState.playerTurn) return;

    const player = window.playerState;
    const monster = window.combatState.currentMonster;
    const skillToUse = monster.skills && monster.skills.length > 0 ? monster.skills[Math.floor(Math.random() * monster.skills.length)] : { name: "Ataque Básico", power: 1.0 };
    
    let damage = Math.max(1, Math.floor((monster.attack || 5) * (skillToUse.power || 1.0) - (player.attributes.defense || 0))); // Assumindo que player.attributes.defense existe
    // Adicionar alguma variação de dano
    damage = Math.floor(damage * (Math.random() * 0.2 + 0.9)); // 90% a 110% do dano

    player.hp -= damage;
    addLogMessage(`${monster.name} usa ${skillToUse.name} em ${player.name} causando ${damage} de dano.`, "monster-attack");

    if (player.hp <= 0) {
        player.hp = 0;
        addLogMessage(`${player.name} foi derrotado!`, "defeat");
        endCombat(false); // Jogador perdeu
    } else {
        window.combatState.playerTurn = true;
        if (typeof window.updateUI === 'function') window.updateUI();
        renderCombatUI(); // Atualiza HP do jogador
    }
}

function checkCombatEnd() {
    if (window.combatState.monsterCurrentHp <= 0) {
        addLogMessage(`${window.combatState.currentMonster.name} foi derrotado!`, "victory");
        endCombat(true); // Jogador venceu
    }
}

function endCombat(playerWon) {
    window.combatState.active = false;
    const monster = window.combatState.currentMonster;

    if (playerWon) {
        const goldGained = monster.goldReward || 0;
        const expGained = monster.expReward || 0;
        window.playerState.gold += goldGained;
        window.playerState.exp += expGained;
        window.showNotification(`Você venceu! Ganhou ${goldGained} Ouro e ${expGained} EXP.`, "success");
        addLogMessage(`Você venceu! Ganhou ${goldGained} Ouro e ${expGained} EXP.`);
        // Lógica de Level Up
        if (window.playerState.exp >= window.playerState.maxExp) {
            levelUp();
        }
    } else {
        window.showNotification("Você foi derrotado!", "error");
        addLogMessage("Você foi derrotado!");
        // Penalidades? Ex: perder ouro, voltar para a cidade, etc.
        window.playerState.hp = 1; // Deixa o jogador com 1 HP
    }

    // Restaurar stats do jogador se foram modificados por buffs/debuffs durante o combate
    if (window.combatState.playerOriginalStats) {
        // Apenas HP e MP são restaurados para o estado pré-combate se não for derrota total
        // Atributos podem ter sido alterados por equipamentos, então não restaurar cegamente
        // playerState.hp = combatState.playerOriginalStats.hp; 
        // playerState.mp = combatState.playerOriginalStats.mp;
    }

    window.combatState.currentMonster = null;
    if (typeof window.savePlayerCharacterData === 'function') window.savePlayerCharacterData();
    if (typeof window.updateUI === 'function') window.updateUI();
    // Volta para a tela de seleção do calabouço após um tempo
    setTimeout(() => {
        prepareDungeonScreen();
    }, 3000);
}

function levelUp() {
    window.playerState.level++;
    window.playerState.exp = 0; // Ou window.playerState.exp -= window.playerState.maxExp;
    window.playerState.maxExp = Math.floor(window.playerState.maxExp * 1.5); // Aumenta a EXP necessária
    window.playerState.maxHp += 10; // Aumentos de exemplo
    window.playerState.hp = window.playerState.maxHp; // Cura total no level up
    window.playerState.maxMp += 5;
    window.playerState.mp = window.playerState.maxMp;
    // Aumentar atributos (exemplo simples, pode ser baseado na classe)
    window.playerState.attributes.strength += 1;
    window.playerState.attributes.agility += 1;
    window.playerState.attributes.intelligence += 1;
    window.playerState.attributes.vitality += 1;
    window.showNotification(`Parabéns! Você alcançou o Nível ${window.playerState.level}!`, "success");
    addLogMessage(`${window.playerState.name} alcançou o Nível ${window.playerState.level}!`);
    if (typeof window.updateUI === 'function') window.updateUI();
    if (typeof window.savePlayerCharacterData === 'function') window.savePlayerCharacterData();
}

function playerUseSkill() {
    // Requer: playerState, combatState, showNotification, updateUI, savePlayerCharacterData, renderCombatUI, addLogMessage, monsterAttack
    if (!window.combatState.active || !window.combatState.playerTurn) return;

    // Lógica para selecionar e usar uma habilidade
    // Isso exigirá uma UI para seleção de habilidades
    const skills = window.playerState.skills || [];
    if (skills.length === 0) {
        window.showNotification("Você não tem habilidades para usar.", "warning");
        return;
    }

    // Exemplo simplificado: usa a primeira habilidade disponível
    const skill = skills[0]; 

    if (window.playerState.mp < skill.cost) {
        window.showNotification("MP insuficiente para usar esta habilidade!", "error");
        return;
    }

    window.playerState.mp -= skill.cost;
    let effectValue;

    if (skill.type === "physical" || skill.type === "magical") {
        const playerAttackStat = skill.type === "physical" ? window.playerState.attributes.strength : window.playerState.attributes.intelligence;
        const monsterDefense = window.combatState.currentMonster.defense || 0;
        effectValue = Math.max(1, Math.floor(playerAttackStat * skill.power - monsterDefense));
        effectValue = Math.floor(effectValue * (Math.random() * 0.2 + 0.9)); // Variação
        window.combatState.monsterCurrentHp -= effectValue;
        addLogMessage(`${window.playerState.name} usa ${skill.name} em ${window.combatState.currentMonster.name} causando ${effectValue} de dano.`, "player-skill");
    } else if (skill.type === "healing") {
        effectValue = Math.floor(window.playerState.maxHp * skill.power);
        window.playerState.hp = Math.min(window.playerState.maxHp, window.playerState.hp + effectValue);
        addLogMessage(`${window.playerState.name} usa ${skill.name} e cura ${effectValue} de HP.`, "player-skill");
    } else {
        addLogMessage(`${window.playerState.name} tenta usar ${skill.name}, mas o tipo de habilidade é desconhecido.`, "warning");
        // Reembolsar MP se a habilidade não fez nada
        window.playerState.mp += skill.cost;
        if (typeof window.updateUI === 'function') window.updateUI();
        return;
    }

    checkCombatEnd();
    if (window.combatState.active) {
        window.combatState.playerTurn = false;
        if (typeof window.updateUI === 'function') window.updateUI();
        renderCombatUI();
        setTimeout(monsterAttack, 1000);
    }
}

function playerUseItem() {
    // Requer: playerState, combatState, showNotification, updateUI, savePlayerCharacterData, renderCombatUI, addLogMessage, monsterAttack
    if (!window.combatState.active || !window.combatState.playerTurn) return;

    // Lógica para selecionar e usar um item do inventário
    // Isso exigirá uma UI para seleção de itens
    // Exemplo: abrir um modal com o inventário e permitir clicar em um item consumível
    window.showNotification("Funcionalidade de usar item em combate ainda não implementada.", "warning");
    // Exemplo de uso de poção de HP:
    /*
    const potion = playerState.inventory.find(item => item && item.id === "potion_hp_small");
    if (potion) {
        playerState.hp = Math.min(playerState.maxHp, playerState.hp + potion.effect.hpBoost);
        // Remover item do inventário
        const itemIndex = playerState.inventory.findIndex(item => item && item.id === "potion_hp_small");
        if (itemIndex > -1) playerState.inventory.splice(itemIndex, 1, null); // Remove e deixa o slot vazio ou null
        
        addLogMessage(`${playerState.name} usa ${potion.name} e recupera ${potion.effect.hpBoost} de HP.`, "player-item");
        checkCombatEnd(); // Embora improvável que um item termine o combate, é uma boa prática
        if (combatState.active) {
            combatState.playerTurn = false;
            updateUI();
            renderCombatUI();
            setTimeout(monsterAttack, 1000);
        }
    } else {
        showNotification("Nenhuma poção de HP encontrada no inventário.", "warning");
    }
    */
}

function playerFlee() {
    if (!window.combatState.active || !window.combatState.playerTurn) return;

    // Lógica de fuga. Exemplo: chance de 50% de sucesso
    if (Math.random() < 0.5) {
        addLogMessage(`${window.playerState.name} tenta fugir e consegue!`, "info");
        window.showNotification("Você conseguiu fugir!", "success");
        endCombat(false); // Considera como uma "perda" em termos de recompensas, mas sem penalidades de morte
    } else {
        addLogMessage(`${window.playerState.name} tenta fugir mas falha!`, "warning");
        window.showNotification("Falha ao tentar fugir!", "error");
        window.combatState.playerTurn = false;
        if (typeof window.updateUI === 'function') window.updateUI();
        renderCombatUI();
        setTimeout(monsterAttack, 1000);
    }
}

// Expor funções se necessário
window.initializeDungeon = initializeDungeon;
window.prepareDungeonScreen = prepareDungeonScreen;
window.startCombat = startCombat;
window.renderCombatUI = renderCombatUI; // Expor para ser chamado por updateUI se necessário
window.playerAttack = playerAttack;
window.playerUseSkill = playerUseSkill;
window.playerUseItem = playerUseItem;
window.playerFlee = playerFlee;
window.monsterAttack = monsterAttack;
window.addLogMessage = addLogMessage;

// Chamar a inicialização quando o DOM estiver pronto
// Isso será chamado pelo game-main.js quando a seção for ativada ou no carregamento inicial
// document.addEventListener("DOMContentLoaded", initializeDungeon);

