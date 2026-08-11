# SPEC-001 — O repositório roda e o CI reprova de verdade

> Documento de especificação obrigatório antes do início de qualquer desenvolvimento.
> Nenhuma linha de código é escrita antes desta SPEC ser aprovada.

---

## Metadados

| Campo | Valor |
|---|---|
| **Número** | SPEC-001 |
| **Feature** | O repositório roda e o CI reprova de verdade |
| **Slug** | `o-repositorio-roda-e-o-ci-reprova-de-verdade` |
| **Owner** | Gustavo Hartz |
| **Card no board** | `e5f1c6c1-9034-424f-8df5-00e7bcb96d5f` — "O repositório roda e o CI reprova de verdade" |
| **Appetite** | 2 dias |
| **Prioridade** | MEDIUM |
| **Criada em** | 2026-08-11 |
| **Aprovada em** | {preencher após aprovação} |
| **Aprovada por** | {preencher após aprovação} |
| **Status** | Rascunho |

---

## Objetivo

Dar ao repositório um **arreio de verificação que funciona e que reprova**: `install`, `build` e
`test` executáveis por comando e documentados no README, rodados pelo CI com os nomes de script
que o workflow realmente chama, e — o ponto do card — **provados em vermelho**, plantando uma
quebra deliberada, observando o CI reprovar e removendo-a em seguida.

Hoje o gate "CI verde obrigatório antes do merge" (CLAUDE.md → Gates de qualidade) não tem
significado: não existe `package.json`, então o workflow `.github/workflows/ci.yml` aborta no step
"Sem app — nada foi verificado". Ao final desta SPEC, verde no CI passa a ser uma afirmação
verificável sobre o repositório.

---

## Contexto e motivação

- **Estado real do repositório hoje:** apenas fundação — `CLAUDE.md`, `AGENTS.md`,
  `.github/copilot-instructions.md`, `docs/projeto/*`, `specs/*-TEMPLATE.md` e
  `.github/workflows/ci.yml`. Não existe `package.json`, `README.md`, `index.html` nem teste algum.
- **O CI já está vermelho, por design.** O workflow committado em `a2844fe` detecta a ausência de
  `package.json` e falha com `::error::Nada foi verificado`. Ele também falha se `package.json`
  existir sem nenhum script de verificação (`test`, `typecheck` ou `build`). Ou seja: o workflow
  não precisa ser reescrito — precisa ser **alimentado** com o que ele já sabe rodar.
- **Por que agora, e não depois do produto:** os três cards de produto no backlog (payload vCard,
  página HTML, renderização do QR) vão nascer sem rede de proteção se o arreio não vier antes.
  O caminho crítico do roadmap (`2.1 → 2.2 → 1.1 → 4.1`) assume um CI que significa alguma coisa.
- **Dependências no board:** o card não declara `depends_on` e não bloqueia nenhum outro
  formalmente — mas destrava, na prática, todos os três cards do backlog.

---

## Escopo — o que está DENTRO

- [ ] **`package.json`** na raiz — projeto privado, sem dependências de runtime, com os scripts
      `build` e `test` (os nomes que `ci.yml` invoca via `npm run build --if-present` e
      `npm test --if-present`).
- [ ] **`package-lock.json`** commitado, para que `npm ci` (o comando de install do CI e do README)
      funcione de fato.
- [ ] **`.nvmrc`** fixando a versão do Node — o workflow já prioriza `.nvmrc` sobre o default 22.
- [ ] **`scripts/build.mjs`** — monta `dist/` com os artefatos estáticos publicáveis. Enquanto não
      existir `index.html` (card "Criar página HTML estática base"), reporta explicitamente
      *"nenhum artefato estático ainda — 0 arquivos copiados"* e sai com código 0.
