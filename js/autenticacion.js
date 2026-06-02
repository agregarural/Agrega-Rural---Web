import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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
const TelacadastroCoop = document.getElementById("idTelaCadastroCoop");
const TelaEsqueciSenha = document.getElementById("idTelaEsqueciSenha"); // Nova Tela

// Botões de navegação existentes
const btnToCadastro = document.getElementById("btnToCadastro");
const btnToCadastroCoop = document.getElementById("btnToCadastroCoop");
const btnToLogin = document.getElementById("btnToLogin");
const btnToLogin2 = document.getElementById("btnToLogin2");

// Novos Botões para Esqueci a Senha
const btnToEsqueciSenha = document.getElementById("btnToEsqueciSenha"); // Crie este botão/link na sua Tela de Login antiga
const btnVoltarLoginRecuperar = document.getElementById("btnVoltarLoginRecuperar");

// Lógica de alternar telas (Atualizada)
if (btnToCadastro) {
    btnToCadastro.addEventListener("click", () => {
        TelaLogin.classList.add("oculto");
        TelacadastroCoop.classList.add("oculto");
        if(TelaEsqueciSenha) TelaEsqueciSenha.classList.add("oculto");
        Telacadastro.classList.remove("oculto");
        carregarCooperativasNoSelect();
    });
}

if (btnToCadastroCoop) {
    btnToCadastroCoop.addEventListener("click", () => {
        TelaLogin.classList.add("oculto");
        Telacadastro.classList.add("oculto");
        if(TelaEsqueciSenha) TelaEsqueciSenha.classList.add("oculto");
        TelacadastroCoop.classList.remove("oculto");
    });
}

if (btnToEsqueciSenha) {
    btnToEsqueciSenha.addEventListener("click", (e) => {
        e.preventDefault();
        TelaLogin.classList.add("oculto");
        Telacadastro.classList.add("oculto");
        TelacadastroCoop.classList.add("oculto");
        TelaEsqueciSenha.classList.remove("oculto");
    });
}

const voltarParaLogin = () => {
    if (Telacadastro) Telacadastro.classList.add("oculto");
    if (TelacadastroCoop) TelacadastroCoop.classList.add("oculto");
    if (TelaEsqueciSenha) TelaEsqueciSenha.classList.add("oculto");
    if (TelaLogin) TelaLogin.classList.remove("oculto");
};

if (btnToLogin) btnToLogin.addEventListener("click", voltarParaLogin);
if (btnToLogin2) btnToLogin2.addEventListener("click", voltarParaLogin);
if (btnVoltarLoginRecuperar) btnVoltarLoginRecuperar.addEventListener("click", voltarParaLogin);

// Notificações flutuantes (Toasts)
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

// Funções Auxiliares de Validação
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
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
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

// Carregamento de Cooperativas
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

// Comunicação com API PHP
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
// FORMULÁRIO NOVO: LOGICA DE RECUPERAÇÃO
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
            // Executa a chamada nativa do Firebase Auth
            await sendPasswordResetEmail(auth, emailRecuperar);
            mostrarToast("E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.", "sucesso");
            
            // Registra a ação no seu log do PHP de forma segura
            await enviarDadosParaPHP({
                email: emailRecuperar,
                matricula: "N/A",
                acao: "recuperacao_senha_solicitada"
            });
            
            formEsqueciSenha.reset();
            setTimeout(voltarParaLogin, 2500); // Retorna o produtor/coop para a tela de login
            
        } catch (error) {
            console.error(error);
            let mensagemErro = "Não foi possível enviar o e-mail de recuperação.";
            if (error.code === "auth/user-not-found") {
                mensagemErro = "Este e-mail não consta em nossa base de dados ativa.";
            }
            mostrarToast(mensagemErro, "erro");
        }
    });
}

