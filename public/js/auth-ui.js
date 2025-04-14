document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const loading = document.getElementById('loading');
  
  // Persistência de autenticação melhorada
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
      auth.onAuthStateChanged((user) => {
          loading.style.display = 'none';
          
          if (user) {
              handleAuthenticatedUser(user);
          } else {
              handleUnauthenticatedUser();
          }
      });
  })
  .catch((error) => {
      console.error('Erro na persistência:', error);
      loading.style.display = 'none';
  });

  // Funções de controle de fluxo
  const handleAuthenticatedUser = (user) => {
      if (user.emailVerified) {
          redirectToGame();
      } else {
          handleUnverifiedEmail(user);
      }
  };

  const handleUnauthenticatedUser = () => {
      initForms();
      showLoginForm();
  };

  const redirectToGame = () => {
      if (!window.location.pathname.includes('character-selection')) {
          window.location.href = 'character-selection.html';
      }
  };

  const handleUnverifiedEmail = (user) => {
      showMessage('Verifique seu e-mail para acessar o jogo!');
      document.getElementById('loginForm').reset();
      auth.signOut(); // Mantém o logout para segurança
  };

  // Controle de formulários
  const initForms = () => {
      setupFormToggle();
      setupSignupForm();
      setupLoginForm();
  };

  const setupFormToggle = () => {
      document.getElementById('showSignup').addEventListener('click', () => toggleForms('signup'));
      document.getElementById('showLogin').addEventListener('click', () => toggleForms('login'));
  };

  const toggleForms = (formToShow) => {
      const forms = {
          login: document.getElementById('loginForm'),
          signup: document.getElementById('signupForm')
      };
      
      Object.values(forms).forEach(form => form.classList.remove('active'));
      forms[formToShow].classList.add('active');
  };

  const setupSignupForm = () => {
      document.getElementById('signupForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('signupEmail').value;
          const password = document.getElementById('signupPassword').value;
          const username = document.getElementById('signupUsername').value;

          try {
              const userCredential = await auth.createUserWithEmailAndPassword(email, password);
              await userCredential.user.updateProfile({ displayName: username });
              await userCredential.user.sendEmailVerification();
              showMessage('Link de verificação enviado para seu e-mail!');
              toggleForms('login');
          } catch (error) {
              showMessage(error.message);
          }
      });
  };

  const setupLoginForm = () => {
      document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('loginEmail').value;
          const password = document.getElementById('loginPassword').value;

          try {
              const userCredential = await auth.signInWithEmailAndPassword(email, password);
              if (userCredential.user.emailVerified) {
                  redirectToGame();
              } else {
                  showMessage('Verifique seu e-mail antes de entrar!');
                  await userCredential.user.sendEmailVerification();
              }
          } catch (error) {
              showMessage(error.message);
          }
      });
  };

  // Utilitários
  const showMessage = (message) => {
      const msgElement = document.getElementById('authMessage');
      msgElement.textContent = message;
      msgElement.style.display = 'block';
      setTimeout(() => msgElement.style.display = 'none', 5000);
  };
});