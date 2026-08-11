# Especificação Funcional — Gerador de QR Code de Contato (H1VE Canvas)

## Capacidades centrais

O sistema entrega uma página HTML estática que renderiza um QR Code contendo os dados de contato de Gustavo Hartz, permitindo que participantes de workshops e palestras salvem o contato de forma rápida.

- **Renderização de QR Code de contato**
  - Gera um QR Code a partir de um payload de contato estruturado.
  - Formato do payload: **vCard 3.0** `[SUPOSIÇÃO — revisar]` — padrão universal reconhecido nativamente por câmeras/agendas de iOS e Android, permitindo "adicionar contato" com um toque (superior a texto puro).
  - Dados codificados:
    - Nome: `Gustavo Hartz`
    - Email: `guhartz@gmail.com`
    - Telefone: `+55 21 969324713` (normalizado para E.164 `[SUPOSIÇÃO — revisar]`, garantindo discagem correta fora do Brasil).

- **Página HTML de apresentação**
  - Exibe o QR Code centralizado, com alto contraste e tamanho mínimo legível (≥ 200×200 px) para leitura à distância em telão/slide `[SUPOSIÇÃO — revisar]`.
  - Exibe os dados de contato em texto abaixo do QR Code como fallback acessível para quem não conseguir ler o código.
  - Página autocontida (single-file): QR Code gerado client-side via biblioteca JS ou embutido como imagem `data:` — sem dependência de backend ou serviços externos em runtime `[SUPOSIÇÃO — revisar]`, o que garante funcionamento offline durante o evento.

- **Separação de responsabilidades** `[SUPOSIÇÃO — revisar]`
  - **Dados de contato**: isolados em um objeto/constante de configuração (ex.: `contact.js` ou `<script>` no topo), não espalhados no markup — facilita atualização sem tocar na UI.
  - **Geração do QR Code**: encapsulada em uma função/lib dedicada (`buildVCard()` + `renderQR()`), separada da montagem visual.
  - **UI**: apenas apresenta o QR Code e o texto; não contém lógica de formatação de dados.

### Fora do escopo (explícito)
- Coleta de dados de participantes, formulários ou captura de leads.
- Backend, banco de dados, autenticação de usuários ou personalização por participante.
- Analytics de scans ou rastreamento.

## Por tipo de usuário

### Participante de Workshop/Palestra (usuário final único)
- **Objetivo**: salvar o contato do palestrante rapidamente.
- **Fluxo**:
  1. Vê a página HTML (projetada em telão ou aberta em dispositivo).
  2. Aponta a câmera do celular para o QR Code.
  3. O sistema operacional reconhece o vCard e oferece "Adicionar aos contatos".
  4. Confirma e salva nome, email e telefone.
- **Fallback**: caso não leia o QR Code, copia os dados do texto exibido abaixo.
- **Permissões**: acesso público, somente leitura. Não há login nem interação que modifique estado.

> Não há usuários administrativos no escopo. Atualização dos dados de contato é feita editando a constante de configuração no código-fonte (papel do mantenedor) `[SUPOSIÇÃO — revisar]`.

## Gates de qualidade

O Canvas não especificou gates; abaixo o baseline H1VE aplicado ao contexto (artefato estático simples).

### Segurança (baseline sempre presente)
- **Autenticação/Autorização**: não aplicável — página pública, somente leitura, sem operações de estado.
- **Validação de input**: não há input de usuário em runtime. A validação recai sobre os **dados de configuração** no build:
  - Email deve casar com formato válido; telefone normalizado para E.164.
  - Escapar os dados de contato ao injetá-los no HTML (evitar quebra de markup / XSS caso os dados venham a ser externalizados) `[SUPOSIÇÃO — revisar]`.
- **Segredos**: nenhum segredo hardcoded. Os dados de contato são **públicos por design** (finalidade é divulgação), portanto não são tratados como segredo.
- **Menor privilégio**: nenhuma dependência externa em runtime; sem chamadas de rede que exponham dados adicionais.
- **Erros genéricos**: caso a biblioteca de QR falhe, exibir mensagem neutra ("Não foi possível gerar o QR Code") e sempre manter o **texto de contato como fallback** — sem exibir stack traces.

### Qualidade de código e testes
- **Gates de CI** `[SUPOSIÇÃO — revisar]`:
  - Lint de HTML/JS (ex.: HTMLHint + ESLint).
  - Validação do vCard gerado contra a spec 3.0.
  - Verificação de acessibilidade básica (contraste, `alt` na imagem do QR Code).
- **Testes onde há lógica crítica**:
  - `buildVCard()`: teste unitário verificando que nome, email e telefone normalizado aparecem corretos e escapados no payload.
  - Teste de renderização: QR Code presente e decodificável (decode via lib e comparação com o vCard esperado).
- **Duplo sign-off**:
  - **QA**: confirma leitura do QR Code em ao menos um dispositivo iOS e um Android, e validade do fallback textual.
  - **Data**: confirma corretude e atualidade dos dados de contato (nome, email, telefone).
- **Merge**: aprovado e integrado pelo **arquiteto** após ambos os sign-offs.

### Definition of Done
- QR Code lê corretamente e adiciona o contato em iOS e Android.
- Dados de contato exibidos em texto conferem com os do QR Code.
- Página funciona offline (single-file autocontido).
- Gates de CI verdes e duplo sign-off registrado.