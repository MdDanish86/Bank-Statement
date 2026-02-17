
import { GoogleGenAI, Part } from "@google/genai";

// Fix: Directly use process.env.API_KEY and remove manual check per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Moved the prompt into a systemInstruction for better structure.
const systemInstruction = `
You are an expert AI financial document parser. 
If a document/image is provided, first perform OCR to extract all text.
Then, from the extracted text (or the text provided directly), your sole task is to extract transaction details and return ONLY a clean table in CSV format.

The OCR text may be noisy, have broken formatting, and include irrelevant information like headers, footers, page numbers, and balance summaries. You MUST ignore everything that is not a clear transaction row.

Extract the transactions and format them into a CSV with the following columns precisely: date,description,amount,category,notes

Follow these rules strictly:
1.  **date**: Extract the transaction date. Attempt to convert it to YYYY-MM-DD format. If the format is ambiguous or cannot be converted, return the date as it appears in the text.
2.  **description**: Extract and clean the merchant name or transaction description. Remove any excess whitespace or non-essential special characters.
3.  **amount**: Extract only the numeric value. Debits (money spent, withdrawals) MUST be represented as negative numbers. Credits (money received, deposits, salary) MUST be represented as positive numbers. Remove all currency symbols (e.g., $, £, ₹) and commas.
4.  **category**: Infer a category from the transaction description. Use the following examples as a guide:
    - Swiggy, Zomato, Restaurant -> Food
    - Amazon, Flipkart, Myntra, Shopping Mall -> Shopping
    - ATM WITHDRAWAL -> Cash
    - UPI, IMPS, NEFT, To [Name] -> Transfer
    - SALARY CREDIT, SALARY -> Income
    - Rent payment -> Housing
    - ELECTRICITY, GAS BILL, UTILITY -> Utilities
    - UBER, OLA, Cab -> Transport
    - For any other unrecognized merchant or transaction, use 'Other'.
5.  **notes**: Add a brief, helpful note only if there's extra context in the OCR text (like a transaction ID or reference number). Otherwise, leave this column blank.

Your output MUST meet these requirements:
- Return ONLY the CSV formatted data.
- The first line MUST be the header row: date,description,amount,category,notes
- Do NOT include any explanations, markdown formatting (like \`\`\`csv), commentary, or any text before or after the CSV data.
- If you cannot find any valid transactions in the text, return only the header row: date,description,amount,category,notes
`;

export async function parseTransactions(
  ocrText: string,
  file?: { mimeType: string; data: string }
): Promise<string> {
  try {
    const parts: Part[] = [];
    if (file) {
      parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
      // A minimal text part is good practice for multimodal requests.
      parts.push({ text: "Parse the transactions from this document." });
    } else {
      parts.push({ text: ocrText });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: parts },
      config: {
        systemInstruction,
      },
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("Received an empty response from the AI.");
    }
    
    // Clean up potential markdown code fences
    const cleanedText = text.replace(/^```csv\n|```$/g, '').trim();

    // Validate if the response starts with the expected header
    if (!cleanedText.toLowerCase().startsWith('date,description,amount,category,notes')) {
        console.warn("AI response did not start with the expected CSV header.");
        // If it looks like a valid CSV but without a header, prepend one.
        if (cleanedText.split(',').length >= 3) {
            return `date,description,amount,category,notes\n${cleanedText}`;
        }
        throw new Error("AI response was not in the expected CSV format.");
    }

    return cleanedText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to parse transactions. The AI model may be temporarily unavailable.");
  }
}
