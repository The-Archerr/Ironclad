import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ZoomIn, ZoomOut, MoveHorizontal } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { FlowchartNode } from "@/components/FlowchartNode";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "wouter";
import { useAuth } from "@/lib/auth";
import { type Course, type Topic, type UserProgress } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopicCard } from "@/components/TopicCard";

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id);
  const { user } = useAuth();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<"flowchart" | "list">("flowchart");

  // Get course
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !isNaN(courseId),
  });

  // Get topics
  const { data: topics, isLoading: isLoadingTopics } = useQuery<Topic[]>({
    queryKey: [`/api/courses/${courseId}/topics`],
    enabled: !isNaN(courseId),
  });

  // Get user progress
  const { data: completedTopics, isLoading: isLoadingProgress } = useQuery<UserProgress[]>({
    queryKey: user ? [`/api/users/${user.id}/completed-topics`] : [],
    enabled: !!user,
  });

  // Calculate completed topic IDs
  const completedTopicIds = completedTopics 
    ? completedTopics.filter(p => p.isCompleted).map(p => p.topicId) 
    : [];

  // Build a dependency graph for topics
  const dependencyGraph = useMemo(() => {
    if (!topics) return {};
    
    const graph: Record<number, { level: number, position: number }> = {};
    
    // Initialize all topics with level 0
    topics.forEach(topic => {
      graph[topic.id] = { level: 0, position: 0 };
    });
    
    // Calculate the level for each topic based on prerequisites
    let changed = true;
    while (changed) {
      changed = false;
      
      topics.forEach(topic => {
        if (topic.prerequisites && topic.prerequisites.length > 0) {
          // Find the maximum level of all prerequisites
          const maxLevel = Math.max(...topic.prerequisites.map(prereqId => 
            graph[prereqId]?.level || 0
          ));
          
          // Set this topic's level to be one more than the max prerequisite level
          if (graph[topic.id].level <= maxLevel) {
            graph[topic.id].level = maxLevel + 1;
            changed = true;
          }
        }
      });
    }
    
    // Calculate position within level
    const levelCounts: Record<number, number> = {};
    
    // Count topics in each level
    Object.values(graph).forEach(node => {
      levelCounts[node.level] = (levelCounts[node.level] || 0) + 1;
    });
    
    // Sort topics by order property and assign positions within each level
    const levelPositions: Record<number, number> = {};
    
    topics.sort((a, b) => a.order - b.order).forEach(topic => {
      const level = graph[topic.id].level;
      levelPositions[level] = levelPositions[level] || 0;
      
      graph[topic.id].position = levelPositions[level];
      levelPositions[level]++;
    });
    
    return graph;
  }, [topics]);
  
  // Prepare flowchart connections
  const connections = useMemo(() => {
    if (!topics) return [];
    
    return topics.flatMap(topic => 
      topic.prerequisites?.map(prereqId => ({
        fromId: prereqId,
        toId: topic.id
      })) || []
    );
  }, [topics]);

  // Check if a topic should be locked (prerequisites not completed)
  const isTopicLocked = (topic: Topic) => {
    if (!topic.prerequisites || topic.prerequisites.length === 0) return false;
    
    return !topic.prerequisites.every(prereqId => 
      completedTopicIds.includes(prereqId)
    );
  };

  // Calculate node positions for the flowchart
  const getNodePosition = (topic: Topic, allTopics: Topic[]) => {
    const baseY = 60;
    const baseX = 60;
    const xSpacing = 300; // More space between levels
    const ySpacing = 150; // More space between topics in the same level
    
    const node = dependencyGraph[topic.id];
    if (!node) {
      return { x: baseX, y: baseY };
    }
    
    // Calculate a staggered layout for even distribution
    const level = node.level;
    const position = node.position;
    
    // Get count of nodes at this level for better centering
    const nodesAtThisLevel = Object.values(dependencyGraph)
      .filter(n => n.level === level)
      .length;
    
    // Calculate vertical offset to center nodes at the same level
    const levelOffset = position - (nodesAtThisLevel - 1) / 2;
    
    // Apply slight offset for even-numbered levels for a more organic layout
    const evenLevelOffset = level % 2 === 0 ? ySpacing / 4 : 0;
    
    return {
      x: baseX + level * xSpacing,
      y: baseY + levelOffset * ySpacing + evenLevelOffset
    };
  };

  if (isNaN(courseId)) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold text-red-500">Invalid Course ID</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isLoadingCourse ? (
              <Skeleton className="h-8 w-[200px]" />
            ) : (
              course?.title
            )}
          </h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
            {isLoadingCourse ? (
              <Skeleton className="h-5 w-full" />
            ) : (
              <CardDescription>{course?.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {completedTopicIds.length > 0 && topics ? 
                  `Progress: ${completedTopicIds.filter(id => 
                    topics.some(t => t.id === id)
                  ).length} / ${topics.length} topics completed` 
                  : "Start learning this course"
                }
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                {topics && topics.length > 0 && (
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${
                        (completedTopicIds.filter(id => 
                          topics.some(t => t.id === id)
                        ).length / topics.length) * 100
                      }%` 
                    }} 
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Learning Pathway</CardTitle>
                <CardDescription>
                  Click on a topic to view its content. Complete prerequisites to unlock topics.
                </CardDescription>
              </div>
              <Tabs 
                defaultValue="flowchart" 
                onValueChange={(value) => setViewMode(value as "flowchart" | "list")}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoadingTopics ? (
              <div className="h-[400px] flex items-center justify-center">
                <Skeleton className="h-[300px] w-[600px]" />
              </div>
            ) : topics && topics.length > 0 ? (
              viewMode === "flowchart" ? (
                <div className="space-y-2">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                    >
                      <ZoomOut className="h-4 w-4 mr-1" />
                      Zoom Out
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                    >
                      <ZoomIn className="h-4 w-4 mr-1" />
                      Zoom In
                    </Button>
                    <span className="text-sm text-muted-foreground flex items-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>
                  
                  <div 
                    className="relative border rounded-md p-8 bg-accent/10"
                    style={{ 
                      height: "calc(75vh)",
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ 
                      transform: `scale(${zoomLevel})`, 
                      transformOrigin: "top left",
                      width: "100%",
                      height: "100%",
                      position: "relative"
                    }}>
                      {/* Draw connector lines background grid for visual reference */}
                      <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 gap-4 opacity-5 pointer-events-none">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="border border-dashed border-primary/30 rounded-md"></div>
                        ))}
                      </div>
                      
                      {topics.map((topic) => (
                        <FlowchartNode
                          key={topic.id}
                          topic={topic}
                          isCompleted={completedTopicIds.includes(topic.id)}
                          isLocked={isTopicLocked(topic)}
                          position={getNodePosition(topic, topics)}
                          connections={connections}
                          allTopics={topics}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics
                    .sort((a, b) => {
                      // Sort by level first, then by order within level
                      const levelA = dependencyGraph[a.id]?.level || 0;
                      const levelB = dependencyGraph[b.id]?.level || 0;
                      
                      if (levelA !== levelB) return levelA - levelB;
                      return a.order - b.order;
                    })
                    .map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        isCompleted={completedTopicIds.includes(topic.id)}
                        isLocked={isTopicLocked(topic)}
                      />
                    ))
                  }
                </div>
              )
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">No topics available for this course</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
