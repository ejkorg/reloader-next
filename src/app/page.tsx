"use client";
import { useState, useEffect } from 'react';
import { Container, TextField, Box, Select, MenuItem, FormControl, InputLabel, Button, Typography, Modal } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Define types directly in this file
interface TesterType {
  [key: string]: { senderId: number };
}

interface DataType {
  [key: string]: { testerType: TesterType[] };
}

interface Config {
  hostname: string;
  port: number;
  serviceName: string;
  username: string;
  password: string;
  dataType: DataType[];
}

const Home = () => {
  const [config, setConfig] = useState<Record<string, Config> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [batchSize, setBatchSize] = useState<number | string>('');
  const [hostname, setHostname] = useState<string>('');
  const [port, setPort] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [dataType, setDataType] = useState<string>('');
  const [testerType, setTesterType] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (!res.ok) {
          throw new Error('Failed to load configuration.');
        }
        const data = await res.json();
        setConfig(data);
      } catch (error: any) {
        setMessage(error.message || 'An error occurred while fetching the configuration.');
      }
    };

    fetchConfig();
  }, []);

  const handleCloseErrorModal = () => setOpenErrorModal(false);

  const handleLocationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedLocation = event.target.value as string;
    setLocation(selectedLocation);
    if (config && config[selectedLocation]) {
      const locationConfig = config[selectedLocation];
      setHostname(locationConfig.hostname);
      setPort(locationConfig.port.toString());
      setServiceName(locationConfig.serviceName);
      setDataType('');
      setTesterType('');
    }
  };

  const handleDataTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedDataType = event.target.value as string;
    setDataType(selectedDataType);
    setTesterType('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (startDate && endDate) {
        formData.append('startDate', startDate.toISOString());
        formData.append('endDate', endDate.toISOString());
      } else {
        throw new Error('Please provide either a file or a date range.');
      }

      formData.append('batchSize', batchSize.toString());
      formData.append('hostname', hostname);
      formData.append('port', port);
      formData.append('serviceName', serviceName);
      formData.append('location', location);
      formData.append('dataType', dataType);
      formData.append('testerType', testerType);

      if (config && location) {
        const locationConfig = config[location];
        formData.append('username', process.env[locationConfig.username] || '');
        formData.append('password', process.env[locationConfig.password] || '');
      }

      const apiEndpoint = file ? '/api/process-ids' : '/api/process-dates';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process request');
      }

      const result = await response.json();
      setMessage(result.message);
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred');
      setOpenErrorModal(true);
    }
  };

  return (
    <Container>
      <Box component="form" onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="location-label">Location</InputLabel>
          <Select
            labelId="location-label"
            value={location}
            onChange={handleLocationChange}
            displayEmpty
            label="Location"
          >
            <MenuItem value="" disabled>
              <em>Select a Location</em>
            </MenuItem>
            {config && Object.keys(config).map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="data-type-label">Data Type</InputLabel>
          <Select
            labelId="data-type-label"
            value={dataType}
            onChange={handleDataTypeChange}
            displayEmpty
            label="Data Type"
            disabled={!location}
          >
            <MenuItem value="" disabled>
              <em>Select a Data Type</em>
            </MenuItem>
            {location && config[location]?.dataType?.map((dt) => {
              const dataTypeKey = Object.keys(dt)[0];
              return (
                <MenuItem key={dataTypeKey} value={dataTypeKey}>
                  {dataTypeKey}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="tester-type-label">Tester Type</InputLabel>
          <Select
            labelId="tester-type-label"
            value={testerType}
            onChange={(e) => setTesterType(e.target.value as string)}
            displayEmpty
            label="Tester Type"
            disabled={!dataType || !location}
          >
            <MenuItem value="" disabled>
              <em>Select a Tester Type</em>
            </MenuItem>
            {location && dataType && config[location]?.dataType?.find((dt) => Object.keys(dt)[0] === dataType)?.[dataType]?.testerType?.map((testerTypeObj) => {
              const testerTypeKey = Object.keys(testerTypeObj)[0];
              return (
                <MenuItem key={testerTypeKey} value={testerTypeKey}>
                  {testerTypeKey}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => {
              setStartDate(newValue);
              if (newValue) setFile(null);
            }}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            disabled={!!file}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => {
              setEndDate(newValue);
              if (newValue) setFile(null);
            }}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            disabled={!!file}
          />
        </LocalizationProvider>
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginBottom: '16px' }}
          disabled={!!startDate || !!endDate}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
          disabled={!config} // Disable until config is loaded
        >
          Submit
        </Button>
        {message && (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
      <Modal
        open={openErrorModal}
        onClose={handleCloseErrorModal}
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography id="error-modal-title" variant="h6" component="h2">
            Error
          </Typography>
          <Typography id="error-modal-description" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
          <Button onClick={handleCloseErrorModal} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default Home;


// // src/app/page.tsx working no datepipcker
// "use client";
// import { useState, useEffect } from 'react';
// import { Container, TextField, Box, Select, MenuItem, FormControl, InputLabel, Button, Typography, Modal } from '@mui/material';

// interface TesterType {
//   [key: string]: { senderId: number };
// }

// interface DataType {
//   [key: string]: { testerType: TesterType[] };
// }

// interface Config {
//   hostname: string;
//   port: number;
//   serviceName: string;
//   username: string;
//   password: string;
//   dataType: DataType[];
// }

// const Home = () => {
//   const [config, setConfig] = useState<Record<string, Config> | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [batchSize, setBatchSize] = useState<number | string>('');
//   const [hostname, setHostname] = useState<string>('');
//   const [port, setPort] = useState<string>('');
//   const [serviceName, setServiceName] = useState<string>('');
//   const [location, setLocation] = useState<string>('');
//   const [dataType, setDataType] = useState<string>('');
//   const [testerType, setTesterType] = useState<string>('');
//   const [message, setMessage] = useState<string>('');
//   const [openErrorModal, setOpenErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         const res = await fetch('/api/config');
//         if (!res.ok) {
//           throw new Error('Failed to load configuration.');
//         }
//         const data = await res.json();
//         setConfig(data); // Assuming the structure is { JND: {...}, CZ4: {...} }
//       } catch (error: any) {
//         setMessage(error.message || 'An error occurred while fetching the configuration.');
//       }
//     };

//     fetchConfig();
//   }, []);

//   const handleCloseErrorModal = () => setOpenErrorModal(false);

//   const handleLocationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     const selectedLocation = event.target.value as string;
//     setLocation(selectedLocation);
//     if (config && config[selectedLocation]) {
//       const locationConfig = config[selectedLocation];
//       setHostname(locationConfig.hostname);
//       setPort(locationConfig.port.toString());
//       setServiceName(locationConfig.serviceName);
//       setDataType('');
//       setTesterType('');
//     }
//   };

//   const handleDataTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     const selectedDataType = event.target.value as string;
//     setDataType(selectedDataType);
//     setTesterType(''); // Reset tester type when data type changes
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = event.target.files?.[0] || null;
//     setFile(selectedFile);
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     try {
//       const formData = new FormData();
//       if (file) {
//         formData.append('file', file);
//       }
//       formData.append('batchSize', batchSize.toString());
//       formData.append('hostname', hostname);
//       formData.append('port', port);
//       formData.append('serviceName', serviceName);
//       formData.append('location', location);
//       formData.append('dataType', dataType);
//       formData.append('testerType', testerType);

//       if (config && location) {
//         const locationConfig = config[location];
//         formData.append('username', process.env[locationConfig.username] || '');
//         formData.append('password', process.env[locationConfig.password] || '');
//       }

//       const response = await fetch('/api/process-ids', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Failed to process IDs');
//       }

//       const result = await response.json();
//       setMessage(result.message);
//     } catch (error: any) {
//       setErrorMessage(error.message || 'An error occurred');
//       setOpenErrorModal(true);
//     }
//   };

//   return (
//     <Container>
//       <Box component="form" onSubmit={handleSubmit}>
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel id="location-label">Location</InputLabel>
//           <Select
//             labelId="location-label"
//             value={location}
//             onChange={handleLocationChange}
//             displayEmpty
//             label="Location"
//           >
//             <MenuItem value="" disabled>
//               <em>Select a Location</em>
//             </MenuItem>
//             {config && Object.keys(config).map((loc) => (
//               <MenuItem key={loc} value={loc}>
//                 {loc}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel id="data-type-label">Data Type</InputLabel>
//           <Select
//             labelId="data-type-label"
//             value={dataType}
//             onChange={handleDataTypeChange}
//             displayEmpty
//             label="Data Type"
//             disabled={!location}
//           >
//             <MenuItem value="" disabled>
//               <em>Select a Data Type</em>
//             </MenuItem>
//             {location && config[location]?.dataType?.map((dt) => {
//               const dataTypeKey = Object.keys(dt)[0];
//               return (
//                 <MenuItem key={dataTypeKey} value={dataTypeKey}>
//                   {dataTypeKey}
//                 </MenuItem>
//               );
//             })}
//           </Select>
//         </FormControl>
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel id="tester-type-label">Tester Type</InputLabel>
//           <Select
//             labelId="tester-type-label"
//             value={testerType}
//             onChange={(e) => setTesterType(e.target.value as string)}
//             displayEmpty
//             label="Tester Type"
//             disabled={!dataType || !location}
//           >
//             <MenuItem value="" disabled>
//               <em>Select a Tester Type</em>
//             </MenuItem>
//             {location && dataType && config[location]?.dataType?.find((dt) => Object.keys(dt)[0] === dataType)?.[dataType]?.testerType?.map((testerTypeObj) => {
//               const testerTypeKey = Object.keys(testerTypeObj)[0];
//               return (
//                 <MenuItem key={testerTypeKey} value={testerTypeKey}>
//                   {testerTypeKey}
//                 </MenuItem>
//               );
//             })}
//           </Select>
//         </FormControl>
//         <TextField
//           fullWidth
//           label="Batch Size"
//           value={batchSize}
//           onChange={(e) => setBatchSize(e.target.value)}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           fullWidth
//           label="Hostname"
//           value={hostname}
//           onChange={(e) => setHostname(e.target.value)}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           fullWidth
//           label="Port"
//           value={port}
//           onChange={(e) => setPort(e.target.value)}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           fullWidth
//           label="Service Name"
//           value={serviceName}
//           onChange={(e) => setServiceName(e.target.value)}
//           sx={{ mb: 2 }}
//         />
//         <input
//           type="file"
//           onChange={handleFileChange}
//           style={{ marginBottom: '16px' }}
//         />
//         <Button
//           variant="contained"
//           color="primary"
//           type="submit"
//           fullWidth
//           disabled={!config} // Disable until config is loaded
//         >
//           Submit
//         </Button>
//         {message && (
//           <Typography variant="body1" color="error" sx={{ mt: 2 }}>
//             {message}
//           </Typography>
//         )}
//       </Box>
//       <Modal
//         open={openErrorModal}
//         onClose={handleCloseErrorModal}
//         aria-labelledby="error-modal-title"
//         aria-describedby="error-modal-description"
//       >
//         <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
//           <Typography id="error-modal-title" variant="h6" component="h2">
//             Error
//           </Typography>
//           <Typography id="error-modal-description" sx={{ mt: 2 }}>
//             {errorMessage}
//           </Typography>
//           <Button onClick={handleCloseErrorModal} sx={{ mt: 2 }}>
//             Close
//           </Button>
//         </Box>
//       </Modal>
//     </Container>
//   );
// };

// export default Home;

// // src/app/page.tsx  orig
// "use client";
// import { useState, useEffect } from 'react';
// import { Container, TextField, Box, Select, MenuItem, FormControl, InputLabel, Button, Typography, Modal } from '@mui/material';
// import { Config } from '../types/config';

// const Home = () => {
//   const [config, setConfig] = useState<Config | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [batchSize, setBatchSize] = useState<number | string>('');
//   const [hostname, setHostname] = useState<string>('');
//   const [port, setPort] = useState<string>('');
//   const [serviceName, setServiceName] = useState<string>('');
//   const [location, setLocation] = useState<string>('');
//   const [dataType, setDataType] = useState<string>('');
//   const [testerType, setTesterType] = useState<string>('');
//   const [message, setMessage] = useState<string>('');
//   const [openErrorModal, setOpenErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         const res = await fetch('/api/config');
//         if (!res.ok) {
//           throw new Error('Failed to load configuration.');
//         }
//         const data: Config = await res.json();
//         setConfig(data);
//       } catch (error: any) {
//         setMessage(error.message || 'An error occurred while fetching the configuration.');
//       }
//     };

//     fetchConfig();
//   }, []);

//   const handleCloseErrorModal = () => setOpenErrorModal(false);

//   const handleLocationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     const selectedLocation = event.target.value as string;
//     console.log('Selected Location:', selectedLocation);
//     setLocation(selectedLocation);
//     if (config) {
//       setHostname(config[selectedLocation].hostname);
//       setPort(config[selectedLocation].port.toString());
//       setServiceName(config[selectedLocation].serviceName);
//       setDataType('');
//       setTesterType('');
//     }
//   };

//   const handleDataTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
//     const selectedDataType = event.target.value as string;
//     console.log('Selected Data Type:', selectedDataType);
//     setDataType(selectedDataType);
//     setTesterType(''); // Reset tester type when data type changes
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = event.target.files?.[0] || null;
//     setFile(selectedFile);
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     try {
//       const formData = new FormData();
//       if (file) {
//         formData.append('file', file);
//       }
//       formData.append('batchSize', batchSize.toString());
//       formData.append('hostname', hostname);
//       formData.append('port', port);
//       formData.append('serviceName', serviceName);
//       formData.append('location', location);
//       formData.append('dataType', dataType);
//       formData.append('testerType', testerType);

//       // Add username and password to the request
//       formData.append('username', config?.username || '');
//       formData.append('password', config?.password || '');

//       const response = await fetch('/api/process-ids', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Failed to process IDs');
//       }

//       const result = await response.json();
//       setMessage(result.message);
//     } catch (error: any) {
//       setErrorMessage(error.message || 'An error occurred');
//       setOpenErrorModal(true);
//     }
//   };

//   return (
//     <Container>
//       <Box component="form" onSubmit={handleSubmit}>
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel id="location-label">Location</InputLabel>
//           <Select
//             labelId="location-label"
//             value={location}
//             onChange={handleLocationChange}
//             displayEmpty
//           >
//             <MenuItem value="" disabled>
             
//             </MenuItem>
//             {config && Object.keys(config).map((loc) => (
//               <MenuItem key={loc} value={loc}>
//                 {loc}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel id="data-type-label">Data Type</InputLabel>
//           <Select
//             value={dataType}
//             onChange={handleDataTypeChange}
//             displayEmpty
//             disabled={!location}
//           >
//             <MenuItem value="" disabled>
              
//             </MenuItem>
//             {location && config[location]?.dataType.map((dt: any) => {
//               const dataTypeKey = Object.keys(dt)[0];
//               return (
//                 <MenuItem key={dataTypeKey} value={dataTypeKey}>
//                   {dataTypeKey}
//                 </MenuItem>
//               );
//             })}
//           </Select>
//         </FormControl>
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel>Tester Type</InputLabel>
//           <Select
//             value={testerType}
//             onChange={(e) => setTesterType(e.target.value as string)}
//             displayEmpty
//             disabled={!dataType || !location}
//           >
//             <MenuItem value="" disabled>
              
//             </MenuItem>
//             {location && dataType && config[location].dataType.find((dt: any) => Object.keys(dt)[0] === dataType)?.[dataType]?.testerType.map((testerTypeObj: any) => {
//               const testerTypeKey = Object.keys(testerTypeObj)[0];
//               return (
//                 <MenuItem key={testerTypeKey} value={testerTypeKey}>
//                   {testerTypeKey}
//                 </MenuItem>
//               );
//             })}
//           </Select>
//         </FormControl>
//         <TextField
//           fullWidth
//           label="Batch Size"
//           value={batchSize}
//           onChange={(e) => setBatchSize(e.target.value)}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           fullWidth
//           label="Hostname"
//           value={hostname}
//           onChange={(e) => setHostname(e.target.value)}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           fullWidth
//           label="Port"
//           value={port}
//           onChange={(e) => setPort(e.target.value)}
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           fullWidth
//           label="Service Name"
//           value={serviceName}
//           onChange={(e) => setServiceName(e.target.value)}
//           sx={{ mb: 2 }}
//         />
//         <input
//           type="file"
//           onChange={handleFileChange}
//           style={{ marginBottom: '16px' }}
//         />
//         <Button
//           variant="contained"
//           color="primary"
//           type="submit"
//           fullWidth
//           disabled={!config} // Disable until config is loaded
//         >
//           Submit
//         </Button>
//         {message && (
//           <Typography variant="body1" color="error" sx={{ mt: 2 }}>
//             {message}
//           </Typography>
//         )}
//       </Box>
//       <Modal
//         open={openErrorModal}
//         onClose={handleCloseErrorModal}
//         aria-labelledby="error-modal-title"
//         aria-describedby="error-modal-description"
//       >
//         <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
//           <Typography id="error-modal-title" variant="h6" component="h2">
//             Error
//           </Typography>
//           <Typography id="error-modal-description" sx={{ mt: 2 }}>
//             {errorMessage}
//           </Typography>
//           <Button onClick={handleCloseErrorModal} sx={{ mt: 2 }}>
//             Close
//           </Button>
//         </Box>
//       </Modal>
//     </Container>
//   );
// };

// export default Home;