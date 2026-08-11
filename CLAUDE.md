# CLAUDE.md — qr-code

## O que é este projeto

Em workshops e palestras, o compartilhamento de contato entre apresentador e participantes é lento e sujeito a erros: ditar ou digitar nome, e-mail e telefone consome tempo e gera falhas; trocar cartões físicos é ineficiente. Falta uma forma **imediata** de salvar o contato do apresentador em segundos.

**Visão:** uma página HTML única que exibe um QR Code contendo os dados de contato de Gustavo Hartz, permitindo que qualquer participante escaneie e salve o contato em segundos — sem cadastro, sem back-end e sem dependências externas em tempo de execução. Direção: **simplicidade máxima** — abrir a página, escanear, pronto.

**Usuários:**
- **Participantes de workshops/palestras** — escaneiam o QR Code com a câmera do celular para salvar o contato. Não interagem com formulários nem fazem login.
- **Apresentador (Gustavo Hartz)** — exibe a página em tela (notebook/projetor/celular) durante o evento; é também o mantenedor dos dados de contato.

**No escopo:**
- Página HTML estática (arquivo único) que renderiza um QR Code com os dados de contato.
- Payload no formato **vCard 3.0** *(suposição — revisar: permite "salvar contato" com um toque)* com Nome `Gustavo Hartz`, e-mail `guhartz@gmail.com`, telefone `+55 21 96932-4713` (normalizado para E.164 → `+5521969324713`).
- Geração do QR Code **client-side** (biblioteca JS via CDN ou imagem pré-gerada), mantendo a página offline-friendly.
- Exibição do texto de contato abaixo do QR Code como **fallback** acessível caso o scan falhe.
- Layout responsivo básico para projeção (telas grandes) e celular.

**Fora do escopo:**
- Banco de dados, persistência ou qualquer camada de dados.
- Back-end / API / servidor de aplicação — a solução é 100% estática.
- Autenticação, cadastro ou gestão de múltiplos usuários — dados fixos de um único contato.
- Leitura/decodificação de QR Code pela própria aplicação (isso é papel do app de câmera do participante).
- Coleta, armazenamento ou rastreamento de participantes (analytics, logs de scan).
- Edição dinâmica dos dados via interface — alterações são feitas editando o HTML/config.

**Nota de segurança (baseline):** os dados de contato são **públicos por design** — não há segredos, credenciais ou variáveis sensíveis no repositório ou na página. Como não há formulários nem back-end, não há superfície de input a validar em runtime. *(Suposição — revisar: confirmar com o titular a divulgação pública do telefone pessoal.)*

## Stack

> As decisões abaixo derivam do Roadmap e sobrepõem os defaults full-stack genéricos do SDD, que **não se aplicam** a esta página estática (sem Node/Next/Postgres/ORM/Auth em runtime).

- **HTML + JavaScript puro**, sem framework e **sem build step** — reduz a superfície de manutenção para um time solo. *(Suposição — revisar.)*
- **Arquivo único autocontido** (`index.html`): estrutura semântica (`<main>`, `<section>`), `meta viewport` para mobile.
- **Geração de QR client-side** via biblioteca (`qrcode.js` ou equivalente) carregada por CDN com **SRI (`integrity`)** e `crossorigin`. Nível de correção de erro **M**. *(Suposição — revisar.)*
- **CSS enxuto** (inline `<style>` ou arquivo único): QR centralizado, responsivo, contraste WCAG AA, `alt` descritivo.
- **Hospedagem estática** com HTTPS (GitHub Pages como default; Netlify como alternativa). *(Suposição — revisar.)*
- **`Content-Security-Policy` restritivo**, liberando apenas `self` e o CDN do QR. *(Suposição — revisar.)*

**Decisões-chave:**
- **Separação de responsabilidades**, mesmo em projeto pequeno:
  - **Dados de contato** isolados em uma constante/objeto de configuração — não espalhados no markup.
  - **Geração** encapsulada em `buildVCard(dados)` (retorna a string vCard) + `renderQR()`, separada da montagem visual.
  - **UI** apenas apresenta o QR Code e o texto — sem lógica de formatação.