// ==========================================
// 1. CADASTRO DE COOPERATIVA (Mantido idêntico)
// ==========================================
const formCadastroCoop = document.getElementById("formCadastroCoop");
if (formCadastroCoop) {
    formCadastroCoop.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nomeCoop = document.getElementById("coopNome").value.trim();
        const cnpj = document.getElementById("coopCnpj").value.trim().replace(/\D/g, '');
        const admEmail = document.getElementById("admEmail").value.trim();
        const coopEmail = document.getElementById("coopEmail").value.trim();
        const telefone = document.getElementById("coopTelefone").value.trim().replace(/\D/g, '');
        const cep = document.getElementById("coopCep").value.trim().replace(/\D/g, '');
        const logradouro = document.getElementById("coopLogradouro").value.trim();
        const cidade = document.getElementById("coopCidade").value.trim();
        const estado = document.getElementById("coopEstado").value.trim().toUpperCase();
        const senha = document.getElementById("coopSenha").value;
        const repetirSenha = document.getElementById("coopRepetirSenha").value;

        if (!nomeCoop || !cnpj || !admEmail || !coopEmail || !telefone || !cep || !logradouro || !cidade || !estado || !senha || !repetirSenha) {
            mostrarToast("Por favor, preencha todos os campos corporativos!", "erro");
            return;
        }
        if (cep.length !== 8) { return mostrarToast("O CEP informado deve conter exatamente 8 números!", "erro"); }
        if (!validarCNPJ(cnpj)) { return mostrarToast("O CNPJ inserido é inválido!", "erro"); }
        if (!validarCelular(telefone)) { return mostrarToast("Celular inválido! Use o formato DDD + 9 dígitos.", "erro"); }
        if (!validarEmail(coopEmail) || !validarEmail(admEmail)) { return mostrarToast("E-mails com formato incorreto!", "erro"); }
        if (!validarSenhaForte(senha)) { return mostrarToast("A senha precisa ter no mínimo 8 caracteres, letras maiúsculas, minúsculas e símbolos.", "erro"); }
        if (senha !== repetirSenha) { return mostrarToast("As senhas informadas não batem!", "erro"); }

        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, "Cooperativas"));
            if (snapshot.exists()) {
                const coops = snapshot.val();
                for (let id in coops) {
                    if (coops[id].cnpj === cnpj) { return mostrarToast("Este CNPJ já está cadastrado!", "erro"); }
                }
            }
            const userCredential = await createUserWithEmailAndPassword(auth, admEmail, senha);
            const userUid = userCredential.user.uid;
            const novaCoop = {
                coopUid: userUid, nome: nomeCoop, cnpj: cnpj,
                fundacao: new Date().toISOString().split('T')[0],
                contato: { email: coopEmail, telefone: telefone },
                endereco: { logradouro: logradouro, cidade: cidade, estado: estado, cep: cep }
            };
            await set(ref(database, `Cooperativas/${userUid}`), novaCoop);
            mostrarToast("Cooperativa registrada com sucesso!", "sucesso");
            await enviarDadosParaPHP({ email: admEmail, matricula: cnpj, acao: "cadastro_cooperativa" });
            formCadastroCoop.reset();
            setTimeout(voltarParaLogin, 1500);
        } catch (error) {
            console.error(error);
            mostrarToast(error.code === "auth/email-already-in-use" ? "O e-mail informado já está em uso." : "Erro no servidor de autenticação.", "erro");
        }
    });
}

// ==========================================
// 2. CADASTRO DE PRODUTOR (Mantido idêntico)
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
        if (!validarCPF(cpfUser)) { return mostrarToast("CPF inválido!", "erro"); }
        if (!validarEmail(emailUser)) { return mostrarToast("E-mail inválido!", "erro"); }
        if (!validarSenhaForte(senhaUser)) { return mostrarToast("A senha necessita de 8 caracteres, maiúsculas, minúsculas e caracteres especiais.", "erro"); }
        if (senhaUser !== repetirSenhaUser) { return mostrarToast("As senhas não coincidem!", "erro"); }

        try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, "Usuarios"));
            if (snapshot.exists()) {
                const users = snapshot.val();
                for (let id in users) {
                    if (users[id].matricula === matricula) { return mostrarToast("Esta matrícula já está em uso!", "erro"); }
                    if (users[id].cpf === cpfUser) { return mostrarToast("Este CPF já está associado a outra conta!", "erro"); }
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
            setTimeout(voltarParaLogin, 1500);
        } catch (error) {
            console.error(error);
            mostrarToast(error.code === "auth/email-already-in-use" ? "E-mail indisponível para cadastro." : "Erro na persistência dos dados.", "erro");
        }
    });
}

// ==========================================
// 3. ENTRADA / LOGIN (Mantido idêntico)
// ==========================================
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
                    mostrarToast(`Bem-vindo, ${dadosUsuario.nome}!`, "sucesso");
                    await enviarDadosParaPHP({ email: emailLogin, matricula: matriculaLogin, acao: "login_produtor" });
                    setTimeout(() => { window.location.href = "home.html"; }, 1500);
                } else { mostrarToast("Matrícula incorreta para esta conta.", "erro"); }
            } else {
                const snapshotCoop = await get(child(dbRef, `Cooperativas/${user.uid}`));
                if (snapshotCoop.exists()) {
                    mostrarToast("Painel Admin Acessado!", "sucesso");
                    await enviarDadosParaPHP({ email: emailLogin, matricula: matriculaLogin, acao: "login_cooperativa" });
                    setTimeout(() => { window.location.href = "cooperativa.html"; }, 1500);
                } else { mostrarToast("Dados não localizados.", "erro"); }
            }
        } catch (error) {
            console.error(error);
            mostrarToast("Falha na autenticação. Verifique os dados inseridos.", "erro");
        }
    });
}