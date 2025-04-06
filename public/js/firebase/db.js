import { db } from '../firebase/firebase-config.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js';

// Operações do jogador
export const playerDB = {
    // Salvar dados do jogador
    async savePlayer(player) {
        try {
            const playerRef = doc(db, 'players', player.uid);
            await setDoc(playerRef, {
                level: player.level,
                xp: player.xp,
                health: player.health,
                position: player.position,
                inventory: player.inventory,
                lastSaved: new Date()
            });
            console.log('Jogador salvo com sucesso!');
        } catch (error) {
            throw new Error('Erro ao salvar jogador: ' + error.message);
        }
    },

    // Carregar dados do jogador
    async loadPlayer(uid) {
        try {
            const playerRef = doc(db, 'players', uid);
            const docSnap = await getDoc(playerRef);
            
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null; // Novo jogador
            }
        } catch (error) {
            throw new Error('Erro ao carregar jogador: ' + error.message);
        }
    },

    // Atualizar inventário
    async updateInventory(uid, item, action = 'add') {
        try {
            const playerRef = doc(db, 'players', uid);
            
            if (action === 'add') {
                await updateDoc(playerRef, {
                    inventory: arrayUnion(item)
                });
            } else {
                await updateDoc(playerRef, {
                    inventory: arrayRemove(item)
                });
            }
        } catch (error) {
            throw new Error('Erro ao atualizar inventário: ' + error.message);
        }
    },

    // Atualizar posição
    async updatePosition(uid, newPosition) {
        try {
            const playerRef = doc(db, 'players', uid);
            await updateDoc(playerRef, {
                position: newPosition
            });
        } catch (error) {
            throw new Error('Erro ao atualizar posição: ' + error.message);
        }
    }
};

// Operações do jogo
export const gameDB = {
    // Registrar combate
    async logCombat(uid, monsterLevel, result) {
        try {
            const combatRef = doc(collection(db, 'combats', uid, 'logs'));
            await setDoc(combatRef, {
                timestamp: new Date(),
                monsterLevel,
                result,
                xpGained: result === 'win' ? monsterLevel * 10 : 0
            });
        } catch (error) {
            console.error('Erro ao registrar combate:', error);
        }
    },

    // Carregar leaderboard
    async getLeaderboard(limit = 10) {
        try {
            // Implementar lógica de leaderboard
        } catch (error) {
            throw new Error('Erro ao carregar leaderboard: ' + error.message);
        }
    }
};