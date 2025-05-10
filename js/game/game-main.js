// game-main.js: Lógica central, inicialização, e funções de utilidade

// Variáveis globais que podem precisar ser acessadas por outros módulos.
let db, rtdb, auth, currentUserId, authUnsubscribe, playerCharacterUnsubscribe;
let guildChatUnsubscribe, guildMembersUnsubscribe;
let selectedCharacterId = null;

let uiElements = {};
let playerState = {};
let WEAPON_CATALOG_DATA = [];
let ARMOR_CATALOG_DATA = [];
let MONSTER_CATALOG_DATA = [];
// combatState será definido e gerenciado em game-dungeon.js, mas pode ser referenciado aqui se necessário.

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
    mainContent: document.getElementById("main-content"),
    geralSection: document.getElementById("geral-section"),
    armeiroSection: document.getElementById("armeiro-section"),
    armadurasSection: document.getElementById("armaduras-section"),
    guildSection: document.getElementById("guild-section"),
    inventarioSection: document.getElementById("inventario-section"),
    calaboucoSection: document.getElementById("calabouco-section"),
    // Elementos específicos das seções (garantir que existam no HTML)
    geralStatusCompleto: document.getElementById("geral-status-completo"),
    geralEquipamentosAtivos: document.getElementById(
      "geral-equipamentos-ativos"
    ),
    descansarBtn: document.getElementById("descansar-btn"),
    inventoryGrid: document.getElementById("inventory-grid"),
    inventoryGoldDisplay: document.getElementById("inventory-gold-display"),
    armeiroShopContent: document.getElementById("armeiro-shop-content"),
    armadurasShopContent: document.getElementById("armaduras-shop-content"),
    guildSectionContent: document.getElementById("guild-section-content"), // Conteúdo principal da guilda
    dungeonSectionContent: document.getElementById("calabouco-section-content"), // Conteúdo principal do calabouço
    notificationsContainer: document.getElementById("notifications-container"),
    actionButtons: document.querySelectorAll(".action-btn[data-section]"),
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
    attributes: {
      strength: 10,
      agility: 8,
      intelligence: 5,
      vitality: 12,
      defense: 0,
    }, // Adicionado defense
    inventory: new Array(20).fill(null),
    equipment: {
      weapon: null,
      helmet: null,
      chest: null,
      gloves: null,
      boots: null,
    },
    activeSection: "geral",
    guildId: null,
    spritePath: "./assets/sprites/placeholder.png",
    skills: [
      {
        id: "s001",
        name: "Golpe Poderoso",
        cost: 10,
        type: "physical",
        power: 1.5,
        target: "enemy",
        class: ["Guerreiro", "Cavaleiro"],
      },
      {
        id: "s002",
        name: "Bola de Fogo",
        cost: 15,
        type: "magical",
        power: 1.8,
        target: "enemy",
        class: ["Mago"],
      },
      {
        id: "s003",
        name: "Flecha Perfurante",
        cost: 8,
        type: "physical",
        power: 1.3,
        target: "enemy",
        class: ["Arqueiro"],
      },
      {
        id: "s004",
        name: "Ataque Furtivo",
        cost: 12,
        type: "physical",
        power: 1.6,
        target: "enemy",
        class: ["Assassino"],
      },
      {
        id: "s005",
        name: "Curar Leve",
        cost: 20,
        type: "healing",
        power: 0.3,
        target: "self",
        class: ["Todas"],
      },
    ],
  };

  // Catálogos de Itens e Monstros (serão populados por Firebase ou Mocks)
  WEAPON_CATALOG_DATA = [
    {
      id: "w_g_01",
      name: "Espada Curta de Ferro",
      type: "weapon",
      classRestriction: ["Guerreiro", "Cavaleiro"],
      levelRequirement: 1,
      cost: 50,
      stats: { attack: 5 },
      sprite: "sword_iron.png",
    },
    {
      id: "w_m_01",
      name: "Cajado de Aprendiz",
      type: "weapon",
      classRestriction: ["Mago", "Necromancer"],
      levelRequirement: 1,
      cost: 40,
      stats: { magicAttack: 6, intelligence: 1 },
      sprite: "staff_apprentice.png",
    },
  ];
  ARMOR_CATALOG_DATA = [
    {
      id: "h_all_01",
      name: "Capacete de Couro Simples",
      type: "helmet",
      classRestriction: ["Todas"],
      levelRequirement: 1,
      cost: 30,
      stats: { defense: 2 },
      sprite: "helmet_leather.png",
    },
    {
      id: "c_all_01",
      name: "Túnica de Pano Reforçado",
      type: "chest",
      classRestriction: ["Todas"],
      levelRequirement: 1,
      cost: 50,
      stats: { defense: 4 },
      sprite: "chest_cloth_reinforced.png",
    },
  ];
  MONSTER_CATALOG_DATA = [
    {
      id: "m001",
      name: "Goblin Fraco",
      level: 1,
      hp: 30,
      attack: 5,
      defense: 2,
      expReward: 10,
      goldReward: 5,
      sprite: "goblin_weak.png",
      skills: [{ name: "Arranhão", power: 1.1 }],
    },
    {
      id: "m002",
      name: "Lobo Cinzento",
      level: 3,
      hp: 50,
      attack: 8,
      defense: 3,
      expReward: 25,
      goldReward: 10,
      sprite: "wolf_grey.png",
      skills: [{ name: "Mordida Feroz", power: 1.3 }],
    },
  ];

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

  if (
    typeof firebase !== "undefined" &&
    typeof firebaseConfig !== "undefined"
  ) {
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
      showNotification(
        "Erro crítico: Falha ao conectar com Firebase.",
        "error"
      );
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
              get: () =>
                Promise.resolve({
                  exists: true,
                  data: () => {
                    if (
                      collectionName === "players" &&
                      docId === "mockUserId" &&
                      subCollectionName === "characters" &&
                      subDocId === "mockCharId123"
                    ) {
                      return {
                        name: "Jogador Mock",
                        class: "Guerreiro",
                        level: 5,
                        hp: 150,
                        maxHp: 150,
                        mp: 70,
                        maxMp: 70,
                        exp: 10,
                        maxExp: 200,
                        gold: 1000,
                        attributes: {
                          strength: 15,
                          agility: 10,
                          intelligence: 8,
                          vitality: 12,
                          defense: 2,
                        },
                        spritePath: "./assets/sprites/warrior.png",
                        inventory: [],
                        equipment: {
                          weapon: null,
                          helmet: null,
                          chest: null,
                          gloves: null,
                          boots: null,
                        },
                        skills: playerState.skills,
                        guildId: null,
                        activeSection: "geral",
                      };
                    }
                    return {};
                  },
                  id: subDocId || "mockCharId123",
                }),
              set: (data, options) =>
                Promise.resolve(
                  console.log(
                    `Mock DB Set: ${collectionName}/${docId}/${subCollectionName}/${subDocId}`,
                    data,
                    options
                  )
                ),
              update: (data) =>
                Promise.resolve(
                  console.log(
                    `Mock DB Update: ${collectionName}/${docId}/${subCollectionName}/${subDocId}`,
                    data
                  )
                ),
              onSnapshot: (callback) => {
                if (
                  collectionName === "players" &&
                  docId === "mockUserId" &&
                  subCollectionName === "characters" &&
                  (subDocId === "mockCharId123" ||
                    subDocId === selectedCharacterId)
                ) {
                  setTimeout(
                    () =>
                      callback({
                        exists: true,
                        data: () => ({
                          name: "Jogador Mock",
                          class: "Guerreiro",
                          level: 5,
                          hp: 150,
                          maxHp: 150,
                          mp: 70,
                          maxMp: 70,
                          exp: 10,
                          maxExp: 200,
                          gold: 1000,
                          attributes: {
                            strength: 15,
                            agility: 10,
                            intelligence: 8,
                            vitality: 12,
                            defense: 2,
                          },
                          spritePath: "./assets/sprites/warrior.png",
                          inventory: [],
                          equipment: {
                            weapon: null,
                            helmet: null,
                            chest: null,
                            gloves: null,
                            boots: null,
                          },
                          skills: playerState.skills,
                          guildId: null,
                          activeSection: "geral",
                        }),
                        id: subDocId || "mockCharId123",
                      }),
                    50
                  );
                }
                return () => {
                  console.log("Mock onSnapshot unsubscribed");
                };
              },
            }),
          }),
          get: () => Promise.resolve({ exists: false, data: () => ({}) }),
          set: (data, options) =>
            Promise.resolve(
              console.log(
                `Mock DB Set: ${collectionName}/${docId}`,
                data,
                options
              )
            ),
          update: (data) =>
            Promise.resolve(
              console.log(`Mock DB Update: ${collectionName}/${docId}`, data)
            ),
          onSnapshot: (callback) => {
            if (collectionName === "guilds" && docId === "mockGuild123") {
              setTimeout(
                () =>
                  callback({
                    exists: true,
                    data: () => ({
                      name: "Guilda dos Mocks",
                      leaderId: "mockLeader",
                      members: { mockUserId: { name: "Jogador Mock" } },
                    }),
                  }),
                50
              );
            }
            return () => {
              console.log("Mock onSnapshot unsubscribed");
            };
          },
        }),
        add: (data) =>
          Promise.resolve({
            id: "mockGuildId",
            ...console.log(`Mock DB Add: ${collectionName}`, data),
          }),
      }),
    };
    rtdb = {
      ref: (path) => ({
        on: (eventType, callback) => {
          if (path.includes("guildChats"))
            console.log(`Mock RTDB Listener (on ${eventType}) for ${path}`);
          if (path.includes("onlineStatus"))
            console.log(`Mock RTDB Listener (on ${eventType}) for ${path}`);
          if (eventType === "child_added" && path.includes("guildChats")) {
            setTimeout(
              () =>
                callback({
                  val: () => ({
                    senderName: "MockUser",
                    text: "Olá do Mock!",
                    timestamp: Date.now(),
                  }),
                }),
              200
            );
          }
          if (eventType === "value" && path.includes("onlineStatus")) {
            setTimeout(
              () =>
                callback({
                  val: () => ({
                    mockUser1: { name: "Membro Mock 1", online: true },
                    mockUser2: { name: "Membro Mock 2", online: false },
                  }),
                }),
              200
            );
          }
          return () => {
            console.log(`Mock RTDB Listener (off) for ${path}`);
          };
        },
        off: () => {
          console.log(`Mock RTDB Listener (off) for ${path}`);
        },
        push: (data) => {
          console.log(`Mock RTDB Push to ${path}:`, data);
          return Promise.resolve({ key: "mockMessageKey" });
        },
        set: (data) => {
          console.log(`Mock RTDB Set to ${path}:`, data);
          return Promise.resolve();
        },
        remove: () => {
          console.log(`Mock RTDB Remove from ${path}`);
          return Promise.resolve();
        },
        onDisconnect: () => ({
          remove: () =>
            Promise.resolve(console.log("Mock RTDB onDisconnect remove")),
          set: (data) =>
            Promise.resolve(console.log("Mock RTDB onDisconnect set", data)),
          update: (data) =>
            Promise.resolve(console.log("Mock RTDB onDisconnect update", data)),
        }),
      }),
    };
    auth = {
      currentUser: { uid: "mockUserId", email: "mock@example.com" },
      onAuthStateChanged: (callback) => {
        const mockUser = { uid: "mockUserId", email: "mock@example.com" };
        currentUserId = mockUser.uid;
        window.currentUserId = currentUserId;
        setTimeout(() => callback(mockUser), 100);
        return () => {
          console.log("Mock onAuthStateChanged unsubscribed");
        };
      },
    };
    if (!selectedCharacterId) {
      selectedCharacterId = "mockCharId123";
      window.selectedCharacterId = selectedCharacterId;
    }
    console.log("Firebase Mock totalmente inicializado.");
  }

  function setDefaultSpriteForClass() {
    if (!playerState) return;
    switch (playerState.class) {
      case "Guerreiro":
        playerState.spritePath = "./assets/sprites/warrior.png";
        break;
      case "Cavaleiro":
        playerState.spritePath = "./assets/sprites/knight.png";
        break;
      case "Assassino":
        playerState.spritePath = "./assets/sprites/assassin.png";
        break;
      case "Mago":
        playerState.spritePath = "./assets/sprites/mage.png";
        break;
      case "Arqueiro":
        playerState.spritePath = "./assets/sprites/archer.png";
        break;
      case "Necromancer":
        playerState.spritePath = "./assets/sprites/necromancer.png";
        break;
      default:
        playerState.spritePath = "./assets/sprites/placeholder.png";
    }
  }

  async function savePlayerCharacterData() {
    if (!currentUserId || !selectedCharacterId || !db) {
      console.warn(
        "Não é possível salvar: UID do usuário ou ID do personagem não definidos, ou DB não inicializado."
      );
      return;
    }
    try {
      const { id, ...dataToSave } = playerState;
      await db
        .collection("players")
        .doc(currentUserId)
        .collection("characters")
        .doc(selectedCharacterId)
        .set(dataToSave, { merge: true });
      console.log(
        "Dados do personagem salvos no Firebase:",
        selectedCharacterId
      );
    } catch (error) {
      console.error("Erro ao salvar dados do personagem:", error);
      showNotification(
        "Erro ao salvar seus dados. Verifique sua conexão.",
        "error"
      );
    }
  }

  function updateUI() {
    if (!playerState || !playerState.id) {
      console.warn(
        "updateUI chamado sem dados de personagem carregados ou ID de personagem."
      );
      return;
    }
    if (uiElements.playerName)
      uiElements.playerName.textContent = playerState.name;
    if (uiElements.playerClass)
      uiElements.playerClass.textContent = playerState.class;
    if (uiElements.playerLevel)
      uiElements.playerLevel.textContent = playerState.level;
    if (uiElements.playerGold)
      uiElements.playerGold.textContent = playerState.gold;
    if (uiElements.hpBar && uiElements.hpValue) {
      const hpPercent =
        playerState.maxHp > 0 ? (playerState.hp / playerState.maxHp) * 100 : 0;
      uiElements.hpBar.style.width = `${hpPercent}%`;
      uiElements.hpValue.textContent = `${playerState.hp}/${playerState.maxHp}`;
    }
    if (uiElements.mpBar && uiElements.mpValue) {
      const mpPercent =
        playerState.maxMp > 0 ? (playerState.mp / playerState.maxMp) * 100 : 0;
      uiElements.mpBar.style.width = `${mpPercent}%`;
      uiElements.mpValue.textContent = `${playerState.mp}/${playerState.maxMp}`;
    }
    if (uiElements.expBar && uiElements.expValue) {
      const expPercent =
        playerState.maxExp > 0
          ? (playerState.exp / playerState.maxExp) * 100
          : 0;
      uiElements.expBar.style.width = `${expPercent}%`;
      uiElements.expValue.textContent = `${playerState.exp}/${playerState.maxExp}`;
    }
    if (playerState.attributes) {
      if (uiElements.attrStrength)
        uiElements.attrStrength.textContent = playerState.attributes.strength;
      if (uiElements.attrAgility)
        uiElements.attrAgility.textContent = playerState.attributes.agility;
      if (uiElements.attrIntelligence)
        uiElements.attrIntelligence.textContent =
          playerState.attributes.intelligence;
      if (uiElements.attrVitality)
        uiElements.attrVitality.textContent = playerState.attributes.vitality;
    }
    if (uiElements.characterSprite && playerState.spritePath) {
      uiElements.characterSprite.src = playerState.spritePath;
      uiElements.characterSprite.alt = `${playerState.name} - ${playerState.class}`;
    }

    // Chamar funções de atualização específicas da seção ativa
    if (
      playerState.activeSection === "geral" &&
      typeof window.updateGeralSection === "function"
    )
      window.updateGeralSection();
    if (
      playerState.activeSection === "inventario" &&
      typeof window.renderInventory === "function"
    )
      window.renderInventory();
    if (
      playerState.activeSection === "armeiro" &&
      typeof window.populateArmeiroShop === "function"
    )
      window.populateArmeiroShop();
    if (
      playerState.activeSection === "armaduras" &&
      typeof window.populateArmorShop === "function"
    )
      window.populateArmorShop();
    if (
      playerState.activeSection === "guild" &&
      typeof window.populateGuildSection === "function"
    )
      window.populateGuildSection();
    if (playerState.activeSection === "calabouco") {
      // A lógica de combate no game-dungeon.js cuidará de renderizar sua própria UI
      // Mas podemos chamar uma função de preparação se não estiver em combate ativo
      if (
        window.combatState &&
        !window.combatState.active &&
        typeof window.prepareDungeonScreen === "function"
      ) {
        window.prepareDungeonScreen();
      } else if (
        window.combatState &&
        window.combatState.active &&
        typeof window.renderCombatUI === "function"
      ) {
        window.renderCombatUI(); // Garante que a UI de combate seja atualizada se necessário
      }
    }
  }

  function switchSection(sectionId) {
    console.log(`Tentando mudar para a seção: ${sectionId}`);
    document.querySelectorAll(".section-panel").forEach((panel) => {
      panel.classList.remove("active-section");
    });
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.add("active-section");
      playerState.activeSection = sectionId;
      console.log(`Seção ativa alterada para: ${playerState.activeSection}`);
      updateUI(); // Atualiza a UI para refletir a nova seção e seus conteúdos
      if (typeof savePlayerCharacterData === "function")
        savePlayerCharacterData(); // Salva a seção ativa
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
      uiElements.actionButtons.forEach((button) => {
        button.removeEventListener("click", handleActionButtonClick); // Evita múltiplos listeners
        button.addEventListener("click", handleActionButtonClick);
      });
      console.log("Botões de ação configurados.");
    }
    // O botão de descanso é configurado em game-general.js agora, pois sua lógica está lá
    // Os botões de loja são configurados dentro de populateShop
    // Os botões de guilda são configurados em game-guild.js
    // Os botões de calabouço são configurados em game-dungeon.js
  }

  async function loadPlayerCharacterData() {
    // Tenta carregar dados de personagem mock se não houver usuário autenticado
    if (!currentUserId || !selectedCharacterId || !db) {
        console.warn("Não é possível carregar dados: UID do usuário ou ID do personagem não definidos, ou DB não inicializado.");

        if (selectedCharacterId === "mockCharId123" && db && db.collection) {
            try {
                const mockCharDocRef = db
                    .collection("players")
                    .doc("mockUserId")
                    .collection("characters")
                    .doc("mockCharId123");

                const doc = await mockCharDocRef.get();
                if (doc.exists) {
                    const data = doc.data();
                    if (!doc.id) {
                        console.error("ID do personagem mock não encontrado.");
                        return;
                    }
                    playerState = {
                        ...playerState,
                        ...data,
                        id: doc.id
                    };
                    setDefaultSpriteForClass();
                    switchSection(playerState.activeSection || "geral"); // updateUI chamado dentro de switchSection
                    console.log("Dados mock do personagem carregados.");
                    return;
                } else {
                    console.warn("Personagem mock não encontrado.");
                }
            } catch (e) {
                console.error("Erro ao carregar personagem mock:", e);
            }
        }

        if (auth && !auth.currentUser && selectedCharacterId !== "mockCharId123") {
            showNotification("Sessão expirada ou não autenticada. Por favor, faça login novamente.", "error");
        }
        return;
    }

    // Carrega dados reais do Firebase
    try {
        if (playerCharacterUnsubscribe) playerCharacterUnsubscribe();

        const characterDocRef = db
            .collection("players")
            .doc(currentUserId)
            .collection("characters")
            .doc(selectedCharacterId);

        playerCharacterUnsubscribe = characterDocRef.onSnapshot(doc => {
            if (doc.exists) {
                console.log("Dados do personagem recebidos do Firebase:", doc.data());
                playerState = {
                    ...playerState,
                    ...doc.data(),
                    id: doc.id
                };
                setDefaultSpriteForClass();
                updateUI();
            } else {
                console.error("Personagem não encontrado no Firebase.");
                showNotification("Personagem não encontrado. Verifique a seleção ou crie um novo.", "error");
            }
        }, error => {
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
      authUnsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          currentUserId = user.uid;
          window.currentUserId = currentUserId;
          console.log("Usuário autenticado:", currentUserId);
          if (selectedCharacterId) {
            console.log("ID do personagem selecionado:", selectedCharacterId);
            loadPlayerCharacterData();
          } else {
            console.error("Nenhum ID de personagem selecionado.");
            showNotification(
              "Nenhum personagem selecionado. Redirecionando para seleção...",
              "error"
            );
            // window.location.href = "char-select.html"; // Exemplo de redirecionamento
          }
        } else {
          currentUserId = null;
          window.currentUserId = null;
          console.log(
            "Nenhum usuário autenticado. Usando mock se aplicável..."
          );
          if (selectedCharacterId === "mockCharId123") {
            loadPlayerCharacterData(); // Tenta carregar mock
          } else {
            showNotification(
              "Por favor, faça login para continuar.",
              "warning"
            );
            // window.location.href = "login.html"; // Exemplo de redirecionamento
          }
        }
      });
    } else {
      console.error("Serviço de autenticação do Firebase não está disponível.");
      showNotification("Falha na autenticação. Tente recarregar.", "error");
    }
    setupActionButtons();
    // A seção inicial será definida por loadPlayerCharacterData ou pelo mock.
    // switchSection(playerState.activeSection || "geral");
    console.log("Jogo inicializado. Aguardando dados do personagem...");

    // Inicializar módulos específicos que precisam de setup no DOMContentLoaded
    if (typeof window.initializeGuild === "function") window.initializeGuild();
    if (typeof window.initializeDungeon === "function")
      window.initializeDungeon();
    // Outros módulos podem ter suas próprias inicializações se necessário
  }

  function populateShop(shopContentElement, catalog, title) {
    if (!shopContentElement || !playerState.id) {
      console.warn(
        "populateShop: Elemento da loja ou ID do jogador não encontrado."
      );
      return;
    }
    let shopHtml = `<h3>${title}</h3><div class="shop-items-grid">`;
    catalog.forEach((item) => {
      if (
        (item.classRestriction.includes(playerState.class) ||
          item.classRestriction.includes("Todas")) &&
        playerState.level >= item.levelRequirement
      ) {
        shopHtml += `
                    <div class="shop-item" data-item-id="${item.id}">
                        <img src="./assets/sprites/items/${
                          item.sprite || "default_item.png"
                        }" alt="${item.name}" class="item-sprite">
                        <p><strong>${item.name}</strong></p>
                        <p>Custo: ${item.cost} Ouro</p>
                        <div class="item-stats">
                            ${Object.entries(item.stats)
                              .map(
                                ([stat, value]) =>
                                  `<p>${
                                    stat.charAt(0).toUpperCase() + stat.slice(1)
                                  }: ${value}</p>`
                              )
                              .join("")}
                        </div>
                        <button class="buy-btn hexagonal-border small-btn" data-item-id="${
                          item.id
                        }" data-catalog-type="${
          catalog === WEAPON_CATALOG_DATA ? "weapon" : "armor"
        }">Comprar</button>
                    </div>
                `;
      }
    });
    shopHtml += "</div>";
    shopContentElement.innerHTML = shopHtml;
    shopContentElement.querySelectorAll(".buy-btn").forEach((button) => {
      button.removeEventListener("click", handleBuyItemClick); // Evita múltiplos listeners
      button.addEventListener("click", handleBuyItemClick);
    });
  }

  function handleBuyItemClick(event) {
    const itemId = event.target.dataset.itemId;
    const catalogType = event.target.dataset.catalogType;
    const catalog =
      catalogType === "weapon" ? WEAPON_CATALOG_DATA : ARMOR_CATALOG_DATA;
    buyItemFromShop(itemId, catalog);
  }

  function buyItemFromShop(itemId, catalog) {
    const item = catalog.find((i) => i.id === itemId);
    if (!item) {
      showNotification("Item não encontrado na loja.", "error");
      return;
    }
    if (playerState.gold < item.cost) {
      showNotification("Ouro insuficiente!", "error");
      return;
    }
    const emptySlotIndex = playerState.inventory.findIndex(
      (slot) => slot === null
    );
    if (emptySlotIndex === -1) {
      showNotification("Inventário cheio!", "error");
      return;
    }
    playerState.gold -= item.cost;
    playerState.inventory[emptySlotIndex] = { ...item }; // Adiciona uma cópia do item
    showNotification(
      `${item.name} comprado e adicionado ao inventário!`,
      "success"
    );
    updateUI();
    if (typeof savePlayerCharacterData === "function")
      savePlayerCharacterData();
  }

  initializeGame();

  // Expor funções e variáveis globais para outros módulos
  window.showNotification = showNotification;
  window.savePlayerCharacterData = savePlayerCharacterData;
  window.updateUI = updateUI;
  window.switchSection = switchSection;
  window.loadPlayerCharacterData = loadPlayerCharacterData;
  window.initializeGame = initializeGame;
  window.populateShop = populateShop;
  window.buyItemFromShop = buyItemFromShop;
  window.setDefaultSpriteForClass = setDefaultSpriteForClass;

  window.playerState = playerState;
  window.uiElements = uiElements;
  window.db = db;
  window.rtdb = rtdb;
  window.auth = auth;
  window.WEAPON_CATALOG_DATA = WEAPON_CATALOG_DATA;
  window.ARMOR_CATALOG_DATA = ARMOR_CATALOG_DATA;
  window.MONSTER_CATALOG_DATA = MONSTER_CATALOG_DATA;
  // window.combatState é gerenciado em game-dungeon.js mas exposto globalmente lá.
});