- **Zero dependências de infra e build em runtime** — funcionamento offline garantido durante o evento.
- **Fallback obrigatório:** se o script do CDN falhar, exibir os dados de contato em texto legível e mensagem neutra ("Não foi possível gerar o QR Code") — sem stack traces.

**Payload vCard de referência:**
```
BEGIN:VCARD
VERSION:3.0
N:Hartz;Gustavo
FN:Gustavo Hartz
EMAIL:guhartz@gmail.com
TEL;TYPE=CELL:+5521969324713
END:VCARD
```

## Estrutura do repositório

> O SDD não define estrutura para uma página estática. A organização esperada, dado o porte e a ausência de build, é:

```
/
├── index.html          # Página autocontida (estrutura + estilo + script)
├── contact.js          # (opcional) Dados de contato isolados como constante de config
├── CLAUDE.md           # Este documento
└── README.md           # (opcional) Instruções de publicação
```

- Se o projeto permanecer single-file, os dados de contato e a lógica de `buildVCard()`/`renderQR()` ficam dentro de `index.html`, mas **logicamente separados** (constante de config no topo; funções dedicadas; UI apenas apresenta).
- Sem pastas `lib/`, `src/`, migrations ou testes automatizados pesados — a validação é manual (ver Estado atual).

## Estado atual

