# Visão & Escopo — Gerador de QR Code de Contato

## Problema

Em workshops e palestras, o compartilhamento de contato entre apresentador e participantes é lento e sujeito a erros:

- Ditar ou digitar nome, e-mail e telefone consome tempo e gera falhas de digitação.
- Trocar cartões físicos é ineficiente e nem sempre disponível.
- Participantes precisam de uma forma **imediata** de salvar o contato do apresentador em seus dispositivos.

Falta uma solução simples que exponha as informações de contato de forma escaneável e instantânea.

## Visão

Uma página HTML única que exibe um QR Code contendo as informações de contato de Gustavo Hartz, permitindo que qualquer participante escaneie e salve o contato em segundos, sem cadastro, sem back-end e sem dependências externas em tempo de execução.

**Direção:** simplicidade máxima — abrir a página, escanear, pronto.

## Usuários

- **Participantes de workshops e palestras** — escaneiam o QR Code com a câmera do celular para acessar/salvar o contato. Não interagem com formulários nem fazem login.
- **Apresentador (Gustavo Hartz)** — exibe a página em tela (notebook/projetor/celular) durante o evento. É também o mantenedor dos dados de contato.

## No escopo

- Página **HTML estática** (arquivo único) que renderiza um QR Code com os dados de contato.
- Conteúdo do QR Code no formato **vCard** *[SUPOSIÇÃO — revisar: vCard permite "salvar contato" com um toque; alternativa seria texto simples, que apenas exibe os dados]*:
  - Nome: Gustavo Hartz
  - E-mail: guhartz@gmail.com
  - Telefone: +55 21 96932-4713
- Geração do QR Code **no navegador (client-side)** via biblioteca JavaScript embutida ou via arquivo de imagem pré-gerado *[SUPOSIÇÃO — revisar: geração client-side evita chamadas a serviços externos e mantém a página offline-friendly]*.
- Exibição visível das informações de contato em texto abaixo do QR Code, como fallback caso o scan falhe.
- Layout responsivo básico para exibição em telas grandes (projeção) e pequenas (celular) *[SUPOSIÇÃO — revisar: garante legibilidade em qualquer contexto de evento]*.

## Fora do escopo

- **Banco de dados** ou qualquer camada de persistência.
- **Back-end / API / servidor de aplicação** — a solução é 100% estática.
- **Autenticação, cadastro ou gestão de múltiplos usuários** — dados fixos de um único contato.
- Leitura/decodificação de QR Code pela própria aplicação (a leitura é feita pelo app de câmera do participante).
- Coleta, armazenamento ou rastreamento de dados dos participantes (analytics, logs de scan).
- Edição dinâmica dos dados de contato via interface — alterações são feitas editando o HTML.

## Nota de segurança (baseline)

- **Sem segredos:** os dados de contato são públicos por natureza; nenhuma credencial ou variável sensível deve existir no repositório ou na página.
- **Exposição consciente:** e-mail e telefone ficam publicamente legíveis no QR Code e no texto — comportamento intencional e alinhado ao propósito. *[SUPOSIÇÃO — revisar: confirmar com o titular a divulgação pública do telefone pessoal]*.
- **Sem entrada de usuário:** por não haver formulários nem back-end, não há superfície para injeção ou validação de input nesta versão.