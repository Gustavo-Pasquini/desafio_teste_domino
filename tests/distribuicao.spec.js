// Testes de peças, distribuição e de quem começa (Gustavo — G2, G3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, pecasNaMao, jogarPeca, pecasDaMesa } from './helpers.js';

async function novaPartida() {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}

test('TC-DO-01 nova partida: 7 peças para cada um e 14 no monte', async () => {
  await novaPartida();
  expect(pecasNaMao('j1')).toHaveLength(7);
  expect(pecasNaMao('j2')).toHaveLength(7);
  expect(screen.getByTestId('monte-qtd')).toHaveTextContent(/^14$/);
  expect(pecasDaMesa()).toHaveLength(0);
});

test('TC-DO-02 peças distribuídas são do duplo-seis e não se repetem (20 partidas)', async () => {
  for (let i = 0; i < 20; i++) {
    await novaPartida();
    const ids = [...pecasNaMao('j1'), ...pecasNaMao('j2')].map((p) => p.getAttribute('data-testid'));
    expect(ids).toHaveLength(14);
    for (const id of ids) {
      const [, a, b] = id.match(/^peca-([0-6])-([0-6])$/) ?? [];
      expect(a, `${id} não é uma peça de 0-0 a 6-6`).toBeDefined();
      expect(Number(a)).toBeLessThanOrEqual(Number(b));
    }
    expect(new Set(ids).size).toBe(14);
  }
});

/** Peça de saída pela regra da seção 1: a maior dupla; sem dupla, a de maior soma. */
function pecaDeSaida(ids) {
  const pecas = ids.map((id) => id.replace('peca-', '').split('-').map(Number));
  const duplas = pecas.filter(([a, b]) => a === b).sort((x, y) => y[0] - x[0]);
  const [a, b] = duplas[0] ?? [...pecas].sort((x, y) => y[0] + y[1] - (x[0] + x[1]))[0];
  return `${a}-${b}`;
}

test('TC-DO-10 só a mão do jogador da vez fica virada para cima', async () => {
  const user = await novaPartida();
  const vez = screen.getByTestId('vez').textContent.trim().toLowerCase();
  expect(['j1', 'j2']).toContain(vez);
  const outro = vez === 'j1' ? 'j2' : 'j1';
  for (const p of pecasNaMao(vez)) expect(p).toHaveAttribute('data-face', 'cima');
  for (const p of pecasNaMao(outro)) expect(p).toHaveAttribute('data-face', 'baixo');

  await jogarPeca(user, vez, pecaDeSaida(pecasNaMao(vez).map((p) => p.getAttribute('data-testid'))));
  for (const p of pecasNaMao(outro)) expect(p).toHaveAttribute('data-face', 'cima');
  for (const p of pecasNaMao(vez)) expect(p).toHaveAttribute('data-face', 'baixo');
});

// Só J2 tem dupla (6-6). Monte vazio.
const CENARIO_6_6_COM_J2 = { j1: '1-2,0-3,4-5', j2: '6-6,2-3,0-1', monte: '' };

test('TC-DO-03 quem tem a maior dupla começa', async () => {
  await abrirJogo(CENARIO_6_6_COM_J2);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J2$/);
});

test('TC-DO-04 a primeira jogada tem que ser a maior dupla', async () => {
  const user = await abrirJogo(CENARIO_6_6_COM_J2);
  await jogarPeca(user, 'j2', '2-3');
  expect(screen.getByTestId('mensagem')).toHaveTextContent('Jogada inválida');
  expect(pecasDaMesa()).toHaveLength(0);
  await jogarPeca(user, 'j2', '6-6');
  expect(pecasDaMesa()).toEqual(['6-6']);
});

// Ninguém tem dupla: começa quem tem a peça de maior soma (5-6, com J1).
const CENARIO_SEM_DUPLAS = { j1: '5-6,0-1', j2: '4-6,2-3', monte: '' };

test('TC-DO-05 sem duplas, começa a peça de maior soma', async () => {
  const user = await abrirJogo(CENARIO_SEM_DUPLAS);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
  await jogarPeca(user, 'j1', '0-1');
  expect(screen.getByTestId('mensagem')).toHaveTextContent('Jogada inválida');
  expect(pecasDaMesa()).toHaveLength(0);
  await jogarPeca(user, 'j1', '5-6');
  expect(pecasDaMesa()).toHaveLength(1);
  expect(['5-6', '6-5']).toContain(pecasDaMesa()[0]);
});

// J1 tem só uma dupla baixa (1-1); J2 tem a peça de maior soma (5-6), mas nenhuma dupla.
const CENARIO_DUPLA_X_SOMA = { j1: '1-1,0-2', j2: '5-6,0-3', monte: '' };

test('TC-DO-18 dupla vence soma: quem tem dupla começa, mesmo com soma menor', async () => {
  const user = await abrirJogo(CENARIO_DUPLA_X_SOMA);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
  await jogarPeca(user, 'j1', '1-1');
  expect(pecasDaMesa()).toEqual(['1-1']);
});
