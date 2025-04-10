import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { firebaseConfig } from './firebase/firebase-config.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function initAuthListeners() {
    const toggleRegister = document.getElementById('toggleRegister');
    const toggleLogin = document.getElementById('toggleLogin');
    if (toggleRegister && toggleLogin) {
        toggleRegister.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
        });
        toggleLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        });
    }
}

export function initAuthForms() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    // Nome pode ser usado futuramente
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Conta criada com sucesso!');
    } catch (error) {
        handleAuthError(error);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = '/character-creation.html';
    } catch (error) {
        handleAuthError(error);
    }
}

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
