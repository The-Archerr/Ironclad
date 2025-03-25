import { ExternalLink, Video, Globe } from "lucide-react";
import { type Resource } from "@shared/schema";

interface ResourceLinkProps {
  resource: Resource;
}

export function ResourceLink({ resource }: ResourceLinkProps) {
  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center p-3 border rounded-md hover:bg-accent transition-colors"
    >
      {resource.type === "video" ? (
        <Video className="h-5 w-5 mr-2 text-red-500" />
      ) : (
        <Globe className="h-5 w-5 mr-2 text-blue-500" />
      )}
      
      <div className="flex-1">
        <h3 className="font-medium text-sm line-clamp-1">{resource.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{resource.url}</p>
      </div>
      
      <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0 text-muted-foreground" />
    </a>
  );
}
