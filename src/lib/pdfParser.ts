import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PDFParseResult {
  text: string;
  pageCount: number;
  pages: string[];
}

export async function extractTextFromPDF(file: File): Promise<PDFParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const pages: string[] = [];
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Extract text items and join them
    const pageText = textContent.items
      .map((item: unknown) => {
        const textItem = item as { str: string; transform?: number[] };
        return textItem.str;
      })
      .join(' ');
    
    pages.push(pageText);
    fullText += pageText + '\n\n';
  }
  
  return {
    text: fullText,
    pageCount: pdf.numPages,
    pages,
  };
}

export async function extractTextWithPositions(file: File): Promise<{
  text: string;
  lines: { text: string; y: number }[];
}[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const result: { text: string; lines: { text: string; y: number }[] }[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items by y position (same line)
    const lineMap = new Map<number, string[]>();
    
    for (const item of textContent.items) {
      const textItem = item as { str: string; transform: number[] };
      const y = Math.round(textItem.transform[5]); // Y position
      
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y)!.push(textItem.str);
    }
    
    // Sort by Y position (descending, since PDF coordinates start from bottom)
    const sortedLines = Array.from(lineMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([y, texts]) => ({
        text: texts.join(' ').trim(),
        y,
      }))
      .filter(line => line.text.length > 0);
    
    result.push({
      text: sortedLines.map(l => l.text).join('\n'),
      lines: sortedLines,
    });
  }
  
  return result;
}
