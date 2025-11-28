import React, { useRef } from 'react';

export const PhotoUpload = ({ field, value, onChange, required }) => {
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    // Use file input with camera capture attribute
    fileInputRef.current?.click();
  };

  return (
    <div className={`form-group ${required ? 'required-field' : ''}`}>
      <label>{field.label} {required && <span className="required-asterisk">*</span>}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoChange}
        style={{ display: 'none' }}
      />
      <div className="photo-upload-container">
        <button type="button" onClick={capturePhoto} style={{ marginBottom: '8px', padding: '8px 16px' }}>
          📷 Take Photo / Upload
        </button>
        {value && (
          <div>
            <img src={value} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
              📸 Photo captured (not saved - testing mode)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

