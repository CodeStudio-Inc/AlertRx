"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { PatientSummaryCard } from "@/components/shared/patient-summary-card";

interface PatientSearchResult {
  _id: string;
  name: string;
  patientId: string;
  phone: string;
  email?: string;
  adherenceScore: number;
  activeMedications: number;
  unresolvedAlerts: number;
  lastActivity?: string;
}

interface PatientSearchProps {
  onSelect?: (patient: PatientSearchResult) => void;
  placeholder?: string;
}

export function PatientSearch({
  onSelect,
  placeholder = "Search by name, phone, or patient ID…",
}: PatientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(
      `/api/patients/search?q=${encodeURIComponent(debouncedQuery.trim())}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setResults(data.patients ?? []);
          setHasSearched(true);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          className="pl-9"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {hasSearched && results.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
          <UserX className="h-8 w-8 opacity-50" />
          <p className="text-sm">No patients found for &quot;{debouncedQuery}&quot;</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((patient) => (
            <div
              key={patient._id}
              className={onSelect ? "cursor-pointer" : undefined}
              onClick={() => onSelect?.(patient)}
            >
              <PatientSummaryCard
                id={patient._id}
                name={patient.name}
                patientId={patient.patientId}
                phone={patient.phone}
                email={patient.email}
                adherenceScore={patient.adherenceScore}
                activeMedications={patient.activeMedications}
                unresolvedAlerts={patient.unresolvedAlerts}
                lastActivity={patient.lastActivity}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
