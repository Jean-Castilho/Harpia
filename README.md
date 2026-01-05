# Projeto Harpia

Harpia é uma aplicação web de e-commerce construída com Node.js e Express, projetada para ser uma plataforma completa de vendas online, com painel administrativo, gerenciamento de produtos e integração de pagamentos.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Instalação e Execução](#instalação-e-execução)
- [Avaliação e Sugestões](#avaliação-e-sugestões)
  - [Backend](#backend)
  - [Frontend](#frontend)

## Sobre o Projeto

Este projeto é uma aplicação de e-commerce renderizada no lado do servidor (SSR) usando EJS como template engine. O backend é responsável por toda a lógica de negócio, autenticação, processamento de pedidos e comunicação com o banco de dados.

## Funcionalidades

- **Autenticação de Usuários:** Registro, login e gerenciamento de perfil com senhas criptografadas.
- **Verificação OTP:** Sistema de verificação por One-Time Password.
- **Catálogo de Produtos:** Visualização de produtos com detalhes.
- **Carrinho de Compras:** Adição e gerenciamento de itens no carrinho.
- **Checkout e Pagamento:** Integração com Mercado Pago para processamento de pagamentos.
- **Painel de Administração:**
  - Dashboard com visão geral.
  - Gerenciamento de produtos (CRUD - Criar, Ler, Atualizar, Deletar).
  - Gerenciamento de inventário.
  - Visualização e gerenciamento de pedidos.
- **Painel de Entregador:** Interface para gestão de entregas.

## Tecnologias Utilizadas

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Banco de Dados:** MongoDB (através do driver nativo)
- **Template Engine:** EJS (Embedded JavaScript)
- **Autenticação:** JWT (JSON Web Tokens) e Express Session
- **Criptografia:** Bcrypt.js
- **Upload de Arquivos:** Multer
- **Envio de E-mails:** Nodemailer
- **Pagamentos:** MercadoPago SDK
- **Variáveis de Ambiente:** Dotenv

### Frontend
- **Linguagens:** HTML5, CSS3, JavaScript (ES6+)
- **Estrutura:** CSS modularizado e semântico.

## Estrutura de Arquivos

A estrutura do projeto segue o padrão MVC (Model-View-Controller) de forma adaptada:

- `src/`: Contém toda a lógica do backend.
  - `controllers/`: Responsáveis por receber as requisições, usar os serviços e enviar respostas.
  - `services/`: Contêm a lógica de negócio da aplicação.
  - `routes/`: Definem as rotas da API e da aplicação web.
  - `middleware/`: Funções que rodam entre a requisição e a resposta (ex: autenticação).
  - `config/`: Configurações de banco de dados e autenticação.
  - `utils/`: Funções utilitárias.
- `public/`: Arquivos estáticos acessíveis publicamente (CSS, JS, imagens).
- `views/`: Arquivos de template EJS para renderização das páginas.
- `uploads/`: Diretório para onde as imagens dos produtos são enviadas.

## Instalação e Execução

**Pré-requisitos:**
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/)

**Passos:**

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/harpia.git
   cd harpia
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione as configurações necessárias, como a string de conexão do MongoDB, o segredo do JWT e as credenciais do Mercado Pago.
   ```env
   # Exemplo de .env
   MONGO_URI=mongodb://localhost:27017/harpia
   JWT_SECRET=seu_segredo_super_secreto
   MERCADOPAGO_ACCESS_TOKEN=seu_access_token
   NODEMAILER_USER=seu_email@example.com
   NODEMAILER_PASS=sua_senha
   ```

4. **Inicie a aplicação:**
   ```bash
   npm start
   ```

A aplicação estará disponível em `http://localhost:3000` (ou a porta que estiver configurada).

---

## Avaliação e Sugestões

Esta seção apresenta uma avaliação da arquitetura e código do projeto, com sugestões de melhorias.

### Backend

#### Pontos Positivos
- **Estrutura Modular:** A separação em `controllers`, `services`, `routes` e `middleware` é uma excelente prática, facilitando a manutenção e a escalabilidade.
- **Segurança Básica:** O uso de `bcrypt` para senhas e `jsonwebtoken`/`express-session` para gerenciamento de sessão são fundamentais e estão bem implementados.
- **Configuração Centralizada:** A pasta `config` e o uso de `.env` para variáveis de ambiente são ótimos para gerenciar diferentes ambientes (desenvolvimento, produção).

#### Problemas Potenciais e Melhorias
1.  **Interação com o Banco de Dados:** O projeto utiliza o driver nativo do MongoDB.
    - **Problema:** O uso direto do driver pode levar a código verboso, repetitivo e a uma maior dificuldade para garantir a consistência dos dados (schema).
    - **Sugestão:** Adotar um **ODM (Object-Document Mapper) como o Mongoose**. Ele simplifica as queries, introduz validação de schema a nível de aplicação, e facilita a criação de lógicas de negócio mais complexas nos models.

2.  **Testes Automatizados:** O `package.json` possui um script de teste, mas ele não utiliza um framework de testes.
    - **Problema:** A ausência de uma suíte de testes automatizados torna o projeto vulnerável a regressões (novos bugs surgindo em funcionalidades antigas) e dificulta refatorações seguras.
    - **Sugestão:** Implementar testes unitários e de integração com frameworks como **Jest** ou **Mocha/Chai**. Comece testando as funções críticas nos `services` e depois os `controllers`.

3.  **Validação de Dados:** Existe um serviço de validação, mas ele pode ser aprimorado.
    - **Problema:** Validações manuais podem ser propensas a erros e difíceis de manter.
    - **Sugestão:** Utilizar uma biblioteca de validação de schemas como **Zod** ou **Joi**. Elas permitem declarar as regras de validação de forma concisa e robusta, retornando erros claros que podem ser facilmente enviados ao frontend.

4.  **Segurança Adicional:**
    - **Problema:** Aplicações Express podem ser vulneráveis a ataques comuns da web se não forem protegidas adequadamente.
    - **Sugestão:** Adicionar o middleware **Helmet** (`app.use(helmet())`) para configurar headers HTTP de segurança e o **express-rate-limit** para proteger as rotas de autenticação contra ataques de força bruta.

### Frontend

#### Pontos Positivos
- **CSS Organizado:** A estrutura de pastas do CSS (`base`, `components`, `layout`, `pages`) é excelente. Ela promove a reutilização de estilos e facilita a manutenção, seguindo princípios de arquiteturas como BEM ou ITCSS.
- **Semântica:** A separação por componentes e páginas indica uma boa organização semântica.

#### Problemas Potenciais e Melhorias
1.  **Build e Otimização de Assets:** Os arquivos CSS e JavaScript são servidos diretamente da pasta `public`.
    - **Problema:** Em produção, servir múltiplos arquivos não minificados aumenta o número de requisições HTTP e o tempo de carregamento da página.
    - **Sugestão:** Introduzir um **build tool como o Vite ou Webpack**. Ele pode ser configurado para "observar" os arquivos em desenvolvimento e, para produção, gerar um único arquivo CSS e um único JS, ambos minificados e otimizados.

2.  **Otimização de Imagens:** As imagens são salvas diretamente na pasta `uploads` após o upload.
    - **Problema:** Imagens não otimizadas podem ser muito grandes, impactando drasticamente a performance de carregamento, especialmente em conexões lentas.
    - **Sugestão:** Integrar uma biblioteca como a **sharp** no backend. Após o `multer` salvar a imagem, use o `sharp` para redimensioná-la, comprimi-la e convertê-la para formatos modernos e eficientes como **WebP**.

3.  **Experiência do Usuário (UX):** A aplicação é totalmente renderizada no servidor.
    - **Problema:** Para interações mais dinâmicas (filtros de busca em tempo real, atualizações de carrinho sem recarregar a página), o modelo SSR pode parecer lento.
    - **Sugestão:** Não é preciso reescrever tudo. Considere usar JavaScript "sprinkles" com bibliotecas leves como **Alpine.js** ou **htmx** para adicionar interatividade a partes específicas da aplicação sem a complexidade de um framework SPA completo.

4.  **Acessibilidade (a11y):**
    - **Problema:** É comum que projetos foquem na funcionalidade e no visual, mas esqueçam da acessibilidade.
    - **Sugestão:** Realizar uma auditoria de acessibilidade. Verifique se o HTML é semântico (uso correto de `main`, `nav`, `button`), se todas as imagens têm texto alternativo (`alt`), se os formulários têm `label`s associadas e se a navegação por teclado é intuitiva.
