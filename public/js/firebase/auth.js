import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Toggle entre login e cadastro
document.getElementById('toggleRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
});

document.getElementById('toggleLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
});

// Cadastro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert('Conta criada com sucesso!');
        // Redirecionar para criação de personagem posteriormente
    } catch (error) {
        handleAuthError(error);
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('Login bem-sucedido!');
        // Redirecionar para o jogo posteriormente
        // Após login bem-sucedido:
if (userCredential.user) {
    window.location.href = '/character-creation.html';
}

// Na página de criação de personagem:
document.addEventListener('DOMContentLoaded', async () => {
    const classes = [
        { id: 'warrior', color: '#FF5555' },
        { id: 'knight', color: '#9999FF' },
        { id: 'archer', color: '#55FF55' },
        { id: 'mage', color: '#FF55FF' },
        { id: 'assassin', color: '#5555FF' },
        { id: 'necromancer', color: '#AA00AA' }
    ];

    // Renderizar classes
    const classSelector = document.querySelector('.class-selector');
    classes.forEach(cls => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `
            <h3>${cls.id.toUpperCase()}</h3>
            <p>${getClassDescription(cls.id)}</p>
        `;
        card.addEventListener('click', () => selectClass(cls));
        classSelector.appendChild(card);
    });

    // Lógica de criação
    document.getElementById('createCharacter').addEventListener('click', async () => {
        const userId = auth.currentUser.uid;
        const canCreate = await playerDB.canCreateNewCharacter(userId);
        
        if (!canCreate) {
            alert('Limite de 3 personagens atingido!');
            return;
        }

        const characterData = {
            name: document.getElementById('characterName').value,
            class: selectedClass,
            spriteConfig: currentSpriteConfig
        };

        const characterId = await playerDB.createCharacter(userId, characterData);
        await realtimeDB.initPlayerStatus(userId, characterId, new Player(characterData).stats);
        
        alert('Personagem criado com sucesso!');
        window.location.href = '/game.html';
    });
});
    } catch (error) {
        handleAuthError(error);
    }
});

function handleAuthError(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            alert('Este e-mail já está cadastrado!');
            break;
        case 'auth/invalid-email':
            alert('E-mail inválido!');
            break;
        case 'auth/weak-password':
            alert('Senha muito fraca (mínimo 6 caracteres)');
            break;
        case 'auth/user-not-found':
            alert('Usuário não encontrado!');
            break;
        case 'auth/wrong-password':
            alert('Senha incorreta!');
            break;
        default:
            alert('Erro: ' + error.message);
    }
}