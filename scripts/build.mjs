// Build da página estática: reúne em dist/ o que vai ao ar.
//
// A stack não tem bundler (CLAUDE.md → "sem build step"), então "construir" aqui significa
// juntar os artefatos publicáveis num diretório só — o que o deploy da Fase 4 vai empacotar.
// Enquanto não existir index.html, o script diz isso em voz alta: um dist/ vazio passando
// por sucesso silencioso seria a mesma decoração que este card veio eliminar.

import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const ENTRY = 'index.html'
const PUBLICAVEIS = new Set(['.html', '.css', '.js', '.svg', '.png', '.ico', '.webmanifest'])

async function coletarEstaticos() {
  const entradas = await readdir(ROOT, { withFileTypes: true })
  return entradas
    .filter((e) => e.isFile() && PUBLICAVEIS.has(extname(e.name)))
    .map((e) => e.name)
    .sort()
}

async function main() {
  const arquivos = await coletarEstaticos()

  await rm(DIST, { recursive: true, force: true })
  await mkdir(DIST, { recursive: true })

  for (const nome of arquivos) {
    await copyFile(join(ROOT, nome), join(DIST, nome))
    console.log(`  copiado  ${nome}`)
  }

  console.log(`build: ${arquivos.length} arquivo(s) em dist/`)

  if (!arquivos.includes(ENTRY)) {
    console.log(
      `build: nenhum ${ENTRY} na raiz — nada publicável foi construído.\n` +
        '       Esperado até o card "Criar página HTML estática base"; depois dele,\n' +
        '       a ausência deixa de ser aviso e passa a ser erro.'
    )
  }
}

await main()
