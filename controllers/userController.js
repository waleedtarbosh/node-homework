const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

const { userSchema } = require("../validation/userSchema");

if (!global.users) global.users = [];
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


const register = async (req, res) => {
  if (!req.body) req.body = {};

  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const hashedPassword = await hashPassword(value.password);

  const newUser = { 
    id: Date.now().toString(), 
    name: value.name, 
    email: value.email, 
    hashedPassword: hashedPassword
  };
  
  global.users.push(newUser);
  global.user_id = newUser; 
  
  res.status(201).json({ name: newUser.name, email: newUser.email });
};

const logon = async (req, res) => {
  if (!req.body) req.body = {};
  const { email, password } = req.body;
  
  const user = global.users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const goodCredentials = await comparePassword(password, user.hashedPassword);
  
  if (goodCredentials) {
    global.user_id = user;
    res.status(200).json({ name: user.name, email: user.email });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

const logoff = (req, res) => {
  global.user_id = null;
  res.status(200).send();
};

module.exports = {
  register,
  logon,
  logoff
};