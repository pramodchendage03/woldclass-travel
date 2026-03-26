import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUpload: (base64: string) => void;
  currentImage?: string;
  label?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, currentImage, label, className = "" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpload(base64String);
      toast.success("Image uploaded successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-widest">{label}</label>}
      <div className="flex items-center gap-4">
        {currentImage && (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold/10 luxury-shadow flex-shrink-0">
            <img src={currentImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 bg-paper border border-gold/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-ink/60 hover:bg-gold/5 hover:text-gold transition-all"
        >
          <Upload className="w-4 h-4" />
          {currentImage ? "Replace Image" : "Upload Image"}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};
