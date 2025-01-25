import oracledb from 'oracledb';
import fs from 'fs';
import { promisify } from 'util';
import yaml from 'js-yaml';

const readFileAsync = promisify(fs.readFile);

// Load and parse the YAML configuration
const config = yaml.load(fs.readFileSync('src/config/dtp-info-config.yaml', 'utf8')) as any;

export const readIdsFromFile = async (filePath: string): Promise<string[]> => {
  const data = await readFileAsync(filePath, 'utf8');
  return data.split('\n').map(id => id.trim()).filter(id => id);
};

export const insertIntoDatabase = async (
  connection: oracledb.Connection,
  batch: string[],
  location: string,
  dataType: string,
  testerType: string
) => {
  const placeholders = batch.map((_, i) => `:id_data${i}`).join(', ');

  // Retrieve senderId from the configuration
  const senderId = config[location]?.dataType?.find((dt: any) => dt[dataType])?.[dataType]?.testerType?.find((tt: any) => tt[testerType])?.[testerType]?.senderId;

  if (!senderId) {
    throw new Error(`Sender ID not found for location: ${location}, dataType: ${dataType}, testerType: ${testerType}`);
  }

  const sql = `
    INSERT INTO DTP_SENDER_QUEUE_ITEM (id, id_metadata, id_data, id_sender, record_created)
    SELECT 
      DTP_SENDER_QUEUE_ITEM_SEQ.NEXTVAL,
      m.id,
      m.id_data,
      :senderId,
      SYSDATE
    FROM 
      all_metadata_view m
    WHERE  
      m.location = :location AND
      m.data_type = :dataType AND
      m.tester_type = :testerType AND
      m.id_data IN (${placeholders})
  `;

  const data = batch.reduce((acc, id, i) => {
    acc[`id_data${i}`] = id;
    return acc;
  }, { location, dataType, testerType, senderId } as { [key: string]: string });

  try {
    await connection.execute(sql, data);
    await connection.commit();
    console.log(`Inserted batch of IDs: ${batch}`);
  } catch (error) {
    console.error('Error inserting batch:', error);
    throw error;
  }
};

export const processIdsInBatches = async (
  connection: oracledb.Connection,
  ids: string[],
  batchSize: number,
  location: string,
  dataType: string,
  testerType: string
) => {
  const totalIds = ids.length;
  for (let startIndex = 0; startIndex < totalIds; startIndex += batchSize) {
    const endIndex = Math.min(startIndex + batchSize, totalIds);
    const batch = ids.slice(startIndex, endIndex);
    await insertIntoDatabase(connection, batch, location, dataType, testerType);
  }
};

// New function to insert data based on a datetime range

export const insertFromDateRange = async (

  connection: oracledb.Connection,

  startDate: string,

  endDate: string,

  location: string,

  dataType: string,

  testerType: string

) => {

  // Retrieve senderId from the configuration

  const senderId = config[location]?.dataType?.find((dt: any) => dt[dataType])?.[dataType]?.testerType?.find((tt: any) => tt[testerType])?.[testerType]?.senderId;

  if (!senderId) {

    throw new Error(`Sender ID not found for location: ${location}, dataType: ${dataType}, testerType: ${testerType}`);

  }

  const sql = `

    INSERT INTO DTP_SENDER_QUEUE_ITEM (id, id_metadata, id_data, id_sender, record_created)

    SELECT 

      DTP_SENDER_QUEUE_ITEM_SEQ.NEXTVAL,

      m.id,

      m.id_data,

      :senderId,

      SYSDATE

    FROM 

      all_metadata_view m

    WHERE  

      m.location = :location AND

      m.data_type = :dataType AND

      m.tester_type = :testerType AND

      m.record_datetime BETWEEN TO_DATE(:startDate, 'YYYY-MM-DD HH24:MI:SS') 

                             AND TO_DATE(:endDate, 'YYYY-MM-DD HH24:MI:SS')

  `;

  const binds = {

    location,

    dataType,

    testerType,

    senderId,

    startDate,

    endDate,

  };

  try {

    const result = await connection.execute(sql, binds);

    await connection.commit();

    console.log(`Inserted data from date range: ${startDate} to ${endDate}`);

    return result;

  } catch (error) {

    console.error('Error inserting data from date range:', error);

    throw error;

  }

};

// import oracledb from 'oracledb';
// import fs from 'fs';
// import { promisify } from 'util';
// import yaml from 'js-yaml';

// const readFileAsync = promisify(fs.readFile);

// // Load and parse the YAML configuration
// const config = yaml.load(fs.readFileSync('src/config/dtp-info-config.yaml', 'utf8')) as any;

// export const readIdsFromFile = async (filePath: string): Promise<string[]> => {
//   const data = await readFileAsync(filePath, 'utf8');
//   return data.split('\n').map(id => id.trim()).filter(id => id);
// };

// export const insertIntoDatabase = async (
//   connection: oracledb.Connection,
//   batch: string[],
//   location: string,
//   dataType: string,
//   testerType: string
// ) => {
//   const placeholders = batch.map((_, i) => `:id_data${i}`).join(', ');

//   // Retrieve senderId from the configuration
//   const senderId = config[location]?.dataType?.find((dt: any) => dt[dataType])?.[dataType]?.testerType?.find((tt: any) => tt[testerType])?.[testerType]?.senderId;

//   if (!senderId) {
//     throw new Error(`Sender ID not found for location: ${location}, dataType: ${dataType}, testerType: ${testerType}`);
//   }

//   const sql = `
//     INSERT INTO DTP_SENDER_QUEUE_ITEM (id, id_metadata, id_data, id_sender, record_created)
//     SELECT 
//       DTP_SENDER_QUEUE_ITEM_SEQ.NEXTVAL,
//       m.id,
//       m.id_data,
//       :senderId,
//       SYSDATE
//     FROM 
//       all_metadata_view m
//     WHERE  
//       m.location = :location AND
//       m.data_type = :dataType AND
//       m.tester_type = :testerType AND
//       m.id_data IN (${placeholders})
//   `;

//   const data = batch.reduce((acc, id, i) => {
//     acc[`id_data${i}`] = id;
//     return acc;
//   }, { location, dataType, testerType, senderId } as { [key: string]: string });

//   try {
//     await connection.execute(sql, data);
//     await connection.commit();
//     console.log(`Inserted batch of IDs: ${batch}`);
//   } catch (error) {
//     console.error('Error inserting batch:', error);
//     throw error;
//   }
// };

// export const processIdsInBatches = async (
//   connection: oracledb.Connection,
//   ids: string[],
//   batchSize: number,
//   location: string,
//   dataType: string,
//   testerType: string
// ) => {
//   const totalIds = ids.length;
//   for (let startIndex = 0; startIndex < totalIds; startIndex += batchSize) {
//     const endIndex = Math.min(startIndex + batchSize, totalIds);
//     const batch = ids.slice(startIndex, endIndex);
//     await insertIntoDatabase(connection, batch, location, dataType, testerType);
//   }
// };