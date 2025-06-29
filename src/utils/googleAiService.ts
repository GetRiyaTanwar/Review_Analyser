import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { Persona } from '../types/review';

// Rate limiting variables
let lastRequestTime = 0;
const REQUEST_DELAY = 1000; // 1 second between requests

export interface FilePart {
  mimeType: string;
  data: string; // base64 encoded string
}

let genAI: GoogleGenerativeAI | null = null;
let personaModel: GenerativeModel | null = null;
let analysisModel: GenerativeModel | null = null;

export const initializeGoogleAI = (apiKey: string) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  
  // Initialize models
  personaModel = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 4000,
    },
  });

  analysisModel = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 4000,
    },
  });
};

const COUNTRY_CONTEXT: Record<string, string> = {
  'United States': 'American',
  'United Kingdom': 'British',
  'Canada': 'Canadian',
  'Australia': 'Australian',
  'India': 'Indian',
  'Japan': 'Japanese',
  'Germany': 'German',
  'France': 'French',
  'Brazil': 'Brazilian',
  'Nigeria': 'Nigerian',
  'South Africa': 'South African',
  'China': 'Chinese',
  'South Korea': 'Korean',
  'Mexico': 'Mexican',
  'Russia': 'Russian',
  'Netherlands': 'Dutch',
  'Sweden': 'Swedish',
  'Switzerland': 'Swiss',
  'Singapore': 'Singaporean',
  'New Zealand': 'New Zealander'
};

