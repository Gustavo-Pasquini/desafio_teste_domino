// Ponto de entrada do jogo: lê a URL e inicia o jogo ao ser importado.
import { criarPecas, distribuir, cenarioDaUrl } from './pecas.js';
import { novoJogo, jogar, ladosDaJogada } from './jogo.js';
import { pontas } from './mesa.js';
import { podeComprar, comprar, podePassar, passar } from './compra.js';
import { ligarControles, desenharControles, desenharPlacar, mostrarMensagem } from './ui-controles.js';
import { verificarFim, mensagemDoFim } from './fim.js';
import { desenharMao, desenharMesa, mostrarEscolhaLado, ligarEscolhaLado } from './ui-mesa.js';

const raiz = document.body;
const porTestId = (id) => raiz.querySelector(`[data-testid="${id}"]`);

let estado = null;
let pendente = null; // peça que espera o jogador escolher o lado
let fim = null; // resultado da partida, quando ela acaba
const placar = { j1: 0, j2: 0 };

function desenhar() {
  desenharMao(raiz, 'j1', estado, fim !== null, aoClicarPeca);
  desenharMao(raiz, 'j2', estado, fim !== null, aoClicarPeca);
  desenharMesa(raiz, estado.mesa);
  porTestId('monte-qtd').textContent = String(estado.monte.length);
  porTestId('vez').textContent = estado.vez.toUpperCase();
  const ponta = pontas(estado.mesa);
  porTestId('ponta-esquerda').textContent = ponta ? String(ponta.esquerda) : '';
  porTestId('ponta-direita').textContent = ponta ? String(ponta.direita) : '';
  mostrarEscolhaLado(raiz, pendente !== null);
  desenharControles(raiz, { comprar: podeComprar(estado), passar: podePassar(estado) });
  desenharPlacar(raiz, placar);
}

/** Aplica o novo estado (de uma jogada, compra ou passe) e confere se a partida acabou. */
function atualizar(novo) {
  if (!novo) return;
  estado = novo;
  mostrarMensagem(raiz, '');
  fim = verificarFim(estado);
  if (fim) {
    if (fim.vencedor) placar[fim.vencedor] += fim.pontos;
    mostrarMensagem(raiz, mensagemDoFim(fim));
  }
  desenhar();
}

function aplicarJogada(nome, lado) {
  pendente = null;
  atualizar(jogar(estado, nome, lado));
}

function aoClicarPeca(nome) {
  const lados = ladosDaJogada(estado, nome);
  if (lados.length === 0) {
    mostrarMensagem(raiz, 'Jogada inválida');
    return;
  }
  if (lados.length === 1) {
    aplicarJogada(nome, lados[0]);
    return;
  }
  pendente = nome;
  desenhar();
}

ligarEscolhaLado(raiz, (lado) => {
  if (pendente) aplicarJogada(pendente, lado);
});

ligarControles(raiz, {
  aoComprar: () => atualizar(comprar(estado)),
  aoPassar: () => atualizar(passar(estado)),
});

function comecarPartida(maos) {
  pendente = null;
  fim = null;
  estado = novoJogo(maos);
  mostrarMensagem(raiz, '');
  desenhar();
}

// btn-nova-partida sempre sorteia uma partida normal (7 + 7 + 14).
porTestId('btn-nova-partida').addEventListener('click', () => comecarPartida(distribuir(criarPecas())));

// Com j1/j2/monte na URL, a partida (só a primeira) começa ao abrir a página, só com as peças listadas.
const cenario = cenarioDaUrl(location.search);
if (cenario) comecarPartida(cenario);
