const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

const { userSchema } = require("../validation/userSchema");
const pool = require("../db/pg-pool");

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


    const hashedPassword = await hashPassword(value.password);

    const result = await pool.query(
      `INSERT INTO users (email, name, hashed_password) 
       VALUES ($1, $2, $3) RETURNING id, email, name`,
      [value.email, value.name, hashedPassword]
    );

    const newUser = result.rows[0];
    global.user_id = newUser.id;

    return res.status(201).json({ name: newUser.name, email: newUser.email });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({ message: "Email already registered" });
    }
    return next(e);
  }
};

const logon = async (req, res, next = () => {}) => {
  if (!req.body) req.body = {};
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const goodCredentials = await comparePassword(password, user.hashed_password);

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