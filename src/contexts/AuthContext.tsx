"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";

type UserScore = {
  id: number;
  user_id: string;
  user_nick: string;
  score: number;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userScore: UserScore | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  updateScore: (newScore: number) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userScore: null,
  isLoading: true,
  signOut: async () => {},
  isAuthenticated: false,
  updateScore: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Funzione per recuperare il punteggio dell'utente
  const fetchUserScore = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user score:", error);
        return null;
      }

      return data as UserScore | null;
    } catch (err) {
      console.error("Exception fetching user score:", err);
      return null;
    }
  };

  // Utilizziamo un useEffect separato per la gestione degli eventi di autenticazione
  useEffect(() => {
    let mounted = true;

    // Configura il listener per i cambiamenti dello stato di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        
        // Reindirizza dalla login se necessario
        if (window.location.pathname === "/login") {
          router.push("/");
        }
      } else {
        setSession(null);
        setUser(null);
        setUserScore(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Utilizziamo un useEffect separato per il caricamento iniziale della sessione
  useEffect(() => {
    let mounted = true;

    // Funzione non-bloccante per caricare la sessione
    const loadSession = () => {
      supabase.auth.getSession()
        .then(({ data, error }) => {
          if (!mounted) return;
          
          if (error) {
            console.error("Error getting session:", error);
            setIsLoading(false);
            return;
          }
          
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            
            // Carica il punteggio dell'utente in modo non-bloccante
            fetchUserScore(data.session.user.id)
              .then(score => {
                if (mounted) {
                  setUserScore(score);
                }
              })
              .catch(err => {
                console.error("Error loading user score:", err);
              })
              .finally(() => {
                if (mounted) setIsLoading(false);
              });
          } else {
            setIsLoading(false);
          }
        })
        .catch(err => {
          console.error("Unexpected error loading session:", err);
          if (mounted) setIsLoading(false);
        });
    };

    // Carica la sessione in modo non-bloccante
    loadSession();

    return () => {
      mounted = false;
    };
  }, []);
  
  // Utilizziamo un useEffect separato per caricare il punteggio quando l'utente cambia
  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    
    fetchUserScore(user.id)
      .then(score => {
        if (mounted) {
          setUserScore(score);
        }
      })
      .catch(err => {
        console.error("Error loading score after user change:", err);
      });
      
    return () => {
      mounted = false;
    };
  }, [user]);

  // Funzione per effettuare il logout
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setUserScore(null);
      setSession(null);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per aggiornare il punteggio dell'utente
  const updateScore = (newScore: number) => {
    if (!userScore) return;
    setUserScore({ ...userScore, score: newScore });
  };

  // Valori del contesto di autenticazione
  const value = {
    user,
    session,
    userScore,
    isLoading,
    signOut,
    isAuthenticated: !!user,
    updateScore,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
