# Node.js Fundamentals

## What is Node.js?
JavaScript used to run only inside web browsers. Node.js lets JavaScript run outside the browser, allowing it to work with files, build servers, create APIs, and run command-line tools.
Browser JavaScript → works with web pages, the DOM, and browser APIs.
Node.js JavaScript → works with the file system, processes, servers, and Node.js APIs.

## How does Node.js differ from running JavaScript in the browser?
-Browser: can interact with web pages (DOM), but has very limited access to your local files for security reasons.
-Node.js: can't touch web pages, but can read/write files and doesn't need a browser at all.

## What is the V8 engine, and how does Node use it?
V8 is the "brain" that understands JavaScript and makes it run fast. Google made it for Chrome. Node.js took that same brain and let it work alone, without needing a browser.
V8 compiles JavaScript into machine code, making it run very fast.

## What are some key use cases for Node.js?
-Building servers
-Building APIs (so apps can talk to each other)
-Command-line tools
-Chat apps and live notifications
-Tools that prepare code for the browser
Node.js provides built-in APIs (like the fs module for files and the http module for servers) that browsers don't have.

## Explain the difference between CommonJS and ES Modules. Give a code example of each.
Think of it like two ways to share functions between files.
**CommonJS (default in Node.js):**
example :
// math.js
function add(x, y) { return x + y; }
module.exports = add; //module.exports to export

// app.js
const add = require('./math.js'); //require() to import
console.log(add(2, 3)); // 5

**ES Modules (supported in modern Node.js):**
Note: In Node.js, ES Modules require "type": "module" in package.json, or using the .mjs file extension.

example :
// math.js
export function add(x, y) { return x + y; } //to export

// app.js
import { add } from './math.js'; //to import
console.log(add(2, 3)); // 5