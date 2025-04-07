import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    set 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const rtdb = getDatabase(app);

export const realtimeDB = {
    async initPlayerStatus(userId, characterId, initialStats) {
        const statusRef = ref(rtdb, `players/${userId}/${characterId}`);
        
        // Validação completa dos dados
        const statusData = {
            currentHP: Math.max(Number(initialStats.hp), 10),
            currentMP: Math.max(Number(initialStats.mp), 10),
            position: { 
                x: 0, 
                y: 0 
            },
            lastActive: new Date().toISOString(),
            statusEffects: "none"
        };

        console.log('[RTDB] Dados validados:', statusData);
        
        try {
            await set(statusRef, statusData);
            console.log('[RTDB] Status salvo com sucesso!');
            return true;
        } catch (error) {
            console.error('[RTDB] Erro crítico:', error);
            throw new Error('Falha ao salvar status: ' + error.message);
        }
    },

    updatePosition(userId, characterId, position) {
        const positionRef = ref(rtdb, `players/${userId}/${characterId}/position`);
        set(positionRef, {
            x: position.x,
            y: position.y
        });
    }
};

export const playerDB = {
    async createCharacter(userId, characterData) {
        const charactersRef = collection(firestore, "users", userId, "characters");
        const newCharacterRef = doc(charactersRef);
        
        const firestoreData = {
            name: characterData.name,
            class: characterData.class,
            weapon: characterData.weapon,
            stats: {
                hp: characterData.stats.hp,
                mp: characterData.stats.mp,
                attack: characterData.stats.attack,
                defense: characterData.stats.defense,
                agility: characterData.stats.agility
            },
            created: new Date().toISOString(),
            spriteConfig: characterData.spriteConfig || {}
        };

        console.log('[Firestore] Dados do personagem:', firestoreData);
        
        try {
            await setDoc(newCharacterRef, firestoreData);
            console.log('[Firestore] Personagem criado ID:', newCharacterRef.id);
            return newCharacterRef.id;
        } catch (error) {
            console.error('[Firestore] Erro na criação:', error);
            throw new Error('Erro ao criar personagem: ' + error.message);
        }
    },

    async getCharacters(userId) {
        try {
            const q = query(collection(firestore, "users", userId, "characters"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created: doc.data().created // Já está em ISO string
            }));
        } catch (error) {
            console.error('[Firestore] Erro ao buscar personagens:', error);
            return [];
        }
    },

    async canCreateNewCharacter(userId) {
        try {
            const characters = await this.getCharacters(userId);
            return characters.length < 3;
        } catch (error) {
            console.error('[Firestore] Erro na verificação:', error);
            return false;
        }
    }
};