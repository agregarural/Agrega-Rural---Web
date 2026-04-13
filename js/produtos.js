import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDgDXi-X6vk-ei_Sp_9PUlB745gHcapB4w",
    authDomain: "aprendendo-firebase-pedro.firebaseapp.com",
    databaseURL: "https://aprendendo-firebase-pedro-default-rtdb.firebaseio.com",
    projectId: "aprendendo-firebase-pedro",
    storageBucket: "aprendendo-firebase-pedro.firebasestorage.app",
    messagingSenderId: "144229941890",
    appId: "1:144229941890:web:37274dbafa54ecc1272a9b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const produtoRef = ref(db, 'Produto')


//Importando Header
fetch('../components/header.html')
    .then(res => res.text())
    .then(html => { document.getElementById('header-placeholder').innerHTML = html; });

//Importando menuOptions
fetch('../components/menuoptions.html')
    .then(res => res.text())
    .then(html => { document.getElementById("menu-options").innerHTML = html; });







//Função adicionar Produto no database

const btnAddNovoProduto = document.getElementById("btnAddProduto");

btnAddNovoProduto.addEventListener("click", () => {



    const nomeProduto = document.getElementById("nomeProduto").value.trim();
    const categoriaProduto = document.getElementById("categoriaProduto").value.trim();
    const precoProduto = document.getElementById("precoProduto").value;
    const estoqueProduto = document.getElementById("estoqueProduto").value;
    const descricaoProduto = document.getElementById("descricaoProduto").value.trim();

    if (!nomeProduto || !categoriaProduto || !precoProduto || !estoqueProduto || !descricaoProduto) {

        alert("Preencha os campos obrigatorios"); return;
    }



    const novoProduto = {

        nome: nomeProduto,
        categoria: categoriaProduto,
        preco: parseFloat(precoProduto),
        estoque: parseInt(estoqueProduto),
        descricao: descricaoProduto

    }

    push(produtoRef, novoProduto)
    .then(() => {
        alert("produto adicionado");
        document.getElementById("formulario").reset();
        document.getElementById("container-form").classList.add("oculto");
    })
    .catch((erro) => {
        console.error("erro ao adicionar", erro);
        
    });


});

//Função Remover Produto do dtabase na tabela






//Função Imprimir Produto do dtabase na tabela

function addProdutoInTable(idProdFirebase, produto, categoria, preco, estoque) {


    const corpo = document.getElementById("corpo-tabela-produtos");
    const linha = corpo.insertRow();

    const cell1 = linha.insertCell(0)
    cell1.textContent = produto

    const cell2 = linha.insertCell(1)
    cell2.textContent = categoria

    const cell3 = linha.insertCell(2)
    cell3.textContent = preco

    const cell4 = linha.insertCell(3)
    cell4.textContent = estoque

    const cell5 = linha.insertCell(4)
    cell5.classList.add("acoes")

    const btnEditar = document.createElement("button")
    btnEditar.textContent = "Editar"
    btnEditar.classList.add("btn-editar")
    btnEditar.dataset.id = idProdFirebase
    cell5.appendChild(btnEditar)

    const btnRemover = document.createElement("button")
    btnRemover.textContent = "Remover"
    btnRemover.dataset.id = idProdFirebase
    btnRemover.classList.add("btn-editar")
    cell5.appendChild(btnRemover)

    btnRemover.addEventListener( "click", () => {

    const refRemoverProd = ref(db, `Produto/${idProdFirebase}`);
    remove(refRemoverProd)
    .then( () => {
        alert("Produto removido com sucesso")
    })
    .catch(() =>{
        alert("Erro")
    })

})


}

const btnNovoProduto = document.getElementById("btnNovoProduto")
const formNovoProduto = document.getElementById("container-form")


// configurando btn Novo Produto

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

    const corpo = document.getElementById("corpo-tabela-produtos");
    corpo.innerHTML = '';

    for (let id in dados) {
        const produto = dados[id];

        addProdutoInTable(
            id,
            produto.nome,
            produto.categoria,
            produto.preco,
            produto.estoque
        );
    }


});