'use client';

import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className,
        )}
        style={{
          width: props.width ? `${props.width}px` : undefined,
          height: props.height ? `${props.height}px` : undefined,
        }}
        title={`${alt} (image unavailable)`}
      >
        <ImageOff className="size-4" />
      </div>
    );
  }

  return (
    // biome-ignore lint/performance/noImgElement: using <img> with onError for CDN fallback behavior not supported by next/image
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      loading="lazy"
      {...props}
    />
  );
}
