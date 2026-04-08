const btncadastro = document.getElementById("btnCadastro");
const authentication = document.getElementById("elementoAuthetication");

btncadastro.addEventListener( "click", () => {
    authentication.remove()
});