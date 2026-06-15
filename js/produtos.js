import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue,
    push,
    remove,
    get
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

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
let categoriaRef = null;

fetch("../components/header.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById("header-placeholder").innerHTML = html;
    });

fetch("../components/menuoptions.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById("menu-options").innerHTML = html;
    });

const IMGBB_API_KEY = "ac742aebcb5ef3bbef2489f934240205";

async function enviarImgbb(file) {
    const formData = new FormData();
    formData.append("image", file);

    const resposta = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    });

    const dados = await resposta.json();

    if (!dados.success) {
        throw new Error("Erro ao enviar imagem para o ImgBB");
    }

    return dados.data.url;
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("Usuário não autenticado");
        return;
    }

    const snap = await get(ref(db, `Usuarios/${user.uid}`));

    if (!snap.exists()) {
        alert("Usuário não encontrado no banco de dados.");
        return;
    }

    idCooperativa = snap.val().coopUid;

    produtoRef = ref(db, `Cooperativas/${idCooperativa}/Produtos`);
    categoriaRef = ref(db, `Cooperativas/${idCooperativa}/Categorias`);

    carregarProdutos();
    carregarCategorias();
});

const btnNovoProduto = document.getElementById("btnNovoProduto");
const btnNovaCategoria = document.getElementById("btnNovaCategoria");

const overlayAddProduto = document.getElementById("overlayAddProduto");
const formularioAddProduto = document.getElementById("formularioAddProduto");

const overlayAddCategoria = document.getElementById("overlayAddCategoria");
const formularioAddCategoria = document.getElementById("formularioAddCategoria");

function abrirPopupAddProduto() {
    formularioAddProduto.reset();
    carregarCategoriasSelect();
    overlayAddProduto.classList.remove("oculto");
}

function fecharPopupAddProduto() {
    overlayAddProduto.classList.add("oculto");
    formularioAddProduto.reset();
}

function abrirPopupAddCategoria() {
    formularioAddCategoria.reset();
    overlayAddCategoria.classList.remove("oculto");
}

function fecharPopupAddCategoria() {
    overlayAddCategoria.classList.add("oculto");
    formularioAddCategoria.reset();
}

btnNovoProduto.addEventListener("click", abrirPopupAddProduto);
btnNovaCategoria.addEventListener("click", abrirPopupAddCategoria);

overlayAddProduto.addEventListener("click", (e) => {
    if (e.target === overlayAddProduto) {
        fecharPopupAddProduto();
    }
});

overlayAddCategoria.addEventListener("click", (e) => {
    if (e.target === overlayAddCategoria) {
        fecharPopupAddCategoria();
    }
});

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
        fecharPopupAddProduto();

    } catch (erro) {
        console.error("Erro ao adicionar produto:", erro);
        alert("Erro ao adicionar produto. Tente novamente.");
    }
});

function carregarProdutos() {
    onValue(produtoRef, (snapshot) => {
        const containerCards = document.getElementById("conatiner-cards-produto");
        containerCards.innerHTML = "";

        if (!snapshot.exists()) {
            containerCards.innerHTML = "<p>Nenhum produto cadastrado.</p>";
            return;
        }

        const produtos = snapshot.val();

        for (let id in produtos) {
            const produto = produtos[id];

            criarCardProduto(
                id,
                produto.nome,
                produto.categoria,
                produto.preco,
                produto.estoque,
                produto.imagem
            );
        }
    });
}

function criarCardProduto(idProdFirebase, produto, categoria, preco, estoque, imagem) {
    const containerCards = document.getElementById("conatiner-cards-produto");

    const card = document.createElement("div");
    card.className = "card-produto";
    card.dataset.id = idProdFirebase;

    const containerData = document.createElement("div");
    containerData.className = "container-data";

    const img = document.createElement("img");
    img.src = imagem || "../assets/img/perfil.jpg";
    img.alt = produto;
    img.className = "imgCardView";
    img.onerror = function () {
        this.src = "../assets/img/perfil.jpg";
    };

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

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.classList.add("btn-editar");

    btnRemover.addEventListener("click", async () => {
        if (!confirm("Tem certeza que deseja remover este produto?")) return;

        try {
            await remove(ref(db, `Cooperativas/${idCooperativa}/Produtos/${idProdFirebase}`));
            alert("Produto removido com sucesso.");
        } catch (erro) {
            console.error("Erro ao remover produto:", erro);
            alert("Erro ao remover produto.");
        }
    });

    actionDiv.append(btnEditar, btnRemover);
    card.append(containerData, actionDiv);
    containerCards.append(card);
}

