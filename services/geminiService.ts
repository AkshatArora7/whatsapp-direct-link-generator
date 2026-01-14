
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getWeatherFromLocation = async (lat?: number, lon?: number): Promise<WeatherType> => {
  try {
    const query = lat && lon 
      ? `What is the current weather condition at coordinates ${lat}, ${lon}?`
      : "What is the current weather condition at the user's current location based on their IP?";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${query} Please categorize it into exactly one of these types: CLEAR, SNOW, RAIN, STORM, WIND, CLOUDY. Return ONLY the uppercase category name.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text?.trim().toUpperCase() || "";
    
    if (Object.values(WeatherType).includes(text as WeatherType)) {
      return text as WeatherType;
    }
    
    // Fallback parsing if model returns more than just the word
    if (text.includes('RAIN')) return WeatherType.RAIN;
    if (text.includes('SNOW')) return WeatherType.SNOW;
    if (text.includes('STORM') || text.includes('THUNDER')) return WeatherType.STORM;
    if (text.includes('WIND')) return WeatherType.WIND;
    if (text.includes('CLOUD')) return WeatherType.CLOUDY;
    
    return WeatherType.CLEAR;
  } catch (error) {
    console.error("Error detecting weather:", error);
    return WeatherType.CLEAR;
  }
};

export const generateMessageSuggestions = async (weatherType: string, mood?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 clever, short, and friendly WhatsApp opener messages for a chat link. 
      The current atmospheric vibe is "${weatherType}" and the user's intent/mood is "${mood || 'Friendly'}". 
      The messages should ideally relate to this atmosphere or be very versatile.
      Return the results as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return ["Hey! I found your number and wanted to reach out.", "Hi there! 👋", "Hello! Hope you're having a great day."];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Hello!", "Hey, how's it going?", "Hi! reaching out from your WhatsApp link."];
  }
};
