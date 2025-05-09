// game-guild.js: Lógica da seção Guilda

console.log("game-guild.js: Carregado.");

function initializeGuild() {
    // Lógica de inicialização para a seção de Guilda, se necessário
    console.log("Guild section initialized");
    // Configurar listeners para chat em tempo real, se o usuário estiver em uma guilda
    if (window.playerState && window.playerState.guildId && window.rtdb) {
        setupGuildChatListener(window.playerState.guildId);
        setupGuildMembersListener(window.playerState.guildId);
    }

    // Configurar event listener para o botão de enviar mensagem no chat da guilda
    const sendMsgBtn = document.getElementById("send-guild-message-btn");
    if (sendMsgBtn) {
        sendMsgBtn.addEventListener("click", sendGuildChatMessage);
    }

    // Configurar event listener para o botão de criar guilda (se existir)
    const createGuildBtn = document.getElementById("test-create-guild-btn"); // Assumindo que este é o ID
    if (createGuildBtn) {
        createGuildBtn.addEventListener("click", createGuild);
    }

    // Configurar event listener para o botão de sair da guilda (se existir)
    const leaveGuildBtn = document.getElementById("test-leave-guild-btn"); // Assumindo que este é o ID
    if (leaveGuildBtn) {
        leaveGuildBtn.addEventListener("click", leaveGuild);
    }
}

function populateGuildSection() {
    // Requer: uiElements, playerState, db, rtdb, auth (globais de game-main.js)
    if (!window.uiElements || !window.uiElements.guildSectionContent || !window.playerState || !window.db || !window.rtdb || !window.auth) {
        console.warn("populateGuildSection: Dependências globais não encontradas ou estado do jogador inválido.");
        return;
    }

    const guildContent = window.uiElements.guildSectionContent;
    guildContent.innerHTML = ""; // Limpar conteúdo anterior

    if (window.playerState.guildId) {
        // O jogador está em uma guilda, exibir informações da guilda e chat
        guildContent.innerHTML = `
            <h4>Guild: <span id="guild-name">Carregando...</span></h4>
            <div id="guild-members-list"><strong>Membros Online:</strong> Carregando...</div>
            <div id="guild-chat-container">
                <div id="guild-chat-messages"></div>
                <input type="text" id="guild-chat-input" placeholder="Digite sua mensagem...">
                <button id="send-guild-message-btn" class="hexagonal-border small-btn">Enviar</button>
            </div>
            <button id="leave-guild-btn" class="action-btn hexagonal-border cancel-btn">Sair da Guilda</button>
        `;
        // Carregar nome da guilda
        window.db.collection("guilds").doc(window.playerState.guildId).get().then(doc => {
            if (doc.exists) {
                const guildData = doc.data();
                document.getElementById("guild-name").textContent = guildData.name;
                window.currentGuildData = guildData; // Armazenar dados da guilda globalmente para acesso fácil
            } else {
                console.error("Dados da guilda não encontrados!");
                document.getElementById("guild-name").textContent = "Erro ao carregar guilda";
            }
        }).catch(error => {
            console.error("Erro ao buscar dados da guilda:", error);
            document.getElementById("guild-name").textContent = "Erro ao carregar guilda";
        });

        setupGuildChatListener(window.playerState.guildId);
        setupGuildMembersListener(window.playerState.guildId);
        
        const leaveGuildBtn = document.getElementById("leave-guild-btn");
        if (leaveGuildBtn) {
            leaveGuildBtn.addEventListener("click", leaveGuild);
        }
        const sendMsgBtn = document.getElementById("send-guild-message-btn");
        if (sendMsgBtn) {
            sendMsgBtn.addEventListener("click", sendGuildChatMessage);
        }

    } else {
        // O jogador não está em uma guilda, exibir opções para criar ou juntar-se a uma guilda
        guildContent.innerHTML = `
            <p>Você não está em nenhuma guilda.</p>
            <button id="create-guild-btn" class="action-btn hexagonal-border">Criar Guilda (1000 Ouro)</button>
            <button id="join-guild-btn" class="action-btn hexagonal-border">Procurar Guildas</button> 
            <input type="text" id="guild-id-to-join" placeholder="Ou digite o ID da Guilda para entrar">
            <button id="join-specific-guild-btn" class="action-btn hexagonal-border">Entrar por ID</button>
        `;
        // TODO: Implementar a funcionalidade de procurar guildas e entrar por ID
        const createGuildBtn = document.getElementById("create-guild-btn");
        if (createGuildBtn) {
            createGuildBtn.addEventListener("click", createGuild);
        }
        const joinGuildBtn = document.getElementById("join-guild-btn");
        if (joinGuildBtn) {
            joinGuildBtn.addEventListener("click", () => window.showNotification("Funcionalidade de procurar guildas ainda não implementada.", "info"));
        }
        const joinSpecificGuildBtn = document.getElementById("join-specific-guild-btn");
        if (joinSpecificGuildBtn) {
            joinSpecificGuildBtn.addEventListener("click", () => {
                const guildIdToJoin = document.getElementById("guild-id-to-join").value;
                if (guildIdToJoin) {
                    joinGuild(guildIdToJoin);
                } else {
                    window.showNotification("Por favor, insira um ID de Guilda.", "warning");
                }
            });
        }
    }
    console.log("Seção Guilda atualizada.");
}

