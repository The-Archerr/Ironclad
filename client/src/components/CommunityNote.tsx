import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, User } from "lucide-react";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { type CommunityNote as CommunityNoteType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface CommunityNoteProps {
  note: CommunityNoteType;
  author: { name: string; profilePicUrl: string | null };
  refetch: () => void;
}

export function CommunityNote({ note, author, refetch }: CommunityNoteProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteValue: 1 | -1) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on community notes",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVoting(true);
      await apiRequest("POST", `/api/notes/${note.id}/vote`, {
        userId: user.id,
        vote: voteValue,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register your vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <AvatarWithFallback
            src={author.profilePicUrl}
            fallback={author.name.substring(0, 2).toUpperCase()}
            alt={author.name}
            className="h-8 w-8"
          />
          <div className="ml-2">
            <p className="text-sm font-medium">{author.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400"
            onClick={() => handleVote(1)}
            disabled={isVoting || !user}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{note.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
            onClick={() => handleVote(-1)}
            disabled={isVoting || !user}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            <span>{note.dislikes}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