// Category-specific prompts with detailed context
export const CATEGORY_PROMPTS: Record<string, string> = {
  'thesis': 'Generate exactly {count} diverse academic reviewer personas from {country} specializing in thesis and dissertation review. Each persona should have distinct academic backgrounds, research methodologies, and expertise areas relevant to {country} higher education standards. Include professors, research supervisors, and academic professionals with varying levels of experience in thesis evaluation within {country} academic culture.',
  
  'sop': 'Create exactly {count} professional reviewer personas from {country} specializing in Statement of Purpose evaluation. Each persona should have distinct backgrounds in admissions, academic advising, or career counseling within {country} education system. Include admissions officers, academic advisors, and career counselors with experience in {country} university admissions processes and cultural expectations.',
  
  'assignment': 'Develop exactly {count} educational expert personas from {country} specializing in assignment review and academic writing. Each persona should have distinct teaching backgrounds, subject expertise, and grading experience within {country} education system. Include teachers, professors, and educational consultants with experience in {country} academic standards and assessment criteria.',
  
  'resume': 'Design exactly {count} HR and recruitment professional personas from {country} specializing in resume and CV review. Each persona should have distinct backgrounds in human resources, recruitment, or career development within {country} job market. Include HR managers, recruiters, and career coaches with experience in {country} hiring practices and professional standards.',
  
  'cover-letter': 'Generate exactly {count} professional reviewer personas from {country} specializing in cover letter evaluation. Each persona should have distinct backgrounds in hiring, communications, or career development within {country} professional environment. Include hiring managers, communication specialists, and career advisors with experience in {country} job application processes.',
  
  'proposal': 'Create exactly {count} business professional personas from {country} specializing in client proposal review. Each persona should have distinct backgrounds in business development, project management, or consulting within {country} business environment. Include business consultants, project managers, and executives with experience in {country} business practices and proposal evaluation.',
  
  'linkedin': 'Develop exactly {count} social media and professional networking expert personas from {country} specializing in LinkedIn content review. Each persona should have distinct backgrounds in digital marketing, professional networking, or social media strategy within {country} professional landscape. Include social media managers, networking specialists, and digital marketers with experience in {country} professional networking culture.',
  
  'instagram': 'Design exactly {count} social media and content creation expert personas from {country} specializing in Instagram content review. Each persona should have distinct backgrounds in social media marketing, content creation, or digital branding within {country} social media landscape. Include content creators, social media managers, and digital marketers with experience in {country} social media trends and audience preferences.',
  
  'youtube': 'Generate exactly {count} video content and scriptwriting expert personas from {country} specializing in YouTube script review. Each persona should have distinct backgrounds in video production, scriptwriting, or content strategy within {country} digital content landscape. Include video producers, scriptwriters, and content strategists with experience in {country} video content trends and audience engagement.',
  
  'product-design': 'Create exactly {count} design and product development expert personas from {country} specializing in product design review. Each persona should have distinct backgrounds in industrial design, UX/UI design, or product development within {country} design industry. Include product designers, UX researchers, and design consultants with experience in {country} design standards and user preferences.',
  
  'brand-logo': 'Develop exactly {count} branding and visual design expert personas from {country} specializing in brand and logo review. Each persona should have distinct backgrounds in graphic design, branding, or marketing within {country} creative industry. Include brand strategists, graphic designers, and marketing professionals with experience in {country} branding trends and visual communication.',
  
  'product-description': 'Design exactly {count} marketing and copywriting expert personas from {country} specializing in product description review. Each persona should have distinct backgrounds in copywriting, marketing, or e-commerce within {country} business environment. Include copywriters, marketing specialists, and e-commerce professionals with experience in {country} consumer behavior and marketing practices.',
  
  'journal': 'Generate exactly {count} writing and personal development expert personas from {country} specializing in journal entry review. Each persona should have distinct backgrounds in creative writing, psychology, or personal development within {country} cultural context. Include writing coaches, therapists, and personal development experts with experience in {country} writing traditions and self-expression.',
  
  'habit-goals': 'Create exactly {count} personal development and productivity expert personas from {country} specializing in habit and goal setting review. Each persona should have distinct backgrounds in psychology, coaching, or productivity within {country} personal development landscape. Include life coaches, psychologists, and productivity experts with experience in {country} goal-setting practices and habit formation.',
  
  'poetry': 'Develop exactly {count} literary and creative writing expert personas from {country} specializing in poetry review. Each persona should have distinct backgrounds in literature, creative writing, or poetry within {country} literary tradition. Include poets, literary critics, and creative writing instructors with experience in {country} poetic forms and literary culture.',
  
  'music-lyrics': 'Design exactly {count} music and songwriting expert personas from {country} specializing in music lyrics review. Each persona should have distinct backgrounds in music production, songwriting, or music criticism within {country} music industry. Include songwriters, music producers, and music critics with experience in {country} musical traditions and lyrical expression.',
  
  'design-critique': 'Generate exactly {count} design and creative professional personas from {country} specializing in design critique. Each persona should have distinct backgrounds in various design disciplines within {country} creative industry. Include designers, art directors, and creative professionals with experience in {country} design standards and creative processes.',
  
  'policy': 'Create exactly {count} policy and governance expert personas from {country} specializing in policy review. Each persona should have distinct backgrounds in public policy, government, or policy analysis within {country} governance system. Include policy analysts, government officials, and governance experts with experience in {country} policy-making processes and regulatory frameworks.',
  
  'contract': 'Develop exactly {count} legal and business expert personas from {country} specializing in contract review. Each persona should have distinct backgrounds in law, business, or contract management within {country} legal system. Include lawyers, contract managers, and business consultants with experience in {country} legal practices and business regulations.',
  
  'startup-pitch': 'Design exactly {count} entrepreneurship and investment expert personas from {country} specializing in startup pitch review. Each persona should have distinct backgrounds in entrepreneurship, venture capital, or business development within {country} startup ecosystem. Include investors, entrepreneurs, and business mentors with experience in {country} startup culture and investment criteria.',
  
  'hackathon': 'Generate exactly {count} technology and innovation expert personas from {country} specializing in hackathon project review. Each persona should have distinct backgrounds in technology, innovation, or project development within {country} tech ecosystem. Include tech professionals, innovation consultants, and project managers with experience in {country} technology trends and project evaluation.',
  
  'default': 'Generate exactly {count} diverse and realistic reviewer personas from {country}. Each persona should be unique with distinct backgrounds and perspectives that reflect the diversity of {country}. Include a variety of professional backgrounds, experience levels, and perspectives that are representative of {country} society.'
};

// Tone variations for automatic mixing
const TONE_VARIATIONS = [
  'supportive and encouraging',
  'constructive and analytical',
  'critical and thorough',
  'balanced and objective',
  'enthusiastic and positive',
  'detailed and methodical',
  'creative and innovative',
  'practical and solution-oriented',
  'empathic and understanding',
  'direct and straightforward'
];

