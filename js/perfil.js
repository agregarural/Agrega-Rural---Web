
const TelaLogin = document.getElementById("idTelaLogin");
const Telacadastro = document.getElementById("idTelaCadastro");

const btnToCadastro = document.getElementById("btnToCadastro");
const btnToLogin = document.getElementById("btnToLogin");

Telacadastro.classList.add("oculto")

btnToLogin.addEventListener( "click", () => {
    Telacadastro.classList.add("oculto") 
    TelaLogin.classList.remove("oculto")
});

btnToCadastro.addEventListener( "click", () => {
    TelaLogin.classList.add("oculto")
    Telacadastro.classList.remove("oculto") 
});