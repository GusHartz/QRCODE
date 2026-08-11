# qr-code

Página HTML estática que exibe um QR Code com os dados de contato de **Gustavo Hartz** em formato
vCard. Um participante de workshop aponta a câmera, salva o contato, pronto — sem cadastro, sem
back-end, sem dependência externa em tempo de execução.

O contexto completo (visão, escopo, stack e método de trabalho) está em [`CLAUDE.md`](CLAUDE.md).

## Requisitos

- **Node.js** na versão do [`.nvmrc`](.nvmrc) (24). Com `nvm`: `nvm use`.
- Nada mais. O projeto não tem dependências de runtime.

> Node é usado apenas para o **arreio de verificação** (build e testes). A página em si é HTML e
> JavaScript puros e roda sem nenhum servidor de aplicação.

## Os três comandos

```bash
npm ci
```

Instala as dependências a partir do `package-lock.json`. Hoje o projeto tem **zero dependências** —
o comando existe e é executado pelo CI para que o dia em que a primeira dependência entrar não seja
o dia em que se descobre que o install nunca foi testado.

```bash
npm run build
```

Monta o diretório `dist/` com os artefatos publicáveis da raiz (`.html`, `.css`, `.js`, imagens) —
é o que o deploy empacota. Como a stack não tem bundler, "construir" aqui significa **reunir o que
vai ao ar**. Enquanto `index.html` não existir, o comando imprime explicitamente que nada
publicável foi construído em vez de deixar um `dist/` vazio passar por sucesso.

```bash
npm test
```

Roda a suíte em [`test/`](test/) com o runner nativo do Node (`node --test`), sem framework. Três
arquivos, cada um verificando um invariante real do repositório:

| Arquivo | O que reprova |
|---|---|
| [`test/ci-contract.test.mjs`](test/ci-contract.test.mjs) | Um script renomeado em `package.json` que o CI chama — ou um script que o CI nunca roda. |
| [`test/spec-format.test.mjs`](test/spec-format.test.mjs) | Uma SPEC/DONE sem as seções obrigatórias do template, ou fora da nomenclatura `NNN-slug`. |
| [`test/repo-hygiene.test.mjs`](test/repo-hygiene.test.mjs) | `.gitignore` sem cobrir `node_modules/`, `dist/` ou `.env*`; README sem os comandos; arquivo de ambiente rastreado pelo git. |

## Como o CI usa exatamente estes comandos

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda, em todo PR e em todo push para `main`:

1. `npm ci` (com fallback para `npm install`)
2. `npm run build --if-present`
3. `npm test --if-present`

São os mesmos comandos desta seção — nada que o CI rode existe só lá. E como as chamadas do
workflow usam `--if-present`, um script renomeado sumiria do CI **em silêncio**: é precisamente isso
que `test/ci-contract.test.mjs` impede.

O workflow também falha de propósito quando não há nada a verificar (sem `package.json`, ou com um
`package.json` sem `test`/`typecheck`/`build`). Verde neste repositório é uma afirmação sobre o
código, não um enfeite — e essa capacidade de reprovar foi **provada em vermelho**, com uma quebra
deliberada, no PR da SPEC-001 (ver [`specs/`](specs/)).

## Ver a página localmente

Ainda não há `index.html` — ele chega no card *"Criar página HTML estática base"*. Quando chegar:

```bash
npx serve dist
```

Ou simplesmente abrir `index.html` no navegador: a página é autocontida e não exige servidor.

## Método de trabalho

Este repositório segue o padrão **H1VE**: nenhum código sem SPEC aprovada, nenhum PR sem o DONE
correspondente. Ver [`specs/README.md`](specs/README.md) e o ritual obrigatório em
[`CLAUDE.md`](CLAUDE.md).
