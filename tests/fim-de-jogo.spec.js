// Testes de batida, jogo trancado e nova partida (Breno — B4 e B5).
import { abrirJogo, screen, within, jogarPeca, pecasNaMao } from './helpers.js';

test.each([
  ['Jogador 1', { j1: '6-6,3-6', j2: '1-6,2-4,0-0', monte: '' }, [['j1', '6-6'], ['j2', '1-6'], ['j1', '3-6']], 'pontos-j1', 6],
  ['Jogador 2', { j1: '6-6,1-6,2-4,0-0', j2: '3-6', monte: '' }, [['j1', '6-6'], ['j2', '3-6']], 'pontos-j2', 13],
])('TC-DO-14 batida de %s soma os pontos adversários', async (vencedor, cenario, jogadas, placar, pontos) => {
  const user = await abrirJogo(cenario);
  for (const [jogador, peca] of jogadas) await jogarPeca(user, jogador, peca);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(new RegExp(`^${vencedor} venceu!$`));
  expect(screen.getByTestId(placar)).toHaveTextContent(new RegExp(`^${pontos}$`));
  const [quemBateu, perdedor] = placar === 'pontos-j1' ? ['j1', 'j2'] : ['j2', 'j1'];
  expect(pecasNaMao(quemBateu)).toHaveLength(0);
  const restantes = pecasNaMao(perdedor);
  expect(restantes.length).toBeGreaterThan(0);
  for (const peca of restantes) expect(peca).toHaveAttribute('disabled'); // peças travadas
});

test.each([
  ['Jogador 1', { j1: '6-6,0-1', j2: '2-3,4-4', monte: '' }, 'pontos-j1', 13],
  ['Jogador 2', { j1: '6-6,4-4', j2: '0-1,2-3', monte: '' }, 'pontos-j2', 8],
])('TC-DO-15 jogo trancado dá vitória a %s', async (vencedor, cenario, placar, pontos) => {
  const user = await abrirJogo(cenario);
  await jogarPeca(user, 'j1', '6-6');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(new RegExp(`^Jogo trancado — ${vencedor} venceu!$`));
  expect(screen.getByTestId(placar)).toHaveTextContent(new RegExp(`^${pontos}$`));
});

test.each([
  ['J1', { j1: '6-6,0-4', j2: '1-3,2-2', monte: '' }, 'j1'],
  ['J2', { j1: '1-3,2-2', j2: '6-6,0-4', monte: '' }, 'j2'],
])('TC-DO-16 jogo trancado com empate começando por %s', async (_inicio, cenario, jogador) => {
  const user = await abrirJogo(cenario);
  await jogarPeca(user, jogador, '6-6');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Empate$/);
  expect(screen.getByTestId('pontos-j1')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('pontos-j2')).toHaveTextContent(/^0$/);
});

test('TC-DO-17 nova partida restaura distribuição', async () => {
  const user = await abrirJogo({ j1: '6-6,3-6', j2: '1-6,2-4,0-0', monte: '' });
  await jogarPeca(user, 'j1', '6-6');
  await jogarPeca(user, 'j2', '1-6');
  await jogarPeca(user, 'j1', '3-6');
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(within(screen.getByTestId('mao-j1')).getAllByTestId(/^peca-/)).toHaveLength(7);
  expect(within(screen.getByTestId('mao-j2')).getAllByTestId(/^peca-/)).toHaveLength(7);
  expect(screen.getByTestId('monte-qtd')).toHaveTextContent(/^14$/);
  expect(screen.getByTestId('mesa').children).toHaveLength(0);
  expect(screen.getByTestId('mensagem')).toBeEmptyDOMElement();
});
