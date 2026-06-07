import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    get,
    child,
    push
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ==========================================
// CONFIGURAÇÃO FIREBASE
// ==========================================
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
const database = getDatabase(app);

// ==========================================
// SELEÇÃO DAS TELAS
// ==========================================
const TelaLogin = document.getElementById("idTelaLogin");
const TelaCadastro = document.getElementById("idTelaCadastro");
const TelaRegistroAdmin = document.getElementById("idTelaRegistroAdmin");
const TelaCadastroCoop = document.getElementById("idTelaCadastroCoop");
const TelaEsqueciSenha = document.getElementById("idTelaEsqueciSenha");

// Botões - Tela de Login
const btnToRegistroAdmin = document.getElementById("btnToRegistroAdmin");
const btnToEsqueciSenha = document.getElementById("btnToEsqueciSenha");

// Botões - Tela de Cadastro de Produtor
const btnToLogin = document.getElementById("btnToLogin");
const btnToCadastroCoop = document.getElementById("btnToCadastroCoop");

// Botões - Tela de Registro Admin
const btnToLoginFromAdminReg = document.getElementById("btnToLoginFromAdminReg");
const btnToCadastroCoopFromAdminReg = document.getElementById("btnToCadastroCoopFromAdminReg");

// Botões - Tela de Cadastro Cooperativa
const btnToLogin2 = document.getElementById("btnToLogin2");
const btnToRegistroAdminFromCoop = document.getElementById("btnToRegistroAdminFromCoop");

// Botão - Recuperação
const btnVoltarLoginRecuperar = document.getElementById("btnVoltarLoginRecuperar");

// Header
const btnEntrar = document.getElementById("btnEntrar");
const btnLogout = document.getElementById("btnLogout");

// ==========================================
// NAVEGAÇÃO ENTRE TELAS
// ==========================================
function ocultarTodasTelas() {
    if (TelaLogin) TelaLogin.classList.add("oculto");
    if (TelaCadastro) TelaCadastro.classList.add("oculto");
    if (TelaRegistroAdmin) TelaRegistroAdmin.classList.add("oculto");
    if (TelaCadastroCoop) TelaCadastroCoop.classList.add("oculto");
    if (TelaEsqueciSenha) TelaEsqueciSenha.classList.add("oculto");
}

function irParaLogin() {
    ocultarTodasTelas();

    if (TelaLogin) {
        TelaLogin.classList.remove("oculto");
    }
}

function irParaRegistroAdmin() {
    ocultarTodasTelas();

    if (TelaRegistroAdmin) {
        TelaRegistroAdmin.classList.remove("oculto");
    }
}

function irParaCadastroCoop() {
    ocultarTodasTelas();

    if (TelaCadastroCoop) {
        TelaCadastroCoop.classList.remove("oculto");
    }
}

function irParaEsqueciSenha() {
    ocultarTodasTelas();

    if (TelaEsqueciSenha) {
        TelaEsqueciSenha.classList.remove("oculto");
    }
}

// Eventos de navegação
if (btnToRegistroAdmin) {
    btnToRegistroAdmin.addEventListener("click", irParaRegistroAdmin);
}

if (btnToEsqueciSenha) {
    btnToEsqueciSenha.addEventListener("click", (e) => {
        e.preventDefault();
        irParaEsqueciSenha();
    });
}

if (btnToLogin) {
    btnToLogin.addEventListener("click", irParaLogin);
}

if (btnToCadastroCoop) {
    btnToCadastroCoop.addEventListener("click", irParaCadastroCoop);
}

if (btnToLoginFromAdminReg) {
    btnToLoginFromAdminReg.addEventListener("click", irParaLogin);
}

if (btnToCadastroCoopFromAdminReg) {
    btnToCadastroCoopFromAdminReg.addEventListener("click", irParaCadastroCoop);
}

if (btnToLogin2) {
    btnToLogin2.addEventListener("click", irParaLogin);
}

