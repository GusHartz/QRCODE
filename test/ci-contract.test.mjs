// O contrato entre .github/workflows/ci.yml e package.json.
//
// É o item 2 do card virando teste: "o nome de cada script bate com o que o workflow chama".
// Um script renomeado no package.json some do CI em silêncio — as chamadas do workflow usam
// --if-present, então o job segue verde sem ter rodado nada. Este arquivo é o que quebra.

import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { test } from 'node:test'

const WORKFLOW = '.github/workflows/ci.yml'

const workflow = readFileSync(new URL(`../${WORKFLOW}`, import.meta.url), 'utf8')
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const scripts = Object.keys(pkg.scripts ?? {})

// `npm run <script> [flags]` e o atalho `npm test [flags]`. `npm ci` / `npm install` não são
// scripts e não casam com nenhum dos dois padrões.
function chamadasDoWorkflow() {
  const chamadas = []
  for (const m of workflow.matchAll(/npm run ([\w:-]+)([^\n]*)/g)) {
    chamadas.push({ script: m[1], tolerante: m[2].includes('--if-present') })
  }
  for (const m of workflow.matchAll(/npm test\b([^\n]*)/g)) {
    chamadas.push({ script: 'test', tolerante: m[1].includes('--if-present') })
  }
  return chamadas
}

const chamadas = chamadasDoWorkflow()

test('o workflow invoca pelo menos um script npm', () => {
  assert.ok(
    chamadas.length > 0,
    `${WORKFLOW} não chama nenhum script npm — o CI não teria o que rodar`
  )
})

test('todo script exigido pelo workflow existe em package.json', () => {
  const faltando = chamadas
    .filter((c) => !c.tolerante && !scripts.includes(c.script))
    .map((c) => c.script)
  assert.deepEqual(
    faltando,
    [],
    `${WORKFLOW} chama script(s) inexistente(s) em package.json: ${faltando.join(', ')}`
  )
})

test('todo script de package.json é chamado pelo workflow', () => {
  const chamados = new Set(chamadas.map((c) => c.script))
  const orfaos = scripts.filter((s) => !chamados.has(s))
  assert.deepEqual(
    orfaos,
    [],
    `script(s) declarado(s) em package.json que o CI nunca roda: ${orfaos.join(', ')}`
  )
})

test('o conjunto de verificação do CI não é vazio', () => {
  const verificacao = ['test', 'typecheck', 'build'].filter((s) => scripts.includes(s))
  assert.ok(
    verificacao.length > 0,
    'package.json não declara test, typecheck nem build — verde no CI seria mentira'
  )
})
