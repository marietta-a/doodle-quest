// // src/chrome-ai.d.ts

// // This is a custom type definition file to add the experimental chrome.ai API
// // to the global 'chrome' namespace for TypeScript.

// // Define the structure of the TextSession object returned by createTextSession
// interface AiTextSession {
//   /**
//    * Prompts the model with the given input.
//    * @param input The string prompt to send to the model.
//    * @returns A promise that resolves with the model's response.
//    */
//   prompt(input: string): Promise<string>;

//   /**
//    * Destroys the session and releases its resources.
//    */
//   destroy(): void;
// }

// // Augment the existing 'chrome' namespace
// declare namespace chrome {
//   namespace ai {
//     /**
//      * Checks if the on-device model is available and ready to be used.
//      * @returns A promise that resolves to 'no', 'readily', or 'after-download'.
//      */
//     function canCreateTextSession(): Promise<'no' | 'readily' | 'after-download'>;

//     /**
//      * Creates a new text session for interacting with the on-device model.
//      * @returns A promise that resolves with a TextSession object.
//      */
//     function createTextSession(): Promise<AiTextSession>;
//   }
// }

// This file provides TypeScript definitions for the experimental window.ai API.


type LanguageModelAvailability = 'available' | 'downloading' | 'unavailable';

interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}

// interface LanguageModel {
//   availability(): Promise<LanguageModelAvailability>;
//   params(): Promise<{
//     defaultTopK: number;
//     maxTopK: number;
//     defaultTemperature: number;
//     maxTemperature: number;
//   }>;
//   create(options?: {
//     monitor?: (monitor: EventTarget) => void;
//     temperature?: number;
//     topK?: number;
//     signal?: AbortSignal;
//     initialPrompts?: { role: string; content: string }[];
//   }): Promise<TextSession>;
// }

interface TextSession {
  prompt(prompt: string | { role: string; content: string }[], options?: {
    signal?: AbortSignal;
    responseConstraint?: any; // JSON Schema
    omitResponseConstraintInput?: boolean;
  }): Promise<string>;
  promptStreaming(prompt: string | { role: string; content: string }[], options?: {
    signal?: AbortSignal;
  }): ReadableStream<string>;
  destroy(): void;
  inputUsage: number;
  inputQuota: number;
  clone(options?: { signal?: AbortSignal }): Promise<TextSession>;
}

declare global {
  interface Window {
    ai?: {
      LanguageModel?: LanguageModel;
    };
  }
}