if (btnToRegistroAdminFromCoop) {
    btnToRegistroAdminFromCoop.addEventListener("click", irParaRegistroAdmin);
}

if (btnVoltarLoginRecuperar) {
    btnVoltarLoginRecuperar.addEventListener("click", irParaLogin);
}

// ==========================================
// TOAST / NOTIFICAÇÕES
// ==========================================
function mostrarToast(mensagem, tipo = "erro") {
    const container = document.getElementById("toast-container");

    if (!container) {
        alert(mensagem);
        return;
    }

    const toast = document.createElement("div");
    toast.classList.add("toast", tipo);
    toast.textContent = mensagem;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("mostrar");
    }, 10);

    setTimeout(() => {
        toast.classList.remove("mostrar");

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// ==========================================
// VALIDAÇÕES
// ==========================================
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenhaForte(senha) {
    return senha.length >= 8 &&
        /[A-Z]/.test(senha) &&
        /[a-z]/.test(senha) &&
        /[@$!%*?&_#\-]/.test(senha);
}

function validarCelular(telefone) {
    const num = telefone.replace(/\D/g, "");
    return num.length === 11 && num[2] === "9";
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
    }

    soma = 0;

    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    return resto === parseInt(cpf.substring(10, 11));
}

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, "");

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;

        if (pos < 2) {
            pos = 9;
        }
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado !== parseInt(digitos.charAt(0))) {
        return false;
    }

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;

        if (pos < 2) {
            pos = 9;
        }
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return resultado === parseInt(digitos.charAt(1));
}

// ==========================================
// COMUNICAÇÃO COM PHP
// ==========================================
async function enviarDadosParaPHP(dados) {
    try {
        const response = await fetch("../api/salvar.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultadoBack = await response.json();
        console.log("Resposta do PHP:", resultadoBack.mensagem);

    } catch (error) {
        console.error("Erro de sincronia PHP:", error);
    }
}

// ==========================================
// OBSERVADOR DE AUTENTICAÇÃO
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (btnEntrar) btnEntrar.style.display = "none";
        if (btnLogout) btnLogout.style.display = "inline-block";
    } else {
        if (btnEntrar) btnEntrar.style.display = "inline-block";
        if (btnLogout) btnLogout.style.display = "none";
    }
});

// ==========================================
// LOGOUT
// ==========================================
if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
        try {
            await signOut(auth);

            mostrarToast("Você saiu da sua conta.", "sucesso");
            irParaLogin();

        } catch (error) {
            console.error(error);
            mostrarToast("Erro ao sair.", "erro");
        }
    });
}

// ==========================================
// RECUPERAÇÃO DE SENHA
// ==========================================
const formEsqueciSenha = document.getElementById("formEsqueciSenha");

if (formEsqueciSenha) {
    formEsqueciSenha.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailRecuperar = document.getElementById("recuperarEmail").value.trim();

        if (!validarEmail(emailRecuperar)) {
            mostrarToast("Por favor, digite um formato de e-mail válido!", "erro");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, emailRecuperar);

            mostrarToast("E-mail de redefinição enviado com sucesso!", "sucesso");

            await enviarDadosParaPHP({
                email: emailRecuperar,
                matricula: "N/A",
                acao: "recuperacao_senha_solicitada"
            });

            formEsqueciSenha.reset();
            irParaLogin();

        } catch (error) {
            console.error(error);

            let mensagemErro = "Não foi possível enviar o e-mail de recuperação.";

            if (error.code === "auth/user-not-found") {
                mensagemErro = "Este e-mail não consta em nossa base de dados.";
            }

            mostrarToast(mensagemErro, "erro");
        }
    });
}

// ==========================================
// CADASTRO DO ADMINISTRADOR
// ==========================================
const formRegistroAdmin = document.getElementById("formRegistroAdmin");

