
import { GoogleGenAI } from "@google/genai";

export const getStudyEncouragement = async (content: string, hours: number) => {
  // 优先从环境变量读取，如果是在 Vite 环境下，通常是 import.meta.env.VITE_API_KEY
  // 这里遵循系统指令，直接使用 process.env.API_KEY
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("未检测到 API_KEY，AI 功能将使用演示模式");
    return "太棒了！继续保持这个学习节奏。";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `我今天学习了 ${hours} 小时，内容是：${content}。作为一个温柔体贴的学习助手，请给我一段50字以内的鼓励话语，并建议一个寒假学习的小贴士。`,
      config: {
        systemInstruction: "你是一个大学生寒假学习助教，说话风格亲切、专业、充满正能量。",
        temperature: 0.7,
      },
    });
    return response.text || "加油！每一份努力都会在春天开花结果。";
  } catch (error) {
    console.error("Gemini API 错误:", error);
    return "加油！坚持就是胜利。";
  }
};