- [ ] **`test/`** com testes reais em `node:test` (zero dependências), que reprovam de verdade:
      - **`test/ci-contract.test.mjs`** — todo script que `.github/workflows/ci.yml` invoca sem
        `--if-present` existe em `package.json`; e o conjunto de verificação
        (`test`/`typecheck`/`build`) não é vazio. É o item 2 do card virando teste.
      - **`test/spec-format.test.mjs`** — toda `specs/SPEC-*.md` e `specs/DONE-*.md` (exceto os
        `*-TEMPLATE.md`) tem as seções obrigatórias do gate SPEC-166 do workflow. Roda localmente o
        que hoje só é anotado no PR.
      - **`test/repo-hygiene.test.mjs`** — `.gitignore` cobre `node_modules/`, `dist/` e `.env*`
        (OP-02 / OP-12).
- [ ] **`.gitignore`** — acrescentar `dist/`, `npm-debug.log*` e `.DS_Store` ao mínimo já existente.
- [ ] **`README.md`** — os três comandos (`npm ci`, `npm run build`, `npm test`), o que cada um
      verifica, como abrir a página localmente e como o CI usa esses mesmos comandos.
- [ ] **Prova de vermelho (o card):** plantar uma quebra deliberada em um commit próprio no PR,
      registrar o run vermelho, e removê-la no commit seguinte, registrando o run verde. As duas
      URLs de run entram no `DONE-001`.
- [ ] **`CLAUDE.md`** — atualizar a seção "Estado atual" ao final da sessão.

---

## Escopo — o que está FORA

- **`index.html` e qualquer código de produto** (vCard, renderização do QR, layout) — pertencem aos
  cards "Implementar função de geração de payload vCard", "Criar página HTML estática base" e
  "Renderizar QR Code a partir do vCard". Criar um `index.html` aqui, mesmo placeholder, seria
  invadir card alheio.
- **`html-validate` e o script `lint`** — o CLAUDE.md sugere `html-validate` como gate, mas hoje não
  há um único arquivo HTML para validar. A devDependency e o script `lint` entram junto com o
  `index.html`, no card da página estática. Adicionar agora seria um linter apontando para o vazio.
- **`typecheck`** — não há TypeScript no projeto e o SDD não prevê build step. `ci.yml` já pula o
  script com `--if-present`.
- **Reescrever `.github/workflows/ci.yml`** — o workflow já roda install, build e test corretamente
  assim que `package.json` existir. Mexer nele sem necessidade é risco sem retorno.
- **Deploy / GitHub Pages** — é o card da Fase 4 do roadmap.
- **Servidor de desenvolvimento (`npm run dev`)** — o README vai documentar `npx serve` / abrir o
  arquivo direto; um script dedicado é ceremônia para uma página estática sem build.

---

## Arquivos que serão tocados

| Arquivo | Ação | Descrição da mudança |
|---|---|---|
| `package.json` | criar | Projeto privado, `type: module`, `engines.node`, scripts `build` e `test`. Sem dependências. |
| `package-lock.json` | criar | Gerado por `npm install`; commitado para viabilizar `npm ci`. |
| `.nvmrc` | criar | Versão do Node do projeto (proposta: `24`). |
| `scripts/build.mjs` | criar | Monta `dist/` a partir dos estáticos da raiz; reporta o que **não** foi construído. |
| `test/ci-contract.test.mjs` | criar | Os scripts que o workflow chama existem; o conjunto de verificação não é vazio. |
| `test/spec-format.test.mjs` | criar | SPEC/DONE do repositório seguem as seções obrigatórias do gate SPEC-166. |
| `test/repo-hygiene.test.mjs` | criar | `.gitignore` cobre `node_modules/`, `dist/` e `.env*`. |
| `.gitignore` | modificar | Acrescentar `dist/`, `npm-debug.log*`, `.DS_Store`. |
| `README.md` | criar | Install / build / test, o que cada um verifica, execução local, relação com o CI. |
| `CLAUDE.md` | modificar | Apenas a seção "Estado atual", ao final da sessão. |
| `specs/DONE-001-o-repositorio-roda-e-o-ci-reprova-de-verdade.md` | criar | DONE com as URLs dos runs vermelho e verde. |

