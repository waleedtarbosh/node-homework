const os = require('os');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log('Platform:', os.platform());
console.log('CPU:', os.cpus()[0].model);
console.log('Total Memory:', os.totalmem());

// Path module
const demoFilePath = path.join(sampleFilesDir, 'demo.txt');
console.log('Joined path:', demoFilePath);

// fs.promises API
async function runAllTasks() {
  try {
    // Write and read using fs.promises
    await fsPromises.writeFile(demoFilePath, 'Hello from fs.promises!');
    const demoData = await fsPromises.readFile(demoFilePath, 'utf8');
    console.log('fs.promises read:', demoData);

    // Streams for large files- log first 40 chars of each chunk
    const largeFilePath = path.join(sampleFilesDir, 'largefile.txt');
    
    // 1. Generate the large file programmatically
    let largeContent = '';
    for (let i = 0; i < 500; i++) {
      largeContent += `This is line number ${i} of our large file intended to test the streaming capabilities in Node.js.\n`;
    }
    await fsPromises.writeFile(largeFilePath, largeContent);
    // 2. Read using a stream with a specific highWaterMark
    const readStream = fs.createReadStream(largeFilePath, { 
      encoding: 'utf8', 
      highWaterMark: 1024 
    });

    readStream.on('data', (chunk) => {
      // Log exactly "Read chunk: " followed by the first 40 characters
      console.log(`Read chunk: ${chunk.substring(0, 40)}...`);
    });

    readStream.on('end', () => {
      // Log the exact completion message required by the assignment
      console.log('Finished reading large file with streams.');
    });

    readStream.on('error', (err) => {
      console.error('Stream error:', err.message);
    });

  } catch (err) {
    console.error('Error during operations:', err.message);
  }
}

// Execute the functions
runAllTasks();