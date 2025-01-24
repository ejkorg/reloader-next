"use client";
import { useState, useEffect } from 'react';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";

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
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <select
            id="location"
            value={location}
            onChange={handleLocationChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="" disabled>Select a Location</option>
            {config && Object.keys(config).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="hostname" className="block text-sm font-medium text-gray-700">Hostname</label>
          <input
            type="text"
            id="hostname"
            value={hostname}
            readOnly
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="port" className="block text-sm font-medium text-gray-700">Port</label>
          <input
            type="text"
            id="port"
            value={port}
            readOnly
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Service Name</label>
          <input
            type="text"
            id="serviceName"
            value={serviceName}
            readOnly
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">Data Type</label>
          <select
            id="dataType"
            value={dataType}
            onChange={handleDataTypeChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            disabled={!location}
          >
            <option value="" disabled>Select a Data Type</option>
            {location && config[location]?.dataType?.map((dt) => {
              const dataTypeKey = Object.keys(dt)[0];
              return (
                <option key={dataTypeKey} value={dataTypeKey}>
                  {dataTypeKey}
                </option>
              );
            })}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="testerType" className="block text-sm font-medium text-gray-700">Tester Type</label>
          <select
            id="testerType"
            value={testerType}
            onChange={(e) => setTesterType(e.target.value as string)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            disabled={!dataType || !location}
          >
            <option value="" disabled>Select a Tester Type</option>
            {location && dataType && config[location]?.dataType?.find((dt) => Object.keys(dt)[0] === dataType)?.[dataType]?.testerType?.map((testerTypeObj) => {
              const testerTypeKey = Object.keys(testerTypeObj)[0];
              return (
                <option key={testerTypeKey} value={testerTypeKey}>
                  {testerTypeKey}
                </option>
              );
            })}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700">Batch Size</label>
          <input
            type="text"
            id="batchSize"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <Datetime
              value={startDate}
              onChange={(date) => {
                setStartDate(date as Date);
                if (date) setFile(null);
              }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm:ss"
              inputProps={{ id: "startDate", className: "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" }}
              closeOnSelect
              disabled={!!file}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <Datetime
              value={endDate}
              onChange={(date) => {
                setEndDate(date as Date);
                if (date) setFile(null);
              }}
              dateFormat="YYYY-MM-DD"
              timeFormat="HH:mm:ss"
              inputProps={{ id: "endDate", className: "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" }}
              closeOnSelect
              disabled={!!file}
            />
          </div>
        </div>
        {!startDate && !endDate && (
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">File</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              disabled={!!startDate || !!endDate}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={!config} // Disable until config is loaded
        >
          Submit
        </button>
        {message && (
          <p className="mt-2 text-red-600">
            {message}
          </p>
        )}
      </form>
      {openErrorModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Error
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseErrorModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;