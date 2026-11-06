// Testes de compra e passe (Breno — B2 e B3).
import { test, expect } from 'vitest';
import { abrirJogo, screen, pecasNaMao, jogarPeca } from './helpers.js';

test('TC-DO-11 comprar fica desabilitado quando há jogada', async () => {
  const user = await abrirJogo({ j1: '6-6,6-1', j2: '0-1,6-2', monte: '3-4' });
  await jogarPeca(user, 'j1', '6-6');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J2$/);
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
});
