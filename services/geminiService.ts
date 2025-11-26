import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Task, AIAnalysis, Subtask, Priority, Resource, AcceptanceCriterion, KnowledgeResource, ResourceType } from "../types";
import { AI_CONFIG } from "../constants";
import { PromptTemplates } from "./prompts";

// Browser-safe API Key initialization
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
if (!apiKey) {
    console.error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// JSON 파싱 헬퍼 (AI 응답 안전 처리)
const safeParseJSON = (text: string | undefined): any => {
    if (!text) return null;
    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            return JSON.parse(cleaned.substring(start, end + 1));
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("JSON Parse Failed:", text);
        return null;
    }
};

// Helper for JSON generation to reduce duplication
async function generateJSON<T>(prompt: string, schema: any): Promise<T | null> {
    try {
        const response = await ai.models.generateContent({
            model: AI_CONFIG.MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        if (response.text) {
            return JSON.parse(response.text) as T;
        }
        return null;
    } catch (error) {
        console.error("Gemini JSON Gen Error:", error);
        throw error;
    }
}

/**
 * Drafts 3 versions of professional tasks from a raw user input.
 */
export const draftTaskWithAI = async (rawInput: string): Promise<Partial<Task>[]> => {
  const prompt = PromptTemplates.draftTask(rawInput);

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        priority: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
        product: { type: Type.STRING },
        type: { type: Type.STRING },
        styleTag: { type: Type.STRING }
      }
    }
  };

  const data = await generateJSON<any[]>(prompt, schema);
  
  if (!data || !Array.isArray(data)) throw new Error("Draft generation failed");

  return data.map(item => {
      let priority = Priority.MEDIUM;
      if (item.priority === 'HIGH') priority = Priority.HIGH;
      if (item.priority === 'LOW') priority = Priority.LOW;
      
      return {
          title: item.title,
          description: item.description,
          product: item.product,
          type: item.type,
          priority: priority,
          styleTag: item.styleTag 
      };
  });
};

/**
 * Generates a full AI analysis of a task by running multiple AI functions in parallel.
 */
export const runFullAnalysis = async (task: Task): Promise<AIAnalysis> => {
    const [
        executionPlan,
        acceptanceCriteria,
        solutionDraft,
        learningResources
    ] = await Promise.all([
        generateSubtasksAI(task).catch(e => { console.error("Error generating subtasks:", e); return []; }),
        generateAcceptanceCriteriaAI(task).catch(e => { console.error("Error generating acceptance criteria:", e); return []; }),
        generateSolutionDraftAI(task).catch(e => { console.error("Error generating solution draft:", e); return ""; }),
        recommendResourcesAI(task).catch(e => { console.error("Error recommending resources:", e); return []; })
    ]);

    // Add IDs and completed status to subtasks
    const subtasksWithIds: Subtask[] = executionPlan.map((sub, idx) => ({
        ...sub,
        id: `sub-${Date.now()}-${idx}`,
        completed: false,
    }));

    return {
        executionPlan: subtasksWithIds,
        acceptanceCriteria,
        solutionDraft,
        learningResources,
        lastUpdated: Date.now(),
    };
};


/**
 * Generates a checklist of subtasks.
 */
export const generateSubtasksAI = async (task: Task): Promise<Omit<Subtask, 'id' | 'completed'>[]> => {
  const prompt = PromptTemplates.generateSubtasks(task);

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING }
      }
    }
  };

  const data = await generateJSON<any[]>(prompt, schema);
  return data || [];
};

/**
 * Generates Acceptance Criteria (DoD)
 * Returns structured objects for checklist functionality.
 */
export const generateAcceptanceCriteriaAI = async (task: Task): Promise<AcceptanceCriterion[]> => {
    const prompt = PromptTemplates.generateAcceptanceCriteria(task);
    const schema = {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    };
    const rawData = await generateJSON<string[]>(prompt, schema);
    
    // Map strings to AcceptanceCriterion objects
    if (!rawData) return [];

    return rawData.map((content, idx) => ({
        id: `ac-${Date.now()}-${idx}`,
        content,
        checked: false
    }));
};

/**
 * Generates Solution Draft (Markdown)
 */
export const generateSolutionDraftAI = async (task: Task): Promise<string> => {
    const prompt = PromptTemplates.generateSolutionDraft(task);
    // Use standard generate for markdown output
    const response = await ai.models.generateContent({
        model: AI_CONFIG.MODEL_SMART, // Use smarter model for coding
        contents: prompt
    });
    return response.text || "";
};

/**
 * Generates Recommended Resources
 */
export const recommendResourcesAI = async (task: Task): Promise<Resource[]> => {
    const prompt = PromptTemplates.recommendResources(task);
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                description: { type: Type.STRING }
            }
        }
    };
    const data = await generateJSON<Resource[]>(prompt, schema);
    return data || [];
};


/**
 * Chat with the AI guide about the specific task.
 */
export const chatWithGuide = async (history: {role: string, parts: {text: string}[]}[], message: string, contextTask: Task) => {
    const chat = ai.chats.create({
        model: AI_CONFIG.MODEL_SMART,
        history: [
            {
                role: 'user',
                parts: [{ text: PromptTemplates.chatGuideSystem(contextTask) }]
            },
            {
                role: 'model',
                parts: [{ text: "네, 알겠습니다. 업무 진행을 도와드리겠습니다." }]
            },
            ...history
        ]
    });

    const result = await chat.sendMessage({ message });
    return result.text;
}

