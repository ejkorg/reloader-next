import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Reads a YAML file and returns its contents as a JavaScript object.
 * @param filePath - The relative path to the YAML file.
 * @returns The parsed YAML content.
 */
export const readYamlFile = (filePath: string): any => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    console.error(`Error reading YAML file: ${error.message}`);
    throw new Error('Failed to read configuration file');
  }
};

/**
 * Reads a file and returns an array of trimmed, non-empty lines.
 * @param filePath - The path to the file.
 * @returns An array of strings representing the file's lines.
 */
export const readIdsFromFile = async (filePath: string): Promise<string[]> => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data.split('\n').map(id => id.trim()).filter(id => id);
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    throw new Error('Failed to read IDs from file');
  }
};