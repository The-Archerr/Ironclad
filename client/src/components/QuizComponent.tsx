import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Award,
  BookOpen,
  BarChart,
  HelpCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  type Quiz, 
  type QuizQuestion,
  type UserQuizAttempt,
  QuestionType
} from "@shared/schema";

interface UserAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
}

interface QuizComponentProps {
  topicId: number;
}

export function QuizComponent({ topicId }: QuizComponentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState({ score: 0, total: 0 });
  const [showExplanation, setShowExplanation] = useState(false);

  // Fetch available quizzes for this topic
  const { 
    data: quizzes, 
    isLoading: isLoadingQuizzes,
    refetch: refetchQuizzes 
  } = useQuery<Quiz[]>({
    queryKey: [`/api/topics/${topicId}/quizzes`],
    enabled: !!topicId && !!user,
  });

  // Fetch selected quiz details with questions
  const { 
    data: quizData, 
    isLoading: isLoadingQuizData,
    refetch: refetchQuizData
  } = useQuery<{ quiz: Quiz; questions: QuizQuestion[] }>({
    queryKey: [`/api/quizzes/${selectedQuizId}`],
    enabled: !!selectedQuizId,
  });

  // Fetch user's previous attempts for this quiz
  const { 
    data: attempts, 
    isLoading: isLoadingAttempts,
    refetch: refetchAttempts
  } = useQuery<UserQuizAttempt[]>({
    queryKey: [`/api/users/${user?.id}/quiz-attempts`, { quizId: selectedQuizId }],
    enabled: !!user && !!selectedQuizId,
  });

  // Reset state when quiz is selected
  useEffect(() => {
    if (selectedQuizId) {
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setIsQuizComplete(false);
      setShowResults(false);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    }
  }, [selectedQuizId]);

  // Create quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to generate a quiz");
      
      const response = await apiRequest("POST", `/api/topics/${topicId}/generate-quiz`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz Generated",
        description: "A new quiz has been created for this topic.",
      });
      refetchQuizzes();
      setSelectedQuizId(data.quiz.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to generate quiz:", error);
    },
  });

  // Submit quiz attempt mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (data: { 
      userId: number;
      score: number;
      maxScore: number;
      answers: UserAnswer[];
    }) => {
      const response = await apiRequest(
        "POST", 
        `/api/quizzes/${selectedQuizId}/attempt`, 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz Completed",
        description: `You scored ${finalScore.score} out of ${finalScore.total}`,
      });
      
      // Invalidate queries to update data
      if (user) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/quiz-attempts`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/points`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/achievements`] });
      }
      
      refetchAttempts();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit quiz results. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to submit quiz results:", error);
    },
  });

  const handleStartQuiz = (quizId: number) => {
    setSelectedQuizId(quizId);
  };

  const handleCreateQuiz = () => {
    createQuizMutation.mutate();
  };

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !quizData?.questions) return;
    
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect
    };
    
    setUserAnswers([...userAnswers, answer]);
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (!quizData?.questions) return;
    
    setIsAnswerSubmitted(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate final score
      const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
      const finalScoreObj = {
        score: correctAnswers,
        total: quizData.questions.length
      };
      
      setFinalScore(finalScoreObj);
      setIsQuizComplete(true);
      setShowResults(true);
      
      // Submit quiz results to server
      if (user) {
        submitQuizMutation.mutate({
          userId: user.id,
          score: correctAnswers,
          maxScore: quizData.questions.length,
          answers: userAnswers
        });
      }
    }
  };

  const handleBackToQuizzes = () => {
    setSelectedQuizId(null);
    setIsQuizComplete(false);
    setShowResults(false);
  };

  // Display logic
  if (isLoadingQuizzes && !selectedQuizId) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  // Quiz selection view
  if (!selectedQuizId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Quizzes</h2>
          {user && (
            <Button 
              onClick={handleCreateQuiz} 
              disabled={createQuizMutation.isPending}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Generate New Quiz
            </Button>
          )}
        </div>
        
        {quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map(quiz => (
              <Card key={quiz.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{quiz.title}</CardTitle>
                    <Badge variant={quiz.difficulty > 1 ? "destructive" : "secondary"}>
                      {quiz.difficulty > 1 ? "Advanced" : "Beginner"}
                    </Badge>
                  </div>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>{quiz.pointsToEarn} points available</span>
                  </div>
                  
                  {user && attempts && attempts.some(a => a.quizId === quiz.id) && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Your best score:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={Math.max(...attempts
                            .filter(a => a.quizId === quiz.id)
                            .map(a => (a.score / a.maxScore) * 100))} 
                          className="h-2"
                        />
                        <span className="text-sm">
                          {Math.max(...attempts
                            .filter(a => a.quizId === quiz.id)
                            .map(a => a.score))}/
                          {attempts.find(a => a.quizId === quiz.id)?.maxScore}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleStartQuiz(quiz.id)}
                  >
                    Start Quiz
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 flex flex-col items-center justify-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-center">No quizzes available for this topic yet</p>
              <p className="text-muted-foreground text-center mt-1">
                Generate a quiz to test your knowledge
              </p>
              
              {user ? (
                <Button 
                  onClick={handleCreateQuiz} 
                  className="mt-4"
                  disabled={createQuizMutation.isPending}
                >
                  {createQuizMutation.isPending ? "Generating..." : "Generate Quiz"}
                </Button>
              ) : (
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/auth">Login to generate quizzes</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Results view
  if (isQuizComplete && showResults) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Quiz Results</CardTitle>
          <CardDescription className="text-center">
            You've completed the quiz!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">
              {finalScore.score} / {finalScore.total}
            </p>
            <p className="text-muted-foreground">
              {finalScore.score === finalScore.total
                ? "Perfect! You got all questions right."
                : finalScore.score > finalScore.total / 2
                ? "Good job! You passed the quiz."
                : "Keep practicing. You'll do better next time."}
            </p>
          </div>
          
          <Progress 
            value={(finalScore.score / finalScore.total) * 100} 
            className="h-3"
          />
          
          <div className="space-y-4 mt-6">
            <h3 className="font-medium">Question Summary:</h3>
            {quizData?.questions.map((question, index) => {
              const userAnswer = userAnswers.find(a => a.questionId === question.id);
              return (
                <div key={question.id} className="flex items-start gap-3">
                  {userAnswer?.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">Q{index + 1}: {question.questionText}</p>
                    <p className="text-sm text-muted-foreground">
                      Your answer: {userAnswer?.userAnswer} 
                      {!userAnswer?.isCorrect && (
                        <span className="text-sm ml-2">
                          (Correct: {question.correctAnswer})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleBackToQuizzes}>
            Back to Quizzes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Quiz view - taking the quiz
  if (isLoadingQuizData || !quizData) {
    return <div className="text-center py-10">Loading quiz...</div>;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{quizData.quiz.title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </span>
        </div>
        <Progress 
          value={((currentQuestionIndex) / quizData.questions.length) * 100} 
          className="h-2 mt-2"
        />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h3>
          
          {currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE && (
            <RadioGroup 
              value={selectedAnswer || ""} 
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div 
                  key={option}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-colors
                    ${isAnswerSubmitted 
                      ? option === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : option === selectedAnswer && option !== currentQuestion.correctAnswer
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-gray-200 dark:border-gray-800'
                      : selectedAnswer === option
                        ? 'border-primary'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }
                  `}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${option}`}
                    disabled={isAnswerSubmitted}
                    className="sr-only"
                  />
                  <Label 
                    htmlFor={`option-${option}`}
                    className="flex items-start cursor-pointer"
                  >
                    <div className="flex-1">{option}</div>
                    {isAnswerSubmitted && option === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 ml-2 shrink-0" />
                    )}
                    {isAnswerSubmitted && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-600 ml-2 shrink-0" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQuestion.questionType === QuestionType.TRUE_FALSE && (
            <RadioGroup 
              value={selectedAnswer || ""} 
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div 
                  key={option}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-colors
                    ${isAnswerSubmitted 
                      ? option === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : option === selectedAnswer && option !== currentQuestion.correctAnswer
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-gray-200 dark:border-gray-800'
                      : selectedAnswer === option
                        ? 'border-primary'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }
                  `}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${option}`}
                    disabled={isAnswerSubmitted}
                    className="sr-only"
                  />
                  <Label 
                    htmlFor={`option-${option}`}
                    className="flex items-start cursor-pointer"
                  >
                    <div className="flex-1">{option}</div>
                    {isAnswerSubmitted && option === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 ml-2 shrink-0" />
                    )}
                    {isAnswerSubmitted && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-600 ml-2 shrink-0" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        
        {isAnswerSubmitted && (
          <div className={`p-4 rounded-lg border ${
            userAnswers[userAnswers.length - 1].isCorrect 
              ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900'
              : 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900'
          }`}>
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {userAnswers[userAnswers.length - 1].isCorrect 
                  ? <CheckCircle2 className="h-5 w-5 text-green-600" /> 
                  : <XCircle className="h-5 w-5 text-red-600" />
                }
              </div>
              <div>
                <p className="font-medium mb-1">
                  {userAnswers[userAnswers.length - 1].isCorrect 
                    ? "Correct!" 
                    : "Incorrect"
                  }
                </p>
                {!showExplanation ? (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm" 
                    onClick={() => setShowExplanation(true)}
                  >
                    Show explanation
                  </Button>
                ) : (
                  <p className="text-sm">{currentQuestion.explanation}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBackToQuizzes}
        >
          Back to Quizzes
        </Button>
        
        {isAnswerSubmitted ? (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < quizData.questions.length - 1 
              ? "Next Question" 
              : "See Results"
            }
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
          >
            Submit Answer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}