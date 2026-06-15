import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
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

const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

const auth = getAuth(app);
const db = getDatabase(app);

const secondApp = initializeApp(firebaseConfig, "secondary");
const secondAuth = getAuth(secondApp);

// ==========================================
// IMPORTANDO COMPONENTES
// ==========================================

async function carregarComponentes() {
    try {
        const respostaHeader = await fetch("../components/header.html");
        const htmlHeader = await respostaHeader.text();

        document.getElementById("header-placeholder").innerHTML = htmlHeader;

        await import("../js/header.js");

        const respostaMenu = await fetch("../components/menuoptions.html");
        const htmlMenu = await respostaMenu.text();

        const menuOptions =
            document.getElementById("menuOptions") ||
            document.getElementById("menu-options");

        if (menuOptions) {
            menuOptions.innerHTML = htmlMenu;
        }

    } catch (erro) {
        console.error("Erro ao carregar componentes:", erro);
    }
}

await carregarComponentes();

// ==========================================
// VARIÁVEIS GLOBAIS DA COOPERATIVA LOGADA
// ==========================================

let usuarioLogado = null;
let dadosUsuarioLogado = null;
let coopUidAtual = null;
let dadosCooperativaAtual = null;

// ==========================================
// ELEMENTOS DA TELA
// ==========================================

const btnAddAdm = document.getElementById("btnAddAdm");
const btnTrocarAutoridade = document.getElementById("btnTrocarAutoridade");

const formularioOverlay = document.getElementById("overlay");
const btnConfirm = document.getElementById("btnConfirm");
const btnRefuse = document.getElementById("btnRefuse");

const overlayAutoridade = document.getElementById("overlayAutoridade");
const btnConfirmAutoridade = document.getElementById("btnConfirmAutoridade");
const btnCancelAutoridade = document.getElementById("btnCancelAutoridade");

const inputNome = document.getElementById("nome");
const inputCpf = document.getElementById("cpf");
const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");
const inputMatricula = document.getElementById("matricula");
const inputTipo = document.getElementById("tipo");

const inputEmailAutoridade = document.getElementById("emailAutoridade");
const inputMatriculaAutoridade = document.getElementById("matriculaAutoridade");
const inputTipoAutoridade = document.getElementById("tipoAutoridade");

// ==========================================
// OBSERVAR LOGIN DO ADMINISTRADOR
// ==========================================

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("Você precisa estar logado para acessar o painel da cooperativa.");
        window.location.href = "../pages/autenticacion.html";
        return;
    }

    usuarioLogado = user;

    await carregarUsuarioLogado();

    if (!coopUidAtual) {
        return;
    }

    await carregarDadosDaCooperativa();
    await carregarAdministradoresDaCooperativa();
});

// ==========================================
// CARREGAR USUÁRIO LOGADO
// ==========================================

async function carregarUsuarioLogado() {
    try {
        const dbRef = ref(db);
        const snapshotUsuario = await get(child(dbRef, `Usuarios/${usuarioLogado.uid}`));

        if (!snapshotUsuario.exists()) {
            alert("Usuário não encontrado no banco de dados.");
            await signOut(auth);
            window.location.href = "../pages/autenticacion.html";
            return;
        }

        dadosUsuarioLogado = snapshotUsuario.val();

        if (dadosUsuarioLogado.tipo !== "administrador") {
            alert("Acesso restrito. Somente administradores podem acessar este painel.");
            await signOut(auth);
            window.location.href = "../pages/autenticacion.html";
            return;
        }

        if (!dadosUsuarioLogado.coopUid) {
            alert("Este administrador não está vinculado a nenhuma cooperativa.");
            await signOut(auth);
            window.location.href = "../pages/autenticacion.html";
            return;
        }

        coopUidAtual = dadosUsuarioLogado.coopUid;

    } catch (error) {
        console.error("Erro ao carregar usuário logado:", error);
        alert("Erro ao carregar os dados do usuário.");
    }
}

// ==========================================
// CARREGAR DADOS DA COOPERATIVA
// ==========================================

async function carregarDadosDaCooperativa() {
    try {
        const dbRef = ref(db);
        const snapshotCoop = await get(child(dbRef, `Cooperativas/${coopUidAtual}`));

        if (!snapshotCoop.exists()) {
            alert("Cooperativa não encontrada no banco de dados.");
            return;
        }

        dadosCooperativaAtual = snapshotCoop.val();

        preencherDadosGerais();

    } catch (error) {
        console.error("Erro ao carregar cooperativa:", error);
        alert("Erro ao carregar os dados da cooperativa.");
    }
}

// ==========================================
// PREENCHER DADOS GERAIS NA TELA
// ==========================================

