import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, get } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

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
const auth = getAuth(app);

let idCooperativa = null;
let produtoRef = null;

// ==========================================
// IMPORTANDO COMPONENTES
// ==========================================
fetch('../components/header.html')
    .then(res => res.text())
    .then(html => { document.getElementById('header-placeholder').innerHTML = html; });

fetch('../components/menuoptions.html')
    .then(res => res.text())
    .then(html => { document.getElementById("menu-options").innerHTML = html; });

// ==========================================
// CONFIGURANDO IMGBB
// ==========================================
const IMGBB_API_KEY = "ac742aebcb5ef3bbef2489f934240205";

async function enviarImgbb(file) {
    const formData = new FormData();
    formData.append("image", file);

    const resposta = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    });

    const dados = await resposta.json();
    if (!dados.success) throw new Error("Erro ao enviar imagem para o ImgBB");
    return dados.data.url;
}

// ==========================================
// AUTENTICAÇÃO E INICIALIZAÇÃO DE DADOS
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("Usuário não autenticado");
        return;
    }

    const snap = await get(ref(db, `Usuarios/${user.uid}`));
    if (snap.exists()) {
        idCooperativa = snap.val().coopUid;
        produtoRef = ref(db, `Cooperativas/${idCooperativa}/Produtos`);

        onValue(produtoRef, (snapshot) => {
            const dados = snapshot.val();
            const containerCards = document.getElementById("conatiner-cards-produto");
            containerCards.innerHTML = "";

            if (dados) {
                for (let id in dados) {
                    const produto = dados[id];
                    criarCardProduto(id, produto.nome, produto.categoria, produto.preco, produto.estoque, produto.imagem);
                }
            } else {
                containerCards.innerHTML = "<p>Nenhum produto cadastrado.</p>";
            }
        });
    }
});

// ==========================================
// POPUP: ABERTURA / FECHAMENTO
// ==========================================
const btnNovoProduto = document.getElementById("btnNovoProduto");
const btnNovaCategoria = document.getElementById("btnNovaCategoria");

const overlayAdd = document.getElementById("overlayAddProduto");
const popupAdd = document.getElementById("popupAddProduto");
const formularioAdd = document.getElementById("formularioAddProduto");

const overlayAddCategoria = document.getElementById("overlayAddCategoria");
const popupAddCategoria = document.getElementById("popupAddCategoria");
const formularioAddCategoria = document.getElementById("formularioAddCategoria");




function abrirPopupAdd() {
    formularioAdd.reset();
    document.getElementById("selectCategorias").selectedIndex = 0;
    carregarCategoriasSelect();
    overlayAdd.classList.remove("oculto");
}
function fecharPopupAdd() {
    overlayAdd.classList.add("oculto");
    formularioAdd.reset();
}

btnNovoProduto.addEventListener("click", abrirPopupAdd);
overlayAdd.addEventListener("click", (e) => {
    if (e.target === overlayAdd) {
        fecharPopupAdd();
    }
});





function abrirPopupAddCategoria() {
    document.getElementById("formularioAddCategoria").reset();
    document.getElementById("overlayAddCategoria").classList.remove("oculto");
}

function fecharPopupAddCategoria() {
    document.getElementById("overlayAddCategoria").classList.add("oculto");
    document.getElementById("formularioAddCategoria").reset();
}

btnNovaCategoria.addEventListener("click", abrirPopupAddCategoria);
overlayAddCategoria.addEventListener("click", (e) => {
    if (e.target === overlayAddCategoria) {
        fecharPopupAddCategoria();
    }
});



// ==========================================
// ADICIONAR PRODUTO NO DATABASE
// ==========================================
const btnAddProduto = document.getElementById("btnAddProduto");

btnAddProduto.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!produtoRef) {
        alert("Aguarde a autenticação antes de adicionar um produto.");
        return;
    }

    const nome = document.getElementById("nomeProduto").value.trim();
    const categoria = document.getElementById("selectCategorias").value.trim();
    const preco = document.getElementById("precoProduto").value;
    const estoque = document.getElementById("estoqueProduto").value;
    const descricao = document.getElementById("descricaoProduto").value.trim();
    const imagemInput = document.getElementById("imagemProduto");
    const fileImagem = imagemInput.files[0];

    if (!nome || !categoria || !preco || !estoque || !descricao || !fileImagem) {
        alert("Preencha todos os campos obrigatórios, incluindo a imagem.");
        return;
    }

    try {
        const urlImagem = await enviarImgbb(fileImagem);

        const novoProduto = {
            nome,
            categoria,
            preco: parseFloat(preco),
            estoque: parseInt(estoque),
            descricao,
            imagem: urlImagem
        };

        await push(produtoRef, novoProduto);
        alert("Produto adicionado com sucesso!");
        fecharPopupAdd();  // fecha e limpa o formulário

    } catch (erro) {
        console.error("Erro ao adicionar produto:", erro);
        alert("Erro ao adicionar produto. Tente novamente.");
    }
});