Nenhum arquivo fora desta lista será tocado sem nova aprovação.

---

## Mudanças de schema (se aplicável)

Nenhuma mudança de schema nesta feature. O projeto não tem banco de dados nem camada de persistência
(CLAUDE.md → Fora do escopo). OP-01 não se aplica.

---

## Mudanças de API (se aplicável)

Nenhuma mudança de API nesta feature. O projeto é 100% estático, sem back-end (CLAUDE.md → Fora do
escopo). OP-08 e OP-09 não se aplicam.

---

## Critérios de aceitação

**Cenário 1 — o repositório roda por comando**
- Dado um clone limpo do repositório, com a versão de Node do `.nvmrc`
- Quando eu rodo `npm ci`, depois `npm run build`, depois `npm test`
- Então os três terminam com código de saída 0, e cada comando está documentado no `README.md` com
  a mesma grafia usada aqui

**Cenário 2 — o CI roda os três, e os nomes batem**
- Dado o PR desta feature aberto
- Quando o workflow `CI` executa
- Então o job instala dependências, roda `npm run build` e `npm test`; o *step summary* mostra
  `build — rodou` e `test — rodou`; e o check_suite termina verde

**Cenário 3 — o contrato CI ↔ package.json é testado, não presumido**
- Dado que alguém renomeie o script `test` no `package.json` (ou remova `build`)
- Quando eu rodo `npm test`
- Então `test/ci-contract.test.mjs` falha, apontando qual script o workflow chama e não existe

**Cenário 4 — o `.gitignore` cobre a stack**
- Dado o repositório após `npm ci` e `npm run build`
- Quando eu rodo `git status --porcelain`
- Então nem `node_modules/` nem `dist/` aparecem como não rastreados

**Cenário 5 — prova de vermelho (o card)**
- Dado o PR desta feature com o CI verde
- Quando eu commito uma quebra deliberada (uma asserção invertida em um teste) e faço push
- Então o CI **reprova** — check_suite vermelho, com o teste identificado no log
- E quando eu removo a quebra no commit seguinte, o CI volta a verde
- E as URLs dos dois runs (vermelho e verde) ficam registradas no `DONE-001`

**Cenário 6 — erro / edge case: build sem artefato estático**
- Dado que `index.html` ainda não existe (cards de produto não iniciados)
- Quando eu rodo `npm run build`
- Então o comando sai com código 0 **e imprime explicitamente** que nenhum artefato estático foi
  encontrado — nunca um "build ok" silencioso sobre um `dist/` vazio

---

## Segurança (se aplicável)

Sem superfície de segurança relevante em runtime: a feature não introduz autenticação, autorização,
rotas nem input não-confiável (o projeto não tem back-end nem formulários).

Duas considerações valem o registro:

- **OP-02 / OP-12 — segredos.** Nenhum segredo é introduzido. O teste `repo-hygiene` garante que
  `.env*` continua ignorado; `dist/` passa a ser ignorado para não vazar artefatos gerados.
- **Superfície de supply chain.** A escolha por **zero dependências** (`node:test` embutido, sem
  framework de teste) é deliberada: nenhum pacote de terceiros entra no repositório nesta SPEC.

---

## Riscos e dependências