// Helper function to enforce rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generatePersonas(
  category: string = 'content', 
  count: number = 5,
  country: string = 'United States'
): Promise<Persona[]> {
  // Ensure count is between 1 and 20
  count = Math.max(1, Math.min(20, count));
  
  // Get country context (e.g., 'American' for 'United States')
  const countryContext = COUNTRY_CONTEXT[country] || country;
  if (!personaModel) {
    throw new Error('Google AI not initialized');
  }
  
  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await delay(REQUEST_DELAY - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  try {
    const categoryKey = category.toLowerCase();
    const categoryPrompt = (CATEGORY_PROMPTS[categoryKey] || CATEGORY_PROMPTS['default'])
      .replace('{count}', count.toString())
      .replace('{category}', category)
      .replace('{country}', country);
      
    const prompt = `You are creating ${count} distinct reviewer personas from ${country} for ${category} review. ${categoryPrompt}

IMPORTANT REQUIREMENTS:
1. Generate EXACTLY ${count} personas, no more, no less.
2. All personas MUST be from ${country} and reflect ${countryContext} culture and context.
3. Each persona should have a different tone and review style from this list: ${TONE_VARIATIONS.join(', ')}.
4. Include cultural, linguistic, and professional aspects specific to ${country}.
5. Each persona should have unique expertise relevant to ${category} in the ${country} context.

For each persona, provide these details:
1. Name: A realistic ${countryContext} name
2. Role/Title: Their professional role related to ${category}
3. Expertise: Specific to ${category} in the ${country} context
4. Background: Brief background including their connection to ${country}
5. Personality: How their ${countryContext} background influences their review style
6. Review Style: How they approach ${category} reviews (use different tones from the list)
7. Avatar: An emoji that represents them

Format your response as a valid JSON array of objects with these exact properties:
[
  {
    "name": "Full Name (${countryContext} name)",
    "role": "Their professional role in ${category}",
    "expertise": "Their specific expertise in ${category} (${country} context)",
    "background": "Brief background including their connection to ${country}",
    "personality": "Their personality traits and how they approach reviews",
    "reviewStyle": "How they conduct ${category} reviews (with specific tone)",
    "avatarEmoji": "👤"
  }
]

IMPORTANT: Ensure all personas are culturally appropriate and representative of ${country}. Each persona should have a different tone and approach to reviews.`;

    const result = await personaModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [null, text];
      const jsonString = jsonMatch[1] || text;
      const parsed = JSON.parse(jsonString);
      
      // Ensure we have the expected properties
      return parsed.map((p: any, index: number) => ({
        id: index + 1,
        name: p.name || `Reviewer ${index + 1}`,
        role: p.role || 'Content Reviewer',
        expertise: p.expertise || `Expertise in ${category}`,
        background: p.background || `${countryContext} professional`,
        personality: p.personality || 'Professional and thorough',
        reviewStyle: p.reviewStyle || 'Balanced feedback',
        ratingStyle: p.ratingStyle || 'out of 5',
        avatarEmoji: p.avatarEmoji || '👤'
      }));
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.log('Raw response:', text);
      throw new Error('Failed to parse personas. The response was not in the expected format.');
    }
  } catch (error: any) {
    console.error('Error generating personas:', error);
    throw new Error(`Failed to generate personas: ${error.message}`);
  }
};

