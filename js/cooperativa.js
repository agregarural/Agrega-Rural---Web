


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

btnAddAdm.addEventListener("click", (e) => {
    e.preventDefault();

    if (formularioOverlay.classList.contains("oculto")) {

        formularioOverlay.classList.remove("oculto");
    }
    else {
        formularioOverlay.classList.add("oculto");
    }

});