| Risco | Probabilidade | Mitigação |
|---|---|---|
| `build` que não constrói nada vira teatro — verde sem significado | Alta | O script imprime o que **não** encontrou (Cenário 6) e o README diz que ele só passa a ter conteúdo com o card da página estática. Mesma filosofia do `ci.yml`: relatar o não-verificado. |
| Testes de convenção (formato de SPEC/DONE) virarem burocracia que atrasa PRs | Média | São 3 seções/8 seções checadas por `grep` — as mesmas que o gate SPEC-166 do workflow já exige. O teste local só antecipa a falha; não cria regra nova. |
| O commit da quebra deliberada acabar mergeado em `main` por engano | Baixa | A quebra vive em um commit isolado, revertido no commit imediatamente seguinte, antes do sign-off; o `DONE-001` registra os dois SHAs e o merge é squash pelo arquiteto (OP-20). |
| Node do `.nvmrc` divergir do runner e quebrar o CI | Baixa | `node:test` e a API de `fs` usadas são estáveis de Node 20 em diante; `engines.node` declara o piso e o workflow já lê o `.nvmrc`. |
| `npm ci` falhar sem lockfile | Média | `package-lock.json` é gerado e commitado nesta SPEC; o `ci.yml` ainda tem o fallback `\|\| npm install`. |

**Dependências:**
- Nenhuma dependência de outro card. O board não registra `depends_on` para esta feature.
- **Destrava:** os três cards do backlog (payload vCard, página HTML estática, renderização do QR)
  passam a ter um CI que verifica de verdade.

---

## Notas de implementação

- **Não reescrever `ci.yml`.** O workflow já faz install → `npm run build --if-present` →
  `npm test --if-present`. O trabalho é fazer o `package.json` casar com o que ele chama.
- **`node:test` puro**, sem framework: `node --test test/`. Zero dependências, alinhado à
  "simplicidade máxima" do CLAUDE.md.
- **OP-15 / OP-16:** nenhuma função acima de 50 linhas, nenhum arquivo acima de 300. Os arquivos
  desta SPEC são todos pequenos; se `scripts/build.mjs` crescer, extrair helper em vez de inflar.
- **OP-11:** as mensagens de falha dos testes e do build são diretas e sem stack trace de
  ferramenta — dizem qual invariante quebrou e onde.
- **A prova de vermelho é o entregável, não um detalhe.** Sequência obrigatória: PR aberto → CI
  verde → commit com a quebra → CI vermelho (guardar a URL) → commit removendo a quebra → CI verde
  (guardar a URL). Sem as duas URLs no `DONE-001`, o card não fecha.
- **Ordem sugerida de execução:** `package.json` + `.nvmrc` + lockfile → testes → `scripts/build.mjs`
  → `.gitignore` → `README.md` → PR → prova de vermelho → `DONE-001` → "Estado atual" do CLAUDE.md.

### Pontos que pedem decisão do arquiteto na aprovação

1. **Semântica de `build`.** Proposta: `scripts/build.mjs` monta `dist/`, útil depois para o deploy
   (Fase 4). Alternativa: não ter `build` algum e o README declarar "esta stack não tem build" —
   mais honesto para uma página sem build step, mas deixa o item 1 do card ("construir funciona por
   comando") sem comando. **Recomendo a proposta.**
2. **Versão no `.nvmrc`.** Proposta: `24` (o Node da máquina do founder, v24.14.1). Alternativa: `22`,
   o default do workflow.
3. **Escopo dos testes de convenção.** `spec-format` e `repo-hygiene` testam o *método*, não o
   *produto*. Se preferir um arreio mínimo, `ci-contract` sozinho já satisfaz o card — os outros
   dois são o que dá ao `npm test` algo real para verificar antes de existir código de produto.

---

## Checklist de aprovação

> A ser preenchido pelo arquiteto ou founder antes de aprovar a SPEC.

- [ ] Objetivo está claro e verificável
- [ ] Escopo está bem delimitado (dentro e fora)
- [ ] Arquivos listados estão corretos e completos
- [ ] Mudanças de schema estão documentadas
- [ ] Critérios de aceitação são testáveis
- [ ] Riscos e superfície de segurança foram avaliados
- [ ] Appetite é razoável para o escopo definido
- [ ] Não há conflito com SPECs abertas em paralelo
- [ ] As três decisões em aberto ("Pontos que pedem decisão do arquiteto") foram resolvidas

---

*SPEC-001 — H1VE. Ver `specs/README.md` para o fluxo SPEC→DONE.*
