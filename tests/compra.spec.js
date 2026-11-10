// Testes de compra e passe (Breno — B2 e B3).
import { abrirJogo, screen, pecasNaMao, jogarPeca } from './helpers.js';

test('TC-DO-11 comprar fica desabilitado quando há jogada', async () => {
  const user = await abrirJogo({ j1: '6-6,6-1', j2: '0-1,6-2', monte: '3-4' });
  await jogarPeca(user, 'j1', '6-6');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J2$/);
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
});

test('TC-DO-12 comprar continua até obter peça jogável', async () => {
  const user = await abrirJogo({ j1: '6-6,5-5', j2: '0-1,2-3', monte: '0-0,1-2,4-6' });
  await jogarPeca(user, 'j1', '6-6');
  expect(screen.getByTestId('btn-comprar')).toBeEnabled();
  await user.click(screen.getByTestId('btn-comprar')); // compra 0-0: uma peça por clique
  expect(screen.getByTestId('monte-qtd')).toHaveTextContent(/^2$/);
  expect(pecasNaMao('j2')).toHaveLength(3);
  expect(screen.getByTestId('btn-comprar')).toBeEnabled();
  await user.click(screen.getByTestId('btn-comprar')); // compra 1-2
  expect(screen.getByTestId('monte-qtd')).toHaveTextContent(/^1$/);
  expect(pecasNaMao('j2')).toHaveLength(4);
  expect(screen.getByTestId('btn-comprar')).toBeEnabled();
  await user.click(screen.getByTestId('btn-comprar')); // compra 4-6, que encaixa no 6
  expect(screen.getByTestId('monte-qtd')).toHaveTextContent(/^0$/);
  expect(pecasNaMao('j2')).toHaveLength(5);
  expect(pecasNaMao('j2').map((p) => p.dataset.testid)).toContain('peca-4-6');
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
});

test('TC-DO-13 passar alterna a vez quando monte está vazio', async () => {
  const user = await abrirJogo({ j1: '6-6,6-5', j2: '0-1', monte: '' });
  await jogarPeca(user, 'j1', '6-6');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J2$/);
  expect(screen.getByTestId('btn-comprar')).toBeDisabled();
  expect(screen.getByTestId('btn-passar')).toBeEnabled();
  await user.click(screen.getByTestId('btn-passar'));
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
});
