import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

// Notes:
// 1. Parse file by file (by directory) rather than loading all into memory. (Thousands of files)


// Function to parse XML file and print as JS object
function parseXMLFile(filePath: string): void {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }

    // Read the XML file
    const xmlData = fs.readFileSync(filePath, 'utf8');
    
    // Parse the XML data
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    
    const parsedData = parser.parse(xmlData);
    
    // Print the parsed data as formatted JSON
    console.log(JSON.stringify(parsedData, null, 2));
    
    console.log('XML file successfully parsed and printed as JS object.');
  } catch (error) {
    console.error('Error parsing XML file:', error);
    process.exit(1);
  }
}

// Get file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide the path to an XML file.');
  console.log('Usage: npm run parse-xml <path-to-xml-file>');
  process.exit(1);
}

const filePath = path.resolve(args[0]);
parseXMLFile(filePath); 
