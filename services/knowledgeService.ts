import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KnowledgeResource, ResourceType } from "../types";
import { AI_CONFIG } from "../constants";

// Browser-safe API Key initialization
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
if (!apiKey) {
    console.error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const STORAGE_KEY = 'nexus_ai_knowledge_resources';

// Mock DB
let memoryResources: KnowledgeResource[] = [];

// Helper
const safeParseJSON = (text: string | undefined): any => {
    if (!text) return null;
    try {
        // 1. Try parsing raw text first
        try {
            return JSON.parse(text);
        } catch (e) {
            // Continue to cleaning if raw parsing fails
        }

        // 2. Clean markdown code blocks
        let cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        
        // 3. Find the first '{' or '[' and the last '}' or ']' to isolate the JSON object/array
        const firstBrace = cleaned.indexOf('{');
        const firstBracket = cleaned.indexOf('[');
        
        let start = -1;
        let end = -1;

        // Determine if it starts with { or [
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            start = firstBrace;
            end = cleaned.lastIndexOf('}');
        } else if (firstBracket !== -1) {
            start = firstBracket;
            end = cleaned.lastIndexOf(']');
        }

        if (start !== -1 && end !== -1) {
            cleaned = cleaned.substring(start, end + 1);
            return JSON.parse(cleaned);
        }
        
        // Last ditch attempt if simple cleaning failed but it looks like JSON
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("JSON Parse Failed:", text);
        return null;
    }
};

