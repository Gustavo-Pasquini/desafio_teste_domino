// Testes das dicas de jogo (Gustavo — G6). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, pecasNaMao, jogarPeca, CENARIO_JOGADAS } from './helpers.js';

/** IDs das peças marcadas como jogáveis na mão. */
const marcadas = (jogador) => pecasNaMao(jogador).filter((p) => p.getAttribute('data-jogavel') === 'true').map((p) => p.getAttribute('data-testid'));

test('TC-DO-22 peças que podem ser jogadas ficam destacadas', async () => {
  const user = await abrirJogo(CENARIO_JOGADAS);
  expect(marcadas('j1')).toEqual(['peca-6-6']); // saída obrigatória
  await jogarPeca(user, 'j1', '6-6');
  expect(marcadas('j2').sort()).toEqual(['peca-1-6', 'peca-3-6']);
  expect(marcadas('j1')).toEqual([]);
});

test('TC-DO-23 sem peça jogável, o botão comprar é sugerido', async () => {
  const user = await abrirJogo({ j1: '6-6,5-5', j2: '0-1,2-3', monte: '0-0,1-2,4-6' });
  expect(marcadas('j1')).toEqual(['peca-6-6']);
  expect(screen.getByTestId('btn-comprar')).not.toHaveAttribute('data-sugerido', 'true');
  await jogarPeca(user, 'j1', '6-6');
  expect(pecasNaMao('j2')).toHaveLength(2);
  expect(marcadas('j2')).toEqual([]);
  expect(screen.getByTestId('btn-comprar')).toHaveAttribute('data-sugerido', 'true');
});
