#!/usr/bin/env node

/**
 * This script extracts only the schemas from the generated OpenAPI types
 * and creates clean, simple type exports with "T" prefix.
 * String union types are converted to real TypeScript enums.
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../src/fromSchema/Schematypes.ts');
const outputFile = path.join(__dirname, '../src/fromSchema/Schematypes.ts');

// Read the generated file
const content = fs.readFileSync(inputFile, 'utf-8');

// Find the schemas section
const schemasMatch = content.match(/schemas:\s*\{([\s\S]*?)\};\s*responses:/);

if (!schemasMatch) {
  console.error('❌ Could not find schemas in the file');
  process.exit(1);
}

const schemasContent = schemasMatch[1];

// Parse types by tracking brace depth
function parseTypes(content) {
  const types = [];
  let i = 0;
  
  while (i < content.length) {
    // Skip whitespace and comments
    while (i < content.length && /\s/.test(content[i])) i++;
    
    // Skip JSDoc comments before type name
    if (content.slice(i, i + 3) === '/**') {
      const commentEnd = content.indexOf('*/', i);
      if (commentEnd !== -1) {
        i = commentEnd + 2;
        while (i < content.length && /\s/.test(content[i])) i++;
      }
    }
    
    if (i >= content.length) break;
    
    // Find type name (word followed by :)
    const nameMatch = content.slice(i).match(/^(\w+)\s*:\s*/);
    if (!nameMatch) {
      i++;
      continue;
    }
    
    const typeName = nameMatch[1];
    i += nameMatch[0].length;
    
    // Check if it starts with { (object) or something else (simple type/union)
    if (content[i] === '{') {
      // Object type - track braces
      let braceDepth = 1;
      i++; // skip opening brace
      let bodyStart = i;
      let inString = false;
      let stringChar = '';
      
      while (i < content.length && braceDepth > 0) {
        const char = content[i];
        
        // Handle strings
        if (!inString && (char === '"' || char === "'" || char === '`')) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && content[i - 1] !== '\\') {
          inString = false;
        }
        
        if (!inString) {
          if (char === '{') braceDepth++;
          if (char === '}') braceDepth--;
        }
        
        i++;
      }
      
      let body = content.slice(bodyStart, i - 1); // exclude closing brace
      body = cleanObjectBody(body);
      
      types.push({ name: typeName, body, isObject: true, isEnum: false });
    } else {
      // Simple type - find until semicolon (but handle nested stuff)
      let end = i;
      let depth = 0;
      let inStr = false;
      let strChar = '';
      
      while (end < content.length) {
        const c = content[end];
        
        if (!inStr && (c === '"' || c === "'")) {
          inStr = true;
          strChar = c;
        } else if (inStr && c === strChar && content[end - 1] !== '\\') {
          inStr = false;
        }
        
        if (!inStr) {
          if (c === '(' || c === '[' || c === '{') depth++;
          if (c === ')' || c === ']' || c === '}') depth--;
          if (c === ';' && depth === 0) break;
        }
        end++;
      }
      
      let body = content.slice(i, end).trim();
      body = cleanSimpleType(body);
      
      // Check if this is a string union type (enum candidate)
      const isStringUnion = isStringUnionType(body);
      
      types.push({ name: typeName, body, isObject: false, isEnum: isStringUnion });
      i = end + 1;
    }
    
    // Skip any trailing semicolons or whitespace
    while (i < content.length && /[;\s]/.test(content[i])) i++;
  }
  
  return types;
}

// Check if a type is a string union like "a" | "b" | "c"
function isStringUnionType(body) {
  // Match pattern: "value1" | "value2" | "value3"
  const stringUnionPattern = /^"[^"]*"(\s*\|\s*"[^"]*")+$/;
  return stringUnionPattern.test(body.trim());
}

// Convert string union to enum members
function convertToEnum(body) {
  // Extract all string values
  const matches = body.match(/"([^"]*)"/g);
  if (!matches) return null;
  
  const members = matches.map(m => {
    const value = m.slice(1, -1); // Remove quotes
    const key = value.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    return `  ${key} = "${value}"`;
  });
  
  return members.join(',\n');
}

function cleanObjectBody(body) {
  // Replace components["schemas"]["X"] with just X
  body = body.replace(/components\["schemas"\]\["(\w+)"\]/g, '$1');
  
  // Remove the discriminator property at the end
  body = body.replace(
    /\/\*\*\s*\n?\s*\*\s*@description discriminator enum property added by openapi-typescript\s*\n?\s*\*\s*@enum\s*\{string\}\s*\n?\s*\*\/\s*\n?\s*channel:\s*"[^"]+";?\s*$/,
    ''
  );
  
  // Also try a simpler pattern
  body = body.replace(
    /\/\*\*[\s\S]*?discriminator[\s\S]*?\*\/\s*channel:\s*"[^"]+";?\s*$/,
    ''
  );
  
  // Clean up trailing whitespace and empty lines at the end
  body = body.replace(/\s+$/, '');
  
  // Format: ensure consistent 2-space indentation
  const lines = body.split('\n');
  const cleanedLines = lines
    .map(line => {
      const trimmed = line.trimStart();
      if (trimmed.length === 0) return null;
      return '  ' + trimmed;
    })
    .filter(line => line !== null);
  
  return cleanedLines.join('\n');
}

function cleanSimpleType(body) {
  // Replace components["schemas"]["X"] with just X
  body = body.replace(/components\["schemas"\]\["(\w+)"\]/g, '$1');
  return body.trim();
}

// Add T prefix to type references in body
function addTPrefix(body, typeNames) {
  let result = body;
  for (const name of typeNames) {
    // Replace type references as standalone words (not inside strings)
    const regex = new RegExp(`(?<![a-zA-Z])${name}(?![a-zA-Z])`, 'g');
    result = result.replace(regex, `T${name}`);
  }
  return result;
}

// Parse all types
const types = parseTypes(schemasContent);

// Get all type names for reference replacement
const typeNames = types.map(t => t.name);

// Generate clean output
let output = `/**
 * Auto-generated types from OpenAPI schema
 * Do not edit manually - run: pnpm generate-types
 */

`;

// First, add all enums
const enums = types.filter(t => t.isEnum);
const nonEnums = types.filter(t => !t.isEnum);

for (const type of enums) {
  const enumBody = convertToEnum(type.body);
  output += `export enum T${type.name} {\n${enumBody}\n}\n\n`;
}

// Then add all other types
for (const type of nonEnums) {
  // Add T prefix to references inside the body
  const bodyWithPrefix = addTPrefix(type.body, typeNames);
  
  if (type.isObject) {
    output += `export type T${type.name} = {\n${bodyWithPrefix}\n};\n\n`;
  } else {
    output += `export type T${type.name} = ${bodyWithPrefix};\n\n`;
  }
}

// Write the clean file
fs.writeFileSync(outputFile, output);

console.log(`✅ Extracted ${types.length} types with T prefix:`);
console.log(`   📦 ${enums.length} enums:`);
enums.forEach(t => console.log(`      - T${t.name}`));
console.log(`   📄 ${nonEnums.length} types:`);
nonEnums.forEach(t => console.log(`      - T${t.name}`));

// Cleanup temp file if exists
const tempFile = path.join(__dirname, '../src/fromSchema/temp.ts');
if (fs.existsSync(tempFile)) {
  fs.unlinkSync(tempFile);
}
