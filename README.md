# desafio_teste_domino

Desafio de testes: casos de teste para testar **uma partida de dominó para 2 jogadores**, com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Colaboradores

| Nome | RA | GitHub | Parte no trabalho |
|---|---|---|---|
| Breno Bertaglia Nosima | 24113673-2 | [BrenoNosima](https://github.com/BrenoNosima) | Tarefas B1–B5: CI, documentação dos testes e 7 casos de teste |
| Gustavo Mazeto Pasquini | 24183078-2 | [Gustavo-Pasquini](https://github.com/Gustavo-Pasquini) | Tarefas G1–G6: estrutura do projeto e 16 casos de teste |

As contribuições de cada um aparecem em **Insights → Contributors** e nos commits. A divisão das tarefas e as regras completas estão em [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm test                    # roda todos os casos de teste (Jest)
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "TC-XX-NN"   # um caso só
```

## Funcionamento dos casos de teste

**Situação atual:** somente os casos de teste. O jogo ainda não está implementado, então **todos os testes falham de propósito**, pelo motivo certo (o comportamento ainda não existe). O `npm run verificar` confere isso.

- **Ferramentas:** [Jest](https://jestjs.io) roda os testes; [Testing Library](https://testing-library.com) (`@testing-library/dom`, `user-event` e `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador, sem precisar abrir um.
- **Testes de interface:** cada teste abre o `index.html` do jogo pela função `abrirJogo(params)` de `tests/helpers.js`, clica como um jogador e confere o que aparece na tela. Os testes não chamam funções internas do jogo.
- **Elementos da tela:** encontrados pelo atributo `data-testid` (contrato na seção 3 do PLANEJAMENTO.md).
- **Sem depender de sorte:** o cenário (cartas, minas, peças, frota, puzzle) é montado por parâmetros de URL, então cada teste começa sempre do mesmo jeito. O tempo usa relógio falso (`jest.useFakeTimers()`).
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-..-NN`), o mesmo da tabela abaixo e da seção 5 do PLANEJAMENTO.md.
- **Metodologia:** TDD, um caso de teste por vez: escrever, rodar, ver falhar pelo motivo certo e fazer o commit `test:`.
- **Integração contínua:** o GitHub Actions roda `npm ci` e `npm run verificar` em todo push e Pull Request.

## Casos de teste (23)

| ID | Cenário | Arquivo | Resultado esperado | Autor |
|---|---|---|---|---|
| TC-DO-01 | Distribuição | `tests/distribuicao.spec.js` | `mao-j1` e `mao-j2` com 7 peças; `monte-qtd` = 14; `mesa` vazia | Gustavo |
| TC-DO-02 | 28 peças sem repetir | `tests/distribuicao.spec.js` | Todas de `0-0` a `6-6`, nenhuma repetida | Gustavo |
| TC-DO-03 | Maior dupla começa | `tests/distribuicao.spec.js` | `vez` = J2 | Gustavo |
| TC-DO-04 | Dupla obrigatória | `tests/distribuicao.spec.js` | `mensagem` = "Jogada inválida"; mesa vazia. Clicar 6-6 → mesa = `6-6` | Gustavo |
| TC-DO-05 | Sem duplas | `tests/distribuicao.spec.js` | `vez` = J1 (5-6 tem a maior soma); só 5-6 pode ser jogada primeiro | Gustavo |
| TC-DO-06 | Encaixe | `tests/jogadas.spec.js` | `mesa` = `6-6`, `6-3`; `ponta-esquerda` = 6, `ponta-direita` = 3; `vez` = J1 | Gustavo |
| TC-DO-07 | Peça girada | `tests/jogadas.spec.js` | Na mesa aparece `3-1`; `ponta-direita` = 1; não aparece `escolha-lado` | Gustavo |
| TC-DO-08 | Jogada inválida | `tests/jogadas.spec.js` | `mensagem` = "Jogada inválida"; 0-0 continua na mão; `vez` continua J1 | Gustavo |
| TC-DO-09 | Escolher o lado | `tests/jogadas.spec.js` | `escolha-lado` aparece; `btn-esquerda` → peça entra à esquerda como `1-6` e `ponta-esquerda` = 1 | Gustavo |
| TC-DO-10 | Mão escondida | `tests/distribuicao.spec.js` | Peças do jogador da vez `data-face="cima"`, do outro `"baixo"`; depois de jogar, invertem | Gustavo |
| TC-DO-11 | Comprar só sem jogada | `tests/compra.spec.js` | Para J2 (tem 6-2) `btn-comprar` desabilitado | Breno |
| TC-DO-12 | Comprar até conseguir jogar | `tests/compra.spec.js` | J2: `btn-comprar` habilitado; comprar 3 vezes → `monte-qtd` = 0 e 4-6 na mão; depois de pegar 4-6, `btn-comprar` desabilita | Breno |
| TC-DO-13 | Passar | `tests/compra.spec.js` | J2: `btn-comprar` desabilitado, `btn-passar` habilitado; passar → `vez` = J1 | Breno |
| TC-DO-14 | Batida | `tests/fim-de-jogo.spec.js` | `mensagem` = "Jogador 1 venceu!"; `pontos-j1` = 6 (2+4+0+0); peças travadas | Breno |
| TC-DO-15 | Jogo trancado | `tests/fim-de-jogo.spec.js` | `mensagem` = "Jogo trancado — Jogador 1 venceu!" (1 ponto contra 13); `pontos-j1` = 13 | Breno |
| TC-DO-16 | Trancado com empate | `tests/fim-de-jogo.spec.js` | Somas 4 × 4 (1+3 = 4; 2+2 = 4); `mensagem` = "Empate"; ninguém pontua | Breno |
| TC-DO-17 | Nova partida | `tests/fim-de-jogo.spec.js` | 7 peças para cada um, monte 14, mesa vazia, `mensagem` vazia | Breno |
| TC-DO-18 | Dupla vence soma | `tests/distribuicao.spec.js` | `vez` = J1; J1 joga 1-1 → mesa = `1-1` | Gustavo |
| TC-DO-19 | Maior dupla entre várias | `tests/distribuicao.spec.js` | `vez` = J2; 1-2 → "Jogada inválida"; 5-5 → mesa = `5-5` | Gustavo |
| TC-DO-20 | Escolher o lado direito | `tests/jogadas.spec.js` | Mesa = `6-6`, `6-3`, `3-1`, `1-6`; `ponta-direita` = 6 | Gustavo |
| TC-DO-21 | Girar na ponta esquerda | `tests/jogadas.spec.js` | Mesa = `5-2`, `2-6`, `6-6`, `6-3`; `ponta-esquerda` = 5 | Gustavo |
| TC-DO-22 | Peças jogáveis destacadas | `tests/dicas.spec.js` | Antes: só 6-6 de J1 marcada (saída obrigatória). Depois: 3-6 e 1-6 de J2 marcadas, 2-2 não; nada marcado em J1 | Gustavo |
| TC-DO-23 | Sugerir comprar | `tests/dicas.spec.js` | Na vez de J1, `btn-comprar` sem sugestão; na de J2, nenhuma peça marcada e `btn-comprar` com `data-sugerido="true"` | Gustavo |

## Estrutura

```
index.html                esqueleto da tela (elementos da seção 3)
js/main.js                ponto de entrada do jogo
tests/helpers.js          abrirJogo(), cenários fixos e atalhos
tests/*.spec.js           casos de teste
scripts/verificar-testes.mjs  verificador (npm run verificar e CI)
PLANEJAMENTO.md           regras, contrato, tarefas e casos de teste
docs/                     matriz de cobertura e TDD com IA
```
