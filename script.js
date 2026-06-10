// ====================== BASE DE DADOS ======================
const perguntas = [
    { texto: "Qual prática NÃO é considerada sustentável na agricultura?", opcoes: ["Rotação de culturas", "Uso de queimadas para limpeza do solo", "Compostagem de resíduos orgânicos", "Captação de água da chuva"], correta: 1 },
    { texto: "O que a agricultura sustentável busca proteger principalmente?", opcoes: ["Apenas o lucro do produtor", "Recursos naturais e biodiversidade", "Monocultura de soja", "Uso ilimitado de agrotóxicos"], correta: 1 },
    { texto: "Qual técnica ajuda a evitar erosão do solo?", opcoes: ["Plantio em nível", "Desmatamento", "Aração profunda sem planejamento", "Queimadas controladas"], correta: 0 },
    { texto: "O que é agroecologia?", opcoes: ["Aplicação de venenos em larga escala", "Sistema que integra conhecimentos ecológicos à produção agrícola", "Criação de animais confinados", "Exportação intensiva de alimentos"], correta: 1 },
    { texto: "Qual benefício direto da rotação de culturas?", opcoes: ["Redução da fertilidade do solo", "Aumento de pragas específicas", "Melhoria da estrutura do solo e controle de doenças", "Necessidade maior de irrigação"], correta: 2 }
];

// ====================== VARIÁVEIS GLOBAIS ======================
let pontuacao = 0;
let perguntaAtualIndice = 0;
let totalPerguntas = perguntas.length;
let podeResponder = true;
let tempoFeedback = null;
let opcoesAtuaisBotoes = []; // para referência

// DOM elements
const splashDiv = document.getElementById("splashScreen");
const quizDiv = document.getElementById("quizContainer");
const perguntaTexto = document.getElementById("perguntaTexto");
const opcoesContainer = document.getElementById("opcoesContainer");
const pontuacaoDisplay = document.getElementById("pontuacaoDisplay");
const totalPerguntasSpan = document.getElementById("totalPerguntas");
const feedbackMsgDiv = document.getElementById("feedbackMsg");
const dicaMsgDiv = document.getElementById("dicaMsg");
const resultadoFinalDiv = document.getElementById("resultadoFinal");
const progressBar = document.getElementById("progressBar");
const perguntaAtualNumeroSpan = document.getElementById("perguntaAtualNumero");
const totalPerguntasNumSpan = document.getElementById("totalPerguntasNum");