const saveToStorage = (data: KnowledgeResource[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const loadFromStorage = (): KnowledgeResource[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};


// Main Service
export const knowledgeService = {
    getAllResources: async (): Promise<KnowledgeResource[]> => {
        memoryResources = loadFromStorage();
        // Fallback mock data if empty
        if (memoryResources.length === 0) {
             // You can add some initial dummy data here if needed, or leave it empty
        }
        return [...memoryResources];
    },

    addResourceFromUrl: async (url: string): Promise<KnowledgeResource> => {
        // 1. Analyze with Gemini
        let analysis = await analyzeUrlWithGemini(url);
        
        // Handle Array response (some models return array of objects even if asked for object)
        if (Array.isArray(analysis)) {
            // Try to find the most relevant object, usually the one with detailed info
            const detailed = analysis.find((item: any) => item.title && item.summary);
            if (detailed) {
                analysis = detailed;
            } else if (analysis.length > 0) {
                analysis = analysis[0];
            }
        }

        // 2. Construct Resource Object
        const newResource: KnowledgeResource = {
            id: `kr-${Date.now()}`,
            basicInfo: {
                title: analysis.title || "Untitled",
                summary: analysis.summary || "No summary",
                tags: analysis.tags || [],
                level: analysis.difficulty || 'Intermediate',
                contentType: detectTypeFromUrl(url), // Auto-detect
                author: "AI Curator"
            },
            searchOptimization: {
                keywords: analysis.keyPoints || [],
                chapters: analysis.chapters || []
            },
            managementInfo: {
                originalFileUrl: url
            },
            metadata: {
                uploadedAt: Date.now()
            }
        };

        memoryResources.unshift(newResource);
        saveToStorage(memoryResources);
        return newResource;
    },

    addResourceFromFile: async (file: File): Promise<KnowledgeResource> => {
        // 1. Upload & Analyze with Gemini
        const analysis = await analyzeFileWithGemini(file);
        
        // 2. Construct Resource Object
        const newResource: KnowledgeResource = {
            id: `kr-${Date.now()}`,
            basicInfo: {
                title: analysis.title || file.name,
                summary: analysis.summary || "No summary",
                tags: analysis.tags || [],
                level: analysis.difficulty || 'Intermediate',
                contentType: 'VIDEO', // Assuming File upload is mainly video for now based on context
                author: "AI Curator"
            },
            searchOptimization: {
                keywords: analysis.keyPoints || [],
                chapters: analysis.chapters || []
            },
            managementInfo: {
                fileName: file.name,
                fileType: file.type
            },
            metadata: {
                uploadedAt: Date.now(),
                duration: 0 // Would need metadata extraction for real duration
            }
        };

        memoryResources.unshift(newResource);
        saveToStorage(memoryResources);
        return newResource;
    },

    retryResource: async (id: string): Promise<KnowledgeResource> => {
        const target = memoryResources.find(r => r.id === id);
        if (!target) throw new Error("Resource not found");

        // Simple retry logic: re-run analysis based on available info
        let analysis;
        if (target.managementInfo.originalFileUrl) {
            analysis = await analyzeUrlWithGemini(target.managementInfo.originalFileUrl);
             if (Array.isArray(analysis)) {
                const detailed = analysis.find((item: any) => item.title && item.summary);
                analysis = detailed || analysis[0];
            }
        } else {
             // Cannot retry file upload easily without the file object again in browser context
             // For now, just return existing or mock a success
             return target; 
        }

        const updated: KnowledgeResource = {
            ...target,
            basicInfo: {
                ...target.basicInfo,
                title: analysis.title || target.basicInfo.title,
                summary: analysis.summary || target.basicInfo.summary,
                tags: analysis.tags || target.basicInfo.tags,
                level: analysis.difficulty || target.basicInfo.level,
            },
            searchOptimization: {
                 keywords: analysis.keyPoints || target.searchOptimization.keywords,
                 chapters: analysis.chapters || target.searchOptimization.chapters
            }
        };

        const index = memoryResources.findIndex(r => r.id === id);
        memoryResources[index] = updated;
        saveToStorage(memoryResources);
        return updated;
    },

    deleteResource: async (id: string): Promise<void> => {
        memoryResources = memoryResources.filter(r => r.id !== id);
        saveToStorage(memoryResources);
    }
};

// --- Gemini Analysis Helpers ---

function detectTypeFromUrl(url: string): ResourceType {
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo')) {
        return 'VIDEO';
    }
    return 'ARTICLE';
}

async function analyzeUrlWithGemini(url: string): Promise<any> {
    const prompt = `
    Analyze the content of the following URL: ${url}
    
    If it's a video (like YouTube), treat it as video content.
    If it's an article, treat it as text content.

    Return a SINGLE JSON object (not an array) with the following structure (Korean):
    {
        "title": "Exact title of the content",
        "summary": "3-line summary in Korean",
        "tags": ["tag1", "tag2", "tag3"],
        "difficulty": "Beginner" | "Intermediate" | "Advanced",
        "keyPoints": ["Key takeaway 1", "Key takeaway 2"],
        "chapters": [
            { "timestamp": "00:00", "title": "Intro", "summary": "Brief explanation" } 
        ]
    }
    `;

    try {
        // STEP 1: Search Grounding (Get Raw Info)
        // JSON을 강제하지 않고 자연스럽게 정보를 검색하게 합니다.
        const searchResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Research and summarize the content of this URL: ${url}. 
            Focus on title, key takeaways, difficulty level, and chapter timestamps if video. 
            Response in Korean.`,
            config: {
                tools: [{ googleSearch: {} }], 
                // responseMimeType: "application/json"  <-- 제거
            }
        });

        const rawText = searchResponse.text;
        if (!rawText) throw new Error("No search results found.");

        // STEP 2: Formatting (Text to JSON)
        // 검색된 텍스트를 바탕으로 JSON 구조화를 요청합니다. (도구 없음)
        const formatPrompt = `
        Based on the following research, create a structured JSON object.
        
        Research Content:
        ${rawText}

        Output Structure (Korean):
        {
            "title": "Exact title",
            "summary": "3-line summary",
            "tags": ["tag1", "tag2"],
            "difficulty": "Beginner/Intermediate/Advanced",
            "keyPoints": ["Point 1", "Point 2"],
            "chapters": [{"timestamp": "00:00", "title": "Intro"}]
        }
        `;

        const formatResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: formatPrompt,
            config: {
                responseMimeType: "application/json" // 여기서 JSON 강제
            }
        });
        
        const parsed = safeParseJSON(formatResponse.text);
        if (!parsed) throw new Error("Failed to parse formatted JSON");
        return parsed;

    } catch (error) {
        console.error("Gemini URL Analysis Error:", error);
        
        // Fallback: Try without search tool if search grounding fails
        try {
             const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Analyze this URL purely based on string pattern or known info: ${url}. ${prompt}`,
                config: { responseMimeType: "application/json" }
            });
            return safeParseJSON(fallbackResponse.text) || { title: "분석 실패", summary: "데이터를 파싱할 수 없습니다." };
        } catch (e) {
            return { title: "URL 분석 실패", summary: "Gemini API 오류" };
        }
    }
}

async function analyzeFileWithGemini(file: File): Promise<any> {
     try {
        // 1. Upload
        const uploadResponse = await ai.files.upload({
            file: file,
            config: { displayName: file.name, mimeType: file.type }
        });

        // 2. Poll
        let fileStatus = await ai.files.get({ name: uploadResponse.name });
        while (fileStatus.state === 'PROCESSING') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            fileStatus = await ai.files.get({ name: uploadResponse.name });
        }
        if (fileStatus.state === 'FAILED') throw new Error('Video processing failed.');

        // 3. Generate
        const prompt = `
        You are an Expert Knowledge Analyst. Analyze this file.
        Return JSON (Korean):
        {
            "title": "Title",
            "summary": "Summary",
            "tags": [],
            "difficulty": "Beginner/Intermediate/Advanced",
            "keyPoints": [],
            "chapters": [{"timestamp": "00:00", "title": "...", "summary": "..."}]
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                { fileData: { mimeType: fileStatus.mimeType, fileUri: fileStatus.uri } },
                { text: prompt }
            ],
            config: { responseMimeType: "application/json" }
        });

        return safeParseJSON(response.text) || { title: "파일 분석 실패", summary: "결과 없음" };

     } catch (error) {
         console.error("Gemini File Analysis Error:", error);
         throw error;
     }
}
