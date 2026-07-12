import express from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateCsrfToken, validateCsrfToken } from '../middleware/csrfMiddleware.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

import ProductControllers from "../controllers/productControllers.js";
import { getProductDetail, getProductsByIds } from "../controllers/pagesControllers.js"; // Importa getProductsByIds;
import { getGridFSBucket } from "../config/db.js";
import { handleResponse } from "../utils/handleResponse.js";

const productControllers = new ProductControllers();

const uploadDir = path.resolve(process.cwd(), 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/", async (req, res) => {
  handleResponse(res, productControllers.allProducts());
});

router.get("/:id", getProductDetail);

router.post("/batch", getProductsByIds); // Usa o manipulador de rota importado;

router.post("/", upload.array('imagens', 5), generateCsrfToken, async (req, res, next) => {
  try {
    handleResponse(res ,productControllers.uploadProductAndImage(req) ,201);
  } catch (error) {
    next(error);
  }
});

// Rota para servir imagens do GridFS;
router.get('/images/:filename', (req, res) => {
  const bucket = getGridFSBucket();
  const { filename } = req.params;

  const downloadStream = bucket.openDownloadStreamByName(filename);

  downloadStream.on('file', (file) => {
    // Define o cabeçalho de tipo de conteúdo para que o navegador saiba como renderizar o arquivo
    res.set('Content-Type', file.contentType);
  });

  downloadStream.on('error', (err) => {
    console.error(`Erro ao buscar o arquivo ${filename} do GridFS:`, err);
    return res.status(404).send('Imagem não encontrada.');
  });

  // 'pipe' envia o stream do arquivo diretamente para a resposta da requisição
  downloadStream.pipe(res);
});

// Rota para adicionar comentário a um produto
router.post('/:id/comment', ensureAuthenticated, validateCsrfToken, async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || String(text).trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Comentário vazio.' });
  }

  try {
    // Monta o objeto de comentário usando dados da sessão quando disponível
    const author = req.session?.user ? { _id: req.session.user._id, nome: req.session.user.nome } : undefined;
    const commentObj = author ? { texto: String(text).trim(), author } : { texto: String(text).trim(), nome: 'Usuário' };

    const added = await productControllers.addComment(id, commentObj);

    return res.json({ success: true, message: 'Comentário adicionado.', comment: added });
  } catch (err) {
    next(err);
  }
});

export default router;
