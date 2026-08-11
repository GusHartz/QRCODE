# O método deste projeto

O método vive em **`CLAUDE.md`**, na raiz do repositório. Ele é a **fonte única** — este arquivo
existe só para te levar até lá.

> **Leia `CLAUDE.md` por COMPLETO antes de qualquer sessão de desenvolvimento.**
> Vale para qualquer agente de IA que trabalhe neste repositório (Claude Code, Cursor, Copilot,
> Codex, etc.).

## A Regra de Ouro, resumida

1. **NUNCA inicie um card que o board não autorizou.** Autorização é o card em `dev`, movido por um
   humano. Um "ok" no chat não é autorização.
2. **NUNCA avance o trabalho sem MOVER o card.** Se você não pode mover o card, você não pode fazer
   a ação: pare e comunique.

## Isto não é um pedido

Editar arquivo com o card fora de `dev` é **RECUSADO pelo guard do editor**, antes de a escrita
acontecer — você recebe um `deny` com o motivo, não um aviso. Rode `h1ve status` para ver o estado
do card da sua branch, e `h1ve start` para ver o que o board autoriza iniciar.

O detalhe completo — ritual, OPs, gates, papéis e os gotchas do projeto — está no `CLAUDE.md`.
