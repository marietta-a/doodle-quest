import { AdventurePayload } from "../models/Payloads";
import { doodleGenerationPrompt } from "./PrompExamples";

export interface Hotspot {
  hotspot_doodle_svg: string; 
  pop_up_text: string;
  description: string;
  isValid: boolean;
}

export interface DoodleScene {
  summary:string;
  theme: string;
  main_doodle_svg: string; 
  doodle_description: string;
  hotspots: Hotspot[];
}

const doodleQuestSchema = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "theme": {"type": "string"},
      "summary": {"type": "string"},
      "main_doodle_svg": { "type": "string" },
      "doodle_description": { "type": "string" },
      "hotspots": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "hotspot_doodle_svg": { "type": "string" },
            "pop_up_text": { "type": "string" },
            "description": {"type": "string"},
            "isValid": {"type": "boolean"}
          },
          "required": ["hotspot_doodle_svg", "pop_up_text"]
        }
      }
    },
    "required": ["theme", "main_doodle_svg", "doodle_description", "hotspots"]
  }
};

export async function generateDoodleAdventure({pageContent, progressCallback, language, difficulty}: AdventurePayload): Promise<DoodleScene[]> {
  // @ts-ignore
  if (!self.LanguageModel) {
    throw new Error("Your browser does not support the LanguageModel API.");
  }
  
  try {
    // @ts-ignore
    const availability = await self.LanguageModel.availability();
    if (availability === 'unavailable') {
      throw new Error("The AI model is unavailable.");
    }

    // @ts-ignore
    const session = await self.LanguageModel.create({ 
      modelId: 'gemini-nano',
      expectedInputs: [ { type: "text", languages: ["en", "en"] }, { type: "image" } ],
      expectedOutputs: [ { type: "text", languages: [language.code] } ],
      monitor(m: any) {
        m.addEventListener('downloadprogress', (e: any) => {
          const progress = e.loaded ? Math.round(e.loaded * 100) : 0;
          progressCallback(progress);
        });
      },
    });



    const jsonResponse = await session.prompt(
      doodleGenerationPrompt(`"""${pageContent.substring(0, 4000)}"""`, difficulty, language),
      { responseConstraint: doodleQuestSchema }
    );
    
    const cleanedJson = jsonResponse.trim();
    const adventureData: DoodleScene[] = JSON.parse(cleanedJson);

    
    session.destroy();
    return adventureData;

  } catch (error) {
    console.error("Error in AI pipeline:", error);
    throw new Error("The AI had trouble drawing the adventure. Please try again!");
  }
}