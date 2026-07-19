if (!global.users) global.users = [];
if (typeof global.user_id === "undefined") global.user_id = null;

const register = (req, res) => {
  const { username, password } = req.body;
  
  const newUser = { id: Date.now().toString(), username, password };
  global.users.push(newUser);
  
  global.user_id = newUser.id;
  
  res.status(201).json({ message: "User registered successfully", user: newUser });
};

const logon = (req, res) => {
  const { username, password } = req.body;
  
  const user = global.users.find(u => u.username === username && u.password === password);
  
  if (user) {
    global.user_id = user.id;
    res.status(200).json({ message: "Logon successful" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
};

const logoff = (req, res) => {
  global.user_id = null;
  res.status(200).json({ message: "Logoff successful" });
};

module.exports = {
  register,
  logon,
  logoff
};