import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SeoDomain } from "@/pages/Domains";

interface DomainContextType {
  selectedDomain: SeoDomain | null;
  availableDomains: SeoDomain[];
  setSelectedDomain: (domain: SeoDomain | null) => void;
  refreshDomains: () => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

interface DomainProviderProps {
  children: ReactNode;
}

const DOMAINS_STORAGE_KEY = "seo-domains";

const loadDomains = (): SeoDomain[] => {
  try {
    const stored = localStorage.getItem(DOMAINS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function DomainProvider({ children }: DomainProviderProps) {
  const [selectedDomain, setSelectedDomain] = useState<SeoDomain | null>(null);
  const [availableDomains, setAvailableDomains] = useState<SeoDomain[]>([]);

  const refreshDomains = () => {
    const domains = loadDomains();
    setAvailableDomains(domains);
    
    if (selectedDomain) {
      const updatedSelectedDomain = domains.find(d => d.id === selectedDomain.id);
      setSelectedDomain(updatedSelectedDomain || null);
    } else if (domains.length > 0) {
      setSelectedDomain(domains[0]);
    }
  };

  useEffect(() => {
    refreshDomains();
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DOMAINS_STORAGE_KEY) {
        refreshDomains();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value: DomainContextType = {
    selectedDomain,
    availableDomains,
    setSelectedDomain,
    refreshDomains
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error("useDomain must be used within a DomainProvider");
  }
  return context;
}