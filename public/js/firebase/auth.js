import { auth, db } from '../firebase/firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js';
import {
    setDoc,
    doc
} from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js';

// Verifique se o Firebase está inicializado
console.log("Firebase Auth Object:", auth);

// Force um estado de logout para teste
signOut(auth).then(() => {
    console.log("Usuário deslogado para teste");
});

export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "players", userCredential.user.uid), {
            level: 1,
            xp: 0,
            health: 100,
            position: { x: 400, y: 300 },
            inventory: [],
            lastLogin: new Date()
        });

        return userCredential.user;
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