async function createGuild() {
    if (!window.currentUserId || !window.playerState || !window.db) return;

    if (window.playerState.guildId) {
        window.showNotification("Você já está em uma guilda.", "warning");
        return;
    }

    if (window.playerState.gold < 1000) {
        window.showNotification("Ouro insuficiente para criar uma guilda (requer 1000).", "error");
        return;
    }

    const guildName = prompt("Digite o nome da sua nova guilda:");
    if (!guildName) {
        window.showNotification("Criação de guilda cancelada.", "info");
        return;
    }

    try {
        window.playerState.gold -= 1000;
        const guildRef = await window.db.collection("guilds").add({
            name: guildName,
            leaderId: window.currentUserId,
            leaderName: window.playerState.name,
            members: {
                [window.currentUserId]: { name: window.playerState.name, class: window.playerState.class, level: window.playerState.level }
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        window.playerState.guildId = guildRef.id;
        await window.db.collection("players").doc(window.currentUserId).collection("characters").doc(window.selectedCharacterId).update({
            guildId: guildRef.id
        });
        window.showNotification(`Guilda "${guildName}" criada com sucesso!`, "success");
        populateGuildSection(); // Atualiza a UI da guilda
        if (typeof window.updateUI === 'function') window.updateUI(); // Atualiza a UI geral (ouro)
        if (typeof window.savePlayerCharacterData === 'function') window.savePlayerCharacterData();
    } catch (error) {
        console.error("Erro ao criar guilda:", error);
        window.showNotification("Erro ao criar guilda. Tente novamente.", "error");
        window.playerState.gold += 1000; // Reembolsa o ouro em caso de falha
    }
}

async function joinGuild(guildId) {
    if (!window.currentUserId || !window.playerState || !window.db) return;

    if (window.playerState.guildId) {
        window.showNotification("Você já está em uma guilda. Saia primeiro para entrar em outra.", "warning");
        return;
    }

    if (!guildId) {
        window.showNotification("ID da Guilda inválido.", "error");
        return;
    }

    try {
        const guildDocRef = window.db.collection("guilds").doc(guildId);
        const guildDoc = await guildDocRef.get();

        if (!guildDoc.exists) {
            window.showNotification("Guilda não encontrada.", "error");
            return;
        }

        // Adicionar jogador à guilda
        await guildDocRef.update({
            [`members.${window.currentUserId}`]: { name: window.playerState.name, class: window.playerState.class, level: window.playerState.level }
        });

        // Atualizar estado do jogador
        window.playerState.guildId = guildId;
        await window.db.collection("players").doc(window.currentUserId).collection("characters").doc(window.selectedCharacterId).update({
            guildId: guildId
        });

        window.showNotification(`Você entrou na guilda "${guildDoc.data().name}"!`, "success");
        populateGuildSection(); // Atualiza a UI da guilda
        if (typeof window.updateUI === 'function') window.updateUI();
        if (typeof window.savePlayerCharacterData === 'function') window.savePlayerCharacterData();

    } catch (error) {
        console.error("Erro ao entrar na guilda:", error);
        window.showNotification("Erro ao entrar na guilda. Tente novamente.", "error");
    }
}

async function leaveGuild() {
    if (!window.currentUserId || !window.playerState || !window.playerState.guildId || !window.db) return;

    const confirmLeave = confirm("Você tem certeza que deseja sair da guilda?");
    if (!confirmLeave) return;

    try {
        const guildDocRef = window.db.collection("guilds").doc(window.playerState.guildId);
        const guildDoc = await guildDocRef.get();

        if (guildDoc.exists) {
            const guildData = guildDoc.data();
            // Se o líder sair, a guilda pode ser dissolvida ou a liderança transferida (lógica a ser definida)
            if (guildData.leaderId === window.currentUserId) {
                // Lógica para dissolver guilda ou transferir liderança
                // Por enquanto, vamos apenas remover o jogador e deixar a guilda sem líder se for o caso
                // ou dissolver se for o único membro.
                if (Object.keys(guildData.members).length <= 1) {
                    await guildDocRef.delete();
                    window.showNotification("Guilda dissolvida pois você era o último membro.", "info");
                } else {
                    // Idealmente, transferir liderança aqui. Por enquanto, apenas remove.
                    await guildDocRef.update({
                        [`members.${window.currentUserId}`]: firebase.firestore.FieldValue.delete()
                        // Opcional: definir leaderId como null ou para outro membro
                    });
                    window.showNotification("Você saiu da guilda. A liderança pode precisar ser transferida.", "warning");
                }
            } else {
                // Apenas remove o membro
                await guildDocRef.update({
                    [`members.${window.currentUserId}`]: firebase.firestore.FieldValue.delete()
                });
                window.showNotification("Você saiu da guilda.", "success");
            }
        }

        // Atualizar estado do jogador
        const oldGuildId = window.playerState.guildId;
        window.playerState.guildId = null;
        window.currentGuildData = null;
        await window.db.collection("players").doc(window.currentUserId).collection("characters").doc(window.selectedCharacterId).update({
            guildId: null
        });

        // Parar de ouvir o chat da guilda antiga e status dos membros
        if (guildChatUnsubscribe) guildChatUnsubscribe();
        if (guildMembersUnsubscribe) guildMembersUnsubscribe();
        if (window.rtdb) {
             window.rtdb.ref(`guilds/${oldGuildId}/onlineStatus/${window.currentUserId}`).remove();
        }

        populateGuildSection(); // Atualiza a UI da guilda
        if (typeof window.updateUI === 'function') window.updateUI();
        if (typeof window.savePlayerCharacterData === 'function') window.savePlayerCharacterData();

    } catch (error) {
        console.error("Erro ao sair da guilda:", error);
        window.showNotification("Erro ao sair da guilda. Tente novamente.", "error");
    }
}

function setupGuildChatListener(guildId) {
    if (!window.rtdb || !guildId) return;
    const chatRef = window.rtdb.ref(`guildChats/${guildId}`);
    const messagesContainer = document.getElementById("guild-chat-messages");

    if (guildChatUnsubscribe) guildChatUnsubscribe(); // Remove listener anterior se houver

    guildChatUnsubscribe = chatRef.orderByChild("timestamp").limitToLast(50).on("child_added", (snapshot) => {
        if (messagesContainer) {
            const message = snapshot.val();
            const messageElement = document.createElement("div");
            messageElement.classList.add("chat-message");
            const timestamp = new Date(message.timestamp).toLocaleTimeString();
            messageElement.innerHTML = `<strong>${message.senderName || "Anônimo"}</strong> <span class="chat-timestamp">(${timestamp})</span>: ${message.text}`;
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll para a última mensagem
        }
    });
    console.log(`Ouvindo chat da guilda: ${guildId}`);
}

function sendGuildChatMessage() {
    if (!window.currentUserId || !window.playerState || !window.playerState.guildId || !window.rtdb) return;
    const chatInput = document.getElementById("guild-chat-input");
    if (!chatInput || !chatInput.value.trim()) return;

    const messageText = chatInput.value.trim();
    chatInput.value = ""; // Limpa o campo de entrada

    const chatRef = window.rtdb.ref(`guildChats/${window.playerState.guildId}`);
    chatRef.push({
        senderId: window.currentUserId,
        senderName: window.playerState.name,
        text: messageText,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log("Mensagem enviada para a guilda.");
    }).catch(error => {
        console.error("Erro ao enviar mensagem para a guilda:", error);
        window.showNotification("Erro ao enviar mensagem.", "error");
        chatInput.value = messageText; // Restaura o texto em caso de erro
    });
}

function setupGuildMembersListener(guildId) {
    if (!window.rtdb || !guildId) return;
    const membersOnlineRef = window.rtdb.ref(`guilds/${guildId}/onlineStatus`);
    const membersListElement = document.getElementById("guild-members-list");

    if (guildMembersUnsubscribe) guildMembersUnsubscribe();

    guildMembersUnsubscribe = membersOnlineRef.on("value", (snapshot) => {
        if (membersListElement) {
            const onlineMembers = snapshot.val();
            let onlineCount = 0;
            let membersHtml = "<strong>Membros Online:</strong> ";
            if (onlineMembers) {
                const memberNames = [];
                for (const userId in onlineMembers) {
                    if (onlineMembers[userId].online) {
                        memberNames.push(onlineMembers[userId].name || "Anônimo");
                        onlineCount++;
                    }
                }
                membersHtml += memberNames.join(", ") + ` (${onlineCount})`;
            } else {
                membersHtml += "Nenhum membro online.";
            }
            membersListElement.innerHTML = membersHtml;
        }
    });
    console.log(`Ouvindo status dos membros da guilda: ${guildId}`);

    // Marcar jogador como online
    const currentUserStatusRef = window.rtdb.ref(`guilds/${guildId}/onlineStatus/${window.currentUserId}`);
    currentUserStatusRef.set({ name: window.playerState.name, online: true });
    currentUserStatusRef.onDisconnect().remove(); // Remover ao desconectar
}

// Expor funções se necessário
window.initializeGuild = initializeGuild;
window.populateGuildSection = populateGuildSection;
window.createGuild = createGuild;
window.joinGuild = joinGuild;
window.leaveGuild = leaveGuild;
window.sendGuildChatMessage = sendGuildChatMessage;

// Chamar a inicialização quando o DOM estiver pronto
// Isso será chamado pelo game-main.js quando a seção for ativada ou no carregamento inicial
// document.addEventListener("DOMContentLoaded", initializeGuild);

