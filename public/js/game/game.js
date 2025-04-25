// Adicione no topo do arquivo
import { InventorySystem } from '/public/js/inventory.js';

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

            this.inventory = null;

            this.init();
            this.setupReturnButton();
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.redirectToCharacterSelection();
        }
    }

    async init() {
        try {
            await this.loadCharacter();
            this.setupEventListeners();
            this.setupHomePanel(); // Nova linha adicionada
            this.initializeInventory();
        } catch (error) {
            console.error('Erro na inicialização do jogo:', error);
            this.redirectToCharacterSelection();
        }
    }

    setupHomePanel() {
        this.homePanel = document.getElementById('homePanel');
        document.querySelector('.nav-btn.home').addEventListener('click', () => this.toggleHomePanel(true));
        document.getElementById('homeCloseBtn').addEventListener('click', () => this.toggleHomePanel(false));
        
        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAttributeIncrease(e));
        });

        document.getElementById('saveAttributes').addEventListener('click', () => this.saveAttributes());
    }

    toggleHomePanel(show) {
        if (show) {
            this.loadHomePanelData();
            this.homePanel.style.display = 'block';
        } else {
            this.homePanel.style.display = 'none';
        }
    }

    async loadHomePanelData() {
        try {
            const user = auth.currentUser;
            const doc = await db.collection('players').doc(user.uid)
                .collection('characters').doc(this.selectedCharacterId).get();

            if (doc.exists) {
                const data = doc.data();
                
                document.getElementById('homeCharacterName').textContent = data.name;
                document.getElementById('homeCharacterSprite').src = data.spritePath;
                document.getElementById('characterLevel').textContent = data.level || 1;
                
                document.getElementById('strValue').textContent = data.attributes?.str || 0;
                document.getElementById('intValue').textContent = data.attributes?.int || 0;
                document.getElementById('spdValue').textContent = data.attributes?.spd || 0;
                
                const points = data.availablePoints || 0;
                document.getElementById('pointsRemaining').textContent = 
                    `${points} ponto${points !== 1 ? 's' : ''} disponível${points !== 1 ? 's' : ''}`;

                this.updateQuickInventory(data.inventory);
            }
        } catch (error) {
            console.error('Erro ao carregar dados da casa:', error);
        }
    }

    updateQuickInventory(inventory) {
        const quickSlots = document.getElementById('quickSlots');
        quickSlots.innerHTML = '';

        const itemsToShow = inventory?.items?.slice(0, 4) || [];
        itemsToShow.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'quick-slot';
            slot.innerHTML = `
                <img src="${item.icon}" alt="${item.name}">
                <span class="item-count">${item.quantity || 1}</span>
            `;
            quickSlots.appendChild(slot);
        });
    }

    handleAttributeIncrease(e) {
        const pointsElement = document.getElementById('pointsRemaining');
        const currentPoints = parseInt(pointsElement.textContent) || 0;
        
        if (currentPoints > 0) {
            const attr = e.target.dataset.attr;
            const valueElement = document.getElementById(`${attr}Value`);
            valueElement.textContent = parseInt(valueElement.textContent) + 1;
            pointsElement.textContent = `${currentPoints - 1} pontos disponíveis`;
        }
    }

    async saveAttributes() {
        try {
            const user = auth.currentUser;
            const newAttributes = {
                str: parseInt(document.getElementById('strValue').textContent),
                int: parseInt(document.getElementById('intValue').textContent),
                spd: parseInt(document.getElementById('spdValue').textContent)
            };

            const pointsUsed = this.characterData.availablePoints - 
                parseInt(document.getElementById('pointsRemaining').textContent);

            await db.collection('players').doc(user.uid)
                .collection('characters').doc(this.selectedCharacterId)
                .update({
                    attributes: newAttributes,
                    availablePoints: firebase.firestore.FieldValue.increment(-pointsUsed)
                });

            alert('Atributos salvos com sucesso!');
            this.loadCharacter();
        } catch (error) {
            console.error('Erro ao salvar atributos:', error);
            alert('Erro ao salvar atributos!');
        }
    }

    initializeInventory() {
        try {
            this.inventory = new InventorySystem(this.selectedCharacterId);
            console.log('Inventário inicializado:', this.inventory);
        } catch (error) {
            console.error('Erro ao iniciar inventário:', error);
            this.showErrorMessage('Falha ao carregar inventário');
        }
    }

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
            this.inventory = new InventorySystem(this.selectedCharacterId);
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

        if (action === 'inventory') {
            this.inventory?.toggleInventory(true);
            return;
        }

        console.log('Ação selecionada:', action);
    }

    redirectToCharacterSelection() {
        if (this.chat) {
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
