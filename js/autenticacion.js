import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// Seleção das Telas
const TelaLogin = document.getElementById("idTelaLogin");
const Telacadastro = document.getElementById("idTelaCadastro");
const TelaRegistroAdmin = document.getElementById("idTelaRegistroAdmin");
const TelacadastroCoop = document.getElementById("idTelaCadastroCoop");
const TelaEsqueciSenha = document.getElementById("idTelaEsqueciSenha");

// Botões de navegação – Tela de Login
const btnToRegistroAdmin = document.getElementById("btnToRegistroAdmin");   // "Criar conta de administrador"
const btnToEsqueciSenha = document.getElementById("btnToEsqueciSenha");

// Botões – Tela de Cadastro de Produtor
const btnToLogin = document.getElementById("btnToLogin");
const btnToCadastroCoop = document.getElementById("btnToCadastroCoop");     // "Cadastre sua cooperativa"

// Botões – Tela de Registro do Administrador
const btnToLoginFromAdminReg = document.getElementById("btnToLoginFromAdminReg");
const btnToCadastroCoopFromAdminReg = document.getElementById("btnToCadastroCoopFromAdminReg");

// Botões – Tela de Criação da Cooperativa
const btnToLogin2 = document.getElementById("btnToLogin2");
const btnToRegistroAdminFromCoop = document.getElementById("btnToRegistroAdminFromCoop");

// Botões – Recuperação de senha
const btnVoltarLoginRecuperar = document.getElementById("btnVoltarLoginRecuperar");

// Header
const btnEntrar = document.getElementById("btnEntrar");
const btnLogout = document.getElementById("btnLogout");

// ==========================================
// NAVEGAÇÃO ENTRE TELAS (somente por botões)
// ==========================================

// Função auxiliar
function ocultarTodasTelas() {
    TelaLogin.classList.add("oculto");
    Telacadastro.classList.add("oculto");
    TelaRegistroAdmin.classList.add("oculto");
    TelacadastroCoop.classList.add("oculto");
    TelaEsqueciSenha.classList.add("oculto");
}

const irParaLogin = () => {
    ocultarTodasTelas();
    TelaLogin.classList.remove("oculto");
};

// A partir do Login -> Registro de Administrador
if (btnToRegistroAdmin) {
    btnToRegistroAdmin.addEventListener("click", () => {
        ocultarTodasTelas();
        TelaRegistroAdmin.classList.remove("oculto");
    });
}

// A partir do Login -> Esqueci senha
if (btnToEsqueciSenha) {
    btnToEsqueciSenha.addEventListener("click", (e) => {
        e.preventDefault();
        ocultarTodasTelas();
        TelaEsqueciSenha.classList.remove("oculto");
    });
}

// Cadastro de Produtor -> Login
if (btnToLogin) btnToLogin.addEventListener("click", irParaLogin);
// Cadastro de Produtor -> Criação de Cooperativa
if (btnToCadastroCoop) {
    btnToCadastroCoop.addEventListener("click", () => {
        ocultarTodasTelas();
        TelacadastroCoop.classList.remove("oculto");
    });
}

// Registro de Administrador -> Login
if (btnToLoginFromAdminReg) btnToLoginFromAdminReg.addEventListener("click", irParaLogin);
// Registro de Administrador -> Criação de Cooperativa
if (btnToCadastroCoopFromAdminReg) {
    btnToCadastroCoopFromAdminReg.addEventListener("click", () => {
        ocultarTodasTelas();
        TelacadastroCoop.classList.remove("oculto");
    });
}

// Criação de Cooperativa -> Login
if (btnToLogin2) btnToLogin2.addEventListener("click", irParaLogin);
// Criação de Cooperativa -> Registro de Administrador
if (btnToRegistroAdminFromCoop) {
    btnToRegistroAdminFromCoop.addEventListener("click", () => {
        ocultarTodasTelas();
        TelaRegistroAdmin.classList.remove("oculto");
    });
}

