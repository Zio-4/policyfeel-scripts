# PolicyFeel Scripts

This repository contains utility scripts for processing policy and legislation data.

## XML Transformation Script

The `transform-xml` script converts legislation XML files into a cleaner, more user-friendly JSON format by:

1. Converting kebab-case keys to camelCase
2. Removing unnecessary XML-specific attributes and prefixes
3. Extracting text content and setting them as values
4. Maintaining the essential structure while cleaning up the output

### Usage

```bash
# Output to console
npm run transform-xml <path-to-xml-file>

# Save to a JSON file
npm run transform-xml <path-to-xml-file> <output-json-path>
```

### Example

```bash
# Transform and print to console
npm run transform-xml ./test-bill-hconres.xml

# Transform and save to file
npm run transform-xml ./test-bill-hconres.xml ./output.json
```

## Other Scripts

- `parse-xml`: Parse bills from bulk data