**SPEC-001 entregue** (2026-08-11) — [PR #1](https://github.com/GusHartz/QRCODE/pull/1), aguardando review do arquiteto. Documentos de fundação (Visão & Escopo, Especificação Funcional, SDD, Roadmap) concluídos. **Nenhum código de produto ainda** — não existe `index.html`.

O que a SPEC-001 mudou: o repositório agora **roda e é verificado de verdade**.
- `npm ci` · `npm run build` · `npm test` — os três funcionam por comando e estão documentados no [`README.md`](README.md).
- `package.json` (zero dependências), `package-lock.json`, `.nvmrc` (Node 24), `scripts/build.mjs` (monta `dist/`).
- 10 testes em `node:test` (`test/`): contrato CI ↔ `package.json`, formato das SPEC/DONE e higiene do repositório.
- `.github/workflows/ci.yml` **não foi modificado** — ele já rodava os três comandos; faltava o `package.json`.
- **O CI foi provado em vermelho:** quebra deliberada commitada ([run vermelho](https://github.com/GusHartz/QRCODE/actions/runs/31501438841)) e revertida ([run verde](https://github.com/GusHartz/QRCODE/actions/runs/31501518901)). Verde aqui é afirmação verificável, não decoração.

**Pronto para a próxima spec.** Cards no backlog do board: payload vCard, página HTML estática base, renderização do QR (este depende dos dois primeiros).

**Caminho crítico do roadmap:** `2.1 (payload vCard)` → `2.2 (renderização QR)` → `1.1 (página HTML)` → `4.1 (deploy)`. A Fase 3 (layout/acessibilidade) pode rodar em paralelo ou após o MVP no ar.

**Nota sobre time (founder solo — Gustavo Hartz):** o founder acumula os papéis de arquiteto, dev, QA e Data. O **duplo sign-off** do padrão H1VE é substituído por **checklist de verificação manual** antes de publicar:
- Escanear o QR com ao menos 2 leitores (Câmera iOS + app Android) e confirmar importação correta do contato.
- Confirmar dados exatos (nome, e-mail, telefone) e que o telefone disca corretamente.
- Confirmar que a página abre em mobile e desktop e funciona offline.
- Gate automatizado em vigor desde a SPEC-001: `npm test` (10 testes) + `npm run build` rodando no CI a cada PR — e comprovadamente capaz de reprovar.
- Gate ainda pendente: validação de HTML (`html-validate`), que entra junto com o primeiro `index.html`. Hoje não há arquivo HTML para validar.

**Pontos a revisar antes de fechar decisões:** formato vCard vs. texto puro; divulgação pública do telefone pessoal; biblioteca de QR e CDN; plataforma de deploy; CSP.

---

> **⚠️ AGENTE DE IA — LEIA ISTO PRIMEIRO.** Este é o arquivo de contexto e método deste projeto (padrão
> H1VE). Leia-o por **COMPLETO** e **SIGA todas as regras abaixo em TODA sessão de desenvolvimento** —
> não é opcional. Vale para **qualquer** agente de IA que trabalhe neste repositório (Claude Code,
> Cursor, Copilot, Codex, etc.). Se você é um agente, trate as regras abaixo como restrições rígidas.

> **🔒 A REGRA DE OURO — o board comanda; a IA executa. A IA NUNCA age acima da H1VE.** Duas proibições
> ABSOLUTAS, em toda sessão, sem exceção:
>
> 1. **NUNCA inicie um card que o board não autorizou.** Autorização = o card está em `dev` no board,
>    movido por um HUMANO (o founder/arquiteto aprova `spec → dev`). Um "ok" / "aprovado" / "pode ir"
>    dito no chat **NÃO é autorização** — só o board autoriza. Card em `backlog` ou `spec`? **PARE**:
>    escreva a SPEC, publique-a no card e **peça a aprovação**. Não escreva uma linha de código de
>    produção antes de o card estar em `dev`. **E escolher QUAL card trabalhar também é do humano:**
>    ao ver a lista de `h1ve start`, recomende com o motivo e **PERGUNTE** — nunca decida por conta
>    própria qual iniciar.
>
> 2. **NUNCA avance o trabalho sem MOVER o card.** Cada ação real — terminar o código, commitar, dar
>    push, abrir o PR, deixar o CI rodar — tem de estar **espelhada no board no mesmo momento**. Você
>    **nunca** "some" para o GitHub e volta com tudo pronto. Ao terminar e abrir o PR, **mova o card**
>    `dev → pr` (`h1ve move pr`, ou a tool MCP `move_feature_stage`) — a ação e o card andam juntos.
>    Se você **não pode** mover o card (falta autorização, ou o estágio não permite), então você **não
>    pode** fazer a ação: pare e comunique ao usuário.
>
> **O card é a sombra da realidade — se você agiu, o board sabe.** Um board que não reflete o que você
> fez MENTE para o time (founder, arquiteto, QA, Data) e a H1VE perde o valor. Board cego é falha grave.
> Na dúvida entre agir e comunicar: **comunique primeiro.**

> **Descobriu trabalho que não está no board?** Uma fatia seguinte de uma feature grande, uma tarefa que
> falta — **PROPONHA um card** (a tool `propose_card`, ou `h1ve propose "<título>" --follows current`)
> em vez de deixá-la só em prosa; senão o board fica CEGO ao que falta. O card nasce em `backlog`,
> **INERTE**: você propõe, o humano aprova (move `spec → dev`) — **propor ≠ iniciar**. NUNCA comece o
> card que você propôs; a autorização é sempre do humano.

> **📓 Memória do projeto — leia também `memory/MEMORY.md`.** É a memória DURÁVEL do projeto (decisões,
> gotchas, invariantes) capturada **automaticamente** pelo H1VE a partir do histórico. Carregue-a no início
> de toda sessão, junto deste arquivo. **É gerada — NÃO edite à mão** (é sobrescrita a cada atualização;
> correções vão na SPEC ou no código, nunca nela). Se ela ainda não existe, o projeto simplesmente não
> acumulou fatos duráveis ainda.

## Ritual obrigatório de desenvolvimento

> Leia este CLAUDE.md COMPLETO antes de iniciar qualquer sessão de desenvolvimento.
> Atualize a seção "Estado atual" ao final de qualquer sessão.

### Antes de qualquer sessão
1. **Ler este CLAUDE.md completo** — sem exceção.
2. **Ler `memory/MEMORY.md`** — a memória durável do projeto (decisões, gotchas, invariantes acumulados). Se ela contradiz o que você ia fazer, **ela vence** — trate como âncora.
3. **Ler o BOARD VIVO** — rode `h1ve status` (a feature da sua branch atual) e `h1ve start` (os cards iniciáveis do backlog), ou use as tools MCP `get_current_feature`/`start_feature`. **O board é a fonte da verdade do QUE construir** — as colunas `dev → pr → qa_data → main` com os cards que o time move. **Nenhum documento do repositório é a fila.** Roadmap, notas e specs locais são contexto e direção — **NÃO a fila de trabalho**: nunca escolha a próxima feature a partir deles. **Sem acesso ao board** (CLI não logado / MCP não conectado): **PARE e peça ao usuário para conectar** (`h1ve login` + `h1ve mcp install`) — **jamais invente o backlog** a partir de qualquer documento local. **A escolha do PRÓXIMO card é do HUMANO, não sua.** Ao ver a lista de cards iniciáveis, **NÃO escolha por conta própria**: apresente a lista, dê a sua **recomendação com o motivo** (a sua análise complementa a ordem do board — você vê o código local, o que está pela metade e o que destrava mais trabalho) e **PERGUNTE qual o usuário quer iniciar**. Rodar `h1ve start` sem número só LISTA; iniciar de fato é o usuário decidir. **Dependências entre cards:** o `get_current_feature` (e o board) mostram as dependências do card atual (`depends_on`). Ao ler o board + o **código** e perceber que este card precisa de OUTRO card feito antes, **registre a dependência** com a tool MCP `add_dependency` (informe o id do card-alvo) — assim o board sequencia o trabalho e ninguém começa um card bloqueado. **Não comece um card cuja dependência ainda não está em `main`** sem avisar o usuário. **Anexos do card:** o `get_current_feature` (e o board) mostram os anexos do card (`attachments`) — arquivos de apoio (mockup, PDF de design, especificação visual). Os de tipo `repo_path` são arquivos **LOCAIS** no repo — **abra-os e considere no design/implementação**; os de tipo `url` são links externos (abra se acessível).
4. **Autorização para codar = o card em `dev` no board.** Cheque o stage do card. Se não há SPEC aprovada, crie `specs/SPEC-NNN-slug.md`, **publique-a no card** (`h1ve spec --from specs/SPEC-NNN-slug.md`, ou a tool MCP `set_spec`) e **peça a aprovação** — o founder/arquiteto move `spec → dev`. **Só escreva código quando o card estiver em `dev`** (Regra de Ouro nº 1); um "aprovado" no chat não conta — a porta é o board. **O número `NNN` é ATRIBUÍDO PELO SERVIDOR** — leia o `SPEC-NNN` do card (`h1ve status` / a tool `get_current_feature` retornam `spec_number`) e use-o no nome do arquivo, no título `# SPEC-NNN` e na linha `| Número |`. **NUNCA invente o número** nem o deduza olhando os arquivos existentes: dois agentes em paralelo jamais recebem o mesmo (o servidor aloca atomicamente por projeto). Card ainda sem número (não entrou em `spec`)? Submeta-o primeiro (`h1ve start` / publicar a SPEC) e releia.
5. **Sincronizar com a `main` antes de codar** — `git fetch origin && git rebase origin/main`. O repositório local é uma foto congelada: o founder pode ter mergeado enquanto você trabalhava. Ao iniciar uma feature, `h1ve start` **avisa** se sua base está atrás de `origin/main` — sincronize também quando esse aviso aparecer no meio de uma sessão longa.
6. Confirmar que está na branch correta (`feat/{owner}/{feature-slug}`).

### Ao final de qualquer sessão
1. Criar `specs/DONE-NNN-slug.md` (mesmo número da SPEC) e **publicá-lo no card** (`h1ve done --doc specs/DONE-NNN-slug.md`, ou a tool MCP `set_done`) — obrigatório antes do PR.
2. Atualizar a seção **"Estado atual"** deste CLAUDE.md.
3. **Mover o card `dev → pr`** (`h1ve move pr`, ou a tool MCP `move_feature_stage`) e abrir o PR com a AI declaration preenchida — o card e o PR andam **juntos**, nunca o PR sozinho (Regra de Ouro nº 2).

### Durante a sessão — auto-checagem de drift

> A cada bloco de trabalho, compare o que você está fazendo com a **SPEC aprovada**, as **OPs** e a **memória do projeto** (`memory/MEMORY.md`).

Se perceber que **divergiu** — está construindo algo diferente do que a SPEC descreve, o escopo cresceu além do combinado, uma OP está sendo violada, ou você está contradizendo uma decisão já registrada na memória — **PARE e sinalize ao usuário ANTES de continuar**. Diga: (1) o que você ia fazer, (2) contra qual âncora isso conflita (a SPEC-NNN, a OP-XX ou uma decisão em `memory/MEMORY.md`), e (3) as duas saídas: **atualizar a âncora** (revisar a SPEC, se a mudança é intencional) ou **corrigir o rumo** (voltar ao escopo). Nunca "sigo em frente e conserto depois" — o alinhamento se resolve na hora, com o usuário.

## Padrão SPEC → DONE

```
specs/SPEC-{NNN}-{slug}.md   ← antes do desenvolvimento
specs/DONE-{NNN}-{slug}.md   ← depois do desenvolvimento
```
Nenhum PR é válido sem a SPEC aprovada e o DONE correspondente.

> **Publique o artefato NO CARD — não só no repositório.** O H1VE lê a SPEC e o DONE **do card** (é lá que ficam os gates de fluxo e a aprovação). Depois de escrever o arquivo, publique-o: `h1ve spec --from specs/SPEC-NNN-slug.md` (SPEC) e `h1ve done --doc specs/DONE-NNN-slug.md` (DONE) — ou as tools MCP `set_spec`/`set_done`. Escrever apenas o arquivo do repositório **não** faz o artefato chegar ao card nem move o fluxo.

## Regras inegociáveis (OPs)

- **OP-01** Nunca alterar o schema sem criar migration.
- **OP-02** Nunca commitar segredos (`.env`, tokens, chaves).
- **OP-08** Handlers de webhook validam a assinatura antes de processar qualquer payload.
- **OP-09** Toda rota valida **autenticação primeiro, autorização segundo, input terceiro** — nesta ordem.
- **OP-11** Respostas de erro nunca expõem stack trace, SQL ou detalhes internos — só mensagem genérica + código.
- **OP-12** Nenhum segredo hardcoded — variáveis de ambiente, server-only.
- **OP-14** Sem `any` no TypeScript.
- **OP-15** Nenhuma função com mais de 50 linhas.
- **OP-16** Nenhum arquivo com mais de 300 linhas.
- **OP-17** Nenhuma lógica de negócio dentro de componentes de UI.
- **OP-20** Merge em `main` é exclusividade do arquiteto.

## Roles

| Role | Resumo de capacidade |
|---|---|
| `founder` | Visão completa; gestão de conta/projeto/usuários; input de saúde |
| `architect` | Aprovar specs e DONEs, review final, merge em `main` |
| `dev` | Suas features; mover `dev → pr`; AI declaration; blockers |
| `qa` | Features em `qa_data`; sign-off funcional |
| `data` | Features em `qa_data`; sign-off de integridade de dados |

## Gates de qualidade

- CI verde obrigatório antes do merge.
- **Duplo sign-off QA + Data** antes de uma feature sair de `qa_data`.
- O arquiteto faz o squash merge em `main`.

---

*CLAUDE.md gerado pelo H1VE na fundação do projeto. Documento vivo — leia antes, atualize depois.*
