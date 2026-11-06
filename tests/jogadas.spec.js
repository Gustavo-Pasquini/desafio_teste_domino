// Testes de jogar peças na mesa (Gustavo — G4, G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, pecasNaMao, jogarPeca, pecasDaMesa, CENARIO_JOGADAS } from './helpers.js';

// CENARIO_JOGADAS: J1 = 6-6, 1-3, 0-0 · J2 = 3-6, 1-6, 2-2 · monte vazio.
/** J1 joga 6-6 e J2 joga 3-6 → pontas 6 e 3. */
async function ateTC06(user) {
  await jogarPeca(user, 'j1', '6-6');
  await jogarPeca(user, 'j2', '3-6');
}
/** ... e J1 joga 1-3 → pontas 6 e 1. */
async function ateTC07(user) {
  await ateTC06(user);
  await jogarPeca(user, 'j1', '1-3');
}

test('TC-DO-06 a peça encaixa na ponta com o mesmo número', async () => {
  const user = await abrirJogo(CENARIO_JOGADAS);
  await ateTC06(user);
  expect(pecasDaMesa()).toEqual(['6-6', '6-3']); // pontas iguais (6 e 6): entra à direita
  expect(screen.getByTestId('escolha-lado')).not.toBeVisible(); // ... sem perguntar
  expect(screen.getByTestId('ponta-esquerda')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
});

test('TC-DO-07 a peça é girada para encaixar', async () => {
  const user = await abrirJogo(CENARIO_JOGADAS);
  await ateTC07(user); // 1-3 só encaixa no 3
  expect(pecasDaMesa()).toEqual(['6-6', '6-3', '3-1']);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('escolha-lado')).not.toBeVisible();
});

// J1 = 6-6, 2-6, 0-0 · J2 = 3-6, 2-5, 1-1. Depois de 6-6 e 3-6, as pontas são 6 (esq.) e 3 (dir.):
// 2-6 só encaixa na esquerda; depois, 2-5 só encaixa na esquerda (no 2) e precisa virar 5-2.
const CENARIO_GIRO_ESQUERDA = { j1: '6-6,2-6,0-0', j2: '3-6,2-5,1-1', monte: '' };

test('TC-DO-21 a peça é girada também na ponta esquerda', async () => {
  const user = await abrirJogo(CENARIO_GIRO_ESQUERDA);
  await jogarPeca(user, 'j1', '6-6');
  await jogarPeca(user, 'j2', '3-6');
  await jogarPeca(user, 'j1', '2-6');
  expect(pecasDaMesa()).toEqual(['2-6', '6-6', '6-3']);
  await jogarPeca(user, 'j2', '2-5');
  expect(pecasDaMesa()).toEqual(['5-2', '2-6', '6-6', '6-3']);
  expect(screen.getByTestId('ponta-esquerda')).toHaveTextContent(/^5$/);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^3$/);
});

test('TC-DO-08 peça que não encaixa é recusada', async () => {
  const user = await abrirJogo(CENARIO_JOGADAS);
  await ateTC06(user); // pontas 6 e 3
  await jogarPeca(user, 'j1', '0-0');
  expect(screen.getByTestId('mensagem')).toHaveTextContent('Jogada inválida');
  expect(pecasNaMao('j1').map((p) => p.getAttribute('data-testid'))).toContain('peca-0-0');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
});

test('TC-DO-09 peça que encaixa nas duas pontas: o jogador escolhe o lado', async () => {
  const user = await abrirJogo(CENARIO_JOGADAS);
  await ateTC07(user); // pontas 6 e 1
  expect(screen.getByTestId('escolha-lado')).not.toBeVisible();
  await jogarPeca(user, 'j2', '1-6');
  expect(screen.getByTestId('escolha-lado')).toBeVisible();
  expect(pecasDaMesa()).toHaveLength(3); // ainda não entrou: espera a escolha
  await user.click(screen.getByTestId('btn-esquerda'));
  expect(pecasDaMesa()).toEqual(['1-6', '6-6', '6-3', '3-1']);
  expect(screen.getByTestId('ponta-esquerda')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('escolha-lado')).not.toBeVisible();
});

test('TC-DO-20 peça que encaixa nas duas pontas: escolher a direita', async () => {
  const user = await abrirJogo(CENARIO_JOGADAS);
  await ateTC07(user); // pontas 6 e 1
  await jogarPeca(user, 'j2', '1-6');
  expect(screen.getByTestId('escolha-lado')).toBeVisible();
  await user.click(screen.getByTestId('btn-direita'));
  expect(pecasDaMesa()).toEqual(['6-6', '6-3', '3-1', '1-6']);
  expect(screen.getByTestId('ponta-direita')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('escolha-lado')).not.toBeVisible();
});
