// game-dungeon.js: Lógica da seção Calabouço e combate


// Requer: playerState, combatState (globais de game-main.js)
// Requer: uiElements (global de game-main.js)
// Requer: showNotification (global de game-main.js)
// Requer: addCombatLog, levelUp (deste módulo)

// Requer: WEAPON_CATALOG_DATA, ARMOR_CATALOG_DATA (globais de game-main.js)
// Requer: playerState, combatState (globais de game-main.js)
// Requer: uiElements (global de game-main.js)
// Requer: showNotification (global de game-main.js)
// Requer: addCombatLog, levelUp (deste módulo)
// Requer: WEAPON_CATALOG_DATA, ARMOR_CATALOG_DATA (globais de game-main.js)
// Requer: playerState, combatState (globais de game-main.js)
// Requer: uiElements (global de game-main.js)
console.log("game-dungeon.js: Carregado.");

function prepareDungeonScreen() {
    // Requer: uiElements, playerState, combatState (globais de game-main.js)
    // Requer: startCombat, updateCombatUI (deste módulo)
    if (!uiElements.dungeonSectionContent || !playerState.id) return;
    console.log("Preparando tela do Calabouço...");
    uiElements.dungeonSectionContent.innerHTML = `
        <h2>Calabouço</h2>
        <p>Explore as profundezas e enfrente monstros perigosos!</p>
        <button id="find-monster-btn-dungeon" class="hexagonal-border large-btn">Procurar Monstro</button>
        <div id="combat-area" class="combat-area-hidden">
            <div class="combat-sprites">
                <div class="combatant-display">
                    <img id="player-combat-sprite-dungeon" src="${playerState.spritePath}" alt="Jogador">
                    <p id="player-combat-hp-dungeon">HP: ${playerState.hp}/${playerState.maxHp}</p>
                </div>
                <div class="combatant-display">
                    <img id="monster-combat-sprite-dungeon" src="./assets/sprites/monsters/placeholder_monster.png" alt="Monstro">
                    <p id="monster-combat-hp-dungeon">HP: ???/???</p>
                </div>
            </div>
            <div id="combat-actions-container-dungeon" class="combat-actions"></div>
            <div id="combat-log-dungeon" class="combat-log-terminal"></div>
        </div>
    `;
    const findMonsterBtnDungeon = document.getElementById("find-monster-btn-dungeon");
    if(findMonsterBtnDungeon) {
        findMonsterBtnDungeon.removeEventListener("click", startCombat); 
        findMonsterBtnDungeon.addEventListener("click", startCombat);
        console.log("Botão Procurar Monstro configurado.");
    } else {
        console.error("Botão find-monster-btn-dungeon não encontrado após popular a seção!");
    }
    updateCombatUI(); 
}

function startCombat() {
    // Requer: playerState, MONSTER_CATALOG_DATA, combatState, showNotification (globais de game-main.js)
    // Requer: addCombatLog, updateCombatUI (deste módulo)
    console.log("Função startCombat iniciada.");
    if (!playerState.id) {
        console.log("startCombat: playerState.id não definido. Retornando.");
        if (typeof showNotification === "function") showNotification("Dados do jogador não carregados para iniciar combate.", "warning");
        return;
    }
    console.log("startCombat: playerState.id OK.");

    const availableMonsters = MONSTER_CATALOG_DATA.filter(m => m.level <= playerState.level + 2);
    if (availableMonsters.length === 0) {
        console.log("startCombat: Nenhum monstro disponível. Retornando.");
        addCombatLog("Nenhum monstro adequado encontrado no momento.");
        const findMonsterBtnDungeon = document.getElementById("find-monster-btn-dungeon");
        if(findMonsterBtnDungeon) findMonsterBtnDungeon.style.display = "block";
        return;
    }
    console.log("startCombat: Monstros disponíveis encontrados.");

    const monsterData = { ...availableMonsters[Math.floor(Math.random() * availableMonsters.length)] };
    combatState.active = true;
    combatState.playerTurn = true;
    combatState.currentMonster = monsterData;
    combatState.monsterCurrentHp = monsterData.hp;
    combatState.log = [];
    console.log("startCombat: Estado de combate inicializado com monstro:", monsterData.name);

    const combatArea = document.getElementById("combat-area");
    if(combatArea) combatArea.classList.remove("combat-area-hidden");
    const findMonsterBtnDungeon = document.getElementById("find-monster-btn-dungeon");
    if(findMonsterBtnDungeon) findMonsterBtnDungeon.style.display = "none";

    addCombatLog(`Um ${monsterData.name} selvagem apareceu!`);
    updateCombatUI();
    console.log("startCombat: Combate iniciado e UI atualizada.");
}

