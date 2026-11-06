# Planejamento — desafio_teste_domino

Partida de dominó para **2 jogadores**, jogável no navegador, com casos de teste de interface em JavaScript.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Gustavo Mazeto Pasquini (24183078-2) | Gustavo-Pasquini | Setup do projeto, peças e distribuição, quem começa, jogar peças na mesa |
| Breno Bertaglia Nosima (24113673-2) | BrenoNosima | Comprar e passar, batida, jogo trancado, pontuação, fim da partida, CI e documentação dos testes |

---

## 1. Regras que o jogo deve seguir (escopo)

- **28 peças** (duplo-seis): todas as combinações de 0 a 6, de `0-0` a `6-6`. Soma de todos os pontos = 168.
- **2 jogadores** no mesmo computador (J1 e J2). Só a mão do jogador da vez fica virada para cima.
- **Distribuição:** 7 peças para cada um; as 14 restantes formam o **monte** (para compra).
- **Quem começa:** quem tiver a **maior dupla** (6-6, senão 5-5, …) e é obrigado a jogá-la. Se ninguém tiver dupla, começa quem tiver a peça de maior soma, jogando essa peça.
- **Jogar:** a peça precisa ter um dos números das **pontas** da mesa. Ela é girada automaticamente para encaixar. Se encaixar nas duas pontas, o jogador escolhe o lado.
- **Comprar:** só pode comprar quem não tem nenhuma peça que encaixe. Compra uma por vez, até ter uma jogável ou o monte acabar.
- **Passar:** só quando não tem peça jogável **e** o monte está vazio.
- A vez alterna depois de cada jogada ou passe.
- **Batida:** quem jogar a última peça da mão vence e marca a soma dos pontos que sobraram na mão do adversário.
- **Jogo trancado:** monte vazio e nenhum dos dois consegue jogar. Vence quem tem **menos pontos** na mão e marca a soma da mão do adversário. Somas iguais → **empate**.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Jogo | HTML + CSS + JavaScript puro (ES Modules), sem framework. Ponto de entrada: `js/main.js` |
| Executor dos testes | [Vitest](https://vitest.dev) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`environment: 'jsdom'` no `vitest.config.js`). Não precisa baixar navegador |
| Servidor para jogar | `http-server` (`npm start`) |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm test` em todo push e Pull Request |

Dependências de desenvolvimento (tarefa G1): `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `http-server`, `@stryker-mutator/core`, `@stryker-mutator/vitest-runner`.

Comandos que o projeto deve ter (criados na tarefa G1):

```bash
npm install          # instala dependências (não baixa navegador)
npm start            # abre o jogo em http://localhost:8080 para jogar
npm test             # roda todos os testes uma vez (vitest run)
npm run test:watch   # roda de novo a cada arquivo salvo (vitest)
npm run test:ui      # interface visual do Vitest no navegador (vitest --ui)
npm run mutacao      # teste de mutação: os testes percebem quando o código é estragado? (stryker run)
```

`stryker.config.json` (tarefa G1):

```json
{
  "testRunner": "vitest",
  "vitest": { "configFile": "vitest.config.js" },
  "mutate": ["js/**/*.js", "!js/main.js"],
  "reporters": ["clear-text", "progress", "html"]
}
```

Como um teste abre o jogo — `tests/helpers.js` (tarefa G1):

```js
// tests/helpers.js
import { readFileSync } from 'node:fs';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

export async function abrirJogo(params = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params)); // parâmetros da seção 3
  document.body.innerHTML = corpo;          // mesmo HTML do jogo
  vi.resetModules();                        // cada teste começa um jogo novo
  await import('../js/main.js');            // main.js lê location.search e inicia o jogo
  return userEvent.setup();                 // "user" para clicar como um jogador
}
```

Exemplo de caso de teste:

```js
import { test, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { abrirJogo } from './helpers.js';

test('TC-XX-01 exemplo', async () => {
  const user = await abrirJogo({ /* parâmetros */ });
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('mensagem')).toHaveTextContent('...');
});
```

Regras para os testes:

- Os testes **só** acessam o jogo pelo que o usuário vê/clica: `screen.getByTestId(...)`, `getByRole(...)` e `user.click`, `user.dblClick`, `user.pointer(...)`. Nada de chamar funções internas do jogo.
- Clique direito: `await user.pointer({ keys: '[MouseRight]', target: elemento })`. Clique duplo: `await user.dblClick(elemento)`.
- O jsdom **não lê CSS**. Para esconder/mostrar algo use o atributo `hidden`; para bloquear botão, `disabled`. Assim `toBeVisible()` e `toBeDisabled()` funcionam.
- Tempo (cronômetro): `vi.useFakeTimers()` no teste, `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` e `vi.advanceTimersByTime(2000)` para "esperar" 2 s sem esperar de verdade.
- `main.js` inicia o jogo assim que é importado e não usa `DOMContentLoaded` (o `index.html` carrega com `<script type="module" src="js/main.js">`, que já roda depois do HTML).
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- Aleatoriedade é controlada por **parâmetros de URL** (seção 3). Um teste nunca depende de sorte.
- Cada caso de teste da seção 5 vira um `test('TC-XX-NN ...')` com o **mesmo ID no título**, para ser rastreável na saída do Vitest.


Arquivos para agentes de IA (já estão no repositório; ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md)):

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd G2)
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd G2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, implementador, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/hooks/rodar-testes.mjs   o hook: roda npm test após editar js/ ou tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
```

Estrutura de pastas e dono de cada arquivo:

```
desafio_teste_domino/
├── index.html              G1
├── css/estilo.css          G1 (cada um estiliza a própria parte)
├── js/main.js              G1  ponto de entrada: lê a URL e inicia o jogo
├── js/pecas.js             Gustavo  28 peças, embaralhar, distribuir
├── js/mesa.js              Gustavo  pontas, encaixar, girar, escolher lado
├── js/jogo.js              Gustavo  quem começa, turnos
├── js/ui-mesa.js           Gustavo  desenha mãos e mesa
├── js/compra.js            Breno    comprar, passar
├── js/fim.js               Breno    batida, trancado, pontuação
├── js/ui-controles.js      Breno    botões comprar/passar, mensagens, pontos, nova partida
├── tests/helpers.js        G1
├── tests/distribuicao.spec.js   Gustavo
├── tests/jogadas.spec.js        Gustavo
├── tests/compra.spec.js         Breno
├── tests/fim-de-jogo.spec.js    Breno
├── .github/workflows/testes.yml Breno
├── vitest.config.js        G1
└── package.json            G1
```

## 3. Contrato de interface (o que os testes usam)

### Elementos (`data-testid`)

| data-testid | O que é |
|---|---|
| `btn-nova-partida` | Distribui as peças e começa |
| `mao-j1` / `mao-j2` | Mão de cada jogador |
| `peca-A-B` | Cada peça na mão, com A ≤ B (ex.: `peca-3-6`). Atributo `data-face="cima"\|"baixo"` |
| `mesa` | Peças jogadas. Cada filho tem `data-peca` na orientação em que está na mesa (ex.: `6-6`, `6-3`, `3-1`) |
| `ponta-esquerda` / `ponta-direita` | Número de cada ponta |
| `escolha-lado` | Caixa com `btn-esquerda` e `btn-direita` |
| `monte-qtd` | Peças no monte |
| `vez` | `J1` ou `J2` |
| `btn-comprar` / `btn-passar` | Comprar do monte / passar a vez |
| `pontos-j1` / `pontos-j2` | Pontos marcados na partida |
| `mensagem` | "Jogada inválida", "Jogador 1 venceu!", "Jogo trancado — Jogador 2 venceu!", "Empate" |

### Parâmetros de URL

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `j1` | `?j1=6-6,6-3,1-3,2-2,0-4,5-5,1-1` | Mão do J1 (qualquer quantidade) |
| `j2` | `?j2=…` | Mão do J2 |
| `monte` | `?monte=0-0,0-1` ou `?monte=` (vazio) | Monte, na ordem de compra |

Se qualquer um dos três for usado, **só existem as peças listadas** (as outras ficam fora da partida). Assim dá para montar cenários pequenos.

Cenário fixo usado nos testes de jogada (fica no `tests/helpers.js`):
`CENARIO_JOGADAS` = `?j1=6-6,1-3,0-0&j2=3-6,1-6,2-2&monte=` — J1 começa (tem 6-6).

## 4. Divisão de tarefas

Cada tarefa segue o mesmo ciclo (TDD), e os **dois tipos de commit precisam existir**:

1. Escrever os casos de teste da tarefa (vão falhar) → commit `test: TC-XX-NN ...`
2. Implementar o mínimo para passar → commit `feat: ...`
3. Refatorar se precisar, rodar `npm test` inteiro → commit `refactor:` / `fix:`
4. Abrir Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos diferentes** (coluna "Arquivos"). Assim, depois da G1, os dois trabalham em paralelo sem conflito. Se precisar mexer num arquivo do outro, combine antes e faça um commit pequeno e separado.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd G2` no Claude Code ou `$tdd G2` no Codex; depois, "go" faz o próximo TC. Como e por que funciona: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md). Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Gustavo

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **G1** Setup: `package.json`, `vitest.config.js` (`environment: 'jsdom'`), `js/main.js`, `.gitignore`, `index.html` com os `data-testid` da seção 3, `tests/helpers.js` com `abrirJogo(params)` e `CENARIO_JOGADAS`, e um teste "a página abre" | `gustavo/g1-setup` | index.html, css, config, helpers | — |
| **G2** 28 peças e distribuição | `gustavo/g2-distribuicao` | pecas.js, ui-mesa.js | TC-DO-01, 02, 10 |
| **G3** Quem começa | `gustavo/g3-quem-comeca` | jogo.js | TC-DO-03 a 05 |
| **G4** Encaixar e girar peças, jogada inválida, alternar vez | `gustavo/g4-jogadas` | mesa.js | TC-DO-06 a 08 |
| **G5** Escolher o lado | `gustavo/g5-lado` | mesa.js | TC-DO-09 |

