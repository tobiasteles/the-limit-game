const auth = firebase.auth();
const db = firebase.firestore();

class GameInterface {
    constructor() {
        this.playerData = null;
        this.selectedCharacterId = localStorage.getItem('selectedCharacterId');
        
        this.init();
    }

    async init() {
        await this.loadCharacterData();
        this.renderCharacter();
        this.setupEventListeners();
    }

    async loadCharacterData() {
        if (!this.selectedCharacterId) {
            window.location.href = 'character-selection.html';
            return;
        }

        const user = auth.currentUser;
        const docRef = db.collection('players').doc(user.uid)
                         .collection('characters').doc(this.selectedCharacterId);
        
        const doc = await docRef.get();
        if (doc.exists) {
            this.playerData = doc.data();
        } else {
            alert('Personagem não encontrado!');
            window.location.href = 'character-selection.html';
        }
    }

    renderCharacter() {
        // Dados Básicos
        document.getElementById('playerName').textContent = this.playerData.name;
        document.getElementById('playerLevel').textContent = this.playerData.level || 1;
        
        // Atributos
        document.getElementById('atkValue').textContent = this.playerData.stats?.atk || 0;
        document.getElementById('defValue').textContent = this.playerData.stats?.def || 0;
        document.getElementById('spdValue').textContent = this.playerData.stats?.spd || 0;
        
        // Sprite
        const spriteElement = document.getElementById('characterSprite');
        spriteElement.style.backgroundImage = `url('${this.playerData.spritePath}')`;
    }

    setupEventListeners() {
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.showActionPanel(action);
            });
        });
    }

    showActionPanel(action) {
        const panel = document.getElementById('actionPanel');
        
        const panels = {
            combat: `
                <h2>Combate</h2>
                <div class="combat-options">
                    <div class="enemy-card">
                        <h3>Inimigo Aleatório</h3>
                        <button class="attack-btn">Atacar</button>
                    </div>
                </div>
            `,
            train: `
                <h2>Treinamento</h2>
                <div class="training-options">
                    <div class="train-option">
                        <h3>Força</h3>
                        <button class="train-btn">+5 ATQ (100 Ouro)</button>
                    </div>
                </div>
            `,
            shop: `
                <h2>Loja</h2>
                <div class="shop-items">
                    <div class="item">
                        <h3>Poção de Cura</h3>
                        <button class="buy-btn">Comprar (50 Ouro)</button>
                    </div>
                </div>
            `,
            guild: `
                <h2>Guilda</h2>
                <div class="guild-management">
                    <button class="create-guild">Criar Guilda</button>
                    <div class="guild-list"></div>
                </div>
            `
        };

        panel.innerHTML = panels[action];
    }
}

// Inicialização
auth.onAuthStateChanged(user => {
    if (user) {
        new GameInterface();
    } else {
        window.location.href = 'index.html';
    }
});