import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getDatabase,
    ref,
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

const IMGBB_API_KEY = "ac742aebcb5ef3bbef2489f934240205";

const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

const auth = getAuth(app);
const database = getDatabase(app);

const headerPlaceholder = document.getElementById("header-placeholder");

const fotoPerfilPreview = document.getElementById("fotoPerfilPreview");
const inputFoto = document.getElementById("inputFoto");

const nomeUsuario = document.getElementById("nomeUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const tipoUsuario = document.getElementById("tipoUsuario");
const matriculaUsuario = document.getElementById("matriculaUsuario");
const coopUsuario = document.getElementById("coopUsuario");
const dataCadastroUsuario = document.getElementById("dataCadastroUsuario");

const mensagem = document.getElementById("mensagem");

let usuarioAtual = null;
let fotoURLAtual = "../assets/img/perfil.jpg";

async function carregarHeader() {
    try {
        const resposta = await fetch("../components/header.html");
        const html = await resposta.text();

        headerPlaceholder.innerHTML = html;

        const profileImageHeader = document.getElementById("profileImage");

        if (profileImageHeader) {
            profileImageHeader.src = fotoURLAtual;
        }

    } catch (erro) {
        console.error("Erro ao carregar o header:", erro);
    }
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function limparMensagemDepois() {
    setTimeout(() => {
        mensagem.textContent = "";
        mensagem.className = "";
    }, 4000);
}

function formatarTipo(tipo) {
    if (!tipo) {
        return "Não informado";
    }

    if (tipo === "administrador") {
        return "Administrador";
    }

    if (tipo === "produtor") {
        return "Produtor";
    }

    return tipo;
}

function formatarData(data) {
    if (!data) {
        return "Não informado";
    }

    if (!String(data).includes("-")) {
        return data;
    }

    const partes = String(data).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function mostrarDadosNaTela(dados, user) {
    nomeUsuario.textContent = dados.nome || user.displayName || "Não informado";
    emailUsuario.textContent = dados.email || user.email || "Não informado";
    tipoUsuario.textContent = formatarTipo(dados.tipo);
    matriculaUsuario.textContent = dados.matricula || dados.cpf || "Não informado";
    coopUsuario.textContent = dados.coopUid || "Não informado";
    dataCadastroUsuario.textContent = formatarData(dados.dataCadastro);

    fotoURLAtual = dados.fotoURL || user.photoURL || "../assets/img/perfil.jpg";

    fotoPerfilPreview.src = fotoURLAtual;

    const profileImageHeader = document.getElementById("profileImage");

    if (profileImageHeader) {
        profileImageHeader.src = fotoURLAtual;
    }
}

async function carregarDadosUsuario(user) {
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `Usuarios/${user.uid}`));

        if (!snapshot.exists()) {
            mostrarMensagem("Usuário logado, mas os dados não foram encontrados no banco.", "erro");
            return;
        }

        const dadosUsuario = snapshot.val();

        mostrarDadosNaTela(dadosUsuario, user);

    } catch (erro) {
        console.error("Erro ao carregar dados do usuário:", erro);
        mostrarMensagem("Erro ao carregar os dados do usuário.", "erro");
    }
}

async function enviarImagemParaImgBB(arquivo) {
    const formData = new FormData();
    formData.append("image", arquivo);

    const resposta = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    });

    const dados = await resposta.json();

    console.log("Resposta ImgBB:", dados);

    if (!dados.success) {
        throw new Error("Erro ao enviar imagem para o ImgBB.");
    }

    return dados.data.url;
}

async function salvarImagemPerfil(arquivo) {
    if (!usuarioAtual) {
        mostrarMensagem("Usuário não está logado.", "erro");
        return;
    }

    if (!arquivo) {
        return;
    }

    if (!arquivo.type.startsWith("image/")) {
        mostrarMensagem("Escolha apenas arquivos de imagem.", "erro");
        return;
    }

    try {
        mostrarMensagem("Enviando imagem para o ImgBB...", "sucesso");

        const fotoURL = await enviarImagemParaImgBB(arquivo);

        mostrarMensagem("Salvando URL no Firebase...", "sucesso");

        await update(ref(database, `Usuarios/${usuarioAtual.uid}`), {
            fotoURL: fotoURL
        });

        await updateProfile(usuarioAtual, {
            photoURL: fotoURL
        });

        fotoURLAtual = fotoURL;

        fotoPerfilPreview.src = fotoURLAtual;

        const profileImageHeader = document.getElementById("profileImage");

        if (profileImageHeader) {
            profileImageHeader.src = fotoURLAtual;
        }

        mostrarMensagem("Imagem de perfil atualizada com sucesso.", "sucesso");
        limparMensagemDepois();

        console.log("URL salva no Firebase:", fotoURL);

    } catch (erro) {
        console.error("Erro ao salvar imagem:", erro);
        mostrarMensagem("Erro ao salvar imagem. Veja o console.", "erro");
    }
}

inputFoto.addEventListener("change", async () => {
    const arquivo = inputFoto.files[0];

    if (!arquivo) {
        return;
    }

    const urlTemporaria = URL.createObjectURL(arquivo);
    fotoPerfilPreview.src = urlTemporaria;

    await salvarImagemPerfil(arquivo);

    inputFoto.value = "";
});

await carregarHeader();

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        mostrarMensagem("Nenhum usuário está logado.", "erro");

        setTimeout(() => {
            window.location.href = "../pages/autenticacion.html";
        }, 1500);

        return;
    }

    usuarioAtual = user;

    await carregarDadosUsuario(user);
});