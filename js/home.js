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
import { getAuth, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";


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


const welcomeMessage = document.getElementById('welcome-message');
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, 'Usuarios/' + user.uid);

        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const username = userData.nome || userData.name || user.email;
                welcomeMessage.textContent = `Bem Vindo, ${username}!`;
            } else {
                // se não houver nó para esse UID, exibe o email
                welcomeMessage.textContent = `Bem Vindo, ${user.email}!`;
            }
        }).catch((error) => {
            console.error('Erro ao buscar dados do usuário:', error);
            welcomeMessage.textContent = `Bem Vindo, ${user.email}!`;
        });
    } else {
        window.location.href = '../pages/autenticacion.html';
    }
});


