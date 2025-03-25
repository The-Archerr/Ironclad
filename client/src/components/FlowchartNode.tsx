import { useMemo } from "react";
import { Check, Lock, ChevronRight } from "lucide-react";
import { type Topic } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FlowchartNodeProps {
  topic: Topic;
  isCompleted: boolean;
  isLocked: boolean;
  position: { x: number; y: number };
  connections: Array<{ fromId: number; toId: number }>;
  allTopics: Topic[];
}

export function FlowchartNode({ 
  topic, 
  isCompleted, 
  isLocked, 
  position, 
  connections,
  allTopics
}: FlowchartNodeProps) {
  // Compute target and source connections
  const { sourceConnections, targetConnections } = useMemo(() => {
    // Connections where this node is the source (outgoing)
    const sourceConns = connections
      .filter(conn => conn.fromId === topic.id)
      .map(conn => ({
        ...conn,
        target: allTopics.find(t => t.id === conn.toId),
        targetPosition: allTopics.findIndex(t => t.id === conn.toId)
      }))
      .filter(conn => conn.target); // Only keep connections with valid targets
      
    // Connections where this node is the target (incoming)
    const targetConns = connections
      .filter(conn => conn.toId === topic.id)
      .map(conn => ({
        ...conn,
        source: allTopics.find(t => t.id === conn.fromId),
        sourcePosition: allTopics.findIndex(t => t.id === conn.fromId)
      }))
      .filter(conn => conn.source); // Only keep connections with valid sources
    
    return { sourceConnections: sourceConns, targetConnections: targetConns };
  }, [topic.id, connections, allTopics]);
  
  // Generate SVG paths for connections to target nodes
  const connectionPaths = useMemo(() => {
    return sourceConnections.map(conn => {
      const thisNodeX = position.x;
      const thisNodeY = position.y;
      
      // Find target node's position in the dependency graph
      const targetInfo = conn.target;
      if (!targetInfo) return null;
      
      // Calculate the target node's position in the flowchart
      // Here we need to use the same positioning logic as in CoursePage
      const targetLevel = targetInfo.prerequisites?.length || 0;
      const targetPosition = allTopics
        .filter(t => (t.prerequisites?.length || 0) === targetLevel)
        .findIndex(t => t.id === targetInfo.id);
        
      if (targetPosition === -1) return null;
      
      // Get node counts at target level for better vertical distribution
      const nodesAtTargetLevel = allTopics
        .filter(t => (t.prerequisites?.length || 0) === targetLevel)
        .length;
        
      const levelOffset = targetPosition - (nodesAtTargetLevel - 1) / 2;
      const evenLevelOffset = targetLevel % 2 === 0 ? 150 / 4 : 0;
      
      // Calculate actual target position
      const baseX = 60;
      const baseY = 60;
      const xSpacing = 300;
      const ySpacing = 150;
      
      const targetX = baseX + targetLevel * xSpacing;
      const targetY = baseY + levelOffset * ySpacing + evenLevelOffset;
      
      // Source coordinates (from right side of current node)
      const sx = thisNodeX + 150; // Right edge of source node
      const sy = thisNodeY + 30;  // Middle height of source node
      
      // Target coordinates (to left side of target node)
      const tx = targetX; // Left edge of target node
      const ty = targetY + 30; // Middle height of target node
      
      // Control points for the bezier curve
      // Creating a smooth S-curve between nodes
      const dx = tx - sx;
      const dy = ty - sy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Adjust control points based on distance to create natural curves
      const controlPointX1 = sx + Math.min(80, distance * 0.3);
      const controlPointY1 = sy;
      const controlPointX2 = tx - Math.min(80, distance * 0.3);
      const controlPointY2 = ty;
      
      // Create the SVG path
      const path = `M ${sx} ${sy} 
                    C ${controlPointX1} ${controlPointY1}, 
                      ${controlPointX2} ${controlPointY2}, 
                      ${tx} ${ty}`;
                      
      return {
        path,
        targetId: conn.toId,
        completed: isCompleted,
        id: `${topic.id}-to-${conn.toId}`
      };
    }).filter(Boolean); // Remove any null paths
  }, [topic, position, sourceConnections, allTopics, isCompleted]);

  // Event handlers for the node
  const handleNodeClick = () => {
    if (isLocked) return;
    window.location.href = `/topic/${topic.id}`;
  };

  return (
    <div
      className={`absolute transition-all duration-200 ${
        isLocked ? "opacity-80" : ""
      }`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
      }}
    >
      {/* Connection arrows - source connections (outgoing from this node) */}
      <svg 
        className="absolute top-0 left-0 pointer-events-none"
        style={{ 
          zIndex: -1,
          width: "100vw", 
          height: "100vh",
          transform: "translate(-10%, -10%)",
          overflow: "visible"
        }}
      >
        <defs>
          {/* Global marker definition */}
          <marker
            id={`arrowhead-${topic.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={isCompleted ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)"}
            />
          </marker>
        </defs>
        
        {connectionPaths.map((pathData, index) => (
          <g key={`conn-${pathData?.id || index}`}>
            <path
              d={pathData?.path}
              stroke={isCompleted ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)"}
              strokeWidth="2"
              strokeDasharray={isLocked ? "5,5" : "none"}
              fill="none"
              markerEnd={`url(#arrowhead-${topic.id})`}
            />
          </g>
        ))}
      </svg>
      
      {/* Indicator for incoming connections */}
      {targetConnections.length > 0 && (
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400"></div>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              onClick={handleNodeClick}
              className={cn(
                "relative w-[150px] h-[60px] rounded-lg flex flex-col items-center justify-center",
                "text-sm font-medium border px-3 py-2 shadow-sm transition-all",
                isLocked 
                  ? "bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-400 cursor-not-allowed" 
                  : isCompleted
                    ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-800/70 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/60 cursor-pointer"
                    : "bg-card border-border text-card-foreground hover:bg-accent/30 hover:border-primary/30 cursor-pointer",
                !isLocked && "hover:shadow-md hover:-translate-y-[2px]"
              )}
            >
              <span className="line-clamp-2 text-center mb-1">{topic.title}</span>
              
              {!isLocked && (
                <div className="flex items-center text-xs opacity-70">
                  <span>{isCompleted ? "Completed" : "Explore"}</span>
                  <ChevronRight className="h-3 w-3 ml-1" />
                </div>
              )}
              
              {isCompleted && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              
              {isLocked && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[250px]">
            <p className="font-semibold">{topic.title}</p>
            <p className="text-sm mt-1">{topic.description}</p>
            {isLocked && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                Complete prerequisites first
              </p>
            )}
            {isCompleted && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Completed
              </p>
            )}
            {topic.prerequisites && topic.prerequisites.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Prerequisites: {topic.prerequisites.length}</p>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