function updateCombatUI() {
    // Requer: combatState, playerState (globais de game-main.js)
    // Requer: renderCombatActions, renderCombatLog (deste módulo)
    const combatArea = document.getElementById("combat-area");
    const findMonsterBtnDungeon = document.getElementById("find-monster-btn-dungeon");

    if (!combatState.active || !combatState.currentMonster || !playerState.id) {
        if(combatArea) combatArea.classList.add("combat-area-hidden");
        if(findMonsterBtnDungeon) findMonsterBtnDungeon.style.display = "block";
        return;
    }
    if(combatArea) combatArea.classList.remove("combat-area-hidden");
    if(findMonsterBtnDungeon) findMonsterBtnDungeon.style.display = "none";

    const playerCombatSpriteEl = document.getElementById("player-combat-sprite-dungeon");
    const monsterCombatSpriteEl = document.getElementById("monster-combat-sprite-dungeon");
    const playerCombatHPEl = document.getElementById("player-combat-hp-dungeon");
    const monsterCombatHPEl = document.getElementById("monster-combat-hp-dungeon");

    if (playerCombatSpriteEl) playerCombatSpriteEl.src = playerState.spritePath;
    if (monsterCombatSpriteEl) monsterCombatSpriteEl.src = `./assets/sprites/monsters/${combatState.currentMonster.sprite}`;
    if (playerCombatHPEl) playerCombatHPEl.textContent = `HP: ${playerState.hp}/${playerState.maxHp}`;
    if (monsterCombatHPEl) monsterCombatHPEl.textContent = `HP: ${combatState.monsterCurrentHp}/${combatState.currentMonster.hp}`;
    renderCombatActions();
    renderCombatLog();
}

function renderCombatActions() {
    // Requer: combatState, playerState (globais de game-main.js)
    // Requer: handleCombatAction (deste módulo)
    const combatActionsContainerEl = document.getElementById("combat-actions-container-dungeon");
    if (!combatActionsContainerEl || !combatState.playerTurn || !combatState.active || !playerState.id) {
        if(combatActionsContainerEl) combatActionsContainerEl.innerHTML = "";
        return;
    }
    let actionsHtml = `<button data-action="attack">Atacar</button>`;
    playerState.skills.forEach(skill => {
        if (skill.class.includes(playerState.class) || skill.class.includes("Todas")) {
            actionsHtml += `<button data-action="skill" data-skill-id="${skill.id}">${skill.name} (MP: ${skill.cost})</button>`;
        }
    });
    actionsHtml += `<button data-action="item">Item</button>`;
    actionsHtml += `<button data-action="flee">Fugir</button>`;
    combatActionsContainerEl.innerHTML = actionsHtml;
    combatActionsContainerEl.querySelectorAll("button").forEach(btn => {
        btn.removeEventListener("click", handleCombatAction); 
        btn.addEventListener("click", handleCombatAction);
    });
}

