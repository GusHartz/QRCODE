// Formato das SPEC/DONE — as mesmas seções que o gate SPEC-166 do ci.yml exige.
//
// No workflow esse lint é continue-on-error: ele anota o PR mas não estranda o card. Aqui ele
// reprova localmente, antes do push, que é onde custa barato consertar. Nenhuma regra nova:
// a lista abaixo é cópia fiel do que o workflow procura com grep.

import { readFileSync, readdirSync } from 'node:fs'
import assert from 'node:assert/strict'
import { test } from 'node:test'

const SPECS = new URL('../specs/', import.meta.url)

const SECOES_OBRIGATORIAS = {
  SPEC: [
    'Objetivo',
    'Contexto e motivação',
    'Escopo — o que está DENTRO',
    'Escopo — o que está FORA',
    'Arquivos que serão tocados',
    'Critérios de aceitação',
    'Riscos e dependências',
    'Notas de implementação',
  ],
  DONE: [
    'Resumo do que foi feito',
    'Arquivos modificados',
    'Critérios de aceitação',
    'AI Declaration',
  ],
}

const NOME_VALIDO = /^(SPEC|DONE)-(\d{3})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function documentos() {
  return readdirSync(SPECS)
    .filter((f) => /^(SPEC|DONE)-/.test(f) && !f.endsWith('TEMPLATE.md'))
    .map((arquivo) => ({
      arquivo,
      tipo: arquivo.startsWith('SPEC') ? 'SPEC' : 'DONE',
      texto: readFileSync(new URL(arquivo, SPECS), 'utf8'),
    }))
}

function secoesFaltando({ tipo, texto }) {
  return SECOES_OBRIGATORIAS[tipo].filter(
    (secao) => !new RegExp(`^#+\\s*${escaparRegex(secao)}`, 'im').test(texto)
  )
}

test('toda SPEC/DONE do repositório tem as seções obrigatórias do template', () => {
  const problemas = documentos()
    .map((doc) => ({ arquivo: doc.arquivo, faltando: secoesFaltando(doc) }))
    .filter((p) => p.faltando.length > 0)
    .map((p) => `${p.arquivo}: falta ${p.faltando.join(', ')}`)

  assert.deepEqual(problemas, [], `documento(s) fora do template H1VE:\n${problemas.join('\n')}`)
})

test('toda SPEC/DONE segue a nomenclatura SPEC-NNN-slug.md', () => {
  const invalidos = documentos()
    .map((d) => d.arquivo)
    .filter((arquivo) => !NOME_VALIDO.test(arquivo))

  assert.deepEqual(
    invalidos,
    [],
    `nome(s) fora do padrão NNN de três dígitos + slug kebab-case: ${invalidos.join(', ')}`
  )
})

test('todo DONE tem a SPEC correspondente (mesmo número e slug)', () => {
  const arquivos = documentos().map((d) => d.arquivo)
  const orfaos = arquivos
    .filter((f) => f.startsWith('DONE-'))
    .filter((f) => !arquivos.includes(f.replace(/^DONE-/, 'SPEC-')))

  assert.deepEqual(orfaos, [], `DONE sem a SPEC correspondente: ${orfaos.join(', ')}`)
})
