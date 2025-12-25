"use client";

import { useState, useRef, useCallback } from "react";

interface ExtractedStrategy {
  name: string;
  description: string;
  strategy_prompt: string;
  key_indicators: string[];
  risk_level: "Low" | "Medium" | "High";
  suggested_tickers: string[];
  paper_summary: string;
}

interface PaperUploadProps {
  onStrategyExtracted: (strategy: ExtractedStrategy) => void;
  onError?: (error: string) => void;
}

// Declare PDF.js types
declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (data: { data: ArrayBuffer }) => {
        promise: Promise<{
          numPages: number;
          getPage: (num: number) => Promise<{
            getTextContent: () => Promise<{
              items: Array<{ str: string }>;
            }>;
          }>;
        }>;
      };
      GlobalWorkerOptions: {
        workerSrc: string;
      };
    };
  }
}

export function PaperUpload({ onStrategyExtracted, onError }: PaperUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdfJs = useCallback(async (): Promise<void> => {
    if (window.pdfjsLib) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js"));
      document.head.appendChild(script);
    });
  }, []);

  const extractTextFromPdf = useCallback(async (file: File): Promise<string> => {
    setLoadingStatus("Loading PDF parser...");
    await loadPdfJs();

    setLoadingStatus("Reading PDF file...");
    const arrayBuffer = await file.arrayBuffer();

    setLoadingStatus("Extracting text from PDF...");
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      setLoadingStatus(`Processing page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  }, [loadPdfJs]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);
    setExtractedText(null);

    try {
      let text: string;

      if (file.type === "application/pdf") {
        text = await extractTextFromPdf(file);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        text = await file.text();
      } else {
        throw new Error("Please upload a PDF or TXT file");
      }

      if (text.length < 100) {
        throw new Error("Could not extract enough text from the file. Please try a different file.");
      }

      setExtractedText(text);
      setLoadingStatus("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to read file";
      onError?.(message);
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractStrategy = async () => {
    if (!extractedText) return;

    setIsLoading(true);
    setLoadingStatus("Analyzing paper with AI...");

    try {
      const response = await fetch("/api/papers/extract-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper_text: extractedText,
          model: "claude-sonnet",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to extract strategy");
      }

      onStrategyExtracted(data.data.strategy);
      setLoadingStatus("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract strategy";
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const clearFile = () => {
    setFileName(null);
    setExtractedText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isLoading
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="space-y-3">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-text-secondary">{loadingStatus}</p>
          </div>
        ) : fileName ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-6 h-6 text-profit"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-text-primary font-medium">{fileName}</span>
            </div>
            <p className="text-sm text-text-tertiary">
              {extractedText
                ? `${extractedText.length.toLocaleString()} characters extracted`
                : "Processing..."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <svg
              className="w-12 h-12 mx-auto text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div>
              <p className="text-text-primary font-medium">
                Drop your research paper here
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                or click to browse (PDF or TXT)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions when file is uploaded */}
      {extractedText && !isLoading && (
        <div className="space-y-3">
          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-secondary hover:text-secondary-muted transition-colors"
          >
            {showPreview ? "Hide preview" : "Show text preview"}
          </button>

          {showPreview && (
            <div className="bg-surface-elevated rounded-lg p-4 max-h-48 overflow-y-auto">
              <pre className="text-xs text-text-tertiary whitespace-pre-wrap font-mono">
                {extractedText.slice(0, 2000)}
                {extractedText.length > 2000 && "..."}
              </pre>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleExtractStrategy}
              className="flex-1 px-4 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary-muted transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Extract Strategy with AI
            </button>
            <button
              type="button"
              onClick={clearFile}
              className="px-4 py-3 border border-border text-text-secondary rounded-lg hover:border-border-active hover:text-text-primary transition-colors"
            >
              Clear
            </button>
          </div>

          <p className="text-xs text-text-tertiary text-center">
            This will use 20 credits to analyze the paper
          </p>
        </div>
      )}
    </div>
  );
}
