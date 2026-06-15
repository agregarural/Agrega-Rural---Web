import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    child
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
const database = getDatabase(app);

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        return;
    }

    try {
        const profileImage = document.getElementById("profileImage");

        if (!profileImage) {
            return;
        }

        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `Usuarios/${user.uid}`));

        if (snapshot.exists()) {
            const dadosUsuario = snapshot.val();

            if (dadosUsuario.fotoURL) {
                profileImage.src = dadosUsuario.fotoURL;
                return;
            }
        }

        if (user.photoURL) {
            profileImage.src = user.photoURL;
        }

    } catch (erro) {
        console.error("Erro ao carregar foto do perfil no header:", erro);
    }
});