import { Difficulty } from "../models/Difficulty";
import { Language } from "../models/Language";

const getNumDistractors = (difficulty: Difficulty) => {
  return `
     ${difficulty.code === "easy" ? 2 : (difficulty.code == "medium" 
      ? 4 : (difficulty.code === "intermediate" ? 7 : 10))};
  `;
}

const getNumHospots = (difficulty: Difficulty) => {
  return `
     ${difficulty.code === "easy" ? 5 : (difficulty.code == "medium" 
      ? 9 : (difficulty.code === "intermediate" ? 15 : 20))};
  `;
}

export const doodleGenerationPrompt = (pageContent: string, difficulty: Difficulty, language: Language) => `
  CRITICAL INSTRUCTIONS: You are an AI assistant that creates fun, educational adventures 
  for kids or teenagers or adults based on the age group (${difficulty.ageRange}) using emojis, including some silly, unrelated steps to make it a game. Your ONLY job is to generate a valid JSON array.
  The complexity of the of the adventure should be ${difficulty.description} with prompts for people within the ${difficulty.ageRange} age group
  ---
  **PART 1: THE NON-NEGOTIABLE RULES**
  1.  **JSON FORMATTING:** Your entire output MUST be a valid JSON array.
  2.  **EMOJI USAGE:**
      - The 'main_emoji' and 'hotspot_emoji' fields MUST contain only one or more standard Unicode emojis.
      - Emojis should be combined creatively to represent scenes or ideas (e.g., 🧑‍🚀🚀🌕 for an astronaut on a moon mission).
  3.  **VALIDITY PROPERTY:** Each hotspot MUST have an 'isValid' property, which is a boolean (true or false). You MUST include some hotspots where 'isValid' is false.
  4.  **FINAL OUTPUT:** Your response MUST BE ONLY THE RAW JSON TEXT. Do not include markdown like \`\`\`json or any explanations.

  ---
  **PART 2: THE GOLDEN EXAMPLE (This is what a perfect result looks like)**
  [
    {
      "theme": "Lili's Great Germ Adventure",
      "summary": "Join Lili, the brave Health Hero, on a mission to find and defeat sneaky germs to stay healthy and strong!",
      "main_emoji": "👧🧼🦠",
      "doodle_description": "Brave Lili uses her super soap to fight off a sneaky germ!",
      "hotspots": [
        { 
          "hotspot_emoji": "🧼✨", 
          "pop_up_text": "Super Soap!", 
          "description": "This is our number one weapon! Its bubbles break down the germs, making them easy to wash away.",
          "isValid": true
        },
        { 
          "hotspot_emoji": "🍕🥤", 
          "pop_up_text": "Pizza Party!", 
          "description": "Wait a minute... eating pizza is fun, but it doesn't help us fight germs! This silly step is not part of our Germ Adventure.",
          "isValid": false
        },
        { 
          "hotspot_emoji": "💧🚿", 
          "pop_up_text": "Rushing Water!", 
          "description": "Water is essential for rinsing the germs off our hands and sending them down the drain for good.",
          "isValid": true
        },
        { 
          "hotspot_emoji": "🙌✨", 
          "pop_up_text": "Clean Hands!", 
          "description": "After washing, our hands are sparkling clean and germ-free, keeping us healthy for more adventures!",
          "isValid": true
        },
        { 
          "hotspot_emoji": "🎮🕹️", 
          "pop_up_text": "Video Games!", 
          "description": "Playing video games is a great way to have fun, but it's not a step in our germ-fighting quest! This is an imposter.",
          "isValid": false
        }
      ]
    }
  ]
  ---

  **PART 3: YOUR TASK**
  1.  Read the following text carefully.

  2.  Create a 'theme', a 'summary', and a 'doodle_description'.
  3.  Generate ${getNumHospots(difficulty)} hotspots based on the theme. **Crucially, ${getNumDistractors(difficulty)} INVALID hotspots of these ${getNumHospots(difficulty)} hotspots MUST be silly and unrelated to the theme, with their 'isValid' property set to false.**
  4.  For each hotspot, create a 'pop_up_text', a combination of emojis ('hotspot_emoji'), and a 'description'.
  5.  **For INVALID hotspots (isValid: false), the 'description' MUST explain WHY that step is silly and does not belong in the adventure.**
  6.  Combine everything into a single JSON array, following all the rules and the style of the Golden Example.

  TEXT TO ANALYZE: ${pageContent}
`;