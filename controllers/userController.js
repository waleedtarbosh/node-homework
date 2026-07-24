if (!global.users) global.users = [];
if (typeof global.user_id === "undefined") global.user_id = null;

const register = (req, res) => {
  const { name, email, password } = req.body;
  
  const newUser = { id: Date.now().toString(), name, email, password };
  global.users.push(newUser);
  
  global.user_id = newUser; 
  
  res.status(201).json({ name: newUser.name, email: newUser.email });
};

const logon = (req, res) => {
  const { email, password } = req.body;
  
  const user = global.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    global.user_id = user;
    res.status(200).json({ name: user.name, email: user.email });
  } else {
    res.status(401).send();
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