function preencherDadosGerais() {
    const nome = dadosCooperativaAtual.nome || "Não informado";
    const cnpj = dadosCooperativaAtual.cnpj || "Não informado";
    const email = dadosCooperativaAtual.contato?.email || "Não informado";
    const telefone = dadosCooperativaAtual.contato?.telefone || "Não informado";
    const cep = dadosCooperativaAtual.endereco?.cep || "Não informado";
    const logradouro = dadosCooperativaAtual.endereco?.logradouro || "Não informado";
    const cidade = dadosCooperativaAtual.endereco?.cidade || "Não informado";
    const estado = dadosCooperativaAtual.endereco?.estado || "Não informado";
    const fundacao = dadosCooperativaAtual.fundacao || "Não informado";
    const matriculaAdmin = dadosUsuarioLogado.matricula || "Não informado";

    setTexto("tituloCooperativa", nome);
    setTexto("textoBannerCooperativa", nome);

    setTexto("dadosCoopNome", nome);
    setTexto("dadosCoopCnpj", formatarCNPJ(cnpj));
    setTexto("dadosCoopMatricula", matriculaAdmin);
    setTexto("dadosCoopEmail", email);
    setTexto("dadosCoopTelefone", formatarTelefone(telefone));
    setTexto("dadosCoopCep", formatarCEP(cep));
    setTexto("dadosCoopLogradouro", logradouro);
    setTexto("dadosCoopCidade", cidade);
    setTexto("dadosCoopEstado", estado);
    setTexto("dadosCoopFundacao", formatarData(fundacao));
}

// ==========================================
// CARREGAR ADMINISTRADORES DA MESMA COOPERATIVA
// ==========================================