/**
 * General purpose streaming chat for Gemini Pro Page with Multimodal support
 */
export const getGeminiChatStream = async (
    history: {role: string, parts: {text?: string, inlineData?: any}[]}[], 
    message: string,
    modelId: string = AI_CONFIG.MODEL_SMART,
    imageBase64?: string,
    imageMimeType?: string
) => {
    const chat = ai.chats.create({
        model: modelId,
        history: [
           {
                role: 'user',
                parts: [{ text: "당신은 Nexus AI 플랫폼의 지능형 어시스턴트 Gemini입니다. 사용자의 업무 생산성을 높이고, 창의적인 아이디어를 제공하며, 친절하고 전문적인 태도로 대화하세요. 한국어로 답변하세요." }]
            },
            {
                role: 'model',
                parts: [{ text: "반갑습니다! Nexus AI Gemini입니다. 무엇을 도와드릴까요?" }]
            },
            ...history
        ]
    });

    // Construct content parts
    const parts: any[] = [];
    if (imageBase64 && imageMimeType) {
        parts.push({
            inlineData: {
                data: imageBase64,
                mimeType: imageMimeType
            }
        });
    }
    if (message) {
        parts.push({ text: message });
    }

    // Use parts structure for multimodal
    return await chat.sendMessageStream({ message: parts });
};

/**
 * Generate weekly insight for dashboard
 */
export const getWeeklyInsight = async (tasks: Task[], teamStats: any): Promise<string> => {
    const prompt = PromptTemplates.generateInsights(tasks, teamStats);
    
    try {
        const response = await ai.models.generateContent({
            model: AI_CONFIG.MODEL_SMART,
            contents: prompt
        });
        return response.text || "인사이트를 생성할 수 없습니다.";
    } catch (error) {
        console.error("Insight Gen Error:", error);
        return "현재 AI 인사이트를 불러올 수 없습니다.";
    }
};

/**
 * 지식 리소스 분석 메인 함수
 * @param input 파일 객체(File) 또는 URL 문자열(string)
 * @param type 리소스 타입 ('VIDEO' | 'ARTICLE' | 'GUIDE')
 */
export const analyzeKnowledgeResource = async (
    input: string | File,
    type: ResourceType
): Promise<Partial<KnowledgeResource>> => {
    try {
        // ---------------------------------------------------------
        // CASE A: 비디오 파일 분석 (Gemini 2.0 Flash or Pro Multimodal)
        // ---------------------------------------------------------
        if (input instanceof File) {
            const file = input;

            // 1. 파일 업로드 (File API)
            const uploadResponse = await ai.files.upload({
                file: file,
                config: {
                    displayName: file.name,
                    mimeType: file.type
                }
            });

            // 2. 처리 대기 (Polling)
            // Note: uploadResponse might be the File object itself in some SDK versions,
            // or contain 'file' property. Based on error, it seems to be the File object.
            let fileStatus = await ai.files.get({ name: uploadResponse.name });
            while (fileStatus.state === 'PROCESSING') {
                await new Promise(resolve => setTimeout(resolve, 2000));
                fileStatus = await ai.files.get({ name: uploadResponse.name });
            }

            if (fileStatus.state === 'FAILED') throw new Error('Video processing failed.');

            // 3. 분석 프롬프트
            const prompt = `
            You are an Expert Knowledge Analyst. Watch/listen to the video and create a structured study card.
            
            Instructions:
            1. Synthesize visual text (OCR) and audio speech.
            2. Extract the most important facts and lessons.
            3. Structure the output in JSON format (Korean).
            `;

            // 4. JSON 스키마 정의
            const schema: Schema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    difficulty: { type: Type.STRING },
                    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                    chapters: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                timestamp: { type: Type.STRING },
                                title: { type: Type.STRING }
                            }
                        }
                    }
                },
                required: ["title", "summary", "tags", "difficulty"]
            };

            // 5. AI 요청 생성
            // Note: 'gemini-2.0-flash' is a good balance for video if available, 
            // or 'gemini-1.5-pro' for better reasoning. 
            // Using a model that supports video input is crucial.
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash', 
                contents: [
                    {
                        fileData: {
                            mimeType: fileStatus.mimeType,
                            fileUri: fileStatus.uri
                        }
                    },
                    { text: prompt }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.2,
                }
            });

            const parsed = safeParseJSON(response.text);
            return parsed || {
                title: file.name,
                summary: "분석 실패",
                tags: [],
                difficulty: "Intermediate"
            };
        }

        // ---------------------------------------------------------
        // CASE B: URL 웹 검색 분석 (Google Search Grounding)
        // ---------------------------------------------------------
        else {
            const url = input as string;
            const prompt = `
            Analyze the content of the following URL (${type}) using Google Search.
            URL: ${url}
            
            Return a JSON object with:
            - title: Exact title
            - summary: 3-line summary in Korean
            - tags: Related keywords
            - difficulty: Beginner/Intermediate/Advanced
            - keyPoints: Main takeaways (Korean)
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    responseMimeType: "application/json" // Try to enforce JSON if model supports it with search
                },
            });

            const parsed = safeParseJSON(response.text);
            
            // If direct JSON mode with tools isn't fully supported by the SDK/Model combo yet, 
            // we might get text that contains JSON. safeParseJSON handles the extraction.
            
            return parsed || {
                title: "URL Analysis Failed",
                summary: "정보 없음",
                tags: [],
                difficulty: "Intermediate"
            };
        }

    } catch (error) {
        console.error("Knowledge Analysis Error:", error);
        throw error;
    }
};
