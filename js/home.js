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
const coopNameElement = document.getElementById("coop-name");

const numCompletos = document.getElementById("num-completos");
const numPendentes = document.getElementById("num-pendentes");
const numTransporte = document.getElementById("num-transporte");
const numEstoque = document.getElementById("num-estoque");

async function carregarDadosDashboard(coopUid) {
    try {
        const usuariosSnapshot = await get(ref(db, "Usuarios"));
        const usuarios = usuariosSnapshot.val() || {};

        const userCoopMap = {};

        for (const uid in usuarios) {
            userCoopMap[uid] = usuarios[uid].coopUid;
        }

        const pedidosSnapshot = await get(ref(db, "Pedidos"));

        let completos = 0;
        let pendentes = 0;
        let transporte = 0;

        if (pedidosSnapshot.exists()) {
            const pedidos = pedidosSnapshot.val();

            for (const id in pedidos) {
                const pedido = pedidos[id];
                const usuarioId = pedido.usuarioId;

                if (!usuarioId || userCoopMap[usuarioId] !== coopUid) {
                    continue;
                }

                const status = (pedido.status || "").toLowerCase();

                if (status === "completo" || status === "concluido") {
                    completos++;
                } else if (status === "pendente") {
                    pendentes++;
                } else if (
                    status === "em andamento" ||
                    status === "em transporte" ||
                    status === "enviado"
                ) {
                    transporte++;
                }
            }
        }

        const produtosSnapshot = await get(
            ref(db, `Cooperativas/${coopUid}/Produtos`)
        );

        let produtosCatalogados = 0;

        if (produtosSnapshot.exists()) {
            const produtos = produtosSnapshot.val();

            produtosCatalogados = Object.keys(produtos).length;
        }

        numCompletos.textContent = completos;
        numPendentes.textContent = pendentes;
        numTransporte.textContent = transporte;
        numEstoque.textContent = produtosCatalogados;

    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);

        numCompletos.textContent = 0;
        numPendentes.textContent = 0;
        numTransporte.textContent = 0;
        numEstoque.textContent = 0;
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../pages/autenticacion.html";
        return;
    }

    try {
        const userSnapshot = await get(ref(db, "Usuarios/" + user.uid));

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            const username = userData.nome || userData.name || user.email;

            welcomeMessage.textContent = `Bem Vindo, ${username}!`;

            const coopUid = userData.coopUid;

            if (coopUid) {
                const coopSnapshot = await get(
                    ref(db, `Cooperativas/${coopUid}/nome`)
                );

                if (coopSnapshot.exists()) {
                    coopNameElement.textContent = coopSnapshot.val();
                } else {
                    coopNameElement.textContent = "Cooperativa";
                }

                await carregarDadosDashboard(coopUid);

            } else {
                coopNameElement.textContent = "Sem cooperativa vinculada";

                numCompletos.textContent = 0;
                numPendentes.textContent = 0;
                numTransporte.textContent = 0;
                numEstoque.textContent = 0;
            }

        } else {
            welcomeMessage.textContent = `Bem Vindo, ${user.email}!`;
        }

    } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);

        welcomeMessage.textContent = `Bem Vindo, ${user.email}!`;
    }
});