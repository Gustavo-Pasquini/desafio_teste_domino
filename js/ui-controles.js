// Botões comprar/passar, mensagens, pontos e nova partida. Só desenha e escuta cliques.

const porTestId = (raiz, id) => raiz.querySelector(`[data-testid="${id}"]`);

/** Escreve os rótulos dos botões e liga os cliques. */
export function ligarControles(raiz, { aoComprar, aoPassar }) {
  porTestId(raiz, 'btn-comprar').textContent = 'Comprar';
  porTestId(raiz, 'btn-comprar').addEventListener('click', aoComprar);
  porTestId(raiz, 'btn-passar').textContent = 'Passar';
  porTestId(raiz, 'btn-passar').addEventListener('click', aoPassar);
}

/** Habilita ou desabilita os botões de acordo com o que o jogador da vez pode fazer. */
export function desenharControles(raiz, { comprar, passar }) {
  porTestId(raiz, 'btn-comprar').disabled = !comprar;
  porTestId(raiz, 'btn-passar').disabled = !passar;
}

/** Placar dos dois jogadores. */
export function desenharPlacar(raiz, placar) {
  porTestId(raiz, 'pontos-j1').textContent = String(placar.j1);
  porTestId(raiz, 'pontos-j2').textContent = String(placar.j2);
}

/** Mensagem para os jogadores ('' apaga). */
export function mostrarMensagem(raiz, texto) {
  porTestId(raiz, 'mensagem').textContent = texto;
}
