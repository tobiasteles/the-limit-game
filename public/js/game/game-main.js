import { updateGeralSection } from 'js/game/game-geral.js'; // Certifique-se de que este arquivo existe e contém a função
import { renderInventory } from './game-inventory.js'; // Certifique-se de que este arquivo existe e contém a função
import { populateArmeiroShop } from './game-armory.js'; // Certifique-se de que este arquivo existe e contém a função
import { populateArmadurasShop } from './game-armor-shop.js'; // Certifique-se de que este arquivo existe e contém a função
import { populateGuildSection } from './game-guild.js'; // Certifique-se de que este arquivo existe e contém a função

// game-main.js: Lógica central, inicialização, e funções de utilidade
// Importações adicionais, se necessário
// Variáveis globais que podem precisar ser acessadas por outros módulos.
let db, rtdb, auth, currentUserId, authUnsubscribe, playerCharacterUnsubscribe;
let guildChatUnsubscribe, guildMembersUnsubscribe;
let selectedCharacterId = null;

let uiElements = {};
let playerState = {};
let WEAPON_CATALOG_DATA = [];
let ARMOR_CATALOG_DATA = [];
let MONSTER_CATALOG_DATA = [];
let combatState = {};

document.addEventListener("DOMContentLoaded", () => {
    console.log("game-main.js: DOM Carregado. Inicializando o jogo...");

    const urlParams = new URLSearchParams(window.location.search);
    selectedCharacterId = urlParams.get("characterId");
    if (!selectedCharacterId) {
        selectedCharacterId = localStorage.getItem("selectedCharacterId");
    }
    if (!selectedCharacterId) {
        selectedCharacterId = sessionStorage.getItem("selectedCharacterId");
    }

    uiElements = {
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
        // Seções principais de conteúdo
        mainContent: document.getElementById("main-content"),
        geralSection: document.getElementById("geral-section"),
        armeiroSection: document.getElementById("armeiro-section"),
        armadurasSection: document.getElementById("armaduras-section"),
        guildSection: document.getElementById("guild-section"),
        inventarioSection: document.getElementById("inventario-section"),
        calaboucoSection: document.getElementById("calabouco-section"),
        // Elementos específicos das seções (alguns já aqui, outros nos módulos)
        geralStatusCompleto: document.getElementById("geral-status-completo"), // Se existir no HTML
        geralEquipamentosAtivos: document.getElementById("geral-equipamentos-ativos"), // Se existir no HTML
        descansarBtn: document.getElementById("descansar-btn"), // Se existir no HTML
        inventoryGrid: document.getElementById("inventory-grid"),
        inventoryGoldDisplay: document.getElementById("inventory-gold-display"), // Se existir no HTML
        armeiroShopContent: document.getElementById("armeiro-shop-content"), // Se existir no HTML
        armadurasShopContent: document.getElementById("armaduras-shop-content"), // Se existir no HTML
        guildSectionContent: document.getElementById("guild-section-content"), // Se existir no HTML
        dungeonSectionContent: document.getElementById("calabouco-section-content"), // Se existir no HTML
        notificationsContainer: document.getElementById("notifications-container"),
        actionButtons: document.querySelectorAll(".action-btn[data-section]")
    };

    playerState = {
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

    WEAPON_CATALOG_DATA = [
        { id: "w_g_01", name: "Espada Curta de Ferro", type: "weapon", classRestriction: ["Guerreiro", "Cavaleiro"], levelRequirement: 1, cost: 50, stats: { attack: 5 }, sprite: "sword_iron.png" },
        { id: "w_g_20", name: "Espada Longa de Aço", type: "weapon", classRestriction: ["Guerreiro", "Cavaleiro"], levelRequirement: 20, cost: 500, stats: { attack: 25, strength: 2 }, sprite: "longsword_steel.png" },
        { id: "w_m_01", name: "Cajado de Aprendiz", type: "weapon", classRestriction: ["Mago", "Necromancer"], levelRequirement: 1, cost: 40, stats: { magicAttack: 6, intelligence: 1 }, sprite: "staff_apprentice.png" },
        { id: "w_m_20", name: "Cajado Energizado", type: "weapon", classRestriction: ["Mago"], levelRequirement: 20, cost: 450, stats: { magicAttack: 30, intelligence: 3 }, sprite: "staff_energized.png" },
        { id: "w_a_01", name: "Adaga Serrilhada", type: "weapon", classRestriction: ["Assassino"], levelRequirement: 1, cost: 60, stats: { attack: 4, agility: 2 }, sprite: "dagger_serrated.png" },
        { id: "w_a_20", name: "Lâminas Gêmeas Sombrias", type: "weapon", classRestriction: ["Assassino"], levelRequirement: 20, cost: 550, stats: { attack: 22, agility: 5, criticalChance: 5 }, sprite: "twinblades_shadow.png" },
    ];
    ARMOR_CATALOG_DATA = [
        { id: "h_all_01", name: "Capacete de Couro Simples", type: "helmet", classRestriction: ["Todas"], levelRequirement: 1, cost: 30, stats: { defense: 2 }, sprite: "helmet_leather.png" },
        { id: "h_g_20", name: "Elmo de Placas de Aço", type: "helmet", classRestriction: ["Guerreiro", "Cavaleiro"], levelRequirement: 20, cost: 300, stats: { defense: 10, vitality: 2 }, sprite: "helmet_steel_plate.png" },
        { id: "c_all_01", name: "Túnica de Pano Reforçado", type: "chest", classRestriction: ["Todas"], levelRequirement: 1, cost: 50, stats: { defense: 4 }, sprite: "chest_cloth_reinforced.png" },
        { id: "c_g_20", name: "Peitoral de Aço Maciço", type: "chest", classRestriction: ["Guerreiro", "Cavaleiro"], levelRequirement: 20, cost: 500, stats: { defense: 20, vitality: 5 }, sprite: "chest_steel_massive.png" },
    ];
    MONSTER_CATALOG_DATA = [
        { id: "m001", name: "Goblin Fraco", level: 1, hp: 30, attack: 5, defense: 2, expReward: 10, goldReward: 5, sprite: "goblin_weak.png", skills: [{name: "Arranhão", power: 1.1}] },
        { id: "m002", name: "Lobo Cinzento", level: 3, hp: 50, attack: 8, defense: 3, expReward: 25, goldReward: 10, sprite: "wolf_grey.png", skills: [{name: "Mordida Feroz", power: 1.3}] },
        { id: "m003", name: "Orc Brutamontes", level: 5, hp: 100, attack: 12, defense: 5, expReward: 50, goldReward: 20, sprite: "orc_brute.png", skills: [{name: "Clavada", power: 1.5}] },
        { id: "m004", name: "Aranha Gigante", level: 7, hp: 70, attack: 10, defense: 4, expReward: 40, goldReward: 15, sprite: "spider_giant.png", skills: [{name: "Picada Venenosa", power: 1.2, effect: "poison", duration: 3}] }
    ];

    combatState = {
        active: false,
        playerTurn: true,
        currentMonster: null,
        monsterCurrentHp: 0,
        log: []
    };

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

        // Chamar funções de atualização específicas da seção ativa
        if (playerState.activeSection === "geral" && typeof updateGeralSection === 'function') updateGeralSection();
        if (playerState.activeSection === "inventario" && typeof renderInventory === 'function') renderInventory();
        if (playerState.activeSection === "armeiro" && typeof populateArmeiroShop === 'function') populateArmeiroShop();
        if (playerState.activeSection === "armaduras" && typeof populateArmadurasShop === 'function') populateArmadurasShop();
        if (playerState.activeSection === "guild" && typeof populateGuildSection === 'function') populateGuildSection();
        if (playerState.activeSection === "calabouco") {
            if (combatState.active && typeof updateCombatUI === 'function') updateCombatUI();
            else if (typeof prepareDungeonScreen === 'function') prepareDungeonScreen();
        }
    }

    function switchSection(sectionId) {
        console.log(`Tentando mudar para a seção: ${sectionId}`);
        document.querySelectorAll(".section-panel").forEach(panel => {
            panel.classList.remove("active-section");
        });
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add("active-section");
            playerState.activeSection = sectionId;
            console.log(`Seção ativa alterada para: ${playerState.activeSection}`);
            updateUI(); // Atualiza a UI para refletir a nova seção e seus dados
            if (typeof savePlayerCharacterData === 'function') savePlayerCharacterData(); // Salva o estado da seção ativa
        } else {
            console.error(`Seção com ID ${sectionId}-section não encontrada.`);
        }
    }

    function handleActionButtonClick(event) {
        const sectionId = event.target.dataset.section;
        if (sectionId) {
            switchSection(sectionId);
        }
    }

    function setupActionButtons() {
        if (uiElements.actionButtons) {
            uiElements.actionButtons.forEach(button => {
                button.removeEventListener("click", handleActionButtonClick); // Evita múltiplos listeners
                button.addEventListener("click", handleActionButtonClick);
            });
            console.log("Botões de ação configurados.");
        } else {
            console.error("Botões de ação não encontrados para configuração.");
        }
        // Configurar botão de descanso se existir e a função toggleRest estiver disponível
        if (uiElements.descansarBtn && typeof toggleRest === 'function') {
            uiElements.descansarBtn.removeEventListener("click", toggleRest);
            uiElements.descansarBtn.addEventListener("click", toggleRest);
            console.log("Botão de descanso configurado.");
        }
    }

    async function loadPlayerCharacterData() {
        if (!currentUserId || !selectedCharacterId || !db) {
            console.warn("Não é possível carregar dados: UID do usuário ou ID do personagem não definidos, ou DB não inicializado.");
            if (auth && !auth.currentUser) {
                 showNotification("Sessão expirada ou não autenticada. Por favor, faça login novamente.", "error");
                 // window.location.href = "login.html"; // Redirecionar para login
                 return;
            }
            // Se for mock, tenta carregar dados mock
            if (selectedCharacterId === "mockCharId123" && db.collection) { // Verifica se é mock e db tem 'collection'
                const mockCharDoc = await db.collection("players").doc("mockUserId").collection("characters").doc("mockCharId123").get();
                if (mockCharDoc.exists) {
                    Object.assign(playerState, mockCharDoc.data());
                    playerState.id = mockCharDoc.id;
                    setDefaultSpriteForClass();
                    updateUI();
                    switchSection(playerState.activeSection || "geral");
                    console.log("Dados mock do personagem carregados.");
                    return;
                }
            }
            showNotification("Não foi possível carregar os dados do personagem.", "error");
            return;
        }
        try {
            if (playerCharacterUnsubscribe) playerCharacterUnsubscribe(); 
            const characterDocRef = db.collection("players").doc(currentUserId).collection("characters").doc(selectedCharacterId);
            playerCharacterUnsubscribe = characterDocRef.onSnapshot(async (doc) => {
                if (doc.exists) {
                    console.log("Dados do personagem recebidos do Firebase:", doc.data());
                    Object.assign(playerState, doc.data());
                    playerState.id = doc.id; 
                    setDefaultSpriteForClass();
                    updateUI();
                    // Não chamar switchSection aqui para evitar loop se activeSection for salva e carregada
                    // A seção inicial será definida em initializeGame ou mantida como 'geral'
                } else {
                    console.error("Personagem não encontrado no Firebase.");
                    showNotification("Personagem não encontrado. Verifique a seleção ou crie um novo.", "error");
                    // window.location.href = "char_selection.html"; // Redirecionar para seleção
                }
            }, (error) => {
                console.error("Erro ao carregar dados do personagem em tempo real:", error);
                showNotification("Erro ao carregar dados do personagem.", "error");
            });
        } catch (error) {
            console.error("Erro ao configurar o listener de dados do personagem:", error);
            showNotification("Erro crítico ao carregar dados do personagem.", "error");
        }
    }

    function initializeGame() {
        console.log("Inicializando o jogo...");
        if (auth) {
            authUnsubscribe = auth.onAuthStateChanged(user => {
                if (user) {
                    currentUserId = user.uid;
                    console.log("Usuário autenticado:", currentUserId);
                    if (selectedCharacterId) {
                        console.log("ID do personagem selecionado:", selectedCharacterId);
                        loadPlayerCharacterData();
                    } else {
                        console.error("Nenhum ID de personagem selecionado. Redirecionando para seleção...");
                        showNotification("Nenhum personagem selecionado.", "error");
                        // window.location.href = "char_selection.html"; 
                    }
                } else {
                    currentUserId = null;
                    console.log("Nenhum usuário autenticado. Usando mock ou redirecionando para login...");
                    // Se não houver usuário e estivermos usando mocks, podemos tentar carregar o mock char
                    if (selectedCharacterId === "mockCharId123") {
                        loadPlayerCharacterData(); // Tentará carregar o mock
                    } else {
                        // window.location.href = "login.html";
                    }
                }
            });
        } else {
            console.error("Serviço de autenticação do Firebase não está disponível.");
            showNotification("Falha na autenticação. Tente recarregar.", "error");
        }
        setupActionButtons();
        switchSection(playerState.activeSection || "geral"); // Define a seção inicial
        console.log("Jogo inicializado. Seção ativa:", playerState.activeSection);
    }

    // --- Funções de Loja (Comum para Armeiro e Armaduras) ---
    // Movido para cá para ser acessível por game-armory.js e game-armor-shop.js
    function populateShop(shopContentElement, catalog, title) {
        if (!shopContentElement || !playerState.id) return;
        let shopHtml = `<h3>${title}</h3><div class="shop-items-grid">`;
        catalog.forEach(item => {
            if (item.classRestriction.includes(playerState.class) || item.classRestriction.includes("Todas")) {
                if (playerState.level >= item.levelRequirement) {
                    shopHtml += `
                        <div class="shop-item" data-item-id="${item.id}">
                            <img src="./assets/sprites/items/${item.sprite}" alt="${item.name}" class="item-sprite">
                            <p><strong>${item.name}</strong></p>
                            <p>Custo: ${item.cost} Ouro</p>
                            <div class="item-stats">
                                ${Object.entries(item.stats).map(([stat, value]) => `<p>${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}</p>`).join("")}
                            </div>
                            <button class="buy-btn hexagonal-border small-btn" data-item-id="${item.id}" data-catalog-type="${catalog === WEAPON_CATALOG_DATA ? 'weapon' : 'armor'}">Comprar</button>
                        </div>
                    `;
                }
            }
        });
        shopHtml += "</div>";
        shopContentElement.innerHTML = shopHtml;
        shopContentElement.querySelectorAll(".buy-btn").forEach(button => {
            button.removeEventListener("click", handleBuyItemClick);
            button.addEventListener("click", handleBuyItemClick);
        });
    }

    function handleBuyItemClick(event) {
        const itemId = event.target.dataset.itemId;
        const catalogType = event.target.dataset.catalogType;
        const catalog = catalogType === "weapon" ? WEAPON_CATALOG_DATA : ARMOR_CATALOG_DATA;
        buyItemFromShop(itemId, catalog);
    }

    function buyItemFromShop(itemId, catalog) {
        const item = catalog.find(i => i.id === itemId);
        if (!item) {
            showNotification("Item não encontrado na loja.", "error");
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
        playerState.inventory[emptySlotIndex] = { ...item }; // Adiciona uma cópia do item
        showNotification(`${item.name} comprado e adicionado ao inventário!`, "success");
        updateUI();
        if (typeof savePlayerCharacterData === 'function') savePlayerCharacterData();
    }

    // Inicializa o jogo
    initializeGame();

    // API Global para Testes (opcional, pode ser removida em produção)
    window.gameAPI = {
        getState: () => playerState,
        getCombatState: () => combatState,
        setSelectedChar: (id) => { selectedCharacterId = id; localStorage.setItem("selectedCharacterId", id); console.log("ID do personagem para teste definido como:", id); loadPlayerCharacterData(); },
        buyItemTest: (itemId, catalogType) => {
            const catalog = catalogType === "weapon" ? WEAPON_CATALOG_DATA : ARMOR_CATALOG_DATA;
            buyItemFromShop(itemId, catalog);
        },
        switchSectionTest: switchSection,
        joinMockGuild: () => {
            if (!currentUserId) { showNotification("Você precisa estar logado para entrar em uma guilda mock.", "warning"); return; }
            playerState.guildId = "mockGuild123";
            currentGuildData = {name: "Guilda dos Mocks", leaderId: "mockLeader"}; // currentGuildData é local de game-guild.js, precisa ajustar
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
        startTestCombat: () => { if(typeof startCombat === 'function') startCombat(); else console.error('startCombat não está definida globalmente'); },
        saveGameState: () => savePlayerCharacterData()
    };

}); // Fim do DOMContentLoaded

