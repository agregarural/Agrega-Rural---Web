import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

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


fetch('../components/header.html')
.then(res => res.text())
.then(html => { document.getElementById('header-placeholder').innerHTML = html; });




function addProduto(produto, categoria, preco, estoque) {

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
}


const produtoRef = ref(db, 'Produto')

onValue(produtoRef, (snapshot) => {
    const dados = snapshot.val();

    const corpo = document.getElementById("corpo-tabela-produtos");

    for (let id in dados) {
        const produto = dados[id];

        addProduto(
            produto.nome,
            produto.categoria,
            produto.preco,
            produto.estoque
        );
    }
});






