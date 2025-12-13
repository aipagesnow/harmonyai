import { analyzeMessage } from "../aiService";

// Mock the GoogleGenerativeAI class
jest.mock("@google/generative-ai", () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockResolvedValue({
                    response: {
                        text: () => JSON.stringify({
                            sentimentScore: -0.8,
                            frictionDetected: true,
                            reasoning: "Test reasoning"
                        })
                    }
                })
            })
        }))
    };
});

describe("AI Service", () => {
    it("should analyze a message and return sentiment", async () => {
        process.env.GEMINI_API_KEY = "test";
        const result = await analyzeMessage("I hate this project, it's a disaster.");

        expect(result).toBeDefined();
        expect(result.sentimentScore).toBe(-0.8);
        expect(result.frictionDetected).toBe(true);
    });

    it("should handle missing API key gracefully", async () => {
        delete process.env.GEMINI_API_KEY;
        const result = await analyzeMessage("Hello");
        expect(result.sentimentScore).toBe(0);
    });
});