### Breno

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **B1** CI no GitHub Actions (`npm ci`, `npm test`) + tabela de testes no README | `breno/b1-ci-readme` | .github/workflows, README.md | — |
| **B2** Comprar do monte | `breno/b2-comprar` | compra.js, ui-controles.js | TC-DO-11, 12 |
| **B3** Passar a vez | `breno/b3-passar` | compra.js | TC-DO-13 |
| **B4** Batida e pontuação | `breno/b4-batida` | fim.js | TC-DO-14 |
| **B5** Jogo trancado, empate e nova partida | `breno/b5-trancado` | fim.js, ui-controles.js | TC-DO-15 a 17 |

## 5. Casos de teste (interface)

### Gustavo — peças, início e jogadas

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-DO-01 | Distribuição | Sem parâmetros, `btn-nova-partida` | `mao-j1` e `mao-j2` com 7 peças; `monte-qtd` = 14; `mesa` vazia |
| TC-DO-02 | 28 peças sem repetir | Sem parâmetros. 20 vezes: nova partida, ler os `data-testid` das 14 peças das mãos | Todas de `0-0` a `6-6`, nenhuma repetida |
| TC-DO-03 | Maior dupla começa | `j1=1-2,…` (sem 6-6), `j2=6-6,…` | `vez` = J2 |
| TC-DO-04 | Dupla obrigatória | Cenário do TC-DO-03; J2 clica outra peça que não 6-6 | `mensagem` = "Jogada inválida"; mesa vazia. Clicar 6-6 → mesa = `6-6` |
| TC-DO-05 | Sem duplas | `j1=5-6,0-1`, `j2=4-6,2-3` (nenhuma dupla) | `vez` = J1 (5-6 tem a maior soma); só 5-6 pode ser jogada primeiro |
| TC-DO-06 | Encaixe | `CENARIO_JOGADAS`. J1 joga 6-6, J2 joga 3-6 | `mesa` = `6-6`, `6-3`; `ponta-esquerda` = 6, `ponta-direita` = 3; `vez` = J1 |
| TC-DO-07 | Peça girada | Continuando o TC-DO-06: J1 joga 1-3 (só encaixa no 3) | Na mesa aparece `3-1`; `ponta-direita` = 1; não aparece `escolha-lado` |
| TC-DO-08 | Jogada inválida | Depois do TC-DO-06 (pontas 6 e 3), J1 clica 0-0 | `mensagem` = "Jogada inválida"; 0-0 continua na mão; `vez` continua J1 |
| TC-DO-09 | Escolher o lado | Depois do TC-DO-07 (pontas 6 e 1), J2 clica 1-6 | `escolha-lado` aparece; `btn-esquerda` → peça entra à esquerda como `1-6` e `ponta-esquerda` = 1 |
| TC-DO-10 | Mão escondida | Nova partida | Peças do jogador da vez `data-face="cima"`, do outro `"baixo"`; depois de jogar, invertem |

### Breno — compra, passe e fim da partida

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-DO-11 | Comprar só sem jogada | `j1=6-6,6-1`, `j2=0-1,6-2`, `monte=3-4`. J1 joga 6-6 | Para J2 (tem 6-2) `btn-comprar` desabilitado |
| TC-DO-12 | Comprar até conseguir jogar | `j1=6-6,5-5`, `j2=0-1,2-3`, `monte=0-0,1-2,4-6`. J1 joga 6-6 | J2: `btn-comprar` habilitado; comprar 3 vezes → `monte-qtd` = 0 e 4-6 na mão; depois de pegar 4-6, `btn-comprar` desabilita |
| TC-DO-13 | Passar | `j1=6-6,6-5`, `j2=0-1`, `monte=` (vazio). J1 joga 6-6 | J2: `btn-comprar` desabilitado, `btn-passar` habilitado; passar → `vez` = J1 |
| TC-DO-14 | Batida | `j1=6-6,6-3`, `j2=6-1,2-4,0-0`, `monte=`. J1 joga 6-6, J2 joga 6-1, J1 joga 6-3 | `mensagem` = "Jogador 1 venceu!"; `pontos-j1` = 6 (2+4+0+0); peças travadas |
| TC-DO-15 | Jogo trancado | `j1=6-6,0-1`, `j2=2-3,4-4`, `monte=`. J1 joga 6-6; ninguém tem 6 | `mensagem` = "Jogo trancado — Jogador 1 venceu!" (1 ponto contra 13); `pontos-j1` = 13 |
| TC-DO-16 | Trancado com empate | `j1=6-6,0-4`, `j2=1-3,2-2`, `monte=`. J1 joga 6-6 | Somas 4 × 4 (1+3 = 4; 2+2 = 4); `mensagem` = "Empate"; ninguém pontua |
| TC-DO-17 | Nova partida | Depois do TC-DO-14, clicar `btn-nova-partida` (sem parâmetros) | 7 peças para cada um, monte 14, mesa vazia, `mensagem` vazia |

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Gustavo** cria o repositório e adiciona `BrenoNosima` como colaborador (Settings → Collaborators). **Breno** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main`. Uma branch por tarefa: `gustavo/g2-distribuicao`, `breno/b2-truco`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`. Commits pequenos (um caso de teste ou uma regra por commit).
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main`, `npm test` verde. O CI precisa estar verde no PR.
7. Ordem: **G1 entra primeiro** (estrutura do projeto). Depois disso as tarefas G e B podem andar em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

O desafio só está pronto para entrega quando:

- [ ] Todos os casos de teste da seção 5 implementados em `tests/` e passando com `npm test`
- [ ] Jogo jogável do início ao fim com `npm start`, sem erros no console
- [ ] README com: colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → o que verifica) — tarefa B1
- [ ] CI (GitHub Actions) verde na `main` — tarefa B1
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_domino`
