# Especificação Técnica (SDD)

> **Nota:** O H1VE Canvas fornecido está vazio nos três blocos. Todas as decisões abaixo são defaults de best-practice H1VE marcados como **[SUPOSIÇÃO — revisar]**. Substituir pela realidade do projeto antes do sign-off do arquiteto.

## Stack/fundação técnica

**[SUPOSIÇÃO — revisar]** — stack web full-stack padrão H1VE:

- **Runtime/linguagem:** Node.js LTS + TypeScript (tipagem estática reduz classe inteira de bugs).
- **Framework web:** Next.js (App Router) — rotas como camada de orquestração; UI apenas apresenta.
- **Banco de dados:** PostgreSQL gerenciado; acesso via ORM tipado (Prisma).
- **Autenticação:** provider gerenciado (Auth.js/OAuth) — não reimplementar criptografia de sessão.
- **Infra:** deploy em plataforma serverless/containers; segredos em secret manager do provedor.
- **Observabilidade:** logs estruturados (JSON) + tracing; sem PII em logs.

### Separação de responsabilidades (obrigatória)

| Camada | Responsabilidade | Proibido |
|--------|------------------|----------|
| `lib/` (domínio) | Regra de negócio, validações de domínio, cálculos | Acessar `req`/`res`, renderizar |
| Rotas/handlers | Orquestração: auth → autz → validação → chamar `lib` | Conter regra de negócio |
| UI/componentes | Apresentação e interação | Regra de negócio, query direta a dados |
| Acesso a dados | Queries parametrizadas via ORM | SQL concatenado, lógica de negócio |

## Decisões-chave

- **TypeScript estrito** (`strict: true`): custo baixo, previne bugs em runtime. **[SUPOSIÇÃO — revisar]**
- **Regra de negócio isolada em `lib/`:** testável sem HTTP, reutilizável, auditável.
- **Validação de input na fronteira** com schema (Zod): todo payload externo é validado antes de tocar o domínio.
- **ORM com queries parametrizadas:** elimina SQL injection por construção.
- **Segredos sempre via ambiente/secret manager:** nada hardcoded, nem em repositório.
- **Erros genéricos ao cliente:** detalhe fica no log interno; cliente recebe mensagem neutra + correlation ID.
- **Migrations versionadas** no repositório, aplicadas por pipeline (nunca manualmente em produção).

## Modelo de segurança

Baseline aplicada em **toda** rota, na ordem canônica:

1. **Autenticação** — identidade verificada antes de qualquer lógica; sessão/token validado.
2. **Autorização** — verificação de permissão por recurso, com **menor privilégio** (deny by default). **[SUPOSIÇÃO — revisar]** papéis por confirmar.
3. **Validação de input** — schema estrito rejeita payloads malformados/inesperados; sanitização onde aplicável.

Controles transversais:

- **Segredos:** exclusivamente em variáveis de ambiente / secret manager; scanning de segredos no CI.
- **Respostas de erro genéricas:** sem stack trace, sem mensagens de SQL/ORM, sem detalhes internos.
- **Transporte:** HTTPS obrigatório; cookies `HttpOnly`, `Secure`, `SameSite`.
- **Dados sensíveis:** criptografia em repouso pelo provedor; PII fora de logs.
- **Rate limiting** em endpoints de autenticação e escrita. **[SUPOSIÇÃO — revisar]**

## Gates de qualidade (CI, duplo sign-off, merge do arquiteto)

**CI obrigatório** — merge bloqueado se qualquer gate falhar:

- Lint + type-check (`tsc --noEmit`).
- Testes unitários e de integração passando.
- Cobertura mínima na camada de domínio (`lib/`): **[SUPOSIÇÃO — revisar]** 80%.
- Scan de segredos + auditoria de dependências.
- Build de produção bem-sucedido.

**Duplo sign-off (obrigatório antes do merge):**

- **QA:** valida comportamento, casos de borda e ausência de regressão.
- **Data:** valida integridade de dados, migrations, contratos de schema e ausência de vazamento de PII.

**Merge pelo arquiteto:**

- Somente o **arquiteto** faz o merge, após CI verde + ambos sign-offs.
- Arquiteto verifica aderência à separação de responsabilidades e ao modelo de segurança.
- Branch protegida: sem push direto em `main`; PR obrigatório.

## Testes e harness

- **Unitários (`lib/`):** cobrem toda regra de negócio crítica — a camada onde há lógica. Sem I/O.
- **Integração (rotas):** validam a cadeia auth → autz → validação → domínio, incluindo caminhos de rejeição (401/403/400).
- **Testes de segurança:** casos negativos — acesso não autenticado, sem permissão, input inválido/malicioso — devem falhar de forma segura e com erro genérico.
- **Harness:** runner Vitest/Jest; banco efêmero (container/SQLite em memória) para integração; fixtures e seeds versionados. **[SUPOSIÇÃO — revisar]**
- **Migrations:** testadas em pipeline (apply + rollback) antes de produção.

## Riscos técnicos

**[SUPOSIÇÃO — revisar]** — riscos genéricos do stack, na ausência de dados do Canvas:

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Regra de negócio vazando para rotas/UI | Erosão de arquitetura, baixa testabilidade | Review do arquiteto rejeita PR; lint de fronteiras |
| Falha de autorização (IDOR, deny-by-default ausente) | Acesso indevido a dados | Autz por recurso + testes negativos obrigatórios |
| Segredo hardcoded/commitado | Comprometimento de credenciais | Secret scanning no CI + secret manager |
| Vazamento de detalhe interno em erro | Superfície de ataque, exposição de schema | Handler central de erro genérico + no-PII-in-logs |
| Migration destrutiva em produção | Perda/corrupção de dados | Sign-off de Data + teste de rollback no pipeline |
| Dependência vulnerável | Exploração de CVE | Auditoria automática no CI + updates periódicos |
| Cobertura insuficiente no domínio | Regressões silenciosas | Gate de cobertura mínima em `lib/` |

**Ação requerida:** preencher os blocos do Canvas (Fundação técnica, Gates & qualidade, Riscos) e revisar cada item marcado como suposição antes do sign-off do arquiteto.