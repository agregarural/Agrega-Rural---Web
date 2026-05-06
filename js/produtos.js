import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js";



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
var idCooperativa = '01';
const produtoRef = ref(db, `Cooperativas/${idCooperativa}/Produtos`)

const storage = getStorage(app);

//Importando Header
fetch('../components/header.html')
    .then(res => res.text())
    .then(html => { document.getElementById('header-placeholder').innerHTML = html; });

//Importando menuOptions
fetch('../components/menuoptions.html')
    .then(res => res.text())
    .then(html => { document.getElementById("menu-options").innerHTML = html; });


//Configurando Image Baby
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





//Função adicionar Produto no database

const btnAddNovoProduto = document.getElementById("btnAddProduto");

btnAddNovoProduto.addEventListener("click", async (event) => {
  event.preventDefault();

  const nomeProduto = document.getElementById("nomeProduto").value.trim();
  const categoriaProduto = document.getElementById("categoriaProduto").value.trim();
  const precoProduto = document.getElementById("precoProduto").value;
  const estoqueProduto = document.getElementById("estoqueProduto").value;
  const descricaoProduto = document.getElementById("descricaoProduto").value.trim();

  const inputImagem = document.getElementById("imagemProduto");
  const fileImagem = inputImagem.files[0];

  if (!nomeProduto || !categoriaProduto || !precoProduto || !estoqueProduto || !descricaoProduto || !fileImagem) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  try {
    const urlImagem = await enviarImgbb(fileImagem);

    const novoProduto = {
      nome: nomeProduto,
      categoria: categoriaProduto,
      preco: parseFloat(precoProduto),
      estoque: parseInt(estoqueProduto),
      descricao: descricaoProduto,
      imagem: urlImagem
    };

    await push(produtoRef, novoProduto);

    alert("Produto adicionado");

    document.getElementById("formulario").reset();
    document.getElementById("container-form").classList.add("oculto");

  } catch (erro) {
    console.error("Erro ao adicionar produto:", erro);
    alert("Erro ao adicionar produto");
  }
  
});



//Função Criar cardview exibicional




function criarCardProduto(idProdFirebase, produto, categoria, preco, estoque, imagem) {

    const containerCards = document.getElementById("conatiner-cards-produto");

    //configurando card
    const card = document.createElement("div");
    card.className = "card-produto";
    card.dataset.id = idProdFirebase;

    const containerData = document.createElement("div")
    containerData.className = "container-data";

    //configurando elemento de imagem do carview

    const img = document.createElement("img");
    img.src = imagem;
    img.alt = produto;
    img.className = "imgCardView"

    //configurando elementos de informação

    const infoDiv = document.createElement("div");
    infoDiv.className = "card-info";

    const nomeP = document.createElement("h4");
    nomeP.classList.add("nome-produto")
    nomeP.textContent = produto;

    const categoriaP = document.createElement("p");
    categoriaP.classList.add("info-produto")
    categoriaP.textContent = `Categoria: ${categoria}`;

    const precoP = document.createElement("p");
    precoP.classList.add("info-produto")
    precoP.textContent = `Preço: R$ ${parseFloat(preco).toFixed(2)}`;

    const estoqueP = document.createElement("p");
    estoqueP.classList.add("info-produto")
    estoqueP.textContent = `Estoque: ${estoque} unid.`;


    infoDiv.append(nomeP);
    infoDiv.append(categoriaP);
    infoDiv.append(precoP);
    infoDiv.append(estoqueP);

    containerData.append(img, infoDiv);

    //configurando elementos de interação

    const actionDiv = document.createElement("div")
    actionDiv.className = "card-action"

    const btnEditar = document.createElement("button")
    btnEditar.textContent = "Editar"
    btnEditar.classList.add("btn-editar")
    btnEditar.dataset.id = idProdFirebase

    const btnRemover = document.createElement("button")
    btnRemover.textContent = "Remover"
    btnRemover.dataset.id = idProdFirebase
    btnRemover.classList.add("btn-editar")

    btnRemover.addEventListener("click", () => {

        const refRemoverProd = ref(db, `Cooperativas/${idCooperativa}/Produtos/${idProdFirebase}`);
        remove(refRemoverProd)
            .then(() => {
                alert("Produto removido com sucesso")
            })
            .catch(() => {
                alert("Erro")
            })

    })

    btnEditar.addEventListener("click", () => {

        alert("Botão editar em progresso");

    })


    actionDiv.append(btnEditar);
    actionDiv.append(btnRemover);



    card.append(containerData);
    card.append(actionDiv);

    containerCards.append(card);



}


// configurando btn Novo Produto

const btnNovoProduto = document.getElementById("btnNovoProduto")
const formNovoProduto = document.getElementById("container-form")




formNovoProduto.classList.add("oculto")

btnNovoProduto.addEventListener("click", () => {

    if (formNovoProduto.classList.contains("oculto")) {

        formNovoProduto.classList.remove("oculto");

    } else {

        formNovoProduto.classList.add("oculto");

    }

})


//Impridindo produtos database (READ)


onValue(produtoRef, (snapshot) => {

    const dados = snapshot.val();


    const containerCards = document.getElementById("conatiner-cards-produto");
    containerCards.innerHTML = "";

    if (dados) {

        for (let id in dados) {
            const produto = dados[id];

            criarCardProduto(
                id,
                produto.nome,
                produto.categoria,
                produto.preco,
                produto.estoque,
                produto.imagem
            );
        }
    } else {

        containerCards.innerHTML = "SEM PRODUTOS"
    }


});