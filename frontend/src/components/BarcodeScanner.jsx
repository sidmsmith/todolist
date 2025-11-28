import React, { useState, useEffect } from 'react';

export const BarcodeScanner = ({ field, value, onChange, required }) => {
  const [scannedValue, setScannedValue] = useState(value || '');

  // Update state when value prop changes
  useEffect(() => {
    setScannedValue(value || '');
  }, [value]);

  const handleBarcodeInput = (e) => {
    const val = e.target.value;
    setScannedValue(val);
    onChange(val);
  };

  const simulateScan = () => {
    // Simulate barcode scanner (usually triggered by hardware scanner)
    const mockCode = field.type === 'qr' ? 'QR123456789' : 'BC987654321';
    setScannedValue(mockCode);
    onChange(mockCode);
  };

  return (
    <div className={`form-group ${required ? 'required-field' : ''}`}>
      <label>{field.label} {required && <span className="required-asterisk">*</span>}</label>
      <div className="barcode-scanner-container">
        <input
          type="text"
          value={scannedValue}
          onChange={handleBarcodeInput}
          placeholder={field.type === 'qr' ? 'Scan QR code or enter manually' : 'Scan barcode or enter manually'}
          required={required}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <button type="button" onClick={simulateScan} style={{ padding: '4px 12px' }}>
          {field.type === 'qr' ? '📱 Simulate QR Scan' : '📊 Simulate Barcode Scan'}
        </button>
      </div>
    </div>
  );
};