// Recuperação de senha -> Login
if (btnVoltarLoginRecuperar) btnVoltarLoginRecuperar.addEventListener("click", irParaLogin);

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
// OBSERVADOR DE AUTENTICAÇÃO (header)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (btnEntrar) btnEntrar.style.display = "none";
        if (btnLogout) btnLogout.style.display = "inline-block";
    } else {
        if (btnEntrar) btnEntrar.style.display = "inline-block";
        if (btnLogout) btnLogout.style.display = "none";
    }
    // Nenhuma troca automática de formulários
});

// ==========================================
// NOTIFICAÇÕES
// ==========================================
function mostrarToast(mensagem, tipo = "erro") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.classList.add("toast", tipo);
    toast.textContent = mensagem;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("mostrar"), 10);

    setTimeout(() => {
        toast.classList.remove("mostrar");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================
// VALIDAÇÕES
// ==========================================
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validarSenhaForte(senha) {
    return senha.length >= 8 && /[A-Z]/.test(senha) && /[a-z]/.test(senha) && /[@$!%*?&_#\-]/.test(senha);
}
function validarCelular(telefone) {
    const num = telefone.replace(/\D/g, '');
    return num.length === 11 && num[2] === '9';
}
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
}
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0; let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho = tamanho + 1; numeros = cnpj.substring(0, tamanho); soma = 0; pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
}

// ==========================================
// CARREGAR COOPERATIVAS (para select do produtor)
// ==========================================
async function carregarCooperativasNoSelect() {
    const selectCoop = document.getElementById("userNomeCoop");
    if (!selectCoop) return;
    selectCoop.innerHTML = '<option value="">Selecione sua cooperativa...</option>';
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "Cooperativas"));
        if (snapshot.exists()) {
            const cooperativas = snapshot.val();
            for (let id in cooperativas) {
                const option = document.createElement("option");
                option.value = cooperativas[id].nome;
                option.textContent = cooperativas[id].nome;
                selectCoop.appendChild(option);
            }
        }
    } catch (error) { console.error("Erro ao listar cooperativas: ", error); }
}

// ==========================================
// COMUNICAÇÃO COM PHP (log)
// ==========================================
async function enviarDadosParaPHP(dados) {
    try {
        const response = await fetch("../api/salvar.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        const resultadoBack = await response.json();
        console.log("Resposta do PHP:", resultadoBack.mensagem);
    } catch (e) { console.error("Erro de sincronia PHP:", e); }
}

document.addEventListener("DOMContentLoaded", carregarCooperativasNoSelect);

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
            mostrarToast("E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.", "sucesso");
            await enviarDadosParaPHP({ email: emailRecuperar, matricula: "N/A", acao: "recuperacao_senha_solicitada" });
            formEsqueciSenha.reset();
        } catch (error) {
            console.error(error);
            let mensagemErro = "Não foi possível enviar o e-mail de recuperação.";
            if (error.code === "auth/user-not-found") mensagemErro = "Este e-mail não consta em nossa base de dados ativa.";
            mostrarToast(mensagemErro, "erro");
        }
    });
}

// ==========================================
// 1. REGISTRO DO ADMINISTRADOR (tela própria)
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
        if (!validarEmail(adminEmail)) { mostrarToast("E-mail inválido!", "erro"); return; }
        if (!validarSenhaForte(senha)) { mostrarToast("A senha precisa ter 8 caracteres, maiúsculas, minúsculas e símbolos.", "erro"); return; }
        if (senha !== repetirSenha) { mostrarToast("As senhas não coincidem!", "erro"); return; }

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
                dataCadastro: new Date().toISOString().split('T')[0]
            };
            await set(ref(database, `Usuarios/${userUid}`), adminData);
            mostrarToast("Conta criada com sucesso! Agora faça login e depois crie sua cooperativa.", "sucesso");
            await enviarDadosParaPHP({ email: adminEmail, matricula: "pendente", acao: "cadastro_admin" });
            await signOut(auth);
            formRegistroAdmin.reset();
            
        } catch (error) {
            console.error(error);
            if (error.code === "auth/email-already-in-use") {
                mostrarToast("Este e-mail já está em uso.", "erro");
            } else {
                mostrarToast("Erro ao criar conta.", "erro");
            }
        }
    });
}