function handleCombatAction(event) {
    // Requer: combatState, playerState (globais de game-main.js)
    // Requer: playerAttack, playerUseSkill, playerFlee, addCombatLog, monsterTurn, updateCombatUI (deste módulo)
    if (!combatState.playerTurn || !combatState.active || !playerState.id) return;
    const action = event.target.dataset.action;
    const skillId = event.target.dataset.skillId;
    combatState.playerTurn = false;
    switch (action) {
        case "attack": playerAttack(); break;
        case "skill": playerUseSkill(skillId); break;
        case "item": addCombatLog("Sistema de itens em combate ainda não implementado."); combatState.playerTurn = true; break;
        case "flee": playerFlee(); break;
    }
    if (combatState.active && !combatState.playerTurn) {
        setTimeout(monsterTurn, 1000);
    }
    updateCombatUI();
}

function playerAttack() {
    // Requer: playerState, combatState (globais de game-main.js)
    // Requer: addCombatLog, checkCombatStatus (deste módulo)
    if (!playerState.id || !combatState.currentMonster) return;
    const baseDamage = playerState.attributes.strength + (playerState.equipment.weapon ? playerState.equipment.weapon.stats.attack || 0 : 0);
    const monsterDefense = combatState.currentMonster.defense;
    let damageDealt = Math.max(1, baseDamage - monsterDefense + Math.floor(Math.random() * 5 - 2));
    combatState.monsterCurrentHp -= damageDealt;
    addCombatLog(`${playerState.name} ataca ${combatState.currentMonster.name} causando ${damageDealt} de dano.`);
    checkCombatStatus();
}

function playerUseSkill(skillId) {
    // Requer: playerState, combatState (globais de game-main.js)
    // Requer: addCombatLog, checkCombatStatus (deste módulo)
    if (!playerState.id || !combatState.currentMonster) return;
    const skill = playerState.skills.find(s => s.id === skillId);
    if (!skill) { addCombatLog("Habilidade desconhecida!"); combatState.playerTurn = true; return; }
    if (playerState.mp < skill.cost) { addCombatLog("MP insuficiente para usar " + skill.name + "!"); combatState.playerTurn = true; return; }
    playerState.mp -= skill.cost;
    addCombatLog(`${playerState.name} usa ${skill.name}!`);
    if (skill.target === "enemy") {
        let damageDealt;
        if (skill.type === "physical") damageDealt = Math.max(1, Math.floor((playerState.attributes.strength * skill.power) - combatState.currentMonster.defense));
        else if (skill.type === "magical") damageDealt = Math.max(1, Math.floor((playerState.attributes.intelligence * skill.power) - (combatState.currentMonster.magicDefense || 0)));
        combatState.monsterCurrentHp -= damageDealt;
        addCombatLog(`${skill.name} causa ${damageDealt} de dano em ${combatState.currentMonster.name}.`);
    } else if (skill.type === "healing" && skill.target === "self") {
        const amountHealed = Math.floor(playerState.maxHp * skill.power);
        playerState.hp = Math.min(playerState.maxHp, playerState.hp + amountHealed);
        addCombatLog(`${playerState.name} se cura em ${amountHealed} HP.`);
    }
    checkCombatStatus();
}

function playerFlee() {
    // Requer: playerState (global de game-main.js)
    // Requer: addCombatLog, endCombat (deste módulo)
    if (!playerState.id) return;
    const fleeChance = 0.5 + (playerState.attributes.agility / 100);
    if (Math.random() < fleeChance) {
        addCombatLog("Você conseguiu fugir!");
        endCombat(false);
    } else {
        addCombatLog("Falha ao fugir!");
    }
}