const btnAddCategoria = document.getElementById("btnAddCategoria");

btnAddCategoria.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!categoriaRef) {
        alert("Aguarde a autenticação antes de adicionar uma categoria.");
        return;
    }

    const nomeCategoria = document.getElementById("nomeCategoria").value.trim();
    const imagemInput = document.getElementById("imagemCategoria");
    const fileImagem = imagemInput.files[0];

    if (!nomeCategoria || !fileImagem) {
        alert("Preencha o nome da categoria e selecione uma imagem.");
        return;
    }

    try {
        const urlImagem = await enviarImgbb(fileImagem);

        const novaCategoria = {
            categoria: nomeCategoria,
            imagem: urlImagem
        };

        await push(categoriaRef, novaCategoria);

        alert("Categoria adicionada com sucesso!");
        fecharPopupAddCategoria();

    } catch (erro) {
        console.error("Erro ao adicionar categoria:", erro);
        alert("Erro ao adicionar categoria. Tente novamente.");
    }
});

function carregarCategorias() {
    onValue(categoriaRef, (snapshot) => {
        const containerCards = document.getElementById("conatiner-cards-categoria");
        containerCards.innerHTML = "";

        if (!snapshot.exists()) {
            containerCards.innerHTML = "<p>Nenhuma categoria cadastrada.</p>";
            return;
        }

        const categorias = snapshot.val();

        for (let id in categorias) {
            const categoria = categorias[id];

            criarCardCategoria(
                id,
                categoria.categoria,
                categoria.imagem
            );
        }
    });
}

function criarCardCategoria(idCategoriaFirebase, nomeCategoria, imagemCategoria) {
    const containerCards = document.getElementById("conatiner-cards-categoria");

    const card = document.createElement("div");
    card.className = "card-produto";
    card.dataset.id = idCategoriaFirebase;

    const containerData = document.createElement("div");
    containerData.className = "container-data";

    const img = document.createElement("img");
    img.src = imagemCategoria || "../assets/img/perfil.jpg";
    img.alt = nomeCategoria;
    img.className = "imgCardView";
    img.onerror = function () {
        this.src = "../assets/img/perfil.jpg";
    };

    const infoDiv = document.createElement("div");
    infoDiv.className = "card-info";

    const nomeEl = document.createElement("h4");
    nomeEl.classList.add("nome-produto");
    nomeEl.textContent = nomeCategoria;

    infoDiv.append(nomeEl);
    containerData.append(img, infoDiv);

    const actionDiv = document.createElement("div");
    actionDiv.className = "card-action";

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.classList.add("btn-editar");

    btnRemover.addEventListener("click", async () => {
        if (!confirm("Tem certeza que deseja remover esta categoria? Todos os produtos dessa categoria também serão excluídos.")) return;

        try {
            const snapshotProdutos = await get(produtoRef);

            if (snapshotProdutos.exists()) {
                const produtos = snapshotProdutos.val();

                for (let idProduto in produtos) {
                    if (produtos[idProduto].categoria === nomeCategoria) {
                        await remove(ref(db, `Cooperativas/${idCooperativa}/Produtos/${idProduto}`));
                    }
                }
            }

            await remove(ref(db, `Cooperativas/${idCooperativa}/Categorias/${idCategoriaFirebase}`));

            alert("Categoria e produtos relacionados removidos com sucesso.");

        } catch (erro) {
            console.error("Erro ao remover categoria:", erro);
            alert("Erro ao remover categoria.");
        }
    });

    actionDiv.append(btnRemover);
    card.append(containerData, actionDiv);
    containerCards.append(card);
}

async function carregarCategoriasSelect() {
    const selectCategoria = document.getElementById("selectCategorias");
    selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';

    if (!categoriaRef) return;

    const snapshot = await get(categoriaRef);

    if (!snapshot.exists()) return;

    const categorias = snapshot.val();

    Object.values(categorias).forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.categoria;
        option.textContent = cat.categoria;
        selectCategoria.appendChild(option);
    });
}