// ==========================================
// CRIAR CARD DE PRODUTO NA LISTA
// ==========================================
function criarCardProduto(idProdFirebase, produto, categoria, preco, estoque, imagem) {
    const containerCards = document.getElementById("conatiner-cards-produto");

    const card = document.createElement("div");
    card.className = "card-produto";
    card.dataset.id = idProdFirebase;

    const containerData = document.createElement("div");
    containerData.className = "container-data";

    const img = document.createElement("img");
    img.src = imagem;
    img.alt = produto;
    img.className = "imgCardView";
    img.onerror = () => { this.src = "../assets/img/perfil.jpg"; };

    const infoDiv = document.createElement("div");
    infoDiv.className = "card-info";

    const nomeEl = document.createElement("h4");
    nomeEl.classList.add("nome-produto");
    nomeEl.textContent = produto;

    const categoriaEl = document.createElement("p");
    categoriaEl.classList.add("info-produto");
    categoriaEl.textContent = `Categoria: ${categoria}`;

    const precoEl = document.createElement("p");
    precoEl.classList.add("info-produto");
    precoEl.textContent = `Preço: R$ ${parseFloat(preco).toFixed(2)}`;

    const estoqueEl = document.createElement("p");
    estoqueEl.classList.add("info-produto");
    estoqueEl.textContent = `Estoque: ${estoque} unid.`;

    infoDiv.append(nomeEl, categoriaEl, precoEl, estoqueEl);
    containerData.append(img, infoDiv);

    const actionDiv = document.createElement("div");
    actionDiv.className = "card-action";

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.classList.add("btn-editar");
    btnEditar.dataset.id = idProdFirebase;
    btnEditar.addEventListener("click", () => {
        alert("Funcionalidade de edição em desenvolvimento.");
    });

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.dataset.id = idProdFirebase;
    btnRemover.classList.add("btn-editar");
    btnRemover.addEventListener("click", () => {
        if (!idCooperativa) return;
        if (!confirm("Tem certeza que deseja remover este produto?")) return;

        const refRemover = ref(db, `Cooperativas/${idCooperativa}/Produtos/${idProdFirebase}`);
        remove(refRemover)
            .then(() => alert("Produto removido com sucesso."))
            .catch(() => alert("Erro ao remover produto."));
    });

    actionDiv.append(btnEditar, btnRemover);
    card.append(containerData, actionDiv);
    containerCards.append(card);
}


// ==========================================
// ADICIONAR CATEGORIA NO DATABASE
// ==========================================


const btnAddCategoria = document.getElementById("btnAddCategoria");

btnAddCategoria.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!idCooperativa) {
        alert("Aguarde a autenticação antes de adicionar uma categoria.");
        return;
    }

    const nomeCategoria = document.getElementById("nomeCategoria").value.trim();

    if (!nomeCategoria) {
        alert("Preencha o nome da categoria.");
        return;
    }

    try {
        const categoriaRef = ref(db, `Cooperativas/${idCooperativa}/Categorias`);

        const novaCategoria = {
            categoria: nomeCategoria
        };

        await push(categoriaRef, novaCategoria);
        alert("Categoria adicionada com sucesso!");
        fecharPopupAddCategoria();}
        catch (erro) {
        console.error("Erro ao adicionar categoria:", erro);
        alert("Erro ao adicionar categoria. Tente novamente.");
        }


});


async function carregarCategoriasSelect() {
    const selectCategoria = document.getElementById("selectCategorias");
    selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';

    if (!idCooperativa) return;

    const categoriaRef = ref(db, `Cooperativas/${idCooperativa}/Categorias`);
    const snapshot = await get(categoriaRef);

    if (snapshot.exists()) {
        const categorias = snapshot.val();
        Object.values(categorias).forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.categoria;
            option.textContent = cat.categoria;
            selectCategoria.appendChild(option);
        });
    }
}