fetch('/components/header.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header-placeholder').innerHTML = html;
    });

fetch('/components/menuoptions.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('menuOptions').innerHTML = html;
    });

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    get,
    child,
    update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

const secondApp = initializeApp(firebaseConfig, "secondary");
const secondAuth = getAuth(secondApp);

// Botões principais
const btnAddAdm = document.getElementById("btnAddAdm");
const btnTrocarAutoridade = document.getElementById("btnTrocarAutoridade");

// Overlay cadastrar usuário
const formularioOverlay = document.getElementById("overlay");
const btnConfirm = document.getElementById("btnConfirm");
const btnRefuse = document.getElementById("btnRefuse");

// Overlay trocar autoridade
const overlayAutoridade = document.getElementById("overlayAutoridade");
const btnConfirmAutoridade = document.getElementById("btnConfirmAutoridade");
const btnCancelAutoridade = document.getElementById("btnCancelAutoridade");

// Campos cadastro usuário
const inputNome = document.getElementById("nome");
const inputCpf = document.getElementById("cpf");
const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");
const inputMatricula = document.getElementById("matricula");
const inputTipo = document.getElementById("tipo");

// Campos trocar autoridade
const inputMatriculaAutoridade = document.getElementById("matriculaAutoridade");
const inputTipoAutoridade = document.getElementById("tipoAutoridade");

// ==========================================
// ABRIR POP-UP DE CADASTRAR USUÁRIO
// ==========================================
btnAddAdm.addEventListener("click", (e) => {
    e.preventDefault();

    if (formularioOverlay.classList.contains("oculto")) {
        formularioOverlay.classList.remove("oculto");
        overlayAutoridade.classList.add("oculto");
    } else {
        formularioOverlay.classList.add("oculto");
    }
});

// ==========================================
// ABRIR POP-UP DE TROCAR AUTORIDADE
// ==========================================
btnTrocarAutoridade.addEventListener("click", (e) => {
    e.preventDefault();

    if (overlayAutoridade.classList.contains("oculto")) {
        overlayAutoridade.classList.remove("oculto");
        formularioOverlay.classList.add("oculto");
    } else {
        overlayAutoridade.classList.add("oculto");
    }
});

// ==========================================
// CADASTRAR USUÁRIO
// ==========================================
btnConfirm.addEventListener("click", async (e) => {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const cpf = inputCpf.value.trim();
    const email = inputEmail.value.trim();
    const senha = inputSenha.value;
    const matricula = inputMatricula.value.trim();
    const tipo = inputTipo.value;

    if (!nome || !cpf || !email || !senha || !matricula || !tipo) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const cred = await createUserWithEmailAndPassword(secondAuth, email, senha);
        const novoUid = cred.user.uid;

        await set(ref(db, "Usuarios/" + novoUid), {
            nome: nome,
            cpf: cpf,
            email: email,
            matricula: matricula,
            tipo: tipo,
            userUid: novoUid,
            dataCadastro: new Date().toISOString().split("T")[0]
        });

        console.log("Usuário criado com sucesso:", novoUid);

        await signOut(secondAuth);

        alert("Usuário criado com sucesso!");

        limparFormularioCadastroUsuario();

        formularioOverlay.classList.add("oculto");

    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        alert("Erro ao criar usuário: " + error.message);
    }
});

// ==========================================
// CANCELAR CADASTRO DE USUÁRIO
// ==========================================
btnRefuse.addEventListener("click", (e) => {
    e.preventDefault();

    limparFormularioCadastroUsuario();

    formularioOverlay.classList.add("oculto");
});

// ==========================================
// CONFIRMAR TROCA DE AUTORIDADE
// ==========================================
btnConfirmAutoridade.addEventListener("click", async (e) => {
    e.preventDefault();

    const matriculaInformada = inputMatriculaAutoridade.value.trim();
    const novoTipo = inputTipoAutoridade.value;

    if (!matriculaInformada || !novoTipo) {
        alert("Informe a matrícula e selecione o novo tipo de conta!");
        return;
    }

    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, "Usuarios"));

        if (!snapshot.exists()) {
            alert("Nenhum usuário encontrado no banco.");
            return;
        }

        const usuarios = snapshot.val();

        let uidEncontrado = null;
        let usuarioEncontrado = null;

        for (let uid in usuarios) {
            if (usuarios[uid].matricula === matriculaInformada) {
                uidEncontrado = uid;
                usuarioEncontrado = usuarios[uid];
                break;
            }
        }

        if (!uidEncontrado) {
            alert("Nenhum usuário encontrado com essa matrícula.");
            return;
        }

        await update(ref(db, "Usuarios/" + uidEncontrado), {
            tipo: novoTipo
        });

        alert(
            "Autoridade alterada com sucesso!\n\n" +
            "Nome: " + usuarioEncontrado.nome + "\n" +
            "Email: " + usuarioEncontrado.email + "\n" +
            "Matrícula: " + matriculaInformada + "\n" +
            "Novo tipo: " + novoTipo
        );

        limparFormularioTrocarAutoridade();

        overlayAutoridade.classList.add("oculto");

    } catch (error) {
        console.error("Erro ao trocar autoridade:", error);
        alert("Erro ao trocar autoridade: " + error.message);
    }
});

// ==========================================
// CANCELAR TROCA DE AUTORIDADE
// ==========================================
btnCancelAutoridade.addEventListener("click", (e) => {
    e.preventDefault();

    limparFormularioTrocarAutoridade();

    overlayAutoridade.classList.add("oculto");
});

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
function limparFormularioCadastroUsuario() {
    inputNome.value = "";
    inputCpf.value = "";
    inputEmail.value = "";
    inputSenha.value = "";
    inputMatricula.value = "";
    inputTipo.value = "";
}

function limparFormularioTrocarAutoridade() {
    inputMatriculaAutoridade.value = "";
    inputTipoAutoridade.value = "";
}