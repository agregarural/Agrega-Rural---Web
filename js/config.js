import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, get } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

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
let bannersRef = null;

// Variáveis do carrossel
let bannersUrls = [];
let indiceAtual = 0;
let intervalo = null;

const IMGBB_API_KEY = "ac742aebcb5ef3bbef2489f934240205";

// ----- Componentes HTML carregados dinamicamente -----
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

// ----- Função de upload para o ImgBB -----
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

// ----- Autenticação e configuração da cooperativa -----
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
  bannersRef = ref(db, `Cooperativas/${idCooperativa}/Banners`);

  carregarBanners();
});

// ----- Upload de banner -----
document.getElementById("uploadBanner").addEventListener("click", async () => {
  const input = document.getElementById("banner1");
  const file = input.files[0];

  if (!file) {
    alert("Selecione um arquivo de imagem.");
    return;
  }

  if (!bannersRef) {
    alert("Aguarde a autenticação.");
    return;
  }

  try {
    const urlImagem = await enviarImgbb(file);
    await push(bannersRef, {
      url: urlImagem
    });
    alert("Banner enviado com sucesso!");
    input.value = "";
  } catch (erro) {
    console.error("Erro ao enviar banner:", erro);
    alert("Erro ao enviar banner.");
  }
});

// ----- Carregar banners, cards e iniciar carrossel -----
function carregarBanners() {
  onValue(bannersRef, (snapshot) => {
    const containerBanners = document.querySelector(".banners");
    containerBanners.innerHTML = "<p>Banners Cadastrados:</p>";

    if (!snapshot.exists()) {
      containerBanners.innerHTML += "<p>Nenhum banner cadastrado.</p>";
      bannersUrls = [];
      clearInterval(intervalo);
      document.getElementById("previewBanner").src = "https://placehold.co/800x350";
      atualizarDots(0);
      return;
    }

    const banners = snapshot.val();
    const ids = Object.keys(banners);
    bannersUrls = ids.map(id => banners[id].url);

    // Lista de cards com botão remover
    ids.forEach(id => {
      const url = banners[id].url;
      containerBanners.appendChild(criarCardBanner(id, url));
    });

    // Garante que o índice atual é válido
    if (indiceAtual >= bannersUrls.length) {
      indiceAtual = 0;
    }

    iniciarRotacao();
  });
}

function criarCardBanner(id, url) {
  const card = document.createElement("div");
  card.style.cssText = "display:flex; align-items:center; gap:10px; margin-bottom:10px;";

  const img = document.createElement("img");
  img.src = url;
  img.alt = "Banner";
  img.style.cssText = "width:100px; height:auto; border-radius:5px;";

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.textContent = "Ver imagem";
  link.style.cssText = "font-size:0.9em;";

  const btnRemover = document.createElement("button");
  btnRemover.textContent = "Remover";
  btnRemover.addEventListener("click", async () => {
    if (!confirm("Deseja realmente remover este banner?")) return;
    await remove(ref(db, `Cooperativas/${idCooperativa}/Banners/${id}`));
  });

  card.appendChild(img);
  card.appendChild(link);
  card.appendChild(btnRemover);
  return card;
}

// ----- Controles do carrossel -----
function iniciarRotacao() {
  clearInterval(intervalo);
  if (bannersUrls.length === 0) return;

  // Exibe o banner atual
  document.getElementById("previewBanner").src = bannersUrls[indiceAtual];
  atualizarDots(bannersUrls.length);

  // Troca automática a cada 3 segundos
  intervalo = setInterval(() => {
    indiceAtual = (indiceAtual + 1) % bannersUrls.length;
    document.getElementById("previewBanner").src = bannersUrls[indiceAtual];
    atualizarDots(bannersUrls.length);
  }, 3000);
}

function atualizarDots(quantidade) {
  const dotsContainer = document.querySelector(".dots");
  dotsContainer.innerHTML = "";

  for (let i = 0; i < quantidade; i++) {
    const dot = document.createElement("span");
    if (i === indiceAtual) {
      dot.classList.add("active");
    }
    dot.addEventListener("click", () => {
      indiceAtual = i;
      iniciarRotacao();
    });
    dotsContainer.appendChild(dot);
  }
}