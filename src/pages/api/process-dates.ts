import type { NextApiRequest, NextApiResponse } from 'next';
import { insertFromDateRange } from '../../utils/db-utils';
import { getConnection } from '../../utils/oracle-db';
import logger from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { startDate, endDate, batchSize, hostname, port, serviceName, username, password, location, dataType, testerType } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  let connection;

  try {
    connection = await getConnection({ hostname, port, serviceName, username, password });

    logger.info('Inserting data from date range...');
    await insertFromDateRange(connection, startDate, endDate, batchSize, dataType, testerType);
    logger.info('Data inserted successfully');

    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error: any) {
    logger.error(`Error processing date range: ${error.message}`);
    res.status(500).json({ message: 'Error processing date range', error: error.message });
  } finally {
    if (connection) {
      logger.info('Closing the Oracle database connection...');
      await connection.close();
      logger.info('Oracle database connection closed');
    }
  }
}