import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const MAX_SIZE = 1024 * 1024; // 1MB
const MAX_DIMENSION = 1080;
const QUALITY = 0.8;

// 压缩图片到 1MB 以下
async function compressImage(file: File): Promise<{ blob: Blob; compressed: boolean; finalSize: number }> {
  if (file.size <= MAX_SIZE) {
    return { blob: file, compressed: false, finalSize: file.size };
  }

  const img = await loadImage(file);
  let { width, height } = img;

  // 限制最大分辨率 1080p
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  // 迭代降低质量直到 < 1MB
  let quality = QUALITY;
  let blob: Blob | null = null;
  for (let i = 0; i < 5; i++) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality)
    );
    if (blob && blob.size <= MAX_SIZE) break;
    quality -= 0.15;
  }

  if (!blob || blob.size > MAX_SIZE) {
    throw new Error('图片压缩后仍超过 1MB，请更换图片');
  }

  return { blob, compressed: true, finalSize: blob.size };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function generateFileName(ext: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}_${rand}.${ext}`;
}

interface ImageUploaderProps {
  onUploaded: (url: string) => void;
  currentUrl?: string | null;
  folder?: string;
  label?: string;
  className?: string;
}

export function ImageUploader({ onUploaded, currentUrl, folder = 'misc', label = '上传图片', className }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('仅支持 JPEG、PNG、GIF、WEBP、AVIF 格式');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const { blob, compressed, finalSize } = await compressImage(file);
      setProgress(40);

      const ext = compressed ? 'webp' : file.name.split('.').pop()?.toLowerCase() || 'webp';
      const fileName = generateFileName(ext);
      const path = `${folder}/${fileName}`;

      setProgress(60);
      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(path, blob, { contentType: blob.type });

      if (error) throw error;
      setProgress(90);

      const { data: urlData } = supabase.storage.from('user-uploads').getPublicUrl(data.path);
      const url = urlData.publicUrl;

      setPreview(url);
      setProgress(100);
      onUploaded(url);

      if (compressed) {
        toast.success(`上传成功（已自动压缩至 ${(finalSize / 1024).toFixed(0)}KB）`);
      } else {
        toast.success('上传成功');
      }
    } catch (err: any) {
      toast.error(err?.message || '上传失败');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [folder, onUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClear = useCallback(() => {
    setPreview(null);
    onUploaded('');
  }, [onUploaded]);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      {preview ? (
        <div className="relative group rounded-lg overflow-hidden border bg-muted" style={{ width: 120, height: 120 }}>
          <img src={preview} alt="预览" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
          style={{ width: 120, height: 120 }}
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
          <span className="text-xs">{uploading ? '上传中...' : label}</span>
        </button>
      )}
      {progress > 0 && (
        <Progress value={progress} className="mt-2 h-1.5" style={{ width: 120 }} />
      )}
    </div>
  );
}

// 头像上传变体
export function AvatarUploader({ onUploaded, currentUrl, className }: { onUploaded: (url: string) => void; currentUrl?: string | null; className?: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('头像仅支持 JPEG、PNG、WEBP 格式');
      return;
    }
    setUploading(true);
    try {
      const { blob } = await compressImage(file);
      const ext = 'webp';
      const path = `avatars/${generateFileName(ext)}`;
      const { data, error } = await supabase.storage.from('user-uploads').upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('user-uploads').getPublicUrl(data.path);
      onUploaded(urlData.publicUrl);
      toast.success('头像更新成功');
    } catch (err: any) {
      toast.error(err?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors cursor-pointer"
      >
        {currentUrl ? (
          <img src={currentUrl} alt="头像" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </button>
    </div>
  );
}