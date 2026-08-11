# DONE-001 — O repositório roda e o CI reprova de verdade

> Artefato de conclusão obrigatório ao final de qualquer desenvolvimento.

---

## Metadados

| Campo | Valor |
|---|---|
| **Número** | DONE-001 |
| **SPEC correspondente** | `SPEC-001-o-repositorio-roda-e-o-ci-reprova-de-verdade.md` |
| **Feature** | O repositório roda e o CI reprova de verdade |
| **Owner** | Gustavo Hartz |
| **Branch** | `feat/gustavo-hartz/o-repositorio-roda-e-o-ci-reprova-de-verdade` |
| **PR** | https://github.com/GusHartz/QRCODE/pull/1 |
| **Desenvolvimento iniciado** | 2026-08-11 |
| **Desenvolvimento concluído** | 2026-08-11 |
| **Dias utilizados vs appetite** | menos de 1 dia vs 2 dias |

---

## Resumo do que foi feito

O `ci.yml` da fundação estava vermelho por design: sem `package.json`, o job abortava em
`::error::Nada foi verificado`. Este trabalho **alimentou o workflow com o que ele já sabia rodar**,
sem reescrevê-lo — `package.json` (zero dependências) com os scripts `build` e `test`, lockfile
para viabilizar `npm ci`, `.nvmrc` fixando o Node, `scripts/build.mjs` montando `dist/`, três
arquivos de teste em `node:test` e um `README.md` documentando os três comandos.

E, sobretudo, **provou que o CI reprova**: uma quebra deliberada foi commitada, o CI ficou vermelho,
e a quebra foi removida — com as três URLs de run registradas abaixo. A partir daqui, verde neste
repositório é uma afirmação verificável, não um enfeite.

---

## Arquivos criados

| Arquivo | Descrição |
|---|---|
| `package.json` | Projeto privado, `type: module`, `engines.node >=20.11`, scripts `build` e `test`. Zero dependências. |
| `package-lock.json` | Gerado por `npm install`; commitado para que `npm ci` funcione. |
| `.nvmrc` | Node `24` — o workflow prioriza `.nvmrc` sobre o default 22. |
| `scripts/build.mjs` | Monta `dist/` com os estáticos publicáveis da raiz; declara explicitamente quando não há `index.html`. |
| `test/ci-contract.test.mjs` | O contrato entre `ci.yml` e `package.json`: nenhum script exigido faltando, nenhum órfão, conjunto de verificação não vazio. |
| `test/spec-format.test.mjs` | SPEC/DONE com as seções obrigatórias do gate SPEC-166, nomenclatura `NNN-slug`, todo DONE com sua SPEC. |
| `test/repo-hygiene.test.mjs` | `.gitignore` cobrindo `node_modules/`/`dist/`/`.env*`, README com os três comandos, nenhum `.env` rastreado pelo git. |
| `README.md` | Os três comandos, o que cada um verifica, execução local e como o CI usa exatamente os mesmos comandos. |
| `specs/SPEC-001-o-repositorio-roda-e-o-ci-reprova-de-verdade.md` | A SPEC aprovada. |
| `specs/DONE-001-o-repositorio-roda-e-o-ci-reprova-de-verdade.md` | Este documento. |

---

## Arquivos modificados

| Arquivo | O que mudou |
|---|---|
| `.gitignore` | Acrescentados `npm-debug.log*`, `dist/` e `.DS_Store` (`node_modules/` e `.env*` já existiam). |
| `CLAUDE.md` | Seção "Estado atual" atualizada. |

`.github/workflows/ci.yml` foi **deliberadamente não modificado** — a SPEC registra o porquê: o
workflow já executa install → `npm run build --if-present` → `npm test --if-present` corretamente.

---

## Mudanças de schema aplicadas

Nenhuma migration neste DONE. O projeto não tem banco de dados (CLAUDE.md → Fora do escopo).

---

## Mudanças de API entregues

Nenhuma mudança de API neste DONE. O projeto é 100% estático, sem back-end.

---

## Critérios de aceitação — verificação

