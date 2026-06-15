import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

const auth = getAuth(app);
const db = getDatabase(app);

async function carregarComponentes() {
    const respostaHeader = await fetch("../components/header.html");
    const htmlHeader = await respostaHeader.text();

    document.getElementById("header-placeholder").innerHTML = htmlHeader;

    await import("../js/header.js");

    const respostaMenu = await fetch("../components/menuoptions.html");
    const htmlMenu = await respostaMenu.text();

    const menuOptions = document.getElementById("menuOptions");

    if (menuOptions) {
        menuOptions.innerHTML = htmlMenu;
    }
}

await carregarComponentes();

const welcomeMessage = document.getElementById("welcome-message");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../pages/autenticacion.html";
        return;
    }

    try {
        const userRef = ref(db, "Usuarios/" + user.uid);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            const username = userData.nome || userData.name || user.email;
            welcomeMessage.textContent = `Bem Vindo, ${username}!`;
        } else {
            welcomeMessage.textContent = `Bem Vindo, ${user.email}!`;
        }

    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        welcomeMessage.textContent = `Bem Vindo, ${user.email}!`;
    }
});