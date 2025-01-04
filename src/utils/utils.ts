import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const readYamlFile = (filePath: string) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    console.error(`Error reading YAML file: ${error.message}`);
    throw new Error('Failed to read configuration file');
  }
};

