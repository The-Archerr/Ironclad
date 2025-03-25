import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarWithFallbackProps {
  src: string | null | undefined;
  fallback: string;
  alt: string;
  className?: string;
}

export function AvatarWithFallback({ 
  src, 
  fallback, 
  alt, 
  className 
}: AvatarWithFallbackProps) {
  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
