import { auth } from '/public/js/firebase/firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword 
} from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js';

export const signUp = async (email, password) => {
    try {
        return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw new Error(getErrorMessage(error.code));
    }
};

export const signIn = async (email, password) => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        throw new Error(getErrorMessage(error.code));
    }
};

const getErrorMessage = (code) => {
    switch(code) {
        case 'auth/invalid-email': return 'E-mail inválido';
        case 'auth/user-not-found': return 'Usuário não encontrado';
        case 'auth/wrong-password': return 'Senha incorreta';
        case 'auth/email-already-in-use': return 'E-mail já cadastrado';
        default: return 'Erro na autenticação';
    }
};