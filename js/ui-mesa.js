// Desenha as mãos dos jogadores e a mesa. Só desenha e escuta cliques; as regras ficam em outros módulos.
import { nomeDaPeca } from './pecas.js';

function criarPeca(peca, virada, travada, aoClicar) {
  const botao = document.createElement('button');
  const nome = nomeDaPeca(peca);
  botao.type = 'button';
  botao.className = 'peca';
  botao.dataset.testid = `peca-${nome}`;
  botao.dataset.face = virada ? 'cima' : 'baixo';
  botao.disabled = travada;
  botao.addEventListener('click', () => aoClicar(nome));
  return botao;
}

/**
 * Desenha a mão do jogador (`j1` ou `j2`); só a do jogador da vez fica virada para cima.
 * `travada`: fim de partida, nenhuma peça pode ser clicada.
 */
export function desenharMao(raiz, jogador, estado, travada, aoClicar) {
  const elemento = raiz.querySelector(`[data-testid="mao-${jogador}"]`);
  const virada = estado.vez === jogador;
  elemento.replaceChildren(...estado.maos[jogador].map((p) => criarPeca(p, virada, travada, aoClicar)));
}

/** Desenha as peças da mesa, da esquerda para a direita. */
export function desenharMesa(raiz, mesa) {
  const elemento = raiz.querySelector('[data-testid="mesa"]');
  elemento.replaceChildren(
    ...mesa.map(([a, b]) => {
      const peca = document.createElement('span');
      peca.className = 'peca-mesa';
      peca.dataset.peca = `${a}-${b}`;
      return peca;
    }),
  );
}

/** Mostra (ou esconde) a caixa de escolha do lado. */
export function mostrarEscolhaLado(raiz, visivel) {
  raiz.querySelector('[data-testid="escolha-lado"]').hidden = !visivel;
}

/** Liga os botões de escolha do lado: `aoEscolher('esquerda' | 'direita')`. */
export function ligarEscolhaLado(raiz, aoEscolher) {
  for (const lado of ['esquerda', 'direita']) {
    const botao = raiz.querySelector(`[data-testid="btn-${lado}"]`);
    botao.textContent = lado === 'esquerda' ? '◀ Esquerda' : 'Direita ▶';
    botao.addEventListener('click', () => aoEscolher(lado));
  }
}
