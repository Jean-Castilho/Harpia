import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import { fileURLToPath } from 'url';

// Importa os middlewares
import { generateCsrfToken } from '#src/middleware/csrfMiddleware.js';
import handleErrors from '#src/middleware/errorHandler.js'

const app = express();
const port = process.env.PORT || 3080;

const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || `http://localhost:${port}`;
const isLocalhost = /localhost|127\.0\.0\.1/.test(clientUrl);
const cookieSecure = isProduction && !isLocalhost;
const cookieSameSite = cookieSecure ? 'none' : 'lax';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Em produção atrás de proxies como nginx/heroku;
app.set('trust proxy', 1);

// Configuração do mecanismo de visualização;
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'HX-Request'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração da sessão;
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    collectionName: 'sessions'
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: cookieSecure,
    httpOnly: true,
    sameSite: cookieSameSite,
    maxAge: 1000 * 60 * 60 * 24,
  }
}));

// Middleware para gerar e expor o token CSRF para os templates
app.use(generateCsrfToken);

// Middleware para expor dados globais aos templates
app.use((req, res, next) => {
  // Expõe a sessão e o usuário para todas as views
  res.locals.session = req.session;

  res.locals.user = req.session?.user || null;
  res.locals.isAuthenticated = !!req.session?.user?._id; // Define isAuthenticated como um booleano
  
  // Ajuda a identificar a rota ativa para a navegação
  res.locals.currentPath = req.path;
  res.locals.isActive = (pathPrefix) => req.path.startsWith(pathPrefix);

  // Garante que `products` seja sempre um array para evitar erros nos templates
  res.locals.products = res.locals.products || [];
  res.locals.allProducts = res.locals.allProducts || res.locals.products;

  next();
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        console.error("JSON inválido recebido:", err.message);
        return res
            .status(400)
            .json({ success: false, message: "JSON inválido na requisição" });
    }
    return next(err);
});

//sobrecarga de responsabilidade no index.js
import Server from "#src/server.js";
import { connectDataBase, closeDataBase } from '#src/config/db.js';

// Configuração das rotas da aplicação
Server(app);

// Função para iniciar o servidor de forma controlada
const start = async () => {
    try {
        // 1. Conecta ao banco de dados ANTES de iniciar o servidor
        await connectDataBase();

        // 2. Inicia o servidor Express para ouvir por requisições
        app.listen(port, () => {
            console.log(`Servidor rodando: http://localhost:${port}`);
        });
    } catch (error) {
        console.error(
            "Falha ao iniciar a aplicação. O servidor não será iniciado.",
            error,
        );
        process.exit(1);
    }
};

// Middleware de tratamento de erros (deve ser o último middleware a ser usado)
app.use(handleErrors)

process.on("SIGINT", async () => {
    console.log("Recebido sinal de encerramento. Fechando conexões...");
    await closeDataBase();
    process.exit(0);
});

// Inicia a aplicação
start();