async function carregarAdministradoresDaCooperativa() {
    const tbody = document.getElementById("tbodyAdministradores");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="3">Carregando administradores...</td>
        </tr>
    `;

    try {
        const dbRef = ref(db);
        const snapshotUsuarios = await get(child(dbRef, "Usuarios"));

        if (!snapshotUsuarios.exists()) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3">Nenhum administrador encontrado.</td>
                </tr>
            `;
            return;
        }

        const usuarios = snapshotUsuarios.val();

        const administradores = Object.values(usuarios).filter(usuario => {
            return usuario.tipo === "administrador" && usuario.coopUid === coopUidAtual;
        });

        if (administradores.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3">Nenhum administrador encontrado.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";

        administradores.forEach(admin => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${admin.nome || "Não informado"}</td>
                <td>${admin.email || "Não informado"}</td>
                <td>Ativo</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar administradores:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="3">Erro ao carregar administradores.</td>
            </tr>
        `;
    }
}

// ==========================================
// ABRIR POP-UP DE CADASTRAR USUÁRIO
// ==========================================

if (btnAddAdm && formularioOverlay && overlayAutoridade) {
    btnAddAdm.addEventListener("click", (e) => {
        e.preventDefault();

        if (formularioOverlay.classList.contains("oculto")) {
            formularioOverlay.classList.remove("oculto");
            overlayAutoridade.classList.add("oculto");
        } else {
            formularioOverlay.classList.add("oculto");
        }
    });
}

// ==========================================
// ABRIR POP-UP DE TROCAR AUTORIDADE
// ==========================================

if (btnTrocarAutoridade && overlayAutoridade && formularioOverlay) {
    btnTrocarAutoridade.addEventListener("click", (e) => {
        e.preventDefault();

        if (overlayAutoridade.classList.contains("oculto")) {
            overlayAutoridade.classList.remove("oculto");
            formularioOverlay.classList.add("oculto");
        } else {
            overlayAutoridade.classList.add("oculto");
        }
    });
}

// ==========================================
// CADASTRAR USUÁRIO NA MESMA COOPERATIVA
// ==========================================

if (btnConfirm) {
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

        if (!coopUidAtual) {
            alert("Não foi possível identificar a cooperativa do administrador logado.");
            return;
        }

        try {
            const dbRef = ref(db);
            const snapshotUsuarios = await get(child(dbRef, "Usuarios"));

            if (snapshotUsuarios.exists()) {
                const usuarios = snapshotUsuarios.val();

                for (let uid in usuarios) {
                    if (usuarios[uid].email === email) {
                        alert("Este e-mail já está cadastrado.");
                        return;
                    }

                    if (usuarios[uid].cpf === cpf) {
                        alert("Este CPF já está cadastrado.");
                        return;
                    }

                    if (usuarios[uid].matricula === matricula) {
                        alert("Esta matrícula já está em uso.");
                        return;
                    }
                }
            }

            const cred = await createUserWithEmailAndPassword(secondAuth, email, senha);
            const novoUid = cred.user.uid;

            await set(ref(db, "Usuarios/" + novoUid), {
                nome: nome,
                cpf: cpf,
                email: email,
                matricula: matricula,
                tipo: tipo,
                userUid: novoUid,
                coopUid: coopUidAtual,
                dataCadastro: new Date().toISOString().split("T")[0]
            });

            await signOut(secondAuth);

            alert("Usuário criado com sucesso e vinculado à mesma cooperativa!");

            limparFormularioCadastroUsuario();

            if (formularioOverlay) {
                formularioOverlay.classList.add("oculto");
            }

            await carregarAdministradoresDaCooperativa();

        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            alert("Erro ao criar usuário: " + error.message);
        }
    });
}

// ==========================================
// CANCELAR CADASTRO DE USUÁRIO
// ==========================================

if (btnRefuse) {
    btnRefuse.addEventListener("click", (e) => {
        e.preventDefault();

        limparFormularioCadastroUsuario();

        if (formularioOverlay) {
            formularioOverlay.classList.add("oculto");
        }
    });
}

// ==========================================
// CONFIRMAR TROCA DE AUTORIDADE
// ==========================================

if (btnConfirmAutoridade) {
    btnConfirmAutoridade.addEventListener("click", async (e) => {
        e.preventDefault();

        const emailInformado = inputEmailAutoridade.value.trim();
        const matriculaInformada = inputMatriculaAutoridade.value.trim();
        const novoTipo = inputTipoAutoridade.value;

        if (!emailInformado || !matriculaInformada || !novoTipo) {
            alert("Informe o email, a matrícula e selecione o novo tipo de conta!");
            return;
        }

        if (!coopUidAtual) {
            alert("Não foi possível identificar a cooperativa atual.");
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
                const usuario = usuarios[uid];

                if (
                    usuario.email === emailInformado &&
                    usuario.matricula === matriculaInformada
                ) {
                    uidEncontrado = uid;
                    usuarioEncontrado = usuario;
                    break;
                }
            }

            if (!uidEncontrado) {
                alert("Nenhum usuário encontrado com esse email e matrícula.");
                return;
            }

            await update(ref(db, "Usuarios/" + uidEncontrado), {
                tipo: novoTipo,
                coopUid: coopUidAtual
            });

            alert(
                "Autoridade alterada com sucesso!\n\n" +
                "Nome: " + usuarioEncontrado.nome + "\n" +
                "Email: " + usuarioEncontrado.email + "\n" +
                "Matrícula: " + matriculaInformada + "\n" +
                "Novo tipo: " + novoTipo
            );

            limparFormularioTrocarAutoridade();

            if (overlayAutoridade) {
                overlayAutoridade.classList.add("oculto");
            }

            await carregarAdministradoresDaCooperativa();

        } catch (error) {
            console.error("Erro ao trocar autoridade:", error);
            alert("Erro ao trocar autoridade: " + error.message);
        }
    });
}

// ==========================================
// CANCELAR TROCA DE AUTORIDADE
// ==========================================

if (btnCancelAutoridade) {
    btnCancelAutoridade.addEventListener("click", (e) => {
        e.preventDefault();

        limparFormularioTrocarAutoridade();

        if (overlayAutoridade) {
            overlayAutoridade.classList.add("oculto");
        }
    });
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function limparFormularioCadastroUsuario() {
    if (inputNome) inputNome.value = "";
    if (inputCpf) inputCpf.value = "";
    if (inputEmail) inputEmail.value = "";
    if (inputSenha) inputSenha.value = "";
    if (inputMatricula) inputMatricula.value = "";
    if (inputTipo) inputTipo.value = "";
}

function limparFormularioTrocarAutoridade() {
    if (inputEmailAutoridade) inputEmailAutoridade.value = "";
    if (inputMatriculaAutoridade) inputMatriculaAutoridade.value = "";
    if (inputTipoAutoridade) inputTipoAutoridade.value = "";
}

function setTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function formatarCNPJ(cnpj) {
    const num = String(cnpj).replace(/\D/g, "");

    if (num.length !== 14) {
        return cnpj;
    }

    return num.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
    );
}

function formatarTelefone(telefone) {
    const num = String(telefone).replace(/\D/g, "");

    if (num.length !== 11) {
        return telefone;
    }

    return num.replace(
        /^(\d{2})(\d{5})(\d{4})$/,
        "($1) $2-$3"
    );
}

function formatarCEP(cep) {
    const num = String(cep).replace(/\D/g, "");

    if (num.length !== 8) {
        return cep;
    }

    return num.replace(
        /^(\d{5})(\d{3})$/,
        "$1-$2"
    );
}

function formatarData(data) {
    if (!data || !String(data).includes("-")) {
        return data || "Não informado";
    }

    const partes = String(data).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}