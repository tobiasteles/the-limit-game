const auth = firebase.auth();
const db = firebase.firestore();

class Game {
    constructor() {
        try {
            this.selectedCharacterId = 
                localStorage.getItem('selectedCharacterId') ||
                sessionStorage.getItem('selectedCharacterId') ||
                new URLSearchParams(window.location.search).get('characterId');

            if (!this.selectedCharacterId) {
                throw new Error('ID do personagem não encontrado');
            }

            if (!firebase.apps.length) {
                throw new Error('Firebase não inicializado');
            }

            this.init();
            this.setupReturnButton(); // Novo método adicionado
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.redirectToCharacterSelection();
        }
    }

    async init() {
        try {
            await this.loadCharacter();
            this.setupEventListeners();
        } catch (error) {
            console.error('Erro na inicialização do jogo:', error);
            this.redirectToCharacterSelection();
        }
    }

    // Novo método para configurar o botão de retorno
    setupReturnButton() {
        const returnButton = document.getElementById('returnButton');
        if (returnButton) {
            returnButton.addEventListener('click', () => {
                this.redirectToCharacterSelection();
            });
        }
    }

    async loadCharacter() {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Usuário não autenticado');
            
            const docRef = db.collection('players').doc(user.uid)
                            .collection('characters').doc(this.selectedCharacterId);
            
            const doc = await docRef.get();
            
            if (!doc.exists) throw new Error('Personagem não existe');
            
            this.characterData = doc.data();
            this.updateUI();

        } catch (error) {
            console.error('Erro ao carregar personagem:', error);
            this.redirectToCharacterSelection();
        }
    }

    updateUI() {
        try {
            const nameElement = document.getElementById('characterName');
            const spriteElement = document.getElementById('characterSprite');
            const atkElement = document.getElementById('atkValue');
            const defElement = document.getElementById('defValue');

            if (!nameElement || !spriteElement || !atkElement || !defElement) {
                throw new Error('Elementos da UI não encontrados');
            }

            nameElement.textContent = this.characterData.name || 'Herói Sem Nome';
            atkElement.textContent = this.characterData.stats?.atk ?? 0;
            defElement.textContent = this.characterData.stats?.def ?? 0;
            
            if (this.characterData.spritePath) {
                spriteElement.src = this.characterData.spritePath;
                spriteElement.onerror = () => {
                    spriteElement.src = 'assets/default-character.png';
                };
            } else {
                spriteElement.src = 'assets/default-character.png';
            }

        } catch (error) {
            console.error('Erro ao atualizar UI:', error);
            this.showErrorMessage('Erro ao carregar interface');
        }
    }

    setupEventListeners() {
        try {
            const buttons = document.querySelectorAll('.nav-btn');
            if (!buttons.length) throw new Error('Botões não encontrados');
            
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.currentTarget.classList[1];
                    this.handleAction(action);
                });
            });
        } catch (error) {
            console.error('Erro ao configurar listeners:', error);
        }
    }

    handleAction(action) {
        const validActions = ['home', 'weapon', 'armor', 'guild', 'quests', 
                            'inventory', 'skills', 'dungeon', 'events'];
        
        if (!validActions.includes(action)) {
            console.warn('Ação inválida:', action);
            return;
        }
        
        console.log('Ação selecionada:', action);
    }

    redirectToCharacterSelection() {
        // Limpeza adicional se necessário
        if (this.chat) { // Mantido para caso volte a implementar o chat
            this.chat.destroy();
        }
        
        localStorage.removeItem('selectedCharacterId');
        sessionStorage.removeItem('selectedCharacterId');
        window.location.href = 'character-selection.html';
    }

    showErrorMessage(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'global-error';
        errorElement.textContent = message;
        document.body.prepend(errorElement);
        
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
}

auth.onAuthStateChanged(user => {
    try {
        if (user) {
            new Game();
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Erro na inicialização do auth:', error);
        window.location.href = 'index.html';
    }
});