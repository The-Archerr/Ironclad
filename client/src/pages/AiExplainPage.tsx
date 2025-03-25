import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Lightbulb, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "wouter";
import { type Topic } from "@shared/schema";

// Define types for the AI response
interface AIExplanation {
  explanation: string;
  examples: string[];
  keyPoints: string[];
}

export default function AiExplainPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const parsedTopicId = parseInt(topicId);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get topic
  const { data: topic, isLoading: isLoadingTopic } = useQuery<Topic>({
    queryKey: [`/api/topics/${parsedTopicId}`],
    enabled: !isNaN(parsedTopicId),
  });

  // Generate explanation when topic data is loaded
  useEffect(() => {
    if (topic) {
      generateExplanation();
    }
  }, [topic]);

  // Function to simulate AI explanation
  const generateExplanation = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // In a real application, this would call a Gemini AI API
      // Here we're simulating a response based on the topic data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Simulate responses based on topic title
      let simulatedResponse: AIExplanation;
      
      if (topic.title.includes("HTML")) {
        simulatedResponse = {
          explanation: "HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It defines the structure of web content through a series of elements that tell the browser how to display the content.",
          examples: [
            "Basic page structure: `<!DOCTYPE html><html><head><title>Page Title</title></head><body><h1>Heading</h1><p>Paragraph</p></body></html>`",
            "Links: `<a href=\"https://example.com\">Visit Example</a>`",
            "Images: `<img src=\"image.jpg\" alt=\"Description\">`"
          ],
          keyPoints: [
            "HTML uses tags to define elements",
            "Elements can be nested inside other elements",
            "The DOCTYPE declaration specifies the HTML version",
            "HTML5 is the latest version with new semantic elements",
            "HTML provides structure, CSS provides styling, JavaScript provides interactivity"
          ]
        };
      } else if (topic.title.includes("CSS")) {
        simulatedResponse = {
          explanation: "CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML. CSS describes how HTML elements should be displayed on screen, paper, or in other media.",
          examples: [
            "Selector syntax: `.classname { color: blue; font-size: 14px; }`",
            "Flexbox: `.container { display: flex; justify-content: center; }`",
            "Media query: `@media (max-width: 600px) { .class { display: none; } }`"
          ],
          keyPoints: [
            "CSS works by selecting HTML elements and applying styles to them",
            "CSS can be included inline, internal, or in external stylesheets",
            "The cascade determines which styles take precedence",
            "CSS3 introduced animations, transitions, and transformations",
            "Modern CSS includes Flexbox and Grid for powerful layouts"
          ]
        };
      } else if (topic.title.includes("JavaScript")) {
        simulatedResponse = {
          explanation: "JavaScript is a programming language that enables interactive web pages. It's an essential part of web applications, with the majority of websites using it for client-side page behavior.",
          examples: [
            "Variables: `let name = 'John'; const age = 30;`",
            "Functions: `function greet(name) { return 'Hello, ' + name; }`",
            "DOM manipulation: `document.getElementById('demo').innerHTML = 'Hello';`"
          ],
          keyPoints: [
            "JavaScript is a high-level, interpreted programming language",
            "It's primarily used for client-side web development",
            "Modern JavaScript (ES6+) includes features like arrow functions, destructuring, and promises",
            "JavaScript can also run server-side with Node.js",
            "It supports object-oriented, functional, and event-driven programming styles"
          ]
        };
      } else if (topic.title.includes("Array")) {
        simulatedResponse = {
          explanation: "Arrays are ordered collections of data that store multiple values in a single variable. They are fundamental data structures used in almost all programming languages to organize and manipulate collections of data.",
          examples: [
            "Declaration: `let fruits = ['Apple', 'Banana', 'Orange'];`",
            "Accessing elements: `let firstFruit = fruits[0]; // Apple`",
            "Array methods: `fruits.push('Mango'); // Adds Mango to the end`"
          ],
          keyPoints: [
            "Arrays store elements at numeric indices, starting from 0",
            "Arrays can store any data type, including other arrays",
            "Common operations include adding/removing elements and searching/sorting",
            "Time complexity varies by operation (access: O(1), search: O(n))",
            "Arrays in different languages may have fixed or dynamic sizes"
          ]
        };
      } else if (topic.title.includes("Linked List")) {
        simulatedResponse = {
          explanation: "A Linked List is a linear data structure where elements are stored in nodes, and each node points to the next node in the sequence. Unlike arrays, linked lists don't require contiguous memory allocation, making insertions and deletions more efficient.",
          examples: [
            "Node structure: `class Node { constructor(data) { this.data = data; this.next = null; } }`",
            "Insertion: `newNode.next = current.next; current.next = newNode;`",
            "Traversal: `while (current !== null) { console.log(current.data); current = current.next; }`"
          ],
          keyPoints: [
            "Linked lists consist of nodes that contain data and a reference to the next node",
            "The first node is called the head, and the last node points to null",
            "Advantages include dynamic size and efficient insertions/deletions",
            "Disadvantages include sequential access (no random access) and extra memory for pointers",
            "Variations include singly linked, doubly linked, and circular linked lists"
          ]
        };
      } else {
        // Default response for other topics
        simulatedResponse = {
          explanation: `This is an AI-generated explanation for ${topic.title}. ${topic.description} This feature would typically connect to the Gemini AI API to generate a detailed explanation based on the topic.`,
          examples: [
            "Example 1: This would be a practical example of the concept",
            "Example 2: Another example showing how to apply this knowledge",
            "Example 3: A more advanced application of this topic"
          ],
          keyPoints: [
            "Key point 1: An important concept to understand",
            "Key point 2: Another fundamental idea related to this topic",
            "Key point 3: How this topic connects to other areas",
            "Key point 4: Practical applications of this knowledge",
            "Key point 5: Common pitfalls or misconceptions"
          ]
        };
      }
      
      setExplanation(simulatedResponse);
    } catch (err) {
      console.error("Error generating explanation:", err);
      setError("Failed to generate explanation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isNaN(parsedTopicId)) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold text-red-500">Invalid Topic ID</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-2">
          <Link href={`/topic/${parsedTopicId}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
            AI Explanation: 
            {isLoadingTopic ? (
              <Skeleton className="h-8 w-[200px] ml-2" />
            ) : (
              <span className="ml-2">{topic?.title}</span>
            )}
          </h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Topic Understanding</CardTitle>
            <CardDescription>
              AI-powered explanation to help you understand this topic better
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[85%]" />
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={generateExplanation}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : explanation ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Explanation</h3>
                  <p>{explanation.explanation}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Points</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {explanation.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Examples</h3>
                  <div className="space-y-2">
                    {explanation.examples.map((example, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-muted rounded-md font-mono text-sm"
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
          {explanation && (
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={generateExplanation}
                disabled={isGenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? "Generating..." : "Regenerate Explanation"}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> In a production environment, this page would connect to 
            the Gemini AI API to generate explanations based on the topic content. The response 
            above is simulated for demonstration purposes.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