export const generateAnalysis = async (
  content: string,
  persona: any,
  category: string,
  files: FilePart[] = []
) => {
  if (!analysisModel) {
    throw new Error('Google AI not initialized. Call initializeGoogleAI first.');
  }

  try {
    // Prepare the content parts for the API
    const parts = [];
    
    // Create category-specific prompt
    const categorySpecificPrompt = `You are ${persona.name}, a ${persona.role} with expertise in ${persona.expertise}.
    Your background: ${persona.background}
    Your personality: ${persona.personality}
    Your review style: ${persona.reviewStyle}
    
    You are reviewing ${category} content. This is a specialized area that requires specific knowledge and criteria.
    
    Please provide a detailed analysis of the following ${category} content, considering:
    1. Category-specific criteria for ${category}
    2. Professional standards in your field
    3. Cultural context and appropriateness
    4. Technical accuracy and quality
    5. Overall effectiveness for the intended purpose
    
    Provide your analysis in this format:
    1. A rating (out of 5)
    2. Key strengths (at least 3, specific to ${category})
    3. Areas for improvement (at least 3, specific to ${category})
    4. Specific suggestions (at least 3, actionable for ${category})
    5. Overall impression (detailed analysis considering ${category} requirements)`;
    
    // Add the main prompt
    parts.push({
      text: categorySpecificPrompt
    });
    
    // Add file content if provided
    for (const file of files) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      });
    }
    
    // Add text content if provided
    if (content.trim()) {
      parts.push({
        text: `Here is the text content to analyze:
        ${content}`
      });
    }
    
    // Add the response format instructions
    const formatInstructions = `
    
    Format your response as a JSON object with these exact properties:
    {
      "rating": "your rating (e.g., 4/5 or 3.5/5)",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "improvements": ["area 1", "area 2", "area 3"],
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
      "overall": "your overall impression (2-3 detailed paragraphs specific to ${category})"
    }`;
    
    parts.push({ text: formatInstructions });
    
    // Generate content with retry logic
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const result = await analysisModel.generateContent({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });
        
        const response = await result.response;
        let responseText = response.text();
        
        try {
          // Clean up the response text
          responseText = responseText.trim();
          
          // Remove markdown code block markers if present
          if (responseText.startsWith('```json')) {
            responseText = responseText.substring(responseText.indexOf('\n') + 1);
            responseText = responseText.substring(0, responseText.lastIndexOf('```')).trim();
          } else if (responseText.startsWith('```')) {
            responseText = responseText.substring(3, responseText.length - 3).trim();
          }
          
          // Parse the JSON response
          const parsedResponse = JSON.parse(responseText);
          
          // Validate the response has required fields
          if (!parsedResponse.rating || !parsedResponse.overall) {
            throw new Error('Invalid response format from model');
          }
          
          return parsedResponse;
        } catch (e) {
          console.error('Error parsing analysis response:', e);
          console.log('Raw response:', responseText);
          throw new Error('The response was not in the expected format. Please try again.');
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${4 - retries} failed:`, error);
        retries--;
        
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // If we get here, all retries failed
    console.error('All retries failed:', lastError);
    throw lastError || new Error('Failed to generate analysis after multiple attempts');
  } catch (error: any) {
    console.error('Error generating analysis:', error);
    throw new Error(`Failed to generate analysis: ${error.message}`);
  }
};

export const generateSummaryAnalysis = async (reviews: any[], category: string) => {
  if (!analysisModel) {
    throw new Error('Google AI not initialized. Call initializeGoogleAI first.');
  }

  try {
    const prompt = `Analyze these ${category} reviews and provide a comprehensive summary:
    
    ${reviews.map((r, i) => `Reviewer ${i + 1} (${r.persona.name} - ${r.persona.role}):\n${JSON.stringify(r.analysis, null, 2)}`).join('\n\n')}
    
    Generate a summary that includes:
    1. Overall rating distribution
    2. Common strengths mentioned (specific to ${category})
    3. Common areas for improvement (specific to ${category})
    4. Key recommendations (specific to ${category})
    5. Final thoughts on the ${category} quality
    
    Format your response as a JSON object with these properties:
    {
      "overallRating": "X/Y",
      "keyInsights": "Key insights about the ${category}",
      "commonStrengths": ["strength 1", "strength 2", ...],
      "suggestedImprovements": ["improvement 1", "improvement 2", ...],
      "finalThoughts": "your final thoughts on the ${category}"
    }`;

    const result = await analysisModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [null, text];
      const jsonString = jsonMatch[1] || text;
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing summary:', e);
      console.log('Raw response:', text);
      return {
        overallRating: 'N/A',
        keyInsights: `Analysis of ${category}`,
        commonStrengths: [],
        suggestedImprovements: [],
        finalThoughts: text
      };
    }
  } catch (error: any) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

// Enhanced file processing with better text extraction
export async function fileToGenerativePart(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    // Handle different file types with appropriate processing
    if (file.type.startsWith('image/')) {
      // For images, we'll use the vision model to extract text
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          if (!result) {
            throw new Error('Failed to read file data');
          }
          
          // Extract base64 data (remove data URL prefix)
          const base64Data = result.split(',')[1];
          if (!base64Data) {
            throw new Error('Failed to extract base64 data from file');
          }
          
          resolve({
            mimeType: file.type,
            data: base64Data
          });
        } catch (error) {
          console.error('Error processing image file:', error);
          reject(error instanceof Error ? error : new Error('Failed to process image file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Error reading image file: ${file.name}`));
      };
      
      reader.readAsDataURL(file);
    } 
    else if (file.type === 'application/pdf') {
      // For PDFs, we'll use the vision model to extract text
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          if (!result) {
            throw new Error('Failed to read file data');
          }
          
          // Extract base64 data (remove data URL prefix)
          const base64Data = result.split(',')[1];
          if (!base64Data) {
            throw new Error('Failed to extract base64 data from file');
          }
          
          resolve({
            mimeType: file.type,
            data: base64Data
          });
        } catch (error) {
          console.error('Error processing PDF file:', error);
          reject(error instanceof Error ? error : new Error('Failed to process PDF file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Error reading PDF file: ${file.name}`));
      };
      
      reader.readAsDataURL(file);
    }
    // Handle text-based files (doc, docx, txt)
    else if (file.type === 'text/plain' || 
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             file.type === 'application/msword' ||
             file.name.endsWith('.doc') || 
             file.name.endsWith('.docx') || 
             file.name.endsWith('.txt')) {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const text = reader.result as string;
          if (typeof text !== 'string') {
            throw new Error('Failed to read text content');
          }
          
          // Convert text to base64
          const base64Data = btoa(unescape(encodeURIComponent(text)));
          
          resolve({
            mimeType: 'text/plain',
            data: base64Data
          });
        } catch (error) {
          console.error('Error processing text file:', error);
          reject(error instanceof Error ? error : new Error('Failed to process text file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error(`Error reading text file: ${file.name}`));
      };
      
      reader.readAsText(file);
    }
    else {
      reject(new Error(`Unsupported file type: ${file.type}`));
    }
  });
}
