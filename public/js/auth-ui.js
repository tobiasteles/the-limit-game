document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const loading = document.getElementById('loading');
  
    // Configurar persistência de autenticação
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        auth.onAuthStateChanged((user) => {
          loading.style.display = 'none';
          console.log('Estado da autenticação:', user ? 'Logado' : 'Não logado');
  
          if (user) {
            // Verificar se o email foi verificado
            if (user.emailVerified) {
              window.location.href = './character-selection.html';
            } else {
              showMessage('Verifique seu e-mail antes de entrar!');
              auth.signOut();
            }
          } else {
            initForms();
            showLoginForm();
          }
        });
      })
      .catch((error) => {
        console.error('Erro na persistência:', error);
        loading.style.display = 'none';
      });
  
    function initForms() {
      // Alternar entre formulários
      document.getElementById('showSignup').addEventListener('click', () => {
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('signupForm').classList.add('active');
      });
  
      document.getElementById('showLogin').addEventListener('click', () => {
        document.getElementById('signupForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
      });
  
      // Cadastro
      document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const username = document.getElementById('signupUsername').value;
  
        try {
          const userCredential = await auth.createUserWithEmailAndPassword(email, password);
          await userCredential.user.updateProfile({ displayName: username });
          await userCredential.user.sendEmailVerification();
          window.location.href = './character-selection.html';
        } catch (error) {
          showMessage(error.message);
        }
      });
  
      // Login
      document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
  
        try {
          await auth.signInWithEmailAndPassword(email, password);
          window.location.href = './character-selection.html';
        } catch (error) {
          showMessage(error.message);
        }
      });
    }
  
    function showMessage(message) {
      const msgElement = document.getElementById('authMessage');
      msgElement.textContent = message;
      msgElement.style.display = 'block';
      setTimeout(() => msgElement.style.display = 'none', 5000);
    }
  
    function showLoginForm() {
      document.getElementById('loginForm').classList.add('active');
      document.getElementById('signupForm').classList.remove('active');
    }
  });
  