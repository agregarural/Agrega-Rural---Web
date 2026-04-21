import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDHtlAftkqyqfAEza_BELney4VdWrYmdhQ",
    authDomain: "agrega-rural.firebaseapp.com",
    databaseURL: "https://agrega-rural-default-rtdb.firebaseio.com",
    projectId: "agrega-rural",
    storageBucket: "agrega-rural.firebasestorage.app",
    messagingSenderId: "990435539814",
    appId: "1:990435539814:web:691caab2fccc6da7df66a7",
    measurementId: "G-MD0SWV9SG5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


const TelaLogin = document.getElementById("idTelaLogin");
const Telacadastro = document.getElementById("idTelaCadastro");
const TelacadastroCoop = document.getElementById("idTelaCadastroCoop");

const btnToCadastro = document.getElementById("btnToCadastro");
const btnToCadastroCoop = document.getElementById("btnToCadastroCoop");
const btnToLogin = document.getElementById("btnToLogin");
const btnToLogin2 = document.getElementById("btnToLogin2");

Telacadastro.classList.add("oculto")
TelacadastroCoop.classList.add("oculto")

btnToLogin.addEventListener("click", () => {
    Telacadastro.classList.add("oculto")
    TelacadastroCoop.classList.add("oculto")
    TelaLogin.classList.remove("oculto")
});

btnToLogin2.addEventListener("click", () => {
    Telacadastro.classList.add("oculto")
    TelacadastroCoop.classList.add("oculto")
    TelaLogin.classList.remove("oculto")
});

btnToCadastro.addEventListener("click", () => {
    TelaLogin.classList.add("oculto")
    Telacadastro.classList.remove("oculto")
});

btnToCadastroCoop.addEventListener("click", () => {
    TelacadastroCoop.classList.remove("oculto")
    TelaLogin.classList.add("oculto")
    Telacadastro.classList.add("oculto")
});

const btnCiarCoop = document.getElementById("btnCiarCoop");

//CRIANDO COOPERATIVA NO FIREBASE

btnCiarCoop.addEventListener("click", (e) => {
    e.preventDefault();

    var nomeCoop = document.getElementById("coopNome").value.trim();
    var cnpj = document.getElementById("coopCnpj").value.trim();
    var admEmail = document.getElementById("admEmail").value.trim();
    var coopEmail = document.getElementById("coopEmail").value.trim();
    var telefone = document.getElementById("coopTelefone").value.trim();
    var cep = document.getElementById("coopCep").value.trim();
    var logradouro = document.getElementById("coopLogradouro").value.trim();
    var cidade = document.getElementById("coopCidade").value.trim();
    var estado = document.getElementById("coopEstado").value.trim().toUpperCase();
    var senha = document.getElementById("coopSenha").value;
    var repetirSenha = document.getElementById("coopRepetirSenha").value;


    const novaCoop = {
        nome: nomeCoop,
        cnpj: cnpj,
        fundacao: new Date().toISOString().split('T')[0],
        descricao: "",
        contato: {
            email: coopEmail,
            telefone: telefone
        },
        endereco: {
            logradouro: logradouro,
            cidade: cidade,
            estado: estado,
            cep: cep
        },
        Administradores: {
            adm01: {
                nome: "Administrador " + nomeCoop,
                email: admEmail,
                senha: senha,
                tipo: "adm_cooperativa",
                dataCadastro: new Date().toISOString().split('T')[0]
            }
        },
        Produtos: {},
        Cooperados: {}
    };

    push(ref(db, "Cooperativas"), novaCoop)
    .then(() => {
        alert("Cooperativa cadastrada com sucesso")
        document.querySelector("form").reset();
    })
    .catch((error) => {

        alert("erro ao cadastrar cooperativa");
    })



})