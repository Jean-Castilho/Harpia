# Harpia - E-commerce de Móveis e Decorações

Harpia é uma aplicação web de e-commerce completa, focada na venda de móveis e decorações com um estilo rústico. O projeto foi construído com Node.js e Express no backend, utilizando MongoDB como banco de dados e EJS para a renderização de views no servidor.

## Contexto para IA

Este é um projeto de e-commerce MVC (Model-View-Controller) que utiliza sessões para autenticação de usuários e gerenciamento de carrinho de compras. O backend é responsável por servir páginas HTML renderizadas (Server-Side Rendering com EJS), além de fornecer uma API para operações assíncronas no cliente (como atualização do carrinho). A segurança é reforçada com tokens CSRF para proteção contra ataques de falsificação de solicitação entre sites.

## Tecnologias Utilizadas

### Backend
- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework para construção de aplicações web e APIs.
- **MongoDB**: Banco de dados NoSQL para armazenar dados de produtos, usuários, etc.
- **EJS (Embedded JavaScript)**: Template engine para renderizar páginas dinâmicas no servidor.
- **bcrypt.js**: Biblioteca para hashing de senhas.
- **jsonwebtoken (JWT)**: Para criação de tokens de autenticação.
- **express-session**: Middleware para gerenciamento de sessões.

### Frontend
- **HTML5 / CSS3**: Estrutura e estilização das páginas.
- **JavaScript (Vanilla)**: Para interatividade no cliente e chamadas AJAX.

## Funcionalidades Principais

- **Autenticação de Usuário**: Registro, login e gerenciamento de perfil.
- **Catálogo de Produtos**: Visualização de produtos em listagem e página de detalhes.
- **Carrinho de Compras**: Adicionar, remover e visualizar produtos no carrinho.
- **Lista de Favoritos**: Usuários podem salvar produtos que lhes interessam.
- **Fluxo de Pagamento**: Páginas para checkout e confirmação de pagamento.
- **Segurança**: Proteção contra CSRF em formulários e ações sensíveis.
- **Validação de Dados**: Validação no backend para dados de entrada do usuário (nomes, e-mails, senhas).

## Estrutura do Projeto (Visão Geral)

```
src/
├── controllers/      # Lógica de controle para requisições (renderização de páginas, API).
│   ├── pagesControllers.js # Controladores para renderizar as diferentes páginas da aplicação.
│   └── userControllers.js  # Controladores para lógica de usuário (auth, profile).
├── middleware/       # Middlewares para Express (ex: autenticação, CSRF).
│   └── csrfMiddleware.js   # Geração e validação de tokens CSRF.
├── services/         # Lógica de negócio e serviços auxiliares.
│   └── validationData.js # Funções para validação de dados, hashing e criação de tokens.
public/
├── css/              # Arquivos de estilo (CSS).
└── js/               # Scripts do lado do cliente.
```
