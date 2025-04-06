import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Configura o Firestore
const db = getFirestore(app);

// Configura o Realtime Database
const rtdb = getDatabase(app);

export const realtimeDB = {
    // Inicializar status do jogador
    async initPlayerStatus(userId, characterId, initialStats) {
        const statusRef = ref(rtdb, `players/${userId}/${characterId}`);
        await set(statusRef, {
            currentHP: initialStats.hp,
            currentMP: initialStats.mp,
            position: { x: 0, y: 0 },
            lastActive: new Date().toISOString(),
            statusEffects: []
        });
    },

    // Atualizar status em tempo real
    updatePosition(userId, characterId, position) {
        const positionRef = ref(rtdb, `players/${userId}/${characterId}/position`);
        set(positionRef, position);
    }
};

export const playerDB = {
    // Criar novo personagem
    async createCharacter(userId, characterData) {
        const charactersRef = collection(db, "users", userId, "characters");
        const newCharacterRef = doc(charactersRef);
        await setDoc(newCharacterRef, {
            name: characterData.name,
            class: characterData.class,
            weapon: characterData.weapon,
            stats: characterData.stats,
            created: new Date(),
            spriteConfig: characterData.spriteConfig
        });
        return newCharacterRef.id;
    },

    // Carregar personagens existentes
    async getCharacters(userId) {
        const q = query(collection(db, "users", userId, "characters"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Verificar limite de personagens
    async canCreateNewCharacter(userId) {
        const characters = await this.getCharacters(userId);
        return characters.length < 3;
    }
};
