// auth.js
const authHandler = {
    signUp: async (email, password, username) => {
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        await firebase.firestore().collection('players').doc(userCredential.user.uid).set({
          username: username,
          email: email,
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          last_login: firebase.firestore.FieldValue.serverTimestamp(),
          level: 1,
          gold: 0
        });
  
        return userCredential;
      } catch (error) {
        throw error;
      }
    },
  
    signIn: async (email, password) => {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        await firebase.firestore().collection('players').doc(userCredential.user.uid).update({
          last_login: firebase.firestore.FieldValue.serverTimestamp()
        });
  
        return userCredential;
      } catch (error) {
        throw error;
      }
    }
  };
  
  // Disponibiliza globalmente
  window.authHandler = authHandler;