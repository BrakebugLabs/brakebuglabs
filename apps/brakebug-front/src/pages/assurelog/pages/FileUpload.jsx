import { useState, useRef, useEffect } from 'react';
import '../stylesassure/fileupload.css';

const FileUpload = ({ onFilesUploaded, existingFiles = [] }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    setUploadedFiles(existingFiles || []);
  }, [existingFiles]);

  const formatFileSize = (bytes = 0) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro no upload');
    }

    const data = await res.json();
    return data.file;
  };

  const handleFiles = async (files) => {
    setIsUploading(true);
    setMessage({ text: '', type: '' });

    const newFiles = [];

    for (const file of files) {
      try {
        const uploaded = await uploadFile(file);
        newFiles.push(uploaded);
      } catch (err) {
        setMessage({
          text: `Erro ao enviar ${file.name}`,
          type: 'error',
        });
      }
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    onFilesUploaded?.(newFiles);

    setIsUploading(false);

    if (newFiles.length) {
      setMessage({
        text: `${newFiles.length} arquivo(s) enviados com sucesso`,
        type: 'success',
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = async (file) => {
    try {
      await fetch(
        `http://localhost:5000/api/uploads/${file.filename}`,
        { method: 'DELETE' }
      );
    } catch (_) {}

    const updated = uploadedFiles.filter((f) => f.id !== file.id);
    setUploadedFiles(updated);
    onFilesUploaded?.(updated);

    setMessage({
      text: `Arquivo removido`,
      type: 'info',
    });
  };

  return (
    <div className="assure-fileupload">
      <div
        className={`assure-dropzone ${dragActive ? 'active' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => handleFiles(Array.from(e.target.files))}
        />
        <p><strong>Clique</strong> ou arraste arquivos aqui</p>
        <span>Imagens, vídeos, documentos ou ZIP (até 16MB)</span>
      </div>

      {message.text && (
        <div className={`assure-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {isUploading && (
        <div className="assure-uploading">Fazendo upload...</div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="assure-file-list">
          <h4>Arquivos ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="assure-file-item">
              <div>
                <strong>{file.original_name || file.filename}</strong>
                <span>
                  {formatFileSize(file.size)} • {file.type}
                </span>
              </div>
              <button
                className="assure-remove"
                onClick={() => removeFile(file)}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
