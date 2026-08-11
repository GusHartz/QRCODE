// Higiene do repositório: o que nunca deve ser commitado, e o que precisa estar documentado.
//
// Cobre o item 3 do card (".gitignore cobre as dependências da sua stack") e trava OP-02/OP-12
// (nenhum segredo versionado). O teste do README existe porque o item 1 do card — "instalar,
// construir e testar ... documentados no README" — só é verificável se alguém verificar.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const raiz = (arquivo) => new URL(`../${arquivo}`, import.meta.url)
const ler = (arquivo) => readFileSync(raiz(arquivo), 'utf8')

const PADROES_IGNORADOS = ['node_modules/', 'dist/', '.env*']
const COMANDOS_DO_README = ['npm ci', 'npm run build', 'npm test']

test('.gitignore cobre as dependências e os artefatos gerados da stack', () => {
  const linhas = ler('.gitignore')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))

  const descobertos = PADROES_IGNORADOS.filter((p) => !linhas.includes(p))
  assert.deepEqual(
    descobertos,
    [],
    `.gitignore não ignora: ${descobertos.join(', ')} — isso vaza para o repositório`
  )
})

test('README documenta os três comandos que o CI roda', () => {
  assert.ok(existsSync(raiz('README.md')), 'README.md não existe — o repositório não se explica')

  const readme = ler('README.md')
  const ausentes = COMANDOS_DO_README.filter((cmd) => !readme.includes(cmd))
  assert.deepEqual(
    ausentes,
    [],
    `README.md não documenta: ${ausentes.join(', ')} — comando que o CI roda e ninguém sabe rodar`
  )
})

// Um .env local e ignorado é normal; um .env RASTREADO pelo git é OP-02 violada. A diferença
// só aparece perguntando ao git — existsSync acusaria o desenvolvedor pelo arquivo certo.
test('nenhum arquivo de ambiente está rastreado pelo git', () => {
  const rastreados = execFileSync('git', ['ls-files', '-z', '--', '.env*', '**/.env*'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean)
    .filter((f) => !f.endsWith('.env.example'))

  assert.deepEqual(
    rastreados,
    [],
    `arquivo(s) de ambiente versionado(s) — OP-02: ${rastreados.join(', ')}`
  )
})