| Critério | Status | Observação |
|---|---|---|
| Cenário 1 — o repositório roda por comando | ✅ | `npm ci`, `npm run build`, `npm test` rodados em sequência local com exit 0. Os três documentados no README com a mesma grafia. |
| Cenário 2 — o CI roda os três, e os nomes batem | ✅ | Run [31501279024](https://github.com/GusHartz/QRCODE/actions/runs/31501279024): `npm run build --if-present` e `npm test --if-present` executados, `pass 10 / fail 0`, check_suite verde. |
| Cenário 3 — o contrato CI ↔ package.json é testado | ✅ | Verificado na prática, não em teoria: a quebra plantada renomeou `build` → `compile` e `ci-contract` reprovou com `script(s) declarado(s) em package.json que o CI nunca roda: compile`. |
| Cenário 4 — o `.gitignore` cobre a stack | ✅ | Após `npm ci` + `npm run build`, `git status --porcelain` não lista `node_modules/` nem `dist/`. |
| Cenário 5 — prova de vermelho | ✅ | Sequência completa registrada abaixo. |
| Cenário 6 — build sem artefato estático | ✅ | `npm run build` sai 0 e imprime `build: nenhum index.html na raiz — nada publicável foi construído`. |

### Prova de vermelho — o item 4 do card

| # | Commit | Run | Resultado |
|---|---|---|---|
| 1 | `9012872` — arreio de verificação | [31501279024](https://github.com/GusHartz/QRCODE/actions/runs/31501279024) | ✅ **verde** — `pass 10 / fail 0` |
| 2 | `a90edef` — **QUEBRA DELIBERADA** (`build` → `compile`) | [31501438841](https://github.com/GusHartz/QRCODE/actions/runs/31501438841) | ❌ **VERMELHO** — `pass 9 / fail 1` |
| 3 | `cc57d38` — revert da quebra | [31501518901](https://github.com/GusHartz/QRCODE/actions/runs/31501518901) | ✅ **verde** — restaurado |

**Por que esta quebra, e não uma asserção invertida:** renomear `build` para `compile` reproduz
exatamente a falha silenciosa que o arreio existe para pegar. O workflow chama
`npm run build --if-present` — com o script renomeado, o build simplesmente **para de rodar, sem
erro nenhum**. Um CI ingênuo ficaria verde. Quem reprovou foi `test/ci-contract.test.mjs`, com a
mensagem exata no log do run vermelho:

```
✖ todo script de package.json é chamado pelo workflow
  AssertionError: script(s) declarado(s) em package.json que o CI nunca roda: compile
```

O commit da quebra (`a90edef`) vive isolado e foi revertido no commit imediatamente seguinte
(`cc57d38`); o merge em `main` é squash pelo arquiteto (OP-20), então ele não sobrevive à entrega.

---

## Como testar manualmente

```
1. git clone https://github.com/gushartz/qrcode.git && cd qrcode
2. nvm use            (ou garantir Node >= 20.11; o projeto declara 24 no .nvmrc)
3. npm ci             → exit 0
4. npm run build      → exit 0, imprime que não há index.html ainda
5. npm test           → exit 0, "pass 10 / fail 0"
6. git status --porcelain   → nem node_modules/ nem dist/ aparecem

Para confirmar que a suíte REPROVA (não só passa):
7. Renomeie o script "build" para "compile" em package.json
8. npm test           → exit 1, apontando `compile` como script órfão
9. Desfaça a alteração
```

**Dados de teste necessários:** nenhum. Não há banco, credenciais nem fixtures.

---

## Testes automatizados

| Arquivo de teste | O que testa |
|---|---|
| `test/ci-contract.test.mjs` | O workflow invoca ao menos um script npm; todo script exigido existe em `package.json`; nenhum script declarado é órfão do CI; o conjunto `test`/`typecheck`/`build` não é vazio. |
| `test/spec-format.test.mjs` | Toda SPEC/DONE tem as seções obrigatórias do gate SPEC-166; nomenclatura `SPEC-NNN-slug.md`; todo DONE tem a SPEC correspondente. |
| `test/repo-hygiene.test.mjs` | `.gitignore` cobre `node_modules/`, `dist/` e `.env*`; README documenta os três comandos; nenhum arquivo de ambiente rastreado pelo git (OP-02). |

**Comando para rodar:**
```bash
npm test
```

10 testes, 0 dependências, runner nativo do Node.

---

## AI Declaration

| Arquivo | % gerado por IA | Revisado manualmente? |
|---|---|---|
| `specs/SPEC-001-*.md` | 100% | sim — aprovada pelo founder no board antes de qualquer código |
| `package.json` | 100% | sim |
| `.nvmrc` | 100% | sim |
| `package-lock.json` | gerado por `npm install` | n/a — artefato de ferramenta |
| `scripts/build.mjs` | 100% | sim |
| `test/ci-contract.test.mjs` | 100% | sim |
| `test/spec-format.test.mjs` | 100% | sim |
| `test/repo-hygiene.test.mjs` | 100% | sim |
| `README.md` | 100% | sim |
| `.gitignore` | edição pontual | sim |
| `specs/DONE-001-*.md` | 100% | sim |

**Agente:** Claude Opus 5 (Claude Code). **Supervisão:** o card foi movido `spec → dev` pelo founder
antes de qualquer linha de código; a SPEC foi publicada no card e aprovada primeiro.

**A IA sugeriu mudanças fora do escopo da SPEC?**
- [x] Sim → duas, ambas registradas em "Desvios" abaixo: (a) uma asserção extra em
  `repo-hygiene.test.mjs` verificando o README, (b) o uso de `git ls-files` em vez de `existsSync`
  para detectar `.env` versionado. Nenhuma das duas ampliou a lista de arquivos tocados da SPEC.
  Um terceiro achado — os diretórios `.claude/`, `.h1ve/` e `.vscode/` não rastreados e não
  ignorados — foi **deixado intocado** e comunicado ao founder para decisão, por estar fora da
  lista de arquivos da SPEC.

---

## Desvios em relação à SPEC

| Item da SPEC | O que foi feito | Motivo do desvio |
|---|---|---|
| Notas: `node --test test/` | `node --test "test/*.test.mjs"` | `node --test test/` falha no Node 24 (`Cannot find module .../test`) — o runner trata o argumento como arquivo, não como diretório. O glob funciona nas duas plataformas e as aspas evitam expansão pelo shell. |
| `repo-hygiene.test.mjs` — "`.gitignore` cobre `node_modules/`, `dist/` e `.env*`" | Somadas duas asserções: README documenta os três comandos, e nenhum `.env` está **rastreado pelo git** | O item 1 do card ("documentados no README") só é verificável se alguém verificar; e usar `existsSync` para `.env` acusaria falsamente um `.env` local corretamente ignorado — `git ls-files` distingue o caso real de OP-02. |

Fora isso, a implementação seguiu a SPEC. As três decisões deixadas em aberto para o arquiteto
foram resolvidas conforme a recomendação: `build` monta `dist/`, `.nvmrc` = `24`, e os três testes
entraram.

---

## Limitações conhecidas

- **`npm run build` ainda não constrói nada.** Não existe `index.html` no repositório (é do card
  "Criar página HTML estática base"). O script sai 0 e **informa** isso explicitamente, em vez de
  fingir sucesso. Assumido conscientemente, e registrado na SPEC como risco de maior probabilidade.
- **`npm ci` instala zero pacotes** hoje. O comando existe e é exercitado pelo CI para que o dia da
  primeira dependência não seja o dia em que se descobre que o install nunca foi testado.
- **Sem `lint` e sem `typecheck`.** Não há HTML para o `html-validate` validar nem TypeScript no
  projeto. O `ci.yml` pula ambos com `--if-present`.

---

## Débito técnico gerado

| Item | Impacto | Quando resolver |
|---|---|---|
| `scripts/build.mjs` avisa em vez de falhar quando não há `index.html` | Médio — enquanto durar, um `dist/` vazio passa no CI | No card "Criar página HTML estática base": inverter o aviso em erro, junto com o `index.html`. |
| `html-validate` + script `lint` ausentes | Baixo | Mesmo card acima — entram com o primeiro arquivo HTML. |
| `.claude/`, `.h1ve/` e `.vscode/` não rastreados e não ignorados | Baixo — risco de `git add -A` versionar configuração local | Decisão do founder; fora da lista de arquivos desta SPEC, por isso não foi tocado aqui. |

---

## Checklist de entrega

- [x] Todos os critérios de aceitação verificados
- [x] Testes criados e passando (10/10, local e no CI)
- [x] Typecheck limpo — não aplicável, projeto sem TypeScript (OP-14 sem superfície)
- [x] Lint limpo — não aplicável, sem `lint` nesta entrega (ver Limitações)
- [x] Nenhum log de debug em código de produção — as saídas de `build.mjs` são relatório, não debug
- [x] Nenhum tipo `any` introduzido
- [x] Nenhum segredo hardcoded (OP-02/OP-12) — verificado por `repo-hygiene.test.mjs`
- [x] AI Declaration preenchida acima
- [x] `CLAUDE.md` seção "Estado atual" atualizada
- [x] Este DONE está completo e commitado na branch

**OP-15 / OP-16:** o maior arquivo de código desta entrega tem 79 linhas; a maior função, 21.

---

*DONE-001 — H1VE. Ver `specs/README.md` para o fluxo SPEC→DONE.*
