# Matriz regra → casos de teste — Dominó

| # | Regra (seção 1) | TCs | Situação |
|---|---|---|---|
| 1 | 28 peças, sem repetir | 02 | ✅ |
| 2 | Hotseat | 10 | ✅ |
| 3 | 7 + 7 + 14 no monte | 01 | ✅ |
| 4 | Maior dupla começa e é obrigatória | 03, 04 (só o 6-6) | ⚠️ o 6-6 é também a maior soma → **TC-DO-19** |
| 5 | Sem dupla, a maior soma; dupla vence soma | 05, 18 | ✅ |
| 6 | Encaixar e girar | 06, 07 (só na ponta direita) | ⚠️ falta girar na esquerda → **TC-DO-21** |
| 7 | Escolher o lado | 09 (só esquerda) | ⚠️ falta a direita → **TC-DO-20** |
| 8 | Pontas iguais → direita sem perguntar | 06 | ✅ |
| 9 | Comprar só sem jogada, uma por vez | 11, 12 | ✅ |
| 10 | Passar só sem jogada e sem monte | 13 | ✅ |
| 11 | A vez alterna | 06, 10, 13 | ✅ |
| 12 | Batida e trancado (menor soma, empate), pontos | 14, 15, 16 (só J1 vence) | ✅ → ajuste: J2 vencendo |
| 13 | Nova partida | 17 | ✅ |

### TCs novos — Dominó

| ID | Dono / tarefa | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|---|
| TC-DO-19 | Gustavo / G3 | Maior dupla entre várias | `j1=3-3,5-6` `j2=5-5,1-2` `monte=` | `vez` = J2; 1-2 recusada; 5-5 → mesa `5-5` |
| TC-DO-20 | Gustavo / G5 | Escolher o lado direito | Depois do TC-DO-07, J2 clica 1-6 → `btn-direita` | Mesa termina em `1-6`; `ponta-direita` = 6 |
| TC-DO-21 | Gustavo / G4 | Girar na ponta esquerda | `j1=6-6,2-6,0-0` `j2=3-6,2-5,1-1` `monte=`: 6-6, 3-6, 2-6 (só à esquerda), 2-5 (só à esquerda) | Mesa = `5-2`, `2-6`, `6-6`, `6-3`; `ponta-esquerda` = 5 |
| ajuste 14–16 | Breno / B4, B5 | Batida, trancado e empate | `test.each` com J2 vencendo também | igual, com "Jogador 2 venceu!" |

**Para que serve:** se o código dos jogos vai ser gerado só a partir dos testes, cada regra da seção 1 do PLANEJAMENTO.md tem um teste que a obriga a existir?

**Legenda**
- ✅ coberta, com exemplo suficiente para não dar para "decorar";
- ⚠️ coberta, mas com um exemplo só ou de forma parcial;
- ❌ sem teste;
- ❓ a regra não está definida no plano e precisa de uma decisão de vocês.

Mantenha esta matriz atualizada: todo TC novo entra na linha da regra que ele cobre. Uma regra sem TC não vai existir no jogo gerado.
