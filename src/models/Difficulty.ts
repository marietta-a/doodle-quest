export interface Difficulty{
    code: string;
    description: string;
    ageRange?: string;
}

export const levelDifficulties: Difficulty[] = [
    {
        code: "easy",
        description: "Easy",
        ageRange: "5 to 10"
    },
    {
        code: "medium",
        description: "Medium",
        ageRange: "11 to 19"
    },
    {
        code: "intermediate",
        description: "Intermediate",
        ageRange: "20 to 29"
    },
    {
        code: "hard",
        description: "Hard",
        ageRange: "30+"
    }
]