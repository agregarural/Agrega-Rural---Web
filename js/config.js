fetch('../components/header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header-placeholder').innerHTML = html;
  });

fetch('../components/menuoptions.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('menuOptions').innerHTML = html;
  });

document.addEventListener('DOMContentLoaded', () => {
  /* =========================
     ELEMENTOS
  ========================= */  
  const btnSalvarPerfil = document.getElementById('btnSalvarPerfil');
  const btnAlterarSenha = document.getElementById('btnAlterarSenha');

  const nomeInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const confirmarSenhaInput = document.getElementById('confirmarSenha');

  const nomeError = document.getElementById('nomeError');
  const emailError = document.getElementById('emailError');
  const senhaError = document.getElementById('senhaError');

  const strengthFill = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');

  const darkMode = document.getElementById('darkMode');

  if (!btnSalvarPerfil || !btnAlterarSenha || !nomeInput || !emailInput || !senhaInput || !confirmarSenhaInput) {
    console.error('Algum elemento do formulário não foi encontrado no HTML.');
    return;
  }

  /* =========================
     TOAST
  ========================= */
  function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.classList.add('toast');

    if (type === 'error') {
      toast.classList.add('toast-error');
    } else {
      toast.classList.add('toast-success');
    }

    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /* =========================
     HELPERS
  ========================= */
  function mostrarErro(elemento) {
    if (elemento) elemento.style.display = 'block';
  }

  function esconderErro(elemento) {
    if (elemento) elemento.style.display = 'none';
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /* =========================
     VALIDAÇÃO EM TEMPO REAL
  ========================= */
  nomeInput.addEventListener('input', () => {
    if (nomeInput.value.trim().length < 3) {
      mostrarErro(nomeError);
    } else {
      esconderErro(nomeError);
    }
  });

  emailInput.addEventListener('input', () => {
    if (!validarEmail(emailInput.value.trim())) {
      mostrarErro(emailError);
    } else {
      esconderErro(emailError);
    }
  });

  confirmarSenhaInput.addEventListener('input', () => {
    if (senhaInput.value !== confirmarSenhaInput.value) {
      mostrarErro(senhaError);
    } else {
      esconderErro(senhaError);
    }
  });

  senhaInput.addEventListener('input', () => {
    const senha = senhaInput.value;
    let forca = 0;

    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;

    if (strengthFill) {
      strengthFill.style.width = (forca * 25) + '%';
    }

    if (strengthLabel) {
      if (forca <= 1) {
        strengthLabel.textContent = 'Senha fraca';
        if (strengthFill) strengthFill.style.background = '#e63946';
      } else if (forca <= 3) {
        strengthLabel.textContent = 'Senha média';
        if (strengthFill) strengthFill.style.background = '#ffb703';
      } else {
        strengthLabel.textContent = 'Senha forte';
        if (strengthFill) strengthFill.style.background = '#2a9d8f';
      }
    }

    if (confirmarSenhaInput.value && senha !== confirmarSenhaInput.value) {
      mostrarErro(senhaError);
    } else {
      esconderErro(senhaError);
    }
  });

  /* =========================
     PERFIL
  ========================= */
  function salvarPerfil() {
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();

    let valido = true;

    if (nome.length < 3) {
      mostrarErro(nomeError);
      valido = false;
    } else {
      esconderErro(nomeError);
    }

    if (!validarEmail(email)) {
      mostrarErro(emailError);
      valido = false;
    } else {
      esconderErro(emailError);
    }

    if (!valido) {
      showToast('Corrija os campos inválidos', 'error');
      return;
    }

    showToast('Perfil salvo com sucesso!');
  }

  /* =========================
     ALTERAR SENHA
  ========================= */
  function alterarSenha() {
    const senha = senhaInput.value;
    const confirmar = confirmarSenhaInput.value;

    if (senha.length < 8) {
      showToast('A senha precisa ter pelo menos 8 caracteres', 'error');
      return;
    }

    if (senha !== confirmar) {
      mostrarErro(senhaError);
      showToast('As senhas não coincidem', 'error');
      return;
    }

    esconderErro(senhaError);
    showToast('Senha alterada com sucesso!');
  }

  /* =========================
     EVENTS
  ========================= */
  btnSalvarPerfil.addEventListener('click', salvarPerfil);
  btnAlterarSenha.addEventListener('click', alterarSenha);

  /* =========================
     DARK MODE
  ========================= */
  if (localStorage.getItem('darkMode') === 'true') {
    darkMode.checked = true;
    document.body.classList.add('dark');
  }

  darkMode.addEventListener('change', function () {
    document.body.classList.toggle('dark', this.checked);
    localStorage.setItem('darkMode', this.checked);
  });
});