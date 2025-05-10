// game.js - Main Game Logic and State Management

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Carregado. Inicializando o jogo...");

    // --- Firebase (Real or Mock) ---
    let db, rtdb, auth, currentUserId, authUnsubscribe, playerCharacterUnsubscribe;
    let guildChatUnsubscribe, guildMembersUnsubscribe;
    let selectedCharacterId = null;

    const urlParams = new URLSearchParams(window.location.search);
    selectedCharacterId = urlParams.get("characterId");
    if (!selectedCharacterId) {
        selectedCharacterId = localStorage.getItem("selectedCharacterId");
    }
    if (!selectedCharacterId) {
        selectedCharacterId = sessionStorage.getItem("selectedCharacterId");
    }

    // --- UI Elements Cache ---
    const uiElements = {
        playerName: document.getElementById("char-name"),
        playerClass: document.getElementById("char-class"),
        hpBar: document.getElementById("hp-bar"),
        hpValue: document.getElementById("hp-value"),
        mpBar: document.getElementById("mp-bar"),
        mpValue: document.getElementById("mp-value"),
        expBar: document.getElementById("exp-bar"),
        expValue: document.getElementById("exp-value"),
        playerLevel: document.getElementById("char-level"),
        playerGold: document.getElementById("char-gold"),
        attrStrength: document.getElementById("attr-strength"),
        attrAgility: document.getElementById("attr-agility"),
        attrIntelligence: document.getElementById("attr-intelligence"),
        attrVitality: document.getElementById("attr-vitality"),
        characterSprite: document.getElementById("character-sprite"),
        geralStatusCompleto: document.getElementById("geral-status-completo"),
        geralEquipamentosAtivos: document.getElementById("geral-equipamentos-ativos"),
        descansarBtn: document.getElementById("descansar-btn"),
        inventoryGrid: document.getElementById("inventory-grid"),
        inventoryGoldDisplay: document.getElementById("inventory-gold-display"),
        armeiroShopContent: document.getElementById("armeiro-shop-content"),
        armadurasShopContent: document.getElementById("armaduras-shop-content"),
        guildSectionContent: document.getElementById("guild-section-content"),
        dungeonSectionContent: document.getElementById("calabouco-section-content"),
        notificationsContainer: document.getElementById("notifications-container")
    };
    
    // --- Global Player State ---
    let playerState = {
        id: null, 
        name: "Viajante",
        class: "Guerreiro",
        level: 1,
        gold: 2000, 
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        exp: 0,
        maxExp: 100,
        attributes: { strength: 10, agility: 8, intelligence: 5, vitality: 12 },
        inventory: new Array(20).fill(null),
        equipment: { weapon: null, helmet: null, chest: null, gloves: null, boots: null },
        activeSection: "geral",
        guildId: null,
        spritePath: "./assets/sprites/placeholder.png",
        skills: [
            {id: "s001", name: "Golpe Poderoso", cost: 10, type: "physical", power: 1.5, target: "enemy", class: ["Guerreiro", "Cavaleiro"]},
            {id: "s002", name: "Bola de Fogo", cost: 15, type: "magical", power: 1.8, target: "enemy", class: ["Mago"]},
            {id: "s003", name: "Flecha Perfurante", cost: 8, type: "physical", power: 1.3, target: "enemy", class: ["Arqueiro"]},
            {id: "s004", name: "Ataque Furtivo", cost: 12, type: "physical", power: 1.6, target: "enemy", class: ["Assassino"]},
            {id: "s005", name: "Curar Leve", cost: 20, type: "healing", power: 0.3, target: "self", class: ["Todas"]}
        ]
    };

    if (typeof firebase !== "undefined" && typeof firebaseConfig !== "undefined") {
        try {
            if (firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
                console.log("Firebase App inicializado.");
            }
            db = firebase.firestore();
            rtdb = firebase.database();
            auth = firebase.auth();
            console.log("Serviços Firebase referenciados.");
        } catch (e) {
            console.error("Erro ao inicializar Firebase ou seus serviços:", e);
            showNotification("Erro crítico: Falha ao conectar com Firebase.", "error");
            initializeMockFirebase(); 
        }
    } else {
        console.warn("Firebase SDK ou firebaseConfig não definidos. Usando Mocks.");
        initializeMockFirebase();
    }

    function initializeMockFirebase() {
        console.log("Inicializando Firebase Mock...");
        db = { 
            collection: (collectionName) => ({ 
                doc: (docId) => ({
                    collection: (subCollectionName) => ({ 
                        doc: (subDocId) => ({
                            get: () => Promise.resolve({ 
                                exists: true, 
                                data: () => { 
                                    if (collectionName === "players" && docId === "mockUserId" && subCollectionName === "characters" && subDocId === "mockCharId123") {
                                        return { name: "Jogador Mock", class: "Guerreiro", level: 5, hp: 150, maxHp: 150, mp: 70, maxMp: 70, exp: 10, maxExp: 200, gold: 1000, attributes: { strength: 15, agility: 10, intelligence: 8, vitality: 12 }, spritePath: "./assets/sprites/warrior.png", inventory: [], equipment: {weapon: null, helmet: null, chest:null, gloves:null, boots:null}, skills: playerState.skills, guildId: null, activeSection: "geral" };
                                    }
                                    return {};
                                },
                                id: subDocId || "mockCharId123"
                            }), 
                            set: (data) => Promise.resolve(console.log(`Mock DB Set: ${collectionName}/${docId}/${subCollectionName}/${subDocId}`, data)), 
                            update: (data) => Promise.resolve(console.log(`Mock DB Update: ${collectionName}/${docId}/${subCollectionName}/${subDocId}`, data)),
                            onSnapshot: (callback) => {
                                 if (collectionName === "players" && docId === "mockUserId" && subCollectionName === "characters" && (subDocId === "mockCharId123" || subDocId === selectedCharacterId)) {
                                    setTimeout(() => callback({ 
                                        exists: true, 
                                        data: () => ({ name: "Jogador Mock", class: "Guerreiro", level: 5, hp: 150, maxHp: 150, mp: 70, maxMp: 70, exp: 10, maxExp: 200, gold: 1000, attributes: { strength: 15, agility: 10, intelligence: 8, vitality: 12 }, spritePath: "./assets/sprites/warrior.png", inventory: [], equipment: {weapon: null, helmet: null, chest:null, gloves:null, boots:null}, skills: playerState.skills, guildId: null, activeSection: "geral" }),
                                        id: subDocId || "mockCharId123"
                                    }), 50);
                                 }
                                 return () => {}; 
                            }
                        })
                    }),
                    get: () => Promise.resolve({ exists: false, data: () => ({}) }), 
                    set: (data) => Promise.resolve(console.log(`Mock DB Set: ${collectionName}/${docId}`, data)), 
                    update: (data) => Promise.resolve(console.log(`Mock DB Update: ${collectionName}/${docId}`, data)),
                    onSnapshot: (callback) => { 
                        if (collectionName === "guilds" && docId === "mockGuild123") {
                            setTimeout(() => callback({exists: true, data: () => ({name: "Guilda dos Mocks", leaderId: "mockLeader", members: {"mockUserId": {name: "Jogador Mock"}} })}), 50);
                        }
                        return () => {}; 
                    }
                }),
                add: (data) => Promise.resolve({id: "mockGuildId", ...console.log(`Mock DB Add: ${collectionName}`, data)})
            })
        };
        rtdb = { 
            ref: (path) => ({ 
                on: (eventType, callback) => { 
                    if(path.includes("guildChats")) console.log(`Mock RTDB Listener (on ${eventType}) for ${path}`);
                    if(path.includes("onlineStatus")) console.log(`Mock RTDB Listener (on ${eventType}) for ${path}`);
                    if(eventType === "child_added" && path.includes("guildChats")){
                        setTimeout(() => callback({val: () => ({senderName: "MockUser", text: "Olá do Mock!", timestamp: Date.now()})}), 200);
                    }
                    if(eventType === "value" && path.includes("onlineStatus")){
                         setTimeout(() => callback({val: () => ({mockUser1: {name: "Membro Mock 1", online: true}, mockUser2: {name: "Membro Mock 2", online: false}})}), 200);
                    }
                }, 
                off: () => {console.log(`Mock RTDB Listener (off) for ${path}`)}, 
                push: (data) => {console.log(`Mock RTDB Push to ${path}:`, data); return Promise.resolve({key: "mockMessageKey"})}, 
                set: (data) => {console.log(`Mock RTDB Set to ${path}:`, data); return Promise.resolve()},
                remove: () => {console.log(`Mock RTDB Remove from ${path}`); return Promise.resolve()},
                onDisconnect: () => ({ update: (data) => console.log("Mock RTDB onDisconnect update", data) })
            })
        };
        auth = { 
            currentUser: { uid: "mockUserId", email: "mock@example.com" }, 
            onAuthStateChanged: (callback) => { 
                const mockUser = { uid: "mockUserId", email: "mock@example.com" };
                currentUserId = mockUser.uid;
                setTimeout(() => callback(mockUser), 100); 
                return () => {}; 
            }
        };
        if (!selectedCharacterId) selectedCharacterId = "mockCharId123";
    }

    // --- Item & Monster Catalogs ---
    const WEAPON_CATALOG = [ 
        { id: "w_g_01", name: "Espada Curta de Ferro", type: "weapon", classRestriction: ["Guerreiro", "Cavaleiro"], levelRequirement: 1, cost: 50, stats: { attack: 5 }, sprite: "sword_iron.png" },
        { id: "w_g_20", name: "Espada Longa de Aço", type: "weapon", classRestriction: ["Guerreiro", "Cavaleiro"], levelRequirement: 20, cost: 500, stats: { attack: 25, strength: 2 }, sprite: "longsword_steel.png" },
        { id: "w_m_01", name: "Cajado de Aprendiz", type: "weapon", classRestriction: ["Mago", "Necromancer"], levelRequirement: 1, cost: 40, stats: { magicAttack: 6, intelligence: 1 }, sprite: "staff_apprentice.png" },
        { id: "w_m_20", name: "Cajado Energizado", type: "weapon", classRestriction: ["Mago"], levelRequirement: 20, cost: 450, stats: { magicAttack: 30, intelligence: 3 }, sprite: "staff_energized.png" },
        { id: "w_a_01", name: "Adaga Serrilhada", type: "weapon", classRestriction: ["Assassino"], levelRequirement: 1, cost: 60, stats: { attack: 4, agility: 2 }, sprite: "dagger_serrated.png" },
        { id: "w_a_20", name: "Lâminas Gêmeas Sombrias", type: "weapon", classRestriction: ["Assassino"], levelRequirement: 20, cost: 550, stats: { attack: 22, agility: 5, criticalChance: 5 }, sprite: "twinblades_shadow.png" },
    ];
    const ARMOR_CATALOG = [
        { id: "h_all_01", name: "Capacete de Couro Simples", type: "helmet", classRestriction: ["Todas"], levelRequirement: 1, cost: 30, stats: { defense: 2 }, sprite: "helmet_leather.png" },
        { id: "h_g_20", name: "Elmo de Placas de Aço", type: "helmet", classRestriction: ["Guerreiro", "Cavaleiro"], levelRequirement: 20, cost: 300, stats: { defense: 10, vitality: 2 }, sprite: "helmet_steel_plate.png" },
        { id: "c_all_01", name: "Túnica de Pano Reforçado", type: "chest", classRestriction: ["Todas"], levelRequirement: 1, cost: 50, stats: { defense: 4 }, sprite: "chest_cloth_reinforced.png" },
        { id: "c_g_20", name: "Peitoral de Aço Maciço", type: "chest", classRestriction: ["Guerreiro", "Cavaleiro"], levelRequirement: 20, cost: 500, stats: { defense: 20, vitality: 5 }, sprite: "chest_steel_massive.png" },
    ];
    const MONSTER_CATALOG = [
        { id: "m001", name: "Goblin Fraco", level: 1, hp: 30, attack: 5, defense: 2, expReward: 10, goldReward: 5, sprite: "goblin_weak.png", skills: [{name: "Arranhão", power: 1.1}] },
        { id: "m002", name: "Lobo Cinzento", level: 3, hp: 50, attack: 8, defense: 3, expReward: 25, goldReward: 10, sprite: "wolf_grey.png", skills: [{name: "Mordida Feroz", power: 1.3}] },
        { id: "m003", name: "Orc Brutamontes", level: 5, hp: 100, attack: 12, defense: 5, expReward: 50, goldReward: 20, sprite: "orc_brute.png", skills: [{name: "Clavada", power: 1.5}] },
        { id: "m004", name: "Aranha Gigante", level: 7, hp: 70, attack: 10, defense: 4, expReward: 40, goldReward: 15, sprite: "spider_giant.png", skills: [{name: "Picada Venenosa", power: 1.2, effect: "poison", duration: 3}] }
    ];

    // --- Combat State ---
    let combatState = {
        active: false,
        playerTurn: true,
        currentMonster: null,
        monsterCurrentHp: 0,
        log: []
    };

    // --- Core Game Functions ---
    function updateUI() {
        if (!playerState || !playerState.id) { 
            console.warn("updateUI chamado sem dados de personagem carregados ou ID de personagem.");
            return;
        }
        if (uiElements.playerName) uiElements.playerName.textContent = playerState.name;
        if (uiElements.playerClass) uiElements.playerClass.textContent = playerState.class;
        if (uiElements.playerLevel) uiElements.playerLevel.textContent = playerState.level;
        if (uiElements.playerGold) uiElements.playerGold.textContent = playerState.gold;
        if (uiElements.hpBar && uiElements.hpValue) {
            const hpPercent = playerState.maxHp > 0 ? (playerState.hp / playerState.maxHp) * 100 : 0;
            uiElements.hpBar.style.width = `${hpPercent}%`;
            uiElements.hpValue.textContent = `${playerState.hp}/${playerState.maxHp}`;
        }
        if (uiElements.mpBar && uiElements.mpValue) {
            const mpPercent = playerState.maxMp > 0 ? (playerState.mp / playerState.maxMp) * 100 : 0;
            uiElements.mpBar.style.width = `${mpPercent}%`;
            uiElements.mpValue.textContent = `${playerState.mp}/${playerState.maxMp}`;
        }
        if (uiElements.expBar && uiElements.expValue) {
            const expPercent = playerState.maxExp > 0 ? (playerState.exp / playerState.maxExp) * 100 : 0;
            uiElements.expBar.style.width = `${expPercent}%`;
            uiElements.expValue.textContent = `${playerState.exp}/${playerState.maxExp}`;
        }
        if (playerState.attributes) {
            if (uiElements.attrStrength) uiElements.attrStrength.textContent = playerState.attributes.strength;
            if (uiElements.attrAgility) uiElements.attrAgility.textContent = playerState.attributes.agility;
            if (uiElements.attrIntelligence) uiElements.attrIntelligence.textContent = playerState.attributes.intelligence;
            if (uiElements.attrVitality) uiElements.attrVitality.textContent = playerState.attributes.vitality;
        }
        if (uiElements.characterSprite && playerState.spritePath) {
            uiElements.characterSprite.src = playerState.spritePath; 
            uiElements.characterSprite.alt = `${playerState.name} - ${playerState.class}`;
        }
        
        if (playerState.activeSection === "geral") updateGeralSection();
        if (playerState.activeSection === "inventario") renderInventory();
        if (playerState.activeSection === "armeiro") populateArmeiroShop();
        if (playerState.activeSection === "armaduras") populateArmadurasShop();
        if (playerState.activeSection === "guild") populateGuildSection();
        
        if (playerState.activeSection === "calabouco") {
            if (combatState.active) {
                updateCombatUI(); 
            } else {
                // A tela do calabouço já foi preparada por switchSection.
                // Atualiza elementos que podem mudar mesmo fora de combate ativo.
                const playerCombatSpriteEl = document.getElementById("player-combat-sprite-dungeon");
                if (playerCombatSpriteEl && playerState.spritePath) playerCombatSpriteEl.src = playerState.spritePath;
                const playerCombatHPEl = document.getElementById("player-combat-hp-dungeon");
                 if (playerCombatHPEl) playerCombatHPEl.textContent = `HP: ${playerState.hp}/${playerState.maxHp}`;

                const combatArea = document.getElementById("combat-area");
                const findMonsterBtnDungeon = document.getElementById("find-monster-btn-dungeon");
                if (combatArea) combatArea.classList.add("combat-area-hidden");
                if (findMonsterBtnDungeon) findMonsterBtnDungeon.style.display = "block";
            }
        }
    }

    function switchSection(sectionId) {
        document.querySelectorAll(".section-panel").forEach(panel => panel.classList.remove("active-section"));
        const targetPanel = document.getElementById(`${sectionId}-section`);
        if (targetPanel) {
            targetPanel.classList.add("active-section");
            playerState.activeSection = sectionId;
            console.log(`Seção ativa: ${sectionId}`);
            
            if (sectionId === "calabouco") {
                prepareDungeonScreen(); 
            } else if (sectionId === "guild") {
                populateGuildSection(); 
            }

            updateUI(); 
        } else {
            console.error(`Painel da seção ${sectionId}-section não encontrado.`);
        }
        document.querySelectorAll(".action-btn").forEach(button => {
            button.classList.toggle("active-btn", button.dataset.section === sectionId);
        });
    }
    
    function setupActionButtons() {
        document.querySelectorAll(".action-btn").forEach(button => {
            button.removeEventListener("click", handleActionButtonClick); 
            button.addEventListener("click", handleActionButtonClick);
        });
        console.log("Listeners dos botões de ação configurados.");

        if (uiElements.descansarBtn) {
            uiElements.descansarBtn.removeEventListener("click", toggleRest);
            uiElements.descansarBtn.addEventListener("click", toggleRest);
        }
    }

    function handleActionButtonClick(event) {
        switchSection(event.currentTarget.dataset.section);
    }

    function updateGeralSection() { 
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

    let isResting = false; let restInterval = null;
    function toggleRest() {
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
                if (recovered) updateUI();
                if (playerState.hp === playerState.maxHp && playerState.mp === playerState.maxMp) {
                    clearInterval(restInterval);
                    isResting = false;
                    if (uiElements.descansarBtn) uiElements.descansarBtn.textContent = "Descansar";
                    showNotification("HP e MP totalmente recuperados!", "success");
                }
            }, 3000); 
        }
    }

    function renderInventory() {
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
                if(item.cost) tooltipText += `Custo: ${item.cost} Ouro`;
                tooltip.innerHTML = tooltipText;
                slotDiv.appendChild(tooltip);
            } else {
                slotDiv.classList.add("empty-slot");
            }
            uiElements.inventoryGrid.appendChild(slotDiv);
        }
    }

    function populateShop(shopElement, itemCatalog, shopTitle) {
        if (!shopElement || !playerState.id) return;
        shopElement.innerHTML = `<h3>${shopTitle}</h3>`;
        const availableItems = itemCatalog.filter(item => 
            (item.classRestriction.includes(playerState.class) || item.classRestriction.includes("Todas")) && 
            playerState.level >= item.levelRequirement && 
            (playerState.level < item.levelRequirement + 20) 
        );

        if (availableItems.length === 0) {
            shopElement.innerHTML += "<p>Nenhum item disponível para sua classe/nível no momento.</p>";
            return;
        }

        availableItems.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("shop-item");
            let comparisonHtml = "";
            let currentEquippedItem = null;
            if (item.type === "weapon") currentEquippedItem = playerState.equipment.weapon;
            else if (["helmet", "chest", "gloves", "boots"].includes(item.type)) currentEquippedItem = playerState.equipment[item.type];

            if (currentEquippedItem) {
                comparisonHtml = "<small>Comparação com equipado:</small><br>";
                for (const stat in item.stats) {
                    const currentStat = currentEquippedItem.stats[stat] || 0;
                    const newItemStat = item.stats[stat] || 0;
                    const diff = newItemStat - currentStat;
                    comparisonHtml += `<small>${stat}: ${newItemStat} (${diff >= 0 ? "+" : ""}${diff})</small><br>`;
                }
            }

            itemDiv.innerHTML = `
                <img src="./assets/sprites/items/${item.sprite || "default_item.png"}" alt="${item.name}" class="item-sprite-shop">
                <h4>${item.name}</h4>
                <p>Custo: ${item.cost} Ouro</p>
                <p>Requisito Nível: ${item.levelRequirement}</p>
                <div>${Object.entries(item.stats).map(([key, value]) => `${key}: ${value}`).join(", " )}</div>
                ${comparisonHtml}
                <button class="buy-btn hexagonal-border small-btn" data-item-id="${item.id}" data-catalog="${itemCatalog === WEAPON_CATALOG ? "weapon" : "armor"}">Comprar</button>
            `;
            shopElement.appendChild(itemDiv);
        });
        shopElement.querySelectorAll(".buy-btn").forEach(btn => {
            btn.removeEventListener("click", handleBuyButtonClick); 
            btn.addEventListener("click", handleBuyButtonClick);
        });
    }

    function handleBuyButtonClick(e) {
        const itemId = e.target.dataset.itemId;
        const catalogType = e.target.dataset.catalog;
        const catalogToUse = catalogType === "weapon" ? WEAPON_CATALOG : ARMOR_CATALOG;
        buyItemFromShop(itemId, catalogToUse);
    }

    function populateArmeiroShop() { populateShop(uiElements.armeiroShopContent, WEAPON_CATALOG, "Armas Disponíveis"); }
    function populateArmadurasShop() { populateShop(uiElements.armadurasShopContent, ARMOR_CATALOG, "Armaduras Disponíveis"); }

    function buyItemFromShop(itemId, catalog) {
        if (!playerState.id) return;
        const item = catalog.find(i => i.id === itemId);
        if (!item) {
            showNotification("Item não encontrado!", "error");
            return;
        }
        if (playerState.gold < item.cost) {
            showNotification("Ouro insuficiente!", "error");
            return;
        }
        const emptySlotIndex = playerState.inventory.findIndex(slot => slot === null);
        if (emptySlotIndex === -1) {
            showNotification("Inventário cheio!", "error");
            return;
        }
        playerState.gold -= item.cost;
        playerState.inventory[emptySlotIndex] = { ...item }; 
        showNotification(`${item.name} comprado com sucesso!`, "success");
        updateUI();
        savePlayerCharacterData(); 
    }

    let currentGuildData = null;
    function populateGuildSection() {
        if (!uiElements.guildSectionContent || !playerState.id) return;
        if (!auth || !auth.currentUser) {
            uiElements.guildSectionContent.innerHTML = "<p>Você precisa estar logado para acessar a guilda.</p>";
            return;
        }

        if (!playerState.guildId) {
            uiElements.guildSectionContent.innerHTML = `
                <h2>Guilda</h2>
                <p>Você não está em uma guilda.</p>
                <input type="text" id="guild-name-input" placeholder="Nome da Nova Guilda">
                <button id="create-new-guild-btn" class="hexagonal-border small-btn">Criar Guilda (1000 Ouro)</button>
                <input type="text" id="join-guild-id-input" placeholder="ID da Guilda para Entrar">
                <button id="join-existing-guild-btn" class="hexagonal-border small-btn">Entrar na Guilda</button>
            `;
            const createNewGuildBtn = document.getElementById("create-new-guild-btn");
            if(createNewGuildBtn) {
                createNewGuildBtn.removeEventListener("click", handleCreateGuildClick);
                createNewGuildBtn.addEventListener("click", handleCreateGuildClick);
            }
            const joinExistingGuildBtn = document.getElementById("join-existing-guild-btn");
            if(joinExistingGuildBtn) {
                joinExistingGuildBtn.removeEventListener("click", handleJoinGuildClick);
                joinExistingGuildBtn.addEventListener("click", handleJoinGuildClick);
            }
            return;
        }
        
        uiElements.guildSectionContent.innerHTML = `
            <h2>Guilda: <span id="guild-name-display-dynamic">Carregando...</span></h2>
            <div id="guild-members-container">
                <h4>Membros Online:</h4>
                <ul id="guild-members-list-dynamic"></ul>
            </div>
            <div id="guild-chat-container">
                <h4>Chat da Guilda:</h4>
                <div id="guild-chat-messages-dynamic" class="chat-messages-box"></div>
                <input type="text" id="guild-chat-input-dynamic" placeholder="Digite sua mensagem...">
                <button id="send-guild-message-btn-dynamic" class="hexagonal-border small-btn">Enviar</button>
            </div>
            <button id="leave-guild-btn-dynamic" class="hexagonal-border small-btn">Sair da Guilda</button>
        `;
        
        const guildNameDisplayDynamic = document.getElementById("guild-name-display-dynamic");
        const guildMembersListDynamic = document.getElementById("guild-members-list-dynamic");
        const guildChatMessagesDynamic = document.getElementById("guild-chat-messages-dynamic");
        const guildChatInputDynamic = document.getElementById("guild-chat-input-dynamic");
        const sendGuildMessageBtnDynamic = document.getElementById("send-guild-message-btn-dynamic");
        const leaveGuildBtnDynamic = document.getElementById("leave-guild-btn-dynamic");

        if (sendGuildMessageBtnDynamic) {
            sendGuildMessageBtnDynamic.removeEventListener("click", sendGuildMessage);
            sendGuildMessageBtnDynamic.addEventListener("click", sendGuildMessage);
        }
        if (guildChatInputDynamic) {
            guildChatInputDynamic.removeEventListener("keypress", handleGuildChatKeyPress);
            guildChatInputDynamic.addEventListener("keypress", handleGuildChatKeyPress);
        }
        if (leaveGuildBtnDynamic) {
            leaveGuildBtnDynamic.removeEventListener("click", leaveGuild);
            leaveGuildBtnDynamic.addEventListener("click", leaveGuild);
        }

        if (guildNameDisplayDynamic && currentGuildData) {
            guildNameDisplayDynamic.textContent = currentGuildData.name || "Guilda Desconhecida";
        }
        if (guildMembersListDynamic) guildMembersListDynamic.innerHTML = "<li>Carregando membros...</li>";
        if (guildChatMessagesDynamic) guildChatMessagesDynamic.innerHTML = ""; 

        listenToGuildData(playerState.guildId);
        listenToGuildChat(playerState.guildId);
        listenToGuildMembersOnlineStatus(playerState.guildId);
    }

    function handleCreateGuildClick() {
        const guildNameInput = document.getElementById("guild-name-input");
        if (guildNameInput && guildNameInput.value.trim()) createGuild(guildNameInput.value.trim());
    }
    function handleJoinGuildClick() {
        const joinGuildIdInput = document.getElementById("join-guild-id-input");
        if(joinGuildIdInput && joinGuildIdInput.value.trim()) joinGuild(joinGuildIdInput.value.trim());
    }

    async function createGuild(guildName) {
        if (!currentUserId || !db) {
            showNotification("Não foi possível criar a guilda. Tente novamente.", "error");
            return;
        }
        const creationCost = 1000;
        if (playerState.gold < creationCost) {
            showNotification("Ouro insuficiente para criar a guilda!", "error");
            return;
        }
        try {
            playerState.gold -= creationCost;
            const guildRef = await db.collection("guilds").add({
                name: guildName,
                leaderId: currentUserId,
                leaderName: playerState.name, 
                members: { [currentUserId]: { name: playerState.name, joinedAt: firebase.firestore.FieldValue.serverTimestamp() } }
            });
            playerState.guildId = guildRef.id;
            showNotification(`Guilda "${guildName}" criada com sucesso!`, "success");
            populateGuildSection(); 
            savePlayerCharacterData(); 
            if (rtdb) rtdb.ref(`guilds/${guildRef.id}/onlineStatus/${currentUserId}`).set({ name: playerState.name, online: true });

        } catch (error) {
            console.error("Erro ao criar guilda:", error);
            playerState.gold += creationCost; 
            showNotification("Erro ao criar guilda. Tente novamente.", "error");
        }
    }

    async function joinGuild(guildIdToJoin) {
        if (!currentUserId || !db) {
            showNotification("Não foi possível entrar na guilda. Tente novamente.", "error");
            return;
        }
        try {
            const guildDocRef = db.collection("guilds").doc(guildIdToJoin);
            const guildDoc = await guildDocRef.get();
            if (!guildDoc.exists) {
                showNotification("Guilda não encontrada.", "error");
                return;
            }
            await guildDocRef.update({
                [`members.${currentUserId}`]: { name: playerState.name, joinedAt: firebase.firestore.FieldValue.serverTimestamp() }
            });
            playerState.guildId = guildIdToJoin;
            showNotification(`Você entrou na guilda "${guildDoc.data().name}"!`, "success");
            populateGuildSection();
            savePlayerCharacterData();
            if (rtdb) rtdb.ref(`guilds/${guildIdToJoin}/onlineStatus/${currentUserId}`).set({ name: playerState.name, online: true });
        } catch (error) {
            console.error("Erro ao entrar na guilda:", error);
            showNotification("Erro ao entrar na guilda. Verifique o ID ou tente novamente.", "error");
        }
    }

    function listenToGuildData(guildId) {
        if (!db || !guildId) return;
        const guildDocRef = db.collection("guilds").doc(guildId);
        const unsubscribe = guildDocRef.onSnapshot(doc => {
            if (doc.exists) {
                currentGuildData = doc.data();
                const guildNameDisplayDynamic = document.getElementById("guild-name-display-dynamic");
                if (guildNameDisplayDynamic) guildNameDisplayDynamic.textContent = currentGuildData.name;
            } else {
                console.warn("Dados da guilda não encontrados ou você foi removido.");
                playerState.guildId = null;
                currentGuildData = null;
                populateGuildSection(); 
                savePlayerCharacterData();
            }
        }, err => {
            console.error("Erro ao ouvir dados da guilda:", err);
            showNotification("Erro ao carregar dados da guilda.", "error");
        });
    }

    function listenToGuildChat(guildId) {
        if (!rtdb || !guildId) return;
        if (guildChatUnsubscribe) guildChatUnsubscribe(); 
        const chatRef = rtdb.ref(`guildChats/${guildId}/messages`);
        const guildChatMessagesDynamic = document.getElementById("guild-chat-messages-dynamic");
        if (guildChatMessagesDynamic) guildChatMessagesDynamic.innerHTML = ""; 
        guildChatUnsubscribe = chatRef.orderByChild("timestamp").limitToLast(50).on("child_added", snapshot => {
            const message = snapshot.val();
            if (message && guildChatMessagesDynamic) {
                const msgElement = document.createElement("div");
                msgElement.classList.add("chat-message");
                const senderName = message.senderName || "Anônimo";
                msgElement.innerHTML = `<strong>${senderName}:</strong> ${message.text}`;
                guildChatMessagesDynamic.appendChild(msgElement);
                guildChatMessagesDynamic.scrollTop = guildChatMessagesDynamic.scrollHeight;
            }
        }, err => {
            console.error("Erro ao ouvir chat da guilda:", err);
            showNotification("Erro ao carregar chat da guilda.", "error");
        });
    }

    function sendGuildMessage() {
        const guildChatInputDynamic = document.getElementById("guild-chat-input-dynamic");
        if (!rtdb || !playerState.guildId || !guildChatInputDynamic || !currentUserId) return;
        const text = guildChatInputDynamic.value.trim();
        if (text === "") return;
        rtdb.ref(`guildChats/${playerState.guildId}/messages`).push({
            senderId: currentUserId,
            senderName: playerState.name,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            if (guildChatInputDynamic) guildChatInputDynamic.value = ""; 
        }).catch(err => {
            console.error("Erro ao enviar mensagem:", err);
            showNotification("Erro ao enviar mensagem.", "error");
        });
    }
    function handleGuildChatKeyPress(e) {
        if (e.key === "Enter") sendGuildMessage();
    }

    function listenToGuildMembersOnlineStatus(guildId) {
        if (!rtdb || !guildId) return;
        if (guildMembersUnsubscribe) guildMembersUnsubscribe(); 
        const onlineRef = rtdb.ref(`guilds/${guildId}/onlineStatus`);
        const guildMembersListDynamic = document.getElementById("guild-members-list-dynamic");
        guildMembersUnsubscribe = onlineRef.on("value", snapshot => {
            if (guildMembersListDynamic) guildMembersListDynamic.innerHTML = ""; 
            const membersOnline = snapshot.val();
            if (membersOnline) {
                Object.values(membersOnline).forEach(member => {
                    if (guildMembersListDynamic) {
                        const li = document.createElement("li");
                        li.textContent = `${member.name} (${member.online ? "Online" : "Offline"})`;
                        li.classList.add(member.online ? "member-online" : "member-offline");
                        guildMembersListDynamic.appendChild(li);
                    }
                });
            } else {
                if (guildMembersListDynamic) guildMembersListDynamic.innerHTML = "<li>Nenhum membro online.</li>";
            }
        }, err => {
            console.error("Erro ao ouvir status online dos membros:", err);
            showNotification("Erro ao carregar status dos membros.", "error");
        });
        rtdb.ref(`guilds/${guildId}/onlineStatus/${currentUserId}`).set({ name: playerState.name, online: true });
        rtdb.ref(`guilds/${guildId}/onlineStatus/${currentUserId}`).onDisconnect().update({ online: false });
    }

    async function leaveGuild() {
        if (!playerState.guildId || !currentUserId || !db || !rtdb) return;
        const guildId = playerState.guildId;
        try {
            await rtdb.ref(`guilds/${guildId}/onlineStatus/${currentUserId}`).remove();
            const guildDocRef = db.collection("guilds").doc(guildId);
            await guildDocRef.update({
                [`members.${currentUserId}`]: firebase.firestore.FieldValue.delete()
            });

            playerState.guildId = null;
            if (guildChatUnsubscribe) { guildChatUnsubscribe(); guildChatUnsubscribe = null; }
            if (guildMembersUnsubscribe) { guildMembersUnsubscribe(); guildMembersUnsubscribe = null; }
            currentGuildData = null;
            showNotification("Você saiu da guilda.", "info");
            populateGuildSection(); 
            savePlayerCharacterData();
        } catch (error) {
            console.error("Erro ao sair da guilda:", error);
            showNotification("Erro ao sair da guilda.", "error");
        }
    }

    function prepareDungeonScreen() {
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
        console.log("Função startCombat iniciada.");
        if (!playerState.id) {
            console.log("startCombat: playerState.id não definido. Retornando.");
            showNotification("Dados do jogador não carregados para iniciar combate.", "warning");
            return;
        }
        console.log("startCombat: playerState.id OK.");

        const availableMonsters = MONSTER_CATALOG.filter(m => m.level <= playerState.level + 2);
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
        if (!playerState.id || !combatState.currentMonster) return;
        const baseDamage = playerState.attributes.strength + (playerState.equipment.weapon ? playerState.equipment.weapon.stats.attack || 0 : 0);
        const monsterDefense = combatState.currentMonster.defense;
        let damageDealt = Math.max(1, baseDamage - monsterDefense + Math.floor(Math.random() * 5 - 2));
        combatState.monsterCurrentHp -= damageDealt;
        addCombatLog(`${playerState.name} ataca ${combatState.currentMonster.name} causando ${damageDealt} de dano.`);
        checkCombatStatus();
    }

    function playerUseSkill(skillId) {
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
        updateUI();
        updateCombatUI();
    }

    function checkCombatStatus() {
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
        updateUI();
        prepareDungeonScreen(); 
        savePlayerCharacterData();
    }
    
    function levelUp() {
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
        showNotification(`Você subiu para o Nível ${playerState.level}!`, "success");
        addCombatLog(`Você subiu para o Nível ${playerState.level}!`);
    }

    function addCombatLog(message) {
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

    function showNotification(message, type = "info") {
        if (!uiElements.notificationsContainer) return;
        const notification = document.createElement("div");
        notification.classList.add("notification", `notification-${type}`);
        notification.textContent = message;
        uiElements.notificationsContainer.appendChild(notification);
        setTimeout(() => {
            notification.classList.add("notification-fade-out");
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    async function savePlayerCharacterData() {
        if (!currentUserId || !selectedCharacterId || !db) {
            console.warn("Não é possível salvar: UID do usuário ou ID do personagem não definidos, ou DB não inicializado.");
            return;
        }
        try {
            const { id, ...dataToSave } = playerState; 
            await db.collection("players").doc(currentUserId).collection("characters").doc(selectedCharacterId).set(dataToSave, { merge: true });
            console.log("Dados do personagem salvos no Firebase:", selectedCharacterId);
        } catch (error) {
            console.error("Erro ao salvar dados do personagem:", error);
            showNotification("Erro ao salvar seus dados. Verifique sua conexão.", "error");
        }
    }

    async function initializeGame() {
        console.log("Iniciando initializeGame...");
        if (!auth) {
            console.error("Firebase Auth não inicializado. Tentando usar mocks se disponíveis...");
            if (typeof initializeMockFirebase === "function" && (!firebase || !firebase.apps.length)) {
                currentUserId = auth.currentUser?.uid; 
                if (currentUserId && selectedCharacterId) {
                    console.log(`Mock: Carregando personagem ${selectedCharacterId} para usuário ${currentUserId}`);
                    const characterDataRef = db.collection("players").doc(currentUserId).collection("characters").doc(selectedCharacterId);
                    const doc = await characterDataRef.get(); 
                    if (doc.exists) {
                        playerState = { ...playerState, ...doc.data(), id: doc.id };
                        setDefaultSpriteForClass();
                        updateUI();
                        setupActionButtons(); 
                        switchSection(playerState.activeSection || "geral");
                        showNotification("Jogo carregado com dados Mock!", "info");
                    } else {
                        console.error("Mock: Personagem não encontrado.");
                        showNotification("Mock: Personagem não encontrado. Verifique o ID.", "error");
                    }
                } else {
                    console.log("Mock: currentUserId ou selectedCharacterId não definidos.");
                    updateUI();
                    setupActionButtons();
                    switchSection("geral");
                }
            }
            return;
        }

        authUnsubscribe = auth.onAuthStateChanged(async user => {
            if (user) {
                currentUserId = user.uid;
                console.log("Usuário autenticado:", currentUserId);

                if (!selectedCharacterId) {
                    const lastCharId = localStorage.getItem("lastSelectedCharacterId");
                    if (lastCharId) {
                        selectedCharacterId = lastCharId;
                        console.log("Carregando último personagem selecionado do localStorage:", selectedCharacterId);
                    } else {
                        console.warn("Nenhum personagem selecionado (URL, localStorage, sessionStorage). Redirecionando para seleção...");
                        showNotification("Nenhum personagem selecionado. Você será redirecionado.", "warning");
                        updateUI(); 
                        setupActionButtons(); 
                        switchSection("geral");
                        return; 
                    }
                }
                
                console.log(`Tentando carregar personagem com ID: ${selectedCharacterId} para o usuário ${currentUserId}`);
                if (!db) {
                    console.error("Firestore (db) não está inicializado!");
                    showNotification("Erro crítico: Conexão com banco de dados falhou.", "error");
                    return;
                }
                const characterDocRef = db.collection("players").doc(currentUserId).collection("characters").doc(selectedCharacterId);
                
                if (playerCharacterUnsubscribe) playerCharacterUnsubscribe(); 

                playerCharacterUnsubscribe = characterDocRef.onSnapshot(doc => {
                    if (doc.exists) {
                        console.log("Dados do personagem recebidos do Firestore:", doc.data());
                        playerState = { ...playerState, ...doc.data(), id: doc.id }; 
                        setDefaultSpriteForClass(); 
                        updateUI(); 
                        setupActionButtons(); 
                        switchSection(playerState.activeSection || "geral"); 
                        
                        if (playerState.guildId && playerState.activeSection === "guild") {
                            populateGuildSection(); 
                        }
                        localStorage.setItem("lastSelectedCharacterId", selectedCharacterId);
                        console.log("Jogo inicializado e UI atualizada com dados do personagem.");
                    } else {
                        console.error(`Personagem com ID ${selectedCharacterId} não encontrado para o usuário ${currentUserId}.`);
                        showNotification("Erro: Personagem não encontrado. Verifique a seleção ou crie um novo.", "error");
                        playerState.id = null; 
                        updateUI();
                        setupActionButtons();
                        switchSection("geral");
                    }
                }, err => {
                    console.error("Erro ao carregar dados do personagem (onSnapshot):", err);
                    showNotification("Erro ao carregar seus dados. Verifique as permissões do Firebase.", "error");
                    playerState.id = null;
                    updateUI();
                    setupActionButtons();
                    switchSection("geral");
                });

            } else {
                console.log("Nenhum usuário autenticado. Limpando estado e preparando UI para login/seleção.");
                currentUserId = null;
                selectedCharacterId = null; 
                if (playerCharacterUnsubscribe) playerCharacterUnsubscribe();
                if (guildChatUnsubscribe) { guildChatUnsubscribe(); guildChatUnsubscribe = null; }
                if (guildMembersUnsubscribe) { guildMembersUnsubscribe(); guildMembersUnsubscribe = null; }
                playerState = { ...playerState, id: null, name: "Viajante", class: "Guerreiro", level: 1, gold: 0, hp: 100, maxHp: 100, mp: 50, maxMp: 50, exp: 0, maxExp: 100, attributes: { strength: 5, agility: 5, intelligence: 5, vitality: 5 }, inventory: new Array(20).fill(null), equipment: { weapon: null, helmet: null, chest: null, gloves: null, boots: null }, activeSection: "geral", guildId: null, spritePath: "./assets/sprites/placeholder.png" };
                setDefaultSpriteForClass();
                updateUI();
                setupActionButtons(); 
                switchSection("geral"); 
                showNotification("Por favor, faça login e selecione um personagem.", "info");
            }
        });
    }
    
    function setDefaultSpriteForClass(){
        if (!playerState) return;
        switch(playerState.class) {
            case "Guerreiro": playerState.spritePath = "./assets/sprites/warrior.png"; break;
            case "Cavaleiro": playerState.spritePath = "./assets/sprites/knight.png"; break;
            case "Assassino": playerState.spritePath = "./assets/sprites/assassin.png"; break;
            case "Mago": playerState.spritePath = "./assets/sprites/mage.png"; break;
            case "Arqueiro": playerState.spritePath = "./assets/sprites/archer.png"; break;
            case "Necromancer": playerState.spritePath = "./assets/sprites/necromancer.png"; break;
            default: playerState.spritePath = "./assets/sprites/placeholder.png";
        }
    }

    initializeGame();

    window.gameAPI = {
        getState: () => playerState,
        setState: (newState) => { playerState = {...playerState, ...newState}; updateUI(); savePlayerCharacterData(); },
        buyItemTest: (itemId, catalogType) => {
            const catalog = catalogType === "weapon" ? WEAPON_CATALOG : ARMOR_CATALOG;
            buyItemFromShop(itemId, catalog);
        },
        switchSectionTest: switchSection,
        joinMockGuild: () => {
            if (!currentUserId) { showNotification("Você precisa estar logado para entrar em uma guilda mock.", "warning"); return; }
            playerState.guildId = "mockGuild123";
            currentGuildData = {name: "Guilda dos Mocks", leaderId: "mockLeader"};
            if(rtdb) rtdb.ref(`guilds/mockGuild123/onlineStatus/${currentUserId}`).set({ name: playerState.name, online: true });
            updateUI();
            showNotification("Entrou na Guilda Mock!", "info");
        },
        sendMockChatMessage: (text) => {
            const guildChatMessagesDynamic = document.getElementById("guild-chat-messages-dynamic");
            if(playerState.guildId && guildChatMessagesDynamic){
                 const msgElement = document.createElement("div");
                msgElement.classList.add("chat-message");
                msgElement.innerHTML = `<strong>${playerState.name}:</strong> ${text}`;
                guildChatMessagesDynamic.appendChild(msgElement);
                guildChatMessagesDynamic.scrollTop = guildChatMessagesDynamic.scrollHeight;
            }
        },
        startTestCombat: () => startCombat(),
        saveGameState: () => savePlayerCharacterData()
    };
});

