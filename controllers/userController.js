const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

const { userSchema } = require("../validation/userSchema");
const prisma = require("../db/prisma");

if (typeof global.user_id === "undefined") global.user_id = null;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

const register = async (req, res, next = () => {}) => {
  if (!req.body) req.body = {};

  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }

  try {
    const normalizedEmail = value.email ? value.email.toLowerCase() : value.email;
    const hashedPassword = await hashPassword(value.password);

    const newUser = await prisma.user.create({
      data: { 
        email: normalizedEmail, 
        name: value.name, 
        hashedPassword: hashedPassword 
      },
      select: { id: true, name: true, email: true }
    });

    global.user_id = newUser.id;

    return res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(400).json({ message: "Email already registered" });
    }
    return next(e);
  }
};

const logon = async (req, res, next = () => {}) => {
  if (!req.body) req.body = {};
  let { email, password } = req.body;

  try {
    const normalizedEmail = email ? email.toLowerCase() : email;

    const user = await prisma.user.findUnique({ 
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const goodCredentials = await comparePassword(password, user.hashedPassword);

    if (goodCredentials) {
      global.user_id = user.id;
      return res.status(200).json({ name: user.name, email: user.email });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    return next(err);
  }
};

const logoff = (req, res) => {
  global.user_id = null;
  return res.status(200).send();
};

module.exports = {
  register,
  logon,
  logoff,
};