if (formRegistroAdmin) {
    formRegistroAdmin.addEventListener("submit", async (e) => {
        e.preventDefault();

        const adminNome = document.getElementById("adminNome").value.trim();
        const adminEmail = document.getElementById("adminEmail").value.trim();
        const senha = document.getElementById("adminSenha").value;
        const repetirSenha = document.getElementById("adminRepetirSenha").value;

        if (!adminNome || !adminEmail || !senha || !repetirSenha) {
            mostrarToast("Preencha todos os campos obrigatórios!", "erro");
            return;
        }

        if (!validarEmail(adminEmail)) {
            mostrarToast("E-mail inválido!", "erro");
            return;
        }

        if (!validarSenhaForte(senha)) {
            mostrarToast("A senha precisa ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um símbolo.", "erro");
            return;
        }

        if (senha !== repetirSenha) {
            mostrarToast("As senhas não coincidem!", "erro");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, senha);
            const userUid = userCredential.user.uid;

            const adminData = {
                userUid: userUid,
                nome: adminNome,
                email: adminEmail,
                matricula: "pendente",
                tipo: "administrador",
                coopUid: null,
                dataCadastro: new Date().toISOString().split("T")[0]
            };

            await set(ref(database, `Usuarios/${userUid}`), adminData);

            await enviarDadosParaPHP({
                email: adminEmail,
                matricula: "pendente",
                acao: "cadastro_admin"
            });

            mostrarToast("Conta de administrador criada! Agora cadastre a cooperativa.", "sucesso");

            formRegistroAdmin.reset();

            setTimeout(() => {
                irParaCadastroCoop();
            }, 1200);

        } catch (error) {
            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                mostrarToast("Este e-mail já está em uso.", "erro");
            } else {
                mostrarToast("Erro ao criar conta de administrador.", "erro");
            }
        }
    });
}

// ==========================================
// CADASTRO DA COOPERATIVA
// ==========================================
const formCadastroCoop = document.getElementById("formCadastroCoop");

