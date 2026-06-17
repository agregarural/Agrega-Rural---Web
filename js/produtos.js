import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue,
    push,
    remove,
    get,
    update
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
let produtoEditandoId = null;      // guarda o ID do produto em edição
let produtoEditandoImagem = null;  // guarda a URL atual da imagem

const IMGBB_API_KEY = "ac742aebcb5ef3bbef2489f934240205";

// ---------- Funções de upload de imagem ----------
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

// ---------- Autenticação e carregamento inicial ----------
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

// ---------- Botões principais e overlays ----------
const btnNovoProduto = document.getElementById("btnNovoProduto");
const btnNovaCategoria = document.getElementById("btnNovaCategoria");

const overlayAddProduto = document.getElementById("overlayAddProduto");
const formularioAddProduto = document.getElementById("formularioAddProduto");

const overlayAddCategoria = document.getElementById("overlayAddCategoria");
const formularioAddCategoria = document.getElementById("formularioAddCategoria");

const overlayEditProduto = document.getElementById("overlayEditProduto");
const formularioEditProduto = document.getElementById("formularioEditProduto");

// ---------- Abrir / fechar popups ----------
function abrirPopupAddProduto() {
    formularioAddProduto.reset();
    carregarCategoriasSelect("selectCategorias");
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

function abrirPopupEditarProduto(idProduto) {
    if (!produtoRef || !idCooperativa) return;

    // Buscar os dados completos do produto
    get(ref(db, `Cooperativas/${idCooperativa}/Produtos/${idProduto}`)).then(snapshot => {
        if (!snapshot.exists()) {
            alert("Produto não encontrado.");
            return;
        }

        const produto = snapshot.val();
        produtoEditandoId = idProduto;
        produtoEditandoImagem = produto.imagem || "";

        // Preencher campos
        document.getElementById("editNomeProduto").value = produto.nome || "";
        document.getElementById("editPrecoProduto").value = produto.preco || "";
        document.getElementById("editCustoProducao").value = produto.custo || "";
        document.getElementById("editEstoqueProduto").value = produto.estoque || "";
        document.getElementById("editDescricaoProduto").value = produto.descricao || "";

        // Carregar categorias no select de edição e selecionar a atual
        carregarCategoriasSelect("editSelectCategorias", produto.categoria);

        // Exibir preview da imagem atual
        const preview = document.getElementById("editPreviewImagem");
        if (produto.imagem) {
            preview.src = produto.imagem;
            preview.style.display = "block";
        } else {
            preview.style.display = "none";
        }

        // Limpar input file (caso tenha sido usado antes)
        document.getElementById("editImagemProduto").value = "";

        overlayEditProduto.classList.remove("oculto");
    }).catch(erro => {
        console.error("Erro ao buscar produto:", erro);
        alert("Erro ao carregar dados do produto.");
    });
}

function fecharPopupEditarProduto() {
    overlayEditProduto.classList.add("oculto");
    formularioEditProduto.reset();
    document.getElementById("editPreviewImagem").style.display = "none";
    produtoEditandoId = null;
    produtoEditandoImagem = null;
}

btnNovoProduto.addEventListener("click", abrirPopupAddProduto);
btnNovaCategoria.addEventListener("click", abrirPopupAddCategoria);

// Fechar overlays ao clicar fora
overlayAddProduto.addEventListener("click", (e) => {
    if (e.target === overlayAddProduto) fecharPopupAddProduto();
});
overlayAddCategoria.addEventListener("click", (e) => {
    if (e.target === overlayAddCategoria) fecharPopupAddCategoria();
});
overlayEditProduto.addEventListener("click", (e) => {
    if (e.target === overlayEditProduto) fecharPopupEditarProduto();
});

// ---------- Cadastrar novo produto ----------
const btnAddProduto = document.getElementById("btnAddProduto");
btnAddProduto.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!produtoRef) {
        alert("Aguarde a autenticação.");
        return;
    }

    const nome = document.getElementById("nomeProduto").value.trim();
    const categoria = document.getElementById("selectCategorias").value.trim();
    const preco = document.getElementById("precoProduto").value;
    const custo = document.getElementById("custoProducao").value;
    const estoque = document.getElementById("estoqueProduto").value;
    const descricao = document.getElementById("descricaoProduto").value.trim();
    const imagemInput = document.getElementById("imagemProduto");
    const fileImagem = imagemInput.files[0];

    if (!nome || !categoria || !preco || !estoque || !descricao || !fileImagem || !custo) {
        alert("Preencha todos os campos obrigatórios, incluindo a imagem.");
        return;
    }

    try {
        const urlImagem = await enviarImgbb(fileImagem);

        const novoProduto = {
            nome,
            categoria,
            preco: parseFloat(preco),
            custo: parseFloat(custo),
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

// ---------- Salvar edição do produto ----------
const btnSalvarEdicao = document.getElementById("btnSalvarEdicao");
btnSalvarEdicao.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!produtoEditandoId) {
        alert("Nenhum produto em edição.");
        return;
    }

    const nome = document.getElementById("editNomeProduto").value.trim();
    const categoria = document.getElementById("editSelectCategorias").value.trim();
    const preco = document.getElementById("editPrecoProduto").value;
    const custo = document.getElementById("editCustoProducao").value;
    const estoque = document.getElementById("editEstoqueProduto").value;
    const descricao = document.getElementById("editDescricaoProduto").value.trim();
    const imagemInput = document.getElementById("editImagemProduto");
    const fileImagem = imagemInput.files[0];

    if (!nome || !categoria || !preco || !estoque || !descricao || !custo) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    try {
        let urlImagem = produtoEditandoImagem; // mantém imagem atual por padrão

        // Se uma nova imagem foi selecionada, faz upload
        if (fileImagem) {
            urlImagem = await enviarImgbb(fileImagem);
        }

        const produtoAtualizado = {
            nome,
            categoria,
            preco: parseFloat(preco),
            custo: parseFloat(custo),
            estoque: parseInt(estoque),
            descricao,
            imagem: urlImagem
        };

        // Atualiza o nó específico do produto
        await update(ref(db, `Cooperativas/${idCooperativa}/Produtos/${produtoEditandoId}`), produtoAtualizado);

        alert("Produto atualizado com sucesso!");
        fecharPopupEditarProduto();
    } catch (erro) {
        console.error("Erro ao atualizar produto:", erro);
        alert("Erro ao atualizar produto.");
    }
});

// ---------- Carregar produtos ----------
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
    btnEditar.addEventListener("click", () => {
        abrirPopupEditarProduto(idProdFirebase);
    });

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

// ---------- Categorias ----------
const btnAddCategoria = document.getElementById("btnAddCategoria");
btnAddCategoria.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!categoriaRef) {
        alert("Aguarde a autenticação.");
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
        alert("Erro ao adicionar categoria.");
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
            criarCardCategoria(id, categoria.categoria, categoria.imagem);
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

// ---------- Função auxiliar para carregar categorias no select ----------
async function carregarCategoriasSelect(selectId, categoriaSelecionada = "") {
    const selectCategoria = document.getElementById(selectId);
    if (!selectCategoria) return;

    selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';

    if (!categoriaRef) return;

    const snapshot = await get(categoriaRef);

    if (!snapshot.exists()) return;

    const categorias = snapshot.val();

    Object.values(categorias).forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.categoria;
        option.textContent = cat.categoria;
        if (cat.categoria === categoriaSelecionada) {
            option.selected = true;
        }
        selectCategoria.appendChild(option);
    });
}