const restartBtn = document.getElementById("restartBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const instructionsBtn = document.getElementById("instructionsBtn");
const tipBtn = document.getElementById("tipBtn");
const startQuizBtn = document.getElementById("startQuizBtn");
const skipSplashBtn = document.getElementById("skipSplashBtn");
const restartFromResultBtn = document.getElementById("restartFromResultBtn");
const modalInstrucoes = document.getElementById("instructionsModal");
const closeModal = document.querySelector(".close-modal");

// Dicas autorais
const dicasSustentaveis = [
    "🌱 Compostagem transforma restos de comida em adubo rico!",
    "💧 Captar água da chuva reduz em até 50% o uso de água potável no campo.",
    "🐞 Joaninhas ajudam a controlar pulgões naturalmente, sem veneno.",
    "🌻 Plantar flores próximas às lavouras atrai polinizadores.",
    "🌾 Rotação de culturas evita o esgotamento do solo."
];

// ====================== FUNÇÕES AUXILIARES ======================
function cancelarTimeout() {
    if (tempoFeedback) {
        clearTimeout(tempoFeedback);
        tempoFeedback = null;
    }
}

function atualizarProgresso() {
    let percentual = ((perguntaAtualIndice + 1) / totalPerguntas) * 100;
    progressBar.style.width = `${percentual}%`;
    perguntaAtualNumeroSpan.innerText = perguntaAtualIndice + 1;
}

function desabilitarOpcoes(disabled) {
    opcoesAtuaisBotoes.forEach(btn => {
        btn.disabled = disabled;
    });
}

function limparDestaques() {
    opcoesAtuaisBotoes.forEach(btn => {
        btn.classList.remove("correct-highlight", "wrong-highlight");
    });
}

// ====================== CARREGAR PERGUNTA ======================
function carregarPergunta() {
    if (!podeResponder) return;
    if (perguntaAtualIndice >= totalPerguntas) {
        finalizarQuiz();
        return;
    }

    const pergunta = perguntas[perguntaAtualIndice];
    perguntaTexto.innerText = pergunta.texto;
    opcoesContainer.innerHTML = "";
    opcoesAtuaisBotoes = [];
    
    pergunta.opcoes.forEach((opcao, idx) => {
        const botao = document.createElement("button");
        botao.innerText = `${String.fromCharCode(65+idx)} - ${opcao}`;
        botao.classList.add("option-btn");
        botao.addEventListener("click", () => verificarResposta(idx, pergunta.correta, botao));
        opcoesContainer.appendChild(botao);
        opcoesAtuaisBotoes.push(botao);
    });
    
    atualizarProgresso();
    feedbackMsgDiv.innerText = "";
    feedbackMsgDiv.className = "feedback-message";
    dicaMsgDiv.classList.add("hidden");
    dicaMsgDiv.innerText = "";
    podeResponder = true;
    limparDestaques();
}

// ====================== VERIFICAR RESPOSTA ======================
function verificarResposta(opcaoEscolhida, correta, botaoClicado) {
    if (!podeResponder) return;
    podeResponder = false;
    cancelarTimeout();
    
    const acertou = (opcaoEscolhida === correta);
    
    // Destaque visual
    limparDestaques();
    if (acertou) {
        botaoClicado.classList.add("correct-highlight");
        pontuacao++;
        pontuacaoDisplay.innerText = pontuacao;
        feedbackMsgDiv.innerHTML = "✅ Correto! Muito bem! +1 ponto";
        feedbackMsgDiv.style.color = "var(--correct)";
    } else {
        botaoClicado.classList.add("wrong-highlight");
        // Destacar também a opção correta
        const botaoCorreto = opcoesAtuaisBotoes[correta];
        if (botaoCorreto) botaoCorreto.classList.add("correct-highlight");
        const respostaCerta = perguntas[perguntaAtualIndice].opcoes[correta];
        feedbackMsgDiv.innerHTML = `❌ Errado! A resposta correta era: ${respostaCerta}. Continue aprendendo!`;
        feedbackMsgDiv.style.color = "var(--wrong)";
    }
    
    desabilitarOpcoes(true);
    
    // Avança após delay
    tempoFeedback = setTimeout(() => {
        perguntaAtualIndice++;
        if (perguntaAtualIndice < totalPerguntas) {
            carregarPergunta();
        } else {
            finalizarQuiz();
        }
        tempoFeedback = null;
    }, 800);
}

// ====================== FINALIZAR QUIZ ======================
function finalizarQuiz() {
    podeResponder = false;
    cancelarTimeout();
    desabilitarOpcoes(true);
    opcoesContainer.innerHTML = "";
    perguntaTexto.innerText = "Quiz Finalizado!";
    feedbackMsgDiv.innerHTML = "";
    resultadoFinalDiv.classList.remove("hidden");
    
    const pontosObtidos = pontuacao;
    let mensagem = "";
    if (pontosObtidos === totalPerguntas) {
        mensagem = "🌟 Parabéns! Você é um guardião da sustentabilidade! 🌟";
    } else if (pontosObtidos >= totalPerguntas/2) {
        mensagem = "👍 Bom trabalho! Continue estudando práticas sustentáveis.";
    } else {
        mensagem = "📚 Vale a pena revisar o tema! Cada pequena ação conta para o futuro do planeta.";
    }
    document.getElementById("resultadoPontos").innerHTML = `Você acertou <strong>${pontosObtidos}</strong> de ${totalPerguntas} perguntas.`;
    document.getElementById("mensagemSustentavel").innerText = mensagem;
    progressBar.style.width = "100%";
}

// ====================== REINICIAR QUIZ ======================
function reiniciarQuiz() {
    cancelarTimeout();
    pontuacao = 0;
    perguntaAtualIndice = 0;
    podeResponder = true;
    pontuacaoDisplay.innerText = "0";
    resultadoFinalDiv.classList.add("hidden");
    feedbackMsgDiv.innerText = "";
    dicaMsgDiv.classList.add("hidden");
    
    splashDiv.classList.add("hidden");
    quizDiv.classList.remove("hidden");
    
    carregarPergunta();
}

// ====================== INICIAR JOGO (fechar splash) ======================
function iniciarJogo() {
    splashDiv.classList.add("hidden");
    quizDiv.classList.remove("hidden");
    reiniciarQuiz(); // já reseta e carrega
}

// ====================== MODO ESCURO ======================
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const btn = document.getElementById("darkModeBtn");
    btn.innerHTML = document.body.classList.contains("dark-mode") ? "☀️ Claro" : "🌙 Escuro";
}

// ====================== MODAL INSTRUÇÕES ======================
function abrirInstrucoes() {
    modalInstrucoes.classList.remove("hidden");
}
function fecharInstrucoes() {
    modalInstrucoes.classList.add("hidden");
}

// ====================== DICA EXTRA (sem interferir no feedback) ======================
function mostrarDica() {
    if (splashDiv && !splashDiv.classList.contains("hidden")) {
        alert("🌿 Inicie o quiz para receber dicas durante o jogo!");
        return;
    }
    if (perguntaAtualIndice < totalPerguntas && quizDiv && !quizDiv.classList.contains("hidden") && !resultadoFinalDiv.classList.contains("hidden") === false) {
        const dicaAleatoria = dicasSustentaveis[Math.floor(Math.random() * dicasSustentaveis.length)];
        dicaMsgDiv.innerText = `💡 DICA: ${dicaAleatoria}`;
        dicaMsgDiv.classList.remove("hidden");
        setTimeout(() => {
            dicaMsgDiv.classList.add("hidden");
        }, 4000);
    } else if (resultadoFinalDiv && !resultadoFinalDiv.classList.contains("hidden")) {
        alert("✨ Dica: Reforce seus conhecimentos sobre agroecologia e rotação de culturas!");
    } else {
        alert("Clique em 'Iniciar Jornada' e responda para ganhar dicas!");
    }
}

// ====================== EVENT LISTENERS ======================
startQuizBtn.addEventListener("click", iniciarJogo);
skipSplashBtn.addEventListener("click", iniciarJogo);
restartBtn.addEventListener("click", reiniciarQuiz);
restartFromResultBtn.addEventListener("click", reiniciarQuiz);
darkModeBtn.addEventListener("click", toggleDarkMode);
instructionsBtn.addEventListener("click", abrirInstrucoes);
closeModal.addEventListener("click", fecharInstrucoes);
window.addEventListener("click", (e) => {
    if (e.target === modalInstrucoes) fecharInstrucoes();
});
tipBtn.addEventListener("click", mostrarDica);

// Inicialização dos contadores
totalPerguntasSpan.innerText = totalPerguntas;
totalPerguntasNumSpan.innerText = totalPerguntas;
atualizarProgresso();