if (formCadastroCoop) {
    formCadastroCoop.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        const msgEtapa2 = document.getElementById("msgEtapa2");

        if (msgEtapa2) {
            msgEtapa2.style.display = "none";
        }

        if (!user) {
            mostrarToast("Você precisa criar uma conta de administrador antes de cadastrar a cooperativa.", "erro");

            if (msgEtapa2) {
                msgEtapa2.style.display = "block";
                msgEtapa2.textContent = "Você precisa estar logado como administrador para criar uma cooperativa.";
            }

            return;
        }

        try {
            const dbRef = ref(database);
            const snapshotUsuario = await get(child(dbRef, `Usuarios/${user.uid}`));

            if (!snapshotUsuario.exists()) {
                mostrarToast("Usuário não encontrado no banco de dados.", "erro");
                await signOut(auth);
                irParaLogin();
                return;
            }

            const dadosUsuario = snapshotUsuario.val();

            if (dadosUsuario.tipo !== "administrador") {
                mostrarToast("Somente administradores podem cadastrar cooperativas.", "erro");
                await signOut(auth);
                irParaLogin();
                return;
            }

        } catch (error) {
            console.error(error);
            mostrarToast("Erro ao validar administrador.", "erro");
            return;
        }

        const nomeCoop = document.getElementById("coopNome").value.trim();
        const cnpj = document.getElementById("coopCnpj").value.trim().replace(/\D/g, "");
        const coopMatricula = document.getElementById("coopMatricula").value.trim();
        const coopEmail = document.getElementById("coopEmail").value.trim();
        const telefone = document.getElementById("coopTelefone").value.trim().replace(/\D/g, "");
        const cep = document.getElementById("coopCep").value.trim().replace(/\D/g, "");
        const logradouro = document.getElementById("coopLogradouro").value.trim();
        const cidade = document.getElementById("coopCidade").value.trim();
        const estado = document.getElementById("coopEstado").value.trim().toUpperCase();

        if (!nomeCoop || !cnpj || !coopMatricula || !coopEmail || !telefone || !cep || !logradouro || !cidade || !estado) {
            mostrarToast("Preencha todos os campos da cooperativa!", "erro");
            return;
        }

        if (cep.length !== 8) {
            mostrarToast("CEP inválido!", "erro");
            return;
        }

        if (!validarCNPJ(cnpj)) {
            mostrarToast("CNPJ inválido!", "erro");
            return;
        }

        if (!validarCelular(telefone)) {
            mostrarToast("Celular inválido!", "erro");
            return;
        }

        if (!validarEmail(coopEmail)) {
            mostrarToast("E-mail da cooperativa inválido!", "erro");
            return;
        }

        try {
            const dbRef = ref(database);

            const snapshotCoops = await get(child(dbRef, "Cooperativas"));

            if (snapshotCoops.exists()) {
                const coops = snapshotCoops.val();

                for (let id in coops) {
                    if (coops[id].cnpj === cnpj) {
                        mostrarToast("Este CNPJ já está cadastrado!", "erro");
                        return;
                    }
                }
            }

            const snapshotUsuarios = await get(child(dbRef, "Usuarios"));

            if (snapshotUsuarios.exists()) {
                const usuarios = snapshotUsuarios.val();

                for (let id in usuarios) {
                    if (usuarios[id].matricula === coopMatricula) {
                        mostrarToast("Esta matrícula já está em uso!", "erro");
                        return;
                    }
                }
            }

            const coopUid = user.uid;
            const coopRef = ref(database, `Cooperativas/${coopUid}`);

            const novaCoop = {
                coopUid: coopUid,
                nome: nomeCoop,
                cnpj: cnpj,
                fundacao: new Date().toISOString().split("T")[0],
                contato: {
                    email: coopEmail,
                    telefone: telefone
                },
                endereco: {
                    logradouro: logradouro,
                    cidade: cidade,
                    estado: estado,
                    cep: cep
                }
            };

            await set(coopRef, novaCoop);

            await set(ref(database, `Usuarios/${user.uid}/coopUid`), coopUid);
            await set(ref(database, `Usuarios/${user.uid}/matricula`), coopMatricula);

            await enviarDadosParaPHP({
                email: coopEmail,
                matricula: coopMatricula,
                acao: "criacao_cooperativa"
            });

            formCadastroCoop.reset();

            mostrarToast("Cooperativa cadastrada com sucesso! Agora faça login com e-mail, senha e matrícula.", "sucesso");

            await signOut(auth);

            setTimeout(() => {
                irParaLogin();
            }, 1500);

        } catch (error) {
            console.error(error);
            mostrarToast("Erro ao cadastrar cooperativa.", "erro");
        }
    });
}

// ==========================================
// CADASTRO DE PRODUTOR
// ==========================================
const formCadastroUser = document.getElementById("formCadastroUser");

if (formCadastroUser) {
    formCadastroUser.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nomeUser = document.getElementById("userNome")?.value.trim();
        const cpfUser = document.getElementById("userCpf")?.value.trim().replace(/\D/g, "");
        const emailUser = document.getElementById("userEmail")?.value.trim();
        const senhaUser = document.getElementById("userSenha")?.value;
        const repetirSenhaUser = document.getElementById("userRepetirSenha")?.value;

        if (!nomeUser || !cpfUser || !emailUser || !senhaUser || !repetirSenhaUser) {
            mostrarToast("Preencha todos os campos do cadastro!", "erro");
            return;
        }

        if (!validarCPF(cpfUser)) {
            mostrarToast("CPF inválido!", "erro");
            return;
        }

        if (!validarEmail(emailUser)) {
            mostrarToast("E-mail inválido!", "erro");
            return;
        }

        if (!validarSenhaForte(senhaUser)) {
            mostrarToast("A senha precisa ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um símbolo.", "erro");
            return;
        }

        if (senhaUser !== repetirSenhaUser) {
            mostrarToast("As senhas não coincidem!", "erro");
            return;
        }

        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, "Usuarios"));

            if (snapshot.exists()) {
                const users = snapshot.val();

                for (let id in users) {
                    if (users[id].cpf === cpfUser) {
                        mostrarToast("Este CPF já está associado a outra conta!", "erro");
                        return;
                    }
                }
            }

            const userCredential = await createUserWithEmailAndPassword(auth, emailUser, senhaUser);
            const userUid = userCredential.user.uid;

            const novoUsuario = {
                userUid: userUid,
                nome: nomeUser,
                cpf: cpfUser,
                email: emailUser,
                tipo: "produtor",
                dataCadastro: new Date().toISOString().split("T")[0]
            };

            await set(ref(database, `Usuarios/${userUid}`), novoUsuario);

            await enviarDadosParaPHP({
                email: emailUser,
                matricula: cpfUser,
                acao: "cadastro_produtor"
            });

            mostrarToast("Cadastro de produtor realizado com sucesso!", "sucesso");

            formCadastroUser.reset();

            await signOut(auth);

            setTimeout(() => {
                irParaLogin();
            }, 1500);

        } catch (error) {
            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                mostrarToast("Este e-mail já está em uso.", "erro");
            } else {
                mostrarToast("Erro ao cadastrar produtor.", "erro");
            }
        }
    });
}

