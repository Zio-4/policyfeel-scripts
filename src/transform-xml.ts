import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

// Function to convert kebab-case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Transform key names from kebab-case to camelCase and remove @ prefixes
function transformKeys(obj: any, parentKey: string = ''): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, parentKey));
  }

  const result: any = {};
  
  // First pass: handle text content and basic properties
  for (const key in obj) {
    // Skip XML processing instructions or unnecessary namespaces
    if (key.startsWith('?') || key === '@_xmlns:dc') {
      continue;
    }
    
    let newKey = key;
    
    // Remove attribute prefix
    if (newKey.startsWith('@_')) {
      newKey = newKey.substring(2);
    }
    
    // Convert to camelCase
    newKey = toCamelCase(newKey);
    
    // Skip pagebreak
    if (newKey === 'pagebreak') {
      continue;
    }

    const value = obj[key];

    // Handle text content with attributes
    if (key === '#text') {
      // For text content, set it directly in the parent object, will be handled by caller
      continue;
    } 
    // Process nested objects
    else if (typeof value === 'object' && value !== null) {
      // Check if this object has text content
      if (value['#text']) {
        // Set the main text value
        result[newKey] = value['#text'];
        
        // Process attributes and other properties, but not text content
        for (const subKey in value) {
          if (subKey !== '#text' && subKey !== 'pagebreak') {
            let processedKey = subKey;
            
            // Remove attribute prefix
            if (processedKey.startsWith('@_')) {
              processedKey = processedKey.substring(2);
            }
            
            // Convert to camelCase
            processedKey = toCamelCase(processedKey);
            
            // Don't add display attributes at the same level
            if (processedKey === 'display') {
              // Skip display properties as they're not informative
              continue;
            }
            
            // Add the attribute to the result
            result[processedKey] = value[subKey];
          }
        }
      } else {
        // Regular nested object
        result[newKey] = transformKeys(value, newKey);
      }
    }
    // Regular non-object properties
    else if (key !== 'pagebreak') {
      result[newKey] = value;
    }
  }
  
  // Handle the special case of "display" attributes - we don't want them at the parent level
  if (obj['@_display'] && parentKey) {
    // Skip display attributes as they're not informative
  }
  
  return result;
}

// Main cleanup function to further improve the structure
function cleanupStructure(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanupStructure);
  }
  
  const result: any = {};
  
  for (const key in obj) {
    const value = obj[key];
    
    // Skip empty objects
    if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
      continue;
    }
    
    // Skip display attributes at the top level
    if (key === 'display') {
      continue;
    }
    
    if (typeof value === 'object' && value !== null) {
      result[key] = cleanupStructure(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// Function to parse XML file and print as a clean JS object
function transformXMLFile(filePath: string, outputFilePath?: string): void {
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
    
    // Transform the parsed data
    const transformedData = transformKeys(parsedData);
    
    // Further cleanup the structure
    const cleanedData = cleanupStructure(transformedData);
    
    // Format the JSON with proper indentation
    const formattedJson = JSON.stringify(cleanedData, null, 2);

    // If an output file path is provided, save to file
    if (outputFilePath) {
      fs.writeFileSync(outputFilePath, formattedJson, 'utf8');
      console.log(`Transformed XML saved to ${outputFilePath}`);
    } else {
      // Print to console if no output file is specified
      console.log(formattedJson);
      console.log('XML file successfully transformed and printed as clean JS object.');
    }
  } catch (error) {
    console.error('Error transforming XML file:', error);
    process.exit(1);
  }
}

// Get file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide the path to an XML file.');
  console.log('Usage: npm run transform-xml <path-to-xml-file> [output-json-path]');
  process.exit(1);
}

const filePath = path.resolve(args[0]);
const outputFilePath = args[1] ? path.resolve(args[1]) : undefined;
transformXMLFile(filePath, outputFilePath); 
