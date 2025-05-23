// js/inventory.js
export class InventorySystem {
    constructor(characterId) {
        this.characterId = characterId;
        this.inventoryPanel = document.getElementById('inventoryPanel');
        this.goldElement = document.getElementById('goldAmount');
        this.itemsListElement = document.getElementById('itemsList');

        if (!this.inventoryPanel) {
            console.error('Painel do inventário não encontrado!');
            return;
        }

        this.setupInventory();
    }

    async setupInventory() {
        await this.loadInventory();
        this.setupCloseButton();
        this.toggleInventory(false);
    }

    async loadInventory() {
        try {
            const user = firebase.auth().currentUser;
            if (!user) throw new Error('Usuário não autenticado');

            const doc = await firebase.firestore()
                .collection('players')
                .doc(user.uid)
                .collection('characters')
                .doc(this.characterId)
                .get();

            const data = doc.exists ? doc.data() : {};
            this.inventoryData = data.inventory || this.createDefaultInventory();

            const gold = data.gold || 0;
            if (this.goldElement) this.goldElement.textContent = gold;

            // Carregar a arma equipada
            const weaponData = data.weapon || {};
            if (weaponData.type) {
                this.inventoryData.mainHand = {
                    name: `${weaponData.type} ${weaponData.currentMaterial}`,
                    icon: this.getWeaponIcon(weaponData.type),
                    type: 'weapon',
                    stats: weaponData.stats,
                    level: weaponData.level
                };
            }

            this.items = data.items || [];
            this.updateInventoryUI();
            this.updateItemsList();
        } catch (error) {
            console.error('Erro ao carregar inventário:', error);
            this.inventoryData = this.createDefaultInventory();
            this.items = [];
            this.updateItemsList();
        }
    }

    getWeaponIcon(weaponType) {
        const icons = {
            'Espada de Duas Mãos': 'assets/weapons/greatsword.png',
            'Espada e Escudo': 'assets/weapons/swordshield.png',
            'Adagas Gêmeas': 'assets/weapons/daggers.png',
            'Arco Longo': 'assets/weapons/bow.png',
            'Cajado Arcano': 'assets/weapons/staff.png',
            'Cetro das Trevas': 'assets/weapons/scepter.png'
        };
        return icons[weaponType] || 'assets/weapons/default.png';
    }

    setupCloseButton() {
        const closeBtn = this.inventoryPanel?.querySelector('.close-btn');
        if (!closeBtn) {
            console.error('Botão de fechar não encontrado!');
            return;
        }

        closeBtn.addEventListener('click', () => {
            this.toggleInventory(false);
        });
    }

    updateInventoryUI() {
        const slots = {
            head: document.getElementById('headSlot'),
            torso: document.getElementById('torsoSlot'),
            arms: document.getElementById('armsSlot'),
            legs: document.getElementById('legsSlot'),
            mainHand: document.getElementById('mainHandSlot'),
            offHand: document.getElementById('offHandSlot')
        };

        // Atualizar slots com base no inventário
        Object.entries(this.inventoryData).forEach(([slot, item]) => {
            const slotElement = slots[slot];
            if (!slotElement) {
                console.warn(`Slot ${slot} não encontrado`);
                return;
            }

            if (item) {
                // Verifica se é arma equipada para mostrar stats
                if (slot === 'mainHand' && item.type === 'weapon') {
                    slotElement.innerHTML = `
                        <img src="${item.icon}" alt="${item.name}" onerror="this.src='assets/default-item.png'">
                        <span class="item-name">${item.name}</span>
                        <div class="weapon-stats">
                            <span>ATQ: +${item.stats.atk}</span>
                            <span>Nv: ${item.level}</span>
                        </div>
                    `;
                } else {
                    slotElement.innerHTML = `
                        <img src="${item.icon}" alt="${item.name}" onerror="this.src='assets/default-item.png'">
                        <span class="item-name">${item.name}</span>
                    `;
                }
            } else {
                slotElement.innerHTML = `<span class="slot-label">${slotElement.dataset.label}</span>`;
            }
        });
    }

    updateItemsList() {
        if (!this.itemsListElement) return;

        this.itemsListElement.innerHTML = '';

        this.items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                <img src="${item.icon}" alt="${item.name}" onerror="this.src='assets/default-item.png'">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">x${item.quantity}</div>
                </div>
            `;
            itemCard.addEventListener('click', () => this.handleItemClick(item));
            this.itemsListElement.appendChild(itemCard);
        });
    }

    handleItemClick(item) {
        console.log('Item clicado:', item);
        // Lógica de uso ou equipamento do item
    }

    toggleInventory(show = true) {
        if (this.inventoryPanel) {
            this.inventoryPanel.style.display = show ? 'block' : 'none';
        }
    }

    createDefaultInventory() {
        return {
            head: null,
            torso: null,
            arms: null,
            legs: null,
            mainHand: null,
            offHand: null
        };
    }
}