// ==========================================
// LOGIN - SOMENTE ADMINISTRADOR
// ==========================================
const formLoginElement = document.getElementById("formLogin");

if (formLoginElement) {
    formLoginElement.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailLogin = document.getElementById("loginEmail").value.trim();
        const senhaLogin = document.getElementById("loginSenha").value;
        const matriculaLogin = document.getElementById("loginMatricula").value.trim();

        if (!emailLogin || !senhaLogin || !matriculaLogin) {
            mostrarToast("Preencha todos os campos do login!", "erro");
            return;
        }

        if (!validarEmail(emailLogin)) {
            mostrarToast("Digite um e-mail válido.", "erro");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, emailLogin, senhaLogin);
            const user = userCredential.user;

            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `Usuarios/${user.uid}`));

            if (!snapshot.exists()) {
                mostrarToast("Usuário autenticado, mas sem cadastro no banco de dados.", "erro");
                await signOut(auth);
                return;
            }

            const dadosUsuario = snapshot.val();

            // BLOQUEIA QUALQUER USUÁRIO QUE NÃO SEJA ADMINISTRADOR
            if (dadosUsuario.tipo !== "administrador") {
                mostrarToast("Acesso restrito. Somente administradores podem fazer login.", "erro");
                await signOut(auth);
                return;
            }

            // CONFERE A MATRÍCULA DO ADMINISTRADOR
            if (String(dadosUsuario.matricula) !== String(matriculaLogin)) {
                mostrarToast("Matrícula incorreta para esta conta.", "erro");
                await signOut(auth);
                return;
            }

            // CONFERE SE O ADMIN TEM COOPERATIVA
            if (!dadosUsuario.coopUid) {
                mostrarToast("Este administrador ainda não possui cooperativa vinculada.", "erro");
                await signOut(auth);
                return;
            }

            mostrarToast(`Bem-vindo, ${dadosUsuario.nome}!`, "sucesso");

            await enviarDadosParaPHP({
                email: emailLogin,
                matricula: matriculaLogin,
                acao: "login_admin"
            });

            setTimeout(() => {
                window.location.href = "home.html";
            }, 1500);

        } catch (error) {
            console.error(error);

            let mensagem = "Falha na autenticação. Verifique os dados inseridos.";

            if (error.code === "auth/invalid-credential") {
                mensagem = "E-mail ou senha incorretos.";
            } else if (error.code === "auth/user-not-found") {
                mensagem = "Usuário não encontrado.";
            } else if (error.code === "auth/wrong-password") {
                mensagem = "Senha incorreta.";
            } else if (error.code === "auth/too-many-requests") {
                mensagem = "Muitas tentativas. Tente novamente mais tarde.";
            }

            mostrarToast(mensagem, "erro");
        }
    });
}