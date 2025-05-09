// game-guild.js: Lógica da seção Guilda

console.log("game-guild.js: Carregado.");

let currentGuildData = null; // Estado local do módulo para dados da guilda atual

function populateGuildSection() {
    // Requer: uiElements, playerState, auth, currentUserId (globais de game-main.js)
    // Requer: createGuild, joinGuild, sendGuildMessage, handleGuildChatKeyPress, leaveGuild (deste módulo)
    // Requer: listenToGuildData, listenToGuildChat, listenToGuildMembersOnlineStatus (deste módulo)
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
    // Requer: currentUserId, db, playerState, showNotification, savePlayerCharacterData, rtdb (globais de game-main.js)
    // Requer: firebase.firestore.FieldValue (global)
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
        if (typeof savePlayerCharacterData === "function") savePlayerCharacterData(); 
        if (rtdb) rtdb.ref(`guilds/${guildRef.id}/onlineStatus/${currentUserId}`).set({ name: playerState.name, online: true });

    } catch (error) {
        console.error("Erro ao criar guilda:", error);
        playerState.gold += creationCost; 
        showNotification("Erro ao criar guilda. Tente novamente.", "error");
    }
}

async function joinGuild(guildIdToJoin) {
    // Requer: currentUserId, db, playerState, showNotification, savePlayerCharacterData, rtdb (globais de game-main.js)
    // Requer: firebase.firestore.FieldValue (global)
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
        if (typeof savePlayerCharacterData === "function") savePlayerCharacterData();
        if (rtdb) rtdb.ref(`guilds/${guildIdToJoin}/onlineStatus/${currentUserId}`).set({ name: playerState.name, online: true });
    } catch (error) {
        console.error("Erro ao entrar na guilda:", error);
        showNotification("Erro ao entrar na guilda. Verifique o ID ou tente novamente.", "error");
    }
}

function listenToGuildData(guildId) {
    // Requer: db, playerState, showNotification, savePlayerCharacterData (globais de game-main.js)
    if (!db || !guildId) return;
    const guildDocRef = db.collection("guilds").doc(guildId);
    // Considerar armazenar e chamar o unsubscribe retornado por onSnapshot se necessário
    guildDocRef.onSnapshot(doc => {
        if (doc.exists) {
            currentGuildData = doc.data();
            const guildNameDisplayDynamic = document.getElementById("guild-name-display-dynamic");
            if (guildNameDisplayDynamic) guildNameDisplayDynamic.textContent = currentGuildData.name;
        } else {
            console.warn("Dados da guilda não encontrados ou você foi removido.");
            playerState.guildId = null;
            currentGuildData = null;
            populateGuildSection(); 
            if (typeof savePlayerCharacterData === "function") savePlayerCharacterData();
        }
    }, err => {
        console.error("Erro ao ouvir dados da guilda:", err);
        showNotification("Erro ao carregar dados da guilda.", "error");
    });
}

function listenToGuildChat(guildId) {
    // Requer: rtdb (global de game-main.js)
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
    // Requer: rtdb, playerState, currentUserId, showNotification (globais de game-main.js)
    // Requer: firebase.database.ServerValue (global)
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
    // Requer: rtdb, playerState, currentUserId, showNotification (globais de game-main.js)
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
    // Requer: playerState, currentUserId, db, rtdb, showNotification, savePlayerCharacterData (globais de game-main.js)
    // Requer: firebase.firestore.FieldValue (global)
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
        if (typeof savePlayerCharacterData === "function") savePlayerCharacterData();
    } catch (error) {
        console.error("Erro ao sair da guilda:", error);
        showNotification("Erro ao sair da guilda.", "error");
    }
}

// A função populateGuildSection será chamada por updateUI ou switchSection em game-main.js
// quando playerState.activeSection === "guild".

