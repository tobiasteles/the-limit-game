async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await signIn(email, password);
        alert('Login bem sucedido!');
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await signUp(email, password);
        alert('Cadastro realizado!');
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}