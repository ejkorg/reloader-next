import type { NextApiRequest, NextApiResponse } from 'next';
import oracledb from 'oracledb';
import { insertFromDateRange } from '../../utils/db-utils';
import logger from '@/lib/logger';
import dotenv from 'dotenv';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';


// Load environment variables
dotenv.config();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      logger.error('Error parsing form data:', err);
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    const { startDate, endDate, batchSize, location, dataType, testerType } = fields;

    // Validate startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Parse dates to ensure they are in the correct format
    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    let connection;

    try {
      const config = await fetchConfig();
      const locationConfig = getLocationConfig(config, location as string);

      const { username, password } = getCredentials(locationConfig);

      logger.info('Attempting to connect to the Oracle database...');
      connection = await oracledb.getConnection({
        user: username,
        password: password,
        connectString: `${locationConfig.hostname}:${locationConfig.port}/${locationConfig.serviceName}`,
      });
      logger.info('Successfully connected to the Oracle database');

      logger.info('Inserting data from date range...');
      await insertFromDateRange(connection, parsedStartDate.toISOString(), parsedEndDate.toISOString(), batchSize as string, dataType as string, testerType as string);
      logger.info('Data inserted successfully');

      res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error: any) {
      logger.error(`Error processing date range: ${error.message}`);
      res.status(500).json({ message: 'Error processing date range', error: error.message });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          logger.error('Error closing connection:', error);
        }
      }
    }
  });
}

async function fetchConfig() {
  const configResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`);
  if (!configResponse.ok) {
    throw new Error('Failed to fetch configuration');
  }
  return configResponse.json();
}

// async function fetchConfig() {
//   const filePath = path.join(process.cwd(), 'src/config/dtp-info-config.yaml');
//   const fileContents = fs.readFileSync(filePath, 'utf8');
//   return yaml.load(fileContents);
// }

function getLocationConfig(config: any, location: string) {
  const locationConfig = config[location];
  if (!locationConfig) {
    throw new Error(`No configuration found for location: ${location}`);
  }
  return locationConfig;
}

function getCredentials(location: string) {
  const usernameEnvVar = `${location}_DB_USERNAME`;
  const passwordEnvVar = `${location}_DB_PASSWORD`;

  const username = process.env[usernameEnvVar] || '';
  const password = process.env[passwordEnvVar] || '';

  if (!username || !password) {
    throw new Error(`Database credentials not found for location: ${location} and username: ${username}`);
  }

  return { username, password };
}