import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { processIdsInBatches } from '@/utils/db-utils';
import os from 'os';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import logger from '@/lib/logger';

// Load environment variables
dotenv.config();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(os.tmpdir(), 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(txt|csv)$/;
    const allowedMimeTypes = ['text/plain', 'text/csv'];
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    logger.info(`File upload attempt: originalname=${file.originalname}, extname=${path.extname(file.originalname).toLowerCase()}, mimetype=${file.mimetype}`);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      logger.error(`File type not allowed: originalname=${file.originalname}, extname=${path.extname(file.originalname).toLowerCase()}, mimetype=${file.mimetype}`);
      cb(new Error('Error: File type not allowed!'));
    }
  },
});

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        logger.error(`File upload error: ${err.message}`);
        return res.status(500).json({ message: 'File upload error', error: err.message });
      }

      const { batchSize, location, dataType, testerType } = req.body;
      const filePath = req.file.path;
      let connection;

      try {
        const configPath = path.join(process.cwd(), process.env.CONFIG_FILE_PATH || 'src/config/dtp-info-config.yaml');
        const configFile = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(configFile) as any;

        const locationConfig = config[location];
        if (!locationConfig) {
          throw new Error(`No configuration found for location: ${location}`);
        }

        // Retrieve actual credentials from environment variables
        const username = process.env[locationConfig.username] || '';
        const password = process.env[locationConfig.password] || '';

        // Log the credentials for debugging purposes
        console.log('DB Username:', username);
        console.log('DB Password:', password);

        logger.info('Attempting to connect to the Oracle database...');
        connection = await oracledb.getConnection({
          user: username,
          password: password,
          connectString: `${locationConfig.hostname}:${locationConfig.port}/${locationConfig.serviceName}`,
        });
        logger.info('Successfully connected to the Oracle database');

        const ids = await readIdsFromFile(filePath);
        logger.info('Processing IDs in batches...');
        await processIdsInBatches(connection, ids, parseInt(batchSize), location, dataType, testerType);
        logger.info('IDs processed successfully');
        res.status(200).json({ message: 'IDs processed successfully' });
      } catch (error) {
        logger.error(`Error processing IDs: ${error.message}`);
        res.status(500).json({ message: 'Error processing IDs', error: error.message });
      } finally {
        if (connection) {
          logger.info('Closing the Oracle database connection...');
          await connection.close();
          logger.info('Oracle database connection closed');
        }

        // Delete the temporary file
        fs.unlink(filePath, (err) => {
          if (err) logger.error(`Error deleting temporary file: ${err.message}`);
        });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Helper function to read IDs from the uploaded file
async function readIdsFromFile(filePath: string): Promise<string[]> {
  const data = await fs.promises.readFile(filePath, 'utf8');
  return data.split('\n').map(id => id.trim()).filter(id => id);
}

// import { NextApiRequest, NextApiResponse } from 'next';
// import multer from 'multer';
// import oracledb from 'oracledb';
// import dotenv from 'dotenv';
// import { processIdsInBatches } from '@/utils/db-utils';
// import os from 'os';
// import path from 'path';
// import fs from 'fs';
// import logger from '@/lib/logger';

// // Load environment variables
// dotenv.config();

// // Configure multer for file uploads
// const upload = multer({
//   dest: path.join(os.tmpdir(), 'uploads'),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedExtensions = /\.(txt|csv)$/;
//     const allowedMimeTypes = ['text/plain', 'text/csv'];
//     const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedMimeTypes.includes(file.mimetype);
//     logger.info(`File upload attempt: originalname=${file.originalname}, extname=${path.extname(file.originalname).toLowerCase()}, mimetype=${file.mimetype}`);
//     if (extname && mimetype) {
//       return cb(null, true);
//     } else {
//       logger.error(`File type not allowed: originalname=${file.originalname}, extname=${path.extname(file.originalname).toLowerCase()}, mimetype=${file.mimetype}`);
//       cb(new Error('Error: File type not allowed!'));
//     }
//   },
// });

// export const config = {
//   api: {
//     bodyParser: false, // Disable default body parser to handle file uploads
//   },
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     upload.single('file')(req, res, async (err) => {
//       if (err) {
//         logger.error(`File upload error: ${err.message}`);
//         return res.status(500).json({ message: 'File upload error', error: err.message });
//       }

//       const { batchSize, location, dataType, testerType } = req.body;
//       const filePath = req.file.path;
//       let connection;

//       try {
//         // Log the credentials for debugging purposes
//         console.log('DB Username:', process.env.DB_USERNAME);
//         console.log('DB Password:', process.env.DB_PASSWORD);

//         logger.info('Attempting to connect to the Oracle database...');
//         connection = await oracledb.getConnection({
//           user: process.env.DB_USERNAME,
//           password: process.env.DB_PASSWORD,
//           connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`,
//         });
//         logger.info('Successfully connected to the Oracle database');

//         const ids = await readIdsFromFile(filePath);
//         logger.info('Processing IDs in batches...');
//         await processIdsInBatches(connection, ids, parseInt(batchSize), location, dataType, testerType);
//         logger.info('IDs processed successfully');
//         res.status(200).json({ message: 'IDs processed successfully' });
//       } catch (error) {
//         logger.error(`Error processing IDs: ${error.message}`);
//         res.status(500).json({ message: 'Error processing IDs', error: error.message });
//       } finally {
//         if (connection) {
//           logger.info('Closing the Oracle database connection...');
//           await connection.close();
//           logger.info('Oracle database connection closed');
//         }

//         // Delete the temporary file
//         fs.unlink(filePath, (err) => {
//           if (err) logger.error(`Error deleting temporary file: ${err.message}`);
//         });
//       }
//     });
//   } else {
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// // Helper function to read IDs from the uploaded file
// async function readIdsFromFile(filePath: string): Promise<string[]> {
//   const data = await fs.promises.readFile(filePath, 'utf8');
//   return data.split('\n').map(id => id.trim()).filter(id => id);
// }