function monsterTurn() {
    // Requer: combatState, playerState, updateUI (globais de game-main.js)
    // Requer: addCombatLog, checkCombatStatus, updateCombatUI (deste módulo)
    if (!combatState.active || combatState.playerTurn || !playerState.id || !combatState.currentMonster) return;
    const monster = combatState.currentMonster;
    const monsterSkill = monster.skills[Math.floor(Math.random() * monster.skills.length)];
    const baseDamage = monster.attack * (monsterSkill.power || 1);
    const playerDefense = (playerState.equipment.helmet?.stats?.defense || 0) + (playerState.equipment.chest?.stats?.defense || 0) + (playerState.equipment.gloves?.stats?.defense || 0) + (playerState.equipment.boots?.stats?.defense || 0);
    let damageTaken = Math.max(1, Math.floor(baseDamage - playerDefense + Math.floor(Math.random() * 5 - 2)));
    playerState.hp -= damageTaken;
    addCombatLog(`${monster.name} usa ${monsterSkill.name} em ${playerState.name} causando ${damageTaken} de dano.`);
    combatState.playerTurn = true;
    checkCombatStatus();
    if (typeof updateUI === "function") updateUI();
    updateCombatUI();
}

function checkCombatStatus() {
    // Requer: playerState, combatState (globais de game-main.js)
    // Requer: addCombatLog, endCombat (deste módulo)
    if (!playerState.id || !combatState.currentMonster) return;
    if (combatState.monsterCurrentHp <= 0) {
        addCombatLog(`${combatState.currentMonster.name} foi derrotado!`);
        endCombat(true);
        return;
    }
    if (playerState.hp <= 0) {
        playerState.hp = 0;
        addCombatLog(`${playerState.name} foi derrotado!`);
        endCombat(false);
        return;
    }
}

function endCombat(victory) {
    // Requer: playerState, combatState, updateUI, savePlayerCharacterData (globais de game-main.js)
    // Requer: addCombatLog, levelUp, prepareDungeonScreen (deste módulo)
    if (!playerState.id) return;
    combatState.active = false;
    if (victory && combatState.currentMonster) {
        const monster = combatState.currentMonster;
        playerState.exp += monster.expReward;
        playerState.gold += monster.goldReward;
        addCombatLog(`Você ganhou ${monster.expReward} EXP e ${monster.goldReward} Ouro!`);
        if (playerState.exp >= playerState.maxExp) levelUp();
    }
    combatState.currentMonster = null;
    if (typeof updateUI === "function") updateUI();
    prepareDungeonScreen(); 
    if (typeof savePlayerCharacterData === "function") savePlayerCharacterData();
}

function levelUp() {
    // Requer: playerState, showNotification (globais de game-main.js)
    // Requer: addCombatLog (deste módulo)
    if (!playerState.id) return;
    playerState.level++;
    playerState.exp = playerState.exp - playerState.maxExp;
    playerState.maxExp = Math.floor(playerState.maxExp * 1.5);
    playerState.maxHp += 10;
    playerState.maxMp += 5;
    playerState.hp = playerState.maxHp;
    playerState.mp = playerState.maxMp;
    playerState.attributes.strength += 1;
    playerState.attributes.agility += 1;
    playerState.attributes.intelligence += 1;
    playerState.attributes.vitality += 1;
    if (typeof showNotification === "function") showNotification(`Você subiu para o Nível ${playerState.level}!`, "success");
    addCombatLog(`Você subiu para o Nível ${playerState.level}!`);
}

function addCombatLog(message) {
    // Requer: combatState (global de game-main.js)
    combatState.log.push(message);
    const combatLogEl = document.getElementById("combat-log-dungeon"); 
    if (combatLogEl) {
        const logEntry = document.createElement("p");
        logEntry.textContent = message;
        logEntry.classList.add("combat-log-entry");
        combatLogEl.appendChild(logEntry);
        combatLogEl.scrollTop = combatLogEl.scrollHeight;
    } else {
        console.warn("Elemento de log de combate (combat-log-dungeon) não encontrado ao tentar adicionar mensagem.");
    }
}
function renderCombatLog() { /* Log é adicionado diretamente em addCombatLog */ }

// As funções prepareDungeonScreen e updateCombatUI serão chamadas por switchSection e updateUI em game-main.js
// quando playerState.activeSection === "calabouco".

