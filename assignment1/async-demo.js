const fs = require("fs");
const path = require("path");
const fsPromises = require("fs/promises");

// Set up the exact paths required
const folderPath = path.join(__dirname, "sample-files");
const filePath = path.join(folderPath, "sample.txt");
const fileContent = "Hello, async world!";

// Write a sample file for demonstration
fs.writeFileSync(filePath, fileContent);
// 1. Callback style
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Callback error:", err.message);
    return;
  }
  console.log("Callback read:", data);

  // Callback hell example (test and leave it in comments):
  /*
    Callback Hell:
    This occurs when multiple asynchronous operations depend on one another. 
    You end up nesting callback functions inside other callback functions. 
    This creates a deeply indented pyramid shape in the code, making it 
    very difficult to read, debug, and maintain.
    
    Example:
    fs.readFile('file1.txt', 'utf8', (err1, data1) => {
      fs.readFile('file2.txt', 'utf8', (err2, data2) => {
        fs.readFile('file3.txt', 'utf8', (err3, data3) => {
          console.log("All files read:", data1, data2, data3);
        });
      });
    });
  */
});

// 2. Promise style
fsPromises
  .readFile(filePath, "utf8")
  .then((data) => {
    console.log("Promise read:", data);
  })
  .catch((err) => {
    console.error("Promise error:", err.message);
  });

// 3. Async/Await style
async function readWithAsyncAwait() {
  try {
    const data = await fsPromises.readFile(filePath, "utf8");
    console.log("Async/Await read:", data);
  } catch (err) {
    console.error("Async/Await error:", err.message);
  }
}

// Call the function to execute it
readWithAsyncAwait();
