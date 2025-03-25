import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, Search, User, BookOpen, Sun, Moon, Award
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    return savedTheme || "light";
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (location === "/auth") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b py-3 px-4 bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="text-primary font-bold text-xl">Ironclad</div>
            </a>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            
            {user ? (
              <Link href="/profile">
                <a>
                  <AvatarWithFallback 
                    src={user.profilePicUrl} 
                    fallback={user.name.substring(0, 2).toUpperCase()} 
                    alt={user.name} 
                  />
                </a>
              </Link>
            ) : (
              <Link href="/auth">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <nav className="border-t py-2 px-4 bg-card">
        <div className="container mx-auto">
          <div className="flex justify-around">
            <Link href="/">
              <a className={`flex flex-col items-center p-2 ${location === "/" ? "text-primary" : ""}`}>
                <Home className="h-6 w-6" />
                <span className="text-xs mt-1">Home</span>
              </a>
            </Link>
            <Link href="/search">
              <a className={`flex flex-col items-center p-2 ${location === "/search" ? "text-primary" : ""}`}>
                <Search className="h-6 w-6" />
                <span className="text-xs mt-1">Search</span>
              </a>
            </Link>
            <Link href="/achievements">
              <a className={`flex flex-col items-center p-2 ${location === "/achievements" ? "text-primary" : ""}`}>
                <Award className="h-6 w-6" />
                <span className="text-xs mt-1">Achievements</span>
              </a>
            </Link>
            <Link href={user ? "/profile" : "/auth"}>
              <a className={`flex flex-col items-center p-2 ${location === "/profile" ? "text-primary" : ""}`}>
                <User className="h-6 w-6" />
                <span className="text-xs mt-1">Profile</span>
              </a>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
