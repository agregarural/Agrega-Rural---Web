fetch('/components/header.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header-placeholder').innerHTML = html;
    });

fetch('/components/menuoptions.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('menuOptions').innerHTML = html;
    });

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";


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
const db = getDatabase(app);

const secondApp = initializeApp(firebaseConfig, "secondary");
const secondAuth = getAuth(secondApp);



const btnAddAdm = document.getElementById("btnAddAdm");
const formularioOverlay = document.getElementById("overlay");

const btnConfirm = document.getElementById("btnConfirm");
const btnRefuse = document.getElementById("btnRefuse");

btnAddAdm.addEventListener("click", (e) => {
    e.preventDefault();

    if (formularioOverlay.classList.contains("oculto")) {

        formularioOverlay.classList.remove("oculto");
    }
    else {
        formularioOverlay.classList.add("oculto");
    }

});


btnConfirm.addEventListener("click", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const matricula = document.getElementById("matricula").value;
    const tipo = document.getElementById("tipo").value;

    try {
        const cred = await createUserWithEmailAndPassword(secondAuth, email, senha);
        const novoUid = cred.user.uid;

        await set(ref(db, 'Usuarios/' + novoUid), {
            nome: nome,
            cpf: cpf,
            email: email,
            matricula: matricula,
            tipo: tipo,
            userUid: novoUid,
            dataCadastro: new Date().toISOString().split("T")[0]

        });

        console.log("Usuário criado com sucesso:", novoUid);
        await signOut(secondAuth);
        alert("Administrador criado!");





        formularioOverlay.classList.add("oculto");

    } catch (error) {

        console.error("Erro ao criar usuário:", error);
        alert("Erro ao criar administrador: " + error.message);
    }
});

btnRefuse.addEventListener("click", (e) => {
    e.preventDefault();

    formularioOverlay.classList.add("oculto");

});