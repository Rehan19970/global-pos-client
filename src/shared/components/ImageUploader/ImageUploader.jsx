import { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';

const ImageUploader = ({ onUploadSuccess, type = 'product' }) => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check Size (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size must be less than 2MB');
    }

    // Preview dikhayein
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Backend par upload karein
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const { data } = await api.post(`/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Image uploaded!');
      if (onUploadSuccess) onUploadSuccess(data.imageUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    if (onUploadSuccess) onUploadSuccess('');
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
          <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition shadow-lg"
          >
            <X size={16} />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-slate-800 font-medium">
              Uploading...
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center cursor-pointer transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud size={32} className="text-slate-400 mb-2" />
          <p className="text-slate-600 text-sm font-medium">Click to upload image</p>
          <p className="text-slate-400 text-xs mt-1">JPEG, PNG, WebP (Max 2MB)</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;