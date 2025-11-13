import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Regex aprimorada para nomes, aceitando acentos, apóstrofos e hífens (suporte Unicode)
const nameRegex = /^[\p{L}\p{M}'\s-]+$/u;
// Regex padrão para e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex flexível para números de telefone: aceita +, espaços, parênteses e hífens
const numberRegex = /^\+?[\d\s()-]+$/;
// Regex para senhas (mantida como no original para robustez)// Exige minúscula, maiúscula E número, mas sem símbolos.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


dotenv.config();

export function validationUser(dataUser) {

    let { name, email, phone, password } = dataUser;

    if (!nameRegex.test(name)) {
        return {
            valid: false,
            mensagem: "Nome inválido. Apenas letras, espaços, hífens e apóstrofos são permitidos.",
        };
    }

    if (!emailRegex.test(email)) {
        return { valid: false, mensagem: "Formato de e-mail inválido." };
    }

    if (!numberRegex.test(phone)) {
        return { valid: false, mensagem: "Formato de número de telefone inválido." };
    }

    if (!passwordRegex.test(password)) {
        return {
            valid: false,
            mensagem: "A senha deve ter no mínimo 8 caracteres, com uma letra maiúscula, uma minúscula e um número.",
        };
    }

    return { valid: true, mensagem: "Todos os dados são válidos." };
}

export async function criarHashPass(password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS || "12", 10);
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export function criarToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não está definido no arquivo .env.");
  }

  const expiresIn = process.env.JWT_EXPIRATION || "1h";

  return jwt.sign(payload, secret, { expiresIn });
}


export async function compararSenha(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}
