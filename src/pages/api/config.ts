import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Config } from '../../types/config'; // Ensure this type includes necessary fields

let cachedConfig: Config | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!cachedConfig) {
    try {
      const filePath = path.join(process.cwd(), process.env.CONFIG_FILE_PATH || 'src/config/dtp-info-config.yaml');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      cachedConfig = yaml.load(fileContents) as Config;
    } catch (error: any) {
      console.error(`Error reading YAML file: ${error.message}`);
      return res.status(500).json({ error: 'Failed to read configuration file' });
    }
  }

  res.status(200).json(cachedConfig);
}