// ==========================================
// 2. CRIAÇÃO DA COOPERATIVA (tela própria, exige login)
// ==========================================
const formCadastroCoop = document.getElementById("formCadastroCoop");
if (formCadastroCoop) {
    formCadastroCoop.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            mostrarToast("Você precisa estar logado para criar uma cooperativa. Faça login primeiro.", "erro");
            document.getElementById("msgEtapa2").style.display = "block";
            return;
        }

        document.getElementById("msgEtapa2").style.display = "none";

        const nomeCoop = document.getElementById("coopNome").value.trim();
        const cnpj = document.getElementById("coopCnpj").value.trim().replace(/\D/g, '');
        const coopMatricula = document.getElementById("coopMatricula").value.trim();
        const coopEmail = document.getElementById("coopEmail").value.trim();
        const telefone = document.getElementById("coopTelefone").value.trim().replace(/\D/g, '');
        const cep = document.getElementById("coopCep").value.trim().replace(/\D/g, '');
        const logradouro = document.getElementById("coopLogradouro").value.trim();
        const cidade = document.getElementById("coopCidade").value.trim();
        const estado = document.getElementById("coopEstado").value.trim().toUpperCase();

        if (!nomeCoop || !cnpj || !coopMatricula || !coopEmail || !telefone || !cep || !logradouro || !cidade || !estado) {
            mostrarToast("Preencha todos os campos da cooperativa!", "erro");
            return;
        }
        if (cep.length !== 8) { mostrarToast("CEP inválido!", "erro"); return; }
        if (!validarCNPJ(cnpj)) { mostrarToast("CNPJ inválido!", "erro"); return; }
        if (!validarCelular(telefone)) { mostrarToast("Celular inválido!", "erro"); return; }
        if (!validarEmail(coopEmail)) { mostrarToast("E-mail da cooperativa inválido!", "erro"); return; }

        try {
            const userUid = user.uid;
            const dbRef = ref(database);

            // Verifica CNPJ duplicado
            const snapshot = await get(child(dbRef, "Cooperativas"));
            if (snapshot.exists()) {
                const coops = snapshot.val();
                for (let id in coops) {
                    if (coops[id].cnpj === cnpj) {
                        mostrarToast("Este CNPJ já está cadastrado!", "erro");
                        return;
                    }
                }
            }

            // Cria a cooperativa
            const novaCoop = {
                coopUid: userUid,
                nome: nomeCoop,
                cnpj: cnpj,
                fundacao: new Date().toISOString().split('T')[0],
                contato: { email: coopEmail, telefone: telefone },
                endereco: { logradouro: logradouro, cidade: cidade, estado: estado, cep: cep }
            };
            await set(ref(database, `Cooperativas/${userUid}`), novaCoop);

            // Atualiza perfil do administrador
            await set(ref(database, `Usuarios/${userUid}/coopUid`), userUid);
            await set(ref(database, `Usuarios/${userUid}/matricula`), coopMatricula);

            mostrarToast("Cooperativa cadastrada com sucesso!", "sucesso");
            await enviarDadosParaPHP({ email: user.email, matricula: coopMatricula, acao: "criacao_cooperativa" });
            formCadastroCoop.reset();
            setTimeout(() => { window.location.href = "home.html"; }, 1500);
        } catch (error) {
            console.error(error);
            mostrarToast("Erro ao cadastrar cooperativa.", "erro");
        }
    });
}

