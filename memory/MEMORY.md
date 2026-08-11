# Memória do projeto

> Fatos DURÁVEIS destilados automaticamente do fluxo (decisões, gotchas, invariantes), ancorados por
> ENTIDADE. **Gerado pelo H1VE — não editar à mão** (é sobrescrito). Eterno: nada é apagado.

## 🧭 Invariantes (valem sempre — leia antes de mexer na área)

- **`ci-contract.test.mjs` trava o contrato entre `package.json` e `ci.yml`** — O workflow usa `--if-present` em todos os scripts npm: um script renomeado some do CI em silêncio, sem erro. `test/ci-contract.test.mjs` é a única barreira contra isso — ele reprova se qualquer script declarado em `package.json` não for chamado pelo workflow, ou vice-versa. Nunca remover ou enfraquecer esse teste sem revisar o workflow simultaneamente. · `ci` `test` `package.json`

## 🎯 Decisões

- **`scripts/build.mjs` avisa (exit 0) sem `index.html`; deve virar erro quando ele existir** — Enquanto `index.html` não existe, o build reporta 'nada publicável foi construído' e sai com código 0 — dist/ vazio é estado legítimo nesta fase. Quando o card 'Criar página HTML estática base' for entregue, essa lógica deve ser invertida: ausência de `index.html` passa a ser erro (exit ≠ 0). Débito registrado no DONE-001. · `build` `scripts/build.mjs` `ci`

## ⚠️ Gotchas (comportamento inesperado a não reaprender)

- **`node --test test/` falha no Node 24 — usar glob explícito** — No Node 24, `node --test test/` trata o argumento como caminho de arquivo e falha com `Cannot find module`. O comando correto é `node --test "test/*.test.mjs"`. As aspas evitam expansão prematura pelo shell. · `ci` `test` `package.json`
