import { getDataBase } from "../config/db.js";
import { getGridFSBucket } from "../config/db.js";
import { Readable } from "stream";

export default class ProductController {
  getCollection() {
    const db = getDataBase();
    return db.collection("products");
  }

  async allProducts() {
    return this.getCollection().find({}).toArray();
  }

  
  // Versão simplificada: não usa endereço, só campos essenciais + imagens
  async uploadProductAndImage(req) {
    const files =
      req.body.files && req.body.files.length
        ? req.body.files
        : req.body.file
          ? [req.body.file]
          : [];

    if (!files || files.length === 0) {
      throw new Error("Nenhum arquivo foi enviado");
    }

    console.log(files);

    const bucket = getGridFSBucket();

    // Faz upload de todos os arquivos e obtém os nomes usados no GridFS
    const uploadPromises = files.map((file) => {
      return new Promise((res, rej) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`;
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        const uploadStream = bucket.openUploadStream(uniqueName, {
          contentType: file.mimetype,
          metadata: { originalname: file.originalname },
        });
        readableStream.pipe(uploadStream);

        uploadStream.on("finish", () => res(uniqueName));
        uploadStream.on("error", (err) => rej(err));
      });
    });

    const filesName = await Promise.all(uploadPromises);

    const productData = {
      // --- Informações Principais ---
      nome: req.body.nome, // Ex: "Poltrona Costela com Puff".
      slug: req.body.slug, // Ex: "poltrona-costela-com-puff-couro-preto".
      preco: parseFloat(req.body.preco), // Ex: 1890.00
      imagens: filesName,
      // --- Organização e Estilo ---
      estilo: req.body.estilo, // Ex: "Moderno", "Industrial", "Clássico".
      colecao: req.body.colecao, // Ex: "Coleção Viena 2024".
      // --- Variações de Produto ---
      // Cada objeto aqui é uma versão do produto que o cliente pode comprar.
      //ambientes: req.body.ambientes, // Array. Ex: ["Sala de Estar", "Quarto", "Escritório"].
      /*variacoes: [
       Exemplo de um array que viria do req.body.variacoes.
      {
        sku: "POL-COS-01-PRE",
        cor: "Preto",
        acabamento: "Couro Ecológico",
        preco: 1890.00,
        precoPromocional: 1699.00,
        estoque: 15,
        imagens: ["url_imagem_preta_1.jpg", "url_imagem_preta_2.jpg"] // Imagens específicas da variação
      },
      {
        sku: "POL-COS-01-MAR",
        cor: "Marrom",
        acabamento: "Linho",
        preco: 1950.00,
        estoque: 8,
        imagens: ["url_imagem_marrom_1.jpg"]
      }]
      // boolean: true ou false requerMontagem: req.body.requerMontagem, 
      */

      // --- Logística e Garantia ---
      estoque: req.body.estoque, // Ex: 15 (número inteiro).
      garantia: req.body.garantia, // Ex: "12 meses"
      ativo: req.body.ativo, // Ex: "disponivel na loja"

      categoria: req.body.categoria,
      descricao: req.body.descricao,
      dimensoes: {
        altura: req.body.altura,
        largura: req.body.largura,
        profundidade: req.body.profundidade,
      },
      peso: req.body.peso,
    };

    const result = await this.createProduct(productData);

    // retorna o documento criado já com imagens convertidas (via getProductById)
    const created = await this.getProductById(result.insertedId.toString());
    return created;
  }


}
