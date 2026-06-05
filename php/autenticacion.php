<?php
header("Content-Type: application/json");

// 1. Recebe os dados enviados pelo JavaScript (fetch)
$dados JSON = file_get_contents("php://input");
$requisicao = json_decode($dadosJSON, true);

if (!$requisicao) {
    echo json_encode(["status" => "erro", "mensagem" => "Dados inválidos."]);
    exit;
}

$email = trim($requisicao['email'] ?? '');
$matricula = trim($requisicao['matricula'] ?? '');
$acao = trim($requisicao['acao'] ?? '');

// ========================================================
// FUNÇÃO PHP: VALIDAÇÃO DE CPF POR CÁLCULO (MÓDULO 11)
// ========================================================
function validarCPF_PHP($cpf) {
    $cpf = preg_replace('/[^0-9]/', '', $cpf); // Remove caracteres especiais
    
    if (strlen($cpf) != 11 || preg_match('/(\d)\1{10}/', $cpf)) {
        return false; // Rejeita se não tiver 11 dígitos ou se for repetido
    }

    // Cálculo do primeiro dígito verificador
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false; // Cálculo não bateu
        }
    }
    return true;
}

// ========================================================
// FUNÇÃO PHP: VALIDAÇÃO DE CNPJ POR CÁLCULO (MÓDULO 11)
// ========================================================
function validarCNPJ_PHP($cnpj) {
    $cnpj = preg_replace('/[^0-9]/', '', $cnpj);

    if (strlen($cnpj) != 14 || preg_match('/(\d)\1{13}/', $cnpj)) {
        return false; // Rejeita se não tiver 14 dígitos ou se for repetido
    }

    // Valida primeiro dígito verificador
    for ($i = 0, $j = 5, $soma = 0; $i < 12; $i++) {
        $soma += $cnpj[$i] * $j;
        $j = ($j == 2) ? 9 : $j - 1;
    }
    $resto = $soma % 11;
    if ($cnpj[12] != ($resto < 2 ? 0 : 11 - $resto)) {
        return false;
    }

    // Valida segundo dígito verificador
    for ($i = 0, $j = 6, $soma = 0; $i < 13; $i++) {
        $soma += $cnpj[$i] * $j;
        $j = ($j == 2) ? 9 : $j - 1;
    }
    $resto = $soma % 11;
    if ($cnpj[13] != ($resto < 2 ? 0 : 11 - $resto)) {
        return false;
    }

    return true;
}

// ========================================================
// FILTRO DE SEGURANÇA NO FLUXO DE CADASTRO
// ========================================================

if ($acao === "cadastro_produtor") {
    // No cadastro do produtor, a matrícula enviada pode ser o CPF ou associada a ele
    // Ajuste aqui dependendo de qual campo você está enviando no seu objeto JSON do JS
    if (!validarCPF_PHP($matricula)) {
        echo json_encode(["status" => "erro", "mensagem" => "Segurança: Operação barrada. CPF matematicamente inválido."]);
        exit;
    }
}

if ($acao === "cadastro_cooperativa") {
    // No cadastro da cooperativa, você envia o CNPJ no campo 'matricula'
    if (!validarCNPJ_PHP($matricula)) {
        echo json_encode(["status" => "erro", "mensagem" => "Segurança: Operação barrada. CNPJ matematicamente inválido."]);
        exit;
    }
}

// Se passou pelas validações acima, o código continua o fluxo normal com segurança
echo json_encode(["status" => "sucesso", "mensagem" => "Dados validados e processados no servidor com sucesso!"]);
?>