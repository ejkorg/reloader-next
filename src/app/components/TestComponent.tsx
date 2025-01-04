// src/components/TestComponent.tsx
import React, { useState } from 'react';
import { Container, TextField, Box, Button } from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

const TestComponent = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <Container>
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
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;
          setFile(selectedFile);
          if (selectedFile) {
            setStartDate(null);
            setEndDate(null);
          }
        }}
        style={{ marginBottom: '16px' }}
        disabled={!!startDate || !!endDate}
      />
      <Button variant="contained" color="primary" fullWidth>
        Submit
      </Button>
    </Container>
  );
};

export default TestComponent;