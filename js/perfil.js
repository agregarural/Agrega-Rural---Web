


const TelaLogin = document.getElementById("idTelaLogin");
const Telacadastro = document.getElementById("idTelaCadastro");
const TelacadastroCoop = document.getElementById("idTelaCadastroCoop");

const btnToCadastro = document.getElementById("btnToCadastro");
const btnToCadastroCoop = document.getElementById("btnToCadastroCoop");
const btnToLogin = document.getElementById("btnToLogin");
const btnToLogin2 = document.getElementById("btnToLogin2");

Telacadastro.classList.add("oculto")
TelacadastroCoop.classList.add("oculto")

btnToLogin.addEventListener( "click", () => {
    Telacadastro.classList.add("oculto")
    TelacadastroCoop.classList.add("oculto")  
    TelaLogin.classList.remove("oculto")
});

btnToLogin2.addEventListener( "click", () => {
    Telacadastro.classList.add("oculto")
    TelacadastroCoop.classList.add("oculto")  
    TelaLogin.classList.remove("oculto")
});

btnToCadastro.addEventListener( "click", () => {
    TelaLogin.classList.add("oculto")
    Telacadastro.classList.remove("oculto") 
});

btnToCadastroCoop.addEventListener( "click", () => {
        TelacadastroCoop.classList.remove("oculto") 
    TelaLogin.classList.add("oculto")
    Telacadastro.classList.add("oculto") 
});