// ==========================================
// 3. CADASTRO DE PRODUTOR (inalterado)
// ==========================================
const formCadastroUser = document.getElementById("formCadastroUser");
if (formCadastroUser) {
    formCadastroUser.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nomeUser = document.getElementById("userNome").value.trim();
        const cpfUser = document.getElementById("userCpf").value.trim().replace(/\D/g, '');
        const emailUser = document.getElementById("userEmail").value.trim();
        const nomeCoopVinc = document.getElementById("userNomeCoop").value;
        const matricula = document.getElementById("userMatricula").value.trim();
        const chaveAcesso = document.getElementById("userChaveAcesso").value.trim();
        const senhaUser = document.getElementById("userSenha").value;
        const repetirSenhaUser = document.getElementById("userRepetirSenha").value;

        if (!nomeUser || !cpfUser || !emailUser || !nomeCoopVinc || !matricula || !chaveAcesso || !senhaUser || !repetirSenhaUser) {
            mostrarToast("Preencha todos os campos da ficha de inscrição!", "erro");
            return;
        }
        if (!validarCPF(cpfUser)) { mostrarToast("CPF inválido!", "erro"); return; }
        if (!validarEmail(emailUser)) { mostrarToast("E-mail inválido!", "erro"); return; }
        if (!validarSenhaForte(senhaUser)) { mostrarToast("A senha necessita de 8 caracteres, maiúsculas, minúsculas e caracteres especiais.", "erro"); return; }
        if (senhaUser !== repetirSenhaUser) { mostrarToast("As senhas não coincidem!", "erro"); return; }

        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, "Usuarios"));
            if (snapshot.exists()) {
                const users = snapshot.val();
                for (let id in users) {
                    if (users[id].matricula === matricula) { mostrarToast("Esta matrícula já está em uso!", "erro"); return; }
                    if (users[id].cpf === cpfUser) { mostrarToast("Este CPF já está associado a outra conta!", "erro"); return; }
                }
            }
            const userCredential = await createUserWithEmailAndPassword(auth, emailUser, senhaUser);
            const userUid = userCredential.user.uid;
            const novoUsuario = {
                userUid: userUid, nome: nomeUser, cpf: cpfUser, email: emailUser,
                cooperativaNome: nomeCoopVinc, matricula: matricula, chaveAcesso: chaveAcesso,
                tipo: "produtor", dataCadastro: new Date().toISOString().split('T')[0]
            };
            await set(ref(database, `Usuarios/${userUid}`), novoUsuario);
            mostrarToast("Cadastro efetuado!", "sucesso");
            await enviarDadosParaPHP({ email: emailUser, matricula: cpfUser, acao: "cadastro_produtor" });
            formCadastroUser.reset();
        } catch (error) {
            console.error(error);
            mostrarToast(error.code === "auth/email-already-in-use" ? "E-mail indisponível para cadastro." : "Erro na persistência dos dados.", "erro");
        }
    });
}

// ===================================================
// 4. LOGIN (com bloqueio para admin sem cooperativa)
// ===================================================
const formLoginElement = document.getElementById("formLogin");
if (formLoginElement) {
    formLoginElement.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailLogin = document.getElementById("loginEmail").value.trim();
        const senhaLogin = document.getElementById("loginSenha").value;
        const matriculaLogin = document.getElementById("loginMatricula").value.trim();

        if (!emailLogin || !senhaLogin || !matriculaLogin) {
            mostrarToast("Preencha todos os campos do Login!", "erro");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, emailLogin, senhaLogin);
            const user = userCredential.user;
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `Usuarios/${user.uid}`));

            if (snapshot.exists()) {
                const dadosUsuario = snapshot.val();
                if (dadosUsuario.matricula === matriculaLogin) {

                    if (dadosUsuario.tipo !== "administrador") {
                        mostrarToast("Acesso restrito a administradores.", "erro");
                        return;
                    }

                    if (dadosUsuario.coopUid === null) {
                        mostrarToast("Você ainda não possui uma cooperativa. Acesse a tela 'Criar Cooperativa' para cadastrá-la.", "erro");
                        return;
                    }

                    mostrarToast(`Bem-vindo, ${dadosUsuario.nome}!`, "sucesso");
                    await enviarDadosParaPHP({ email: emailLogin, matricula: matriculaLogin, acao: "login_admin" });
                    setTimeout(() => { window.location.href = "home.html"; }, 1500);

                } else {
                    mostrarToast("Matrícula incorreta para esta conta.", "erro");
                }
            } else {
                mostrarToast("Dados não localizados.", "erro");
            }
        } catch (error) {
            console.error(error);
            let mensagem = "Falha na autenticação. Verifique os dados inseridos.";
            if (error.code === "auth/user-not-found") mensagem = "Usuário não encontrado.";
            else if (error.code === "auth/wrong-password") mensagem = "Senha incorreta.";
            mostrarToast(mensagem, "erro");
        }
    });
}