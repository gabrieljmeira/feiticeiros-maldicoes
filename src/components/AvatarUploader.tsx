'use client';

import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface Props {
  name: string;
  avatarDataUrl?: string;
  onChange: (dataUrl: string) => void;
}

export function AvatarUploader({ name, avatarDataUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        onChange(canvas.toDataURL('image/webp', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const initials = (name || 'FM')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Alterar foto do personagem (JPEG, PNG, WEBP)"
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-accent bg-zinc-900 shadow-glow transition hover:scale-105"
      >
        {avatarDataUrl ? (
          <img src={avatarDataUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-mono text-lg font-bold text-accent-text">{initials}</span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
