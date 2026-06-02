


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

btnConfirm.addEventListener("click", (e) => {
    e.preventDefault();

    formularioOverlay.classList.add("oculto");

});

btnRefuse.addEventListener("click", (e) => {
    e.preventDefault();

    formularioOverlay.classList.add("oculto");

});