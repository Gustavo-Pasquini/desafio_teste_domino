# Planejamento — desafio_teste_domino

Partida de dominó para **2 jogadores**: **casos de teste de interface em JavaScript**. O jogo é implementado a partir desses testes (fase GREEN liberada em 10/11/2026).

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Gustavo Mazeto Pasquini (24183078-2) | Gustavo-Pasquini | Setup do projeto e testes de: peças e distribuição, quem começa, jogar peças na mesa |
| Breno Bertaglia Nosima (24113673-2) | BrenoNosima | Testes de: comprar e passar, batida, jogo trancado, pontuação, fim da partida; CI e documentação dos testes |

---

## 1. Regras do jogo (o que os testes verificam)

- **28 peças** (duplo-seis): todas as combinações de 0 a 6, de `0-0` a `6-6`. Soma de todos os pontos = 168.
- **2 jogadores** no mesmo computador (J1 e J2). Só a mão do jogador da vez fica virada para cima.
- **Distribuição:** 7 peças para cada um; as 14 restantes formam o **monte** (para compra).
- **Quem começa:** quem tiver a **maior dupla** (6-6, senão 5-5, …) e é obrigado a jogá-la. Se ninguém tiver dupla, começa quem tiver a peça de maior soma, jogando essa peça.
- **Jogar:** a peça precisa ter um dos números das **pontas** da mesa. Ela é girada automaticamente para encaixar. Se encaixar nas duas pontas, o jogador escolhe o lado. Se as duas pontas têm o **mesmo número** (por exemplo, só o 6-6 na mesa), a peça entra à **direita** sem perguntar.
- **Comprar:** só pode comprar quem não tem nenhuma peça que encaixe. Compra uma por vez, até ter uma jogável ou o monte acabar.
- **Passar:** só quando não tem peça jogável **e** o monte está vazio.
- A vez alterna depois de cada jogada ou passe.
- **Batida:** quem jogar a última peça da mão vence e marca a soma dos pontos que sobraram na mão do adversário.
- **Jogo trancado:** monte vazio e nenhum dos dois consegue jogar. Vence quem tem **menos pontos** na mão e marca a soma da mão do adversário. Somas iguais → **empate**.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Entrega atual | Casos de teste **e** o jogo que os faz passar (fase GREEN liberada em 10/11/2026; ver [docs/FASE-GREEN.md](docs/FASE-GREEN.md)) |
| Executor dos testes | [Jest](https://jestjs.io) (com `babel-jest` para os ES Modules) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`testEnvironment: 'jsdom'`, via `jest-environment-jsdom`). Não precisa baixar navegador |
| Esqueleto da tela | `index.html` com os elementos da seção 3 **vazios** + `js/main.js` vazio. É só o "molde" que os testes abrem |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm run verificar` em todo push e Pull Request |

Dependências de desenvolvimento (tarefa G1): `jest`, `jest-environment-jsdom`, `babel-jest`, `@babel/core`, `@babel/preset-env`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`.

Comandos que o projeto deve ter (`package.json` da tarefa G1):

```bash
npm install                 # instala dependências (não baixa navegador)
npm test                    # roda os testes (jest)
npm run verificar           # confere se cada teste falha pelo motivo certo e tem um ID do plano
npm run verificar:completo  # idem + acusa TCs do plano que ainda não têm teste (usar na entrega)
npm start                   # jogar em http://localhost:8080
npm run mutacao             # teste de mutação (Stryker)
```

```json
"scripts": {
  "test": "jest",
  "verificar": "node scripts/verificar-testes.mjs",
  "verificar:completo": "node scripts/verificar-testes.mjs --completo"
}
```

### Fase GREEN (liberada em 10/11/2026)

Os testes foram escritos primeiro (RED). Agora o jogo é implementado para passar em cada um, **um TC por vez**, com o mínimo de código em `js/` e **sem alterar `tests/`**. `npm test` precisa ficar todo verde, e `npm run verificar` não pode acusar falha pelo motivo errado.

### Esqueleto da tela (`index.html`, tarefa G1)

- Tem os elementos **fixos** da seção 3, cada um com seu `data-testid`, **sem texto, sem valor e sem atributos de estado** (`data-estado`, `disabled`, `hidden`). Senão algum teste passaria sem o jogo existir.
- Elementos criados pelo jogo (células, cartas, peças, casas) **não** entram no esqueleto.
- Carrega `<script type="module" src="js/main.js"></script>`; `js/main.js` lê os parâmetros da URL e inicia o jogo.

### Como um teste abre o jogo — `tests/helpers.js` (tarefa G1)

```js
// tests/helpers.js
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params)); // parâmetros da seção 3
  document.body.innerHTML = corpo;          // mesmo HTML do jogo
  jest.resetModules();                        // cada teste começa um jogo novo
  await import('../js/main.js');            // lê location.search e inicia o jogo
  return userEvent.setup(opcoesUser);       // "user" para clicar como um jogador
}
```

Exemplo de caso de teste:

```js
import { screen } from '@testing-library/dom';
import { abrirJogo } from './helpers.js';

test('TC-XX-01 exemplo', async () => {
  const user = await abrirJogo({ /* parâmetros */ });
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('mensagem')).toHaveTextContent('...');
});
```

### Regras para os testes

- Os testes **só** acessam o jogo pelo que o usuário vê/clica: `screen.getByTestId(...)`, `getByRole(...)` e `user.click`, `user.dblClick`, `user.pointer(...)`. Nada de importar `js/*.js` ou chamar funções internas.
- Clique direito: `await user.pointer({ keys: '[MouseRight]', target: elemento })`. Clique duplo: `await user.dblClick(elemento)`.
- O jsdom **não lê CSS**. Esconder/mostrar se confere pelo atributo `hidden` (`toBeVisible()`); bloqueio, pelo `disabled` (`toBeDisabled()`).
- Tempo (cronômetro): `jest.useFakeTimers()` no teste, `abrirJogo(params, { advanceTimers: jest.advanceTimersByTime })` e `jest.advanceTimersByTime(2000)` para "esperar" 2 s sem esperar de verdade.
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- Aleatoriedade é controlada por **parâmetros de URL** (seção 3). Um teste nunca depende de sorte.
- Cada caso de teste da seção 5 vira um `test('TC-XX-NN ...')` com o **mesmo ID no título** (o verificador exige).
- Proibido `test.skip`, `test.todo` e `.only` (o verificador acusa).

### Arquivos para agentes de IA (já estão no repositório; ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md))

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd G2)
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd G2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/verificar-testes.mjs     verificador (npm run verificar, CI e hook)
scripts/hooks/rodar-testes.mjs   o hook: roda o verificador após editar tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
docs/FASE-GREEN.md               o que fazer quando a implementação for liberada
```

Estrutura de pastas e dono de cada arquivo.

> Os arquivos de `js/` e o `css/` seguem a divisão abaixo (fase GREEN liberada em 10/11/2026).

```
desafio_teste_domino/
├── index.html              G1  esqueleto: elementos fixos da seção 3, vazios
├── js/main.js              G1  lê a URL e inicia o jogo
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
├── babel.config.cjs        G1  Jest: ES Modules → CommonJS
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

Se qualquer um dos três for usado, **só existem as peças listadas** (as outras ficam fora da partida). Assim dá para montar cenários pequenos. Com esses parâmetros, a partida **já começa ao abrir a página**, sem clicar em `btn-nova-partida`.

Cenário fixo usado nos testes de jogada (fica no `tests/helpers.js`):
`CENARIO_JOGADAS` = `?j1=6-6,1-3,0-0&j2=3-6,1-6,2-2&monte=` — J1 começa (tem 6-6).

### Esclarecimentos da revisão (contrato)

- Os parâmetros `j1`, `j2` e `monte` valem só para a partida que começa ao abrir a página. `btn-nova-partida` depois disso sorteia uma partida normal (7 + 7 + 14).
- Peça bloqueada tem o atributo `disabled`.

## 4. Divisão de tarefas

> ✅ **Fase GREEN liberada (10/11/2026).** Os casos de teste já existem. Agora cada tarefa é fazer os seus TCs passarem com o jogo de verdade.

Cada tarefa segue o mesmo ciclo, **um caso de teste por vez**:

1. 🔴 O teste do TC já existe e falha pelo motivo certo.
2. 🟢 Escrever o **mínimo** de código em `js/` para ele passar, sem tocar em `tests/` e sem "decorar" o cenário do teste → `npm test` verde → commit `feat: ... (TC-XX-NN)`.
3. 🔵 Com tudo verde, refatorar → `refactor:`.
4. No fim da tarefa: revisão (`revisor-tdd`), `npm run mutacao`, atualizar a tabela de testes do README e abrir o Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos diferentes (de teste e de `js/`)** (coluna "Arquivos"). Assim, depois da G1, os dois trabalham em paralelo sem conflito. `tests/helpers.js` é da G1: se precisar mudar, combine antes e faça um commit pequeno e separado.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd G2` no Claude Code ou `$tdd G2` no Codex; depois, "go" escreve o próximo TC. Como e por que funciona: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md). Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Gustavo

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **G1** Setup: `package.json`, configuração do Jest no `package.json` + `babel.config.cjs`, `js/main.js` vazio, `.gitignore`, `index.html` esqueleto (elementos fixos da seção 3 **vazios**, sem texto nem atributos de estado), `tests/helpers.js` com `abrirJogo(params)` e `CENARIO_JOGADAS` | `gustavo/g1-setup` | index.html, js/main.js, config, tests/helpers.js | — |
| **G2** 28 peças e distribuição | `gustavo/g2-distribuicao` | tests/distribuicao.spec.js | TC-DO-01, 02, 10 |
| **G3** Quem começa | `gustavo/g3-quem-comeca` | tests/distribuicao.spec.js | TC-DO-03 a 05, 18, 19 |
| **G4** Encaixar e girar peças, jogada inválida, alternar vez | `gustavo/g4-jogadas` | tests/jogadas.spec.js | TC-DO-06 a 08, 21 |
| **G5** Escolher o lado | `gustavo/g5-lado` | tests/jogadas.spec.js | TC-DO-09, 20 |

### Breno

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **B1** CI no GitHub Actions (`npm ci`, `npm run verificar`) + tabela de testes no README | `breno/b1-ci-readme` | .github/workflows, README.md | — |
| **B2** Comprar do monte | `breno/b2-comprar` | tests/compra.spec.js | TC-DO-11, 12 |
| **B3** Passar a vez | `breno/b3-passar` | tests/compra.spec.js | TC-DO-13 |
| **B4** Batida e pontuação | `breno/b4-batida` | tests/fim-de-jogo.spec.js | TC-DO-14 |
| **B5** Jogo trancado, empate e nova partida | `breno/b5-trancado` | tests/fim-de-jogo.spec.js | TC-DO-15 a 17 |

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
| TC-DO-18 | Dupla vence soma | `j1=1-1,0-2`, `j2=5-6,0-3`, `monte=` (J2 tem a maior soma, mas só J1 tem dupla) | `vez` = J1; J1 joga 1-1 → mesa = `1-1` |
| TC-DO-19 | Maior dupla entre várias | `j1=3-3,5-6`, `j2=5-5,1-2`, `monte=` (J1 tem a maior soma; J2, a maior dupla) | `vez` = J2; 1-2 → "Jogada inválida"; 5-5 → mesa = `5-5` |
| TC-DO-20 | Escolher o lado direito | Depois do TC-DO-07 (pontas 6 e 1), J2 clica 1-6 e `btn-direita` | Mesa = `6-6`, `6-3`, `3-1`, `1-6`; `ponta-direita` = 6 |
| TC-DO-21 | Girar na ponta esquerda | `j1=6-6,2-6,0-0`, `j2=3-6,2-5,1-1`, `monte=`: 6-6, 3-6, 2-6, 2-5 | Mesa = `5-2`, `2-6`, `6-6`, `6-3`; `ponta-esquerda` = 5 |

### Breno — compra, passe e fim da partida

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-DO-11 | Comprar só sem jogada | `j1=6-6,6-1`, `j2=0-1,6-2`, `monte=3-4`. J1 joga 6-6 | Para J2 (tem 6-2) `btn-comprar` desabilitado |
| TC-DO-12 | Comprar até conseguir jogar | `j1=6-6,5-5`, `j2=0-1,2-3`, `monte=0-0,1-2,4-6`. J1 joga 6-6 | J2: `btn-comprar` habilitado; comprar 3 vezes → `monte-qtd` = 0 e 4-6 na mão; depois de pegar 4-6, `btn-comprar` desabilita |
| TC-DO-13 | Passar | `j1=6-6,6-5`, `j2=0-1`, `monte=` (vazio). J1 joga 6-6 | J2: `btn-comprar` desabilitado, `btn-passar` habilitado; passar → `vez` = J1 |
| TC-DO-14 | Batida | `j1=6-6,6-3`, `j2=6-1,2-4,0-0`, `monte=`. J1 joga 6-6, J2 joga 6-1, J1 joga 6-3 | `mensagem` = "Jogador 1 venceu!"; `pontos-j1` = 6 (2+4+0+0); peças travadas |
| TC-DO-15 | Jogo trancado | `j1=6-6,0-1`, `j2=2-3,4-4`, `monte=`. J1 joga 6-6; ninguém tem 6 | `mensagem` = "Jogo trancado — Jogador 1 venceu!" (1 ponto contra 13); `pontos-j1` = 13 |
| TC-DO-16 | Trancado com empate | `j1=6-6,0-4`, `j2=1-3`, `monte=`. J1 joga 6-6 | Somas 4 × 4 (0+4 = 4; 1+3 = 4); `mensagem` = "Empate"; ninguém pontua |
| TC-DO-17 | Nova partida | Depois do TC-DO-14, clicar `btn-nova-partida` (sem parâmetros) | 7 peças para cada um, monte 14, mesa vazia, `mensagem` vazia |

> **Ajuste da matriz de cobertura:** TC-DO-14 a 16 usam `test.each` também com o Jogador 2 vencendo ("Jogador 2 venceu!", `pontos-j2`).

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Gustavo** cria o repositório e adiciona `BrenoNosima` como colaborador (Settings → Collaborators). **Breno** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main`. Uma branch por tarefa: `gustavo/g2-...`, `breno/b2-...`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `feat:`, `refactor:`, `fix:`, `docs:`, `chore:`, `ci:`. Commits pequenos: um caso de teste (ou uma regra) por commit.
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main` e `npm test` todo verde (e `npm run verificar` sem problemas). O CI precisa estar verde no PR.
7. Ordem: **G1 entra primeiro** (estrutura do projeto). Depois disso as tarefas G e B podem andar em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

O desafio só está pronto para entrega quando:

- [ ] Todos os casos de teste da seção 5 escritos em `tests/`, com o ID no título
- [ ] `npm test` todo verde e `npm run verificar:completo` sem problemas
- [ ] Jogo jogável do início ao fim com `npm start`, sem erros no console
- [ ] README com: colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → o que verifica) — tarefa B1
- [ ] CI (GitHub Actions rodando `npm test`) verde na `main` — tarefa B1
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_domino`
