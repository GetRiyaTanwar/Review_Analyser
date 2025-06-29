import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, MessageSquare, Loader2, FileText, X, Info, Menu } from 'lucide-react';
import { toast } from 'sonner';
import type { PersonaConfig, Persona, Review, SummaryAnalysis, FilePart } from '@/types/review';
import { 
  initializeGoogleAI, 
  generatePersonas, 
  generateAnalysis, 
  generateSummaryAnalysis,
  fileToGenerativePart
} from '@/utils/googleAiService';
import { ContentInput } from '@/components/review/ContentInput';
import { ApiKeyInput } from '@/components/review/ApiKeyInput';
import { PersonaConfiguration } from '@/components/review/PersonaConfiguration';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SidebarDashboard from '@/components/ui/SidebarDashboard';

const ReviewPage = () => {
  const { category = 'content' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [content, setContent] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [personaConfig, setPersonaConfig] = useState<PersonaConfig>({
    count: 5,
    country: 'Global'
  });
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<FilePart | null>(null);
  const [generatedPersonas, setGeneratedPersonas] = useState<Persona[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<SummaryAnalysis | null>(null);
  const [personasGenerated, setPersonasGenerated] = useState(false);
  const [reviewsCompleted, setReviewsCompleted] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('google_ai_studio_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      initializeGoogleAI(savedApiKey);
    }
  }, []);

  const categoryTitles: Record<string, string> = {
    'thesis': 'Thesis/Dissertation Review',
    'sop': 'Statement of Purpose Review',
    'assignment': 'Assignment Help',
    'resume': 'Resume/CV Review',
    'cover-letter': 'Cover Letter Review',
    'proposal': 'Client Proposal Review',
    'linkedin': 'LinkedIn Post Review',
    'instagram': 'Instagram Content Review',
    'youtube': 'YouTube Script Review',
    'product-design': 'Product Design Review',
    'brand-logo': 'Brand/Logo Review',
    'product-description': 'Product Description Review',
    'journal': 'Journal Entry Review',
    'habit-goals': 'Habit & Goals Review',
    'poetry': 'Poetry Review',
    'music-lyrics': 'Music Lyrics Review',
    'design-critique': 'Design Critique',
    'policy': 'Policy Review',
    'contract': 'Contract Review',
    'startup-pitch': 'Startup Pitch Review',
    'hackathon': 'Hackathon Project Review'
  };

  const generatePersonasHandler = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Google AI Studio API key');
      return;
    }

    // Initialize Google AI with the API key
    try {
      initializeGoogleAI(apiKey);
      localStorage.setItem('google_ai_studio_api_key', apiKey);
    } catch (error: any) {
      toast.error('Failed to initialize Google AI: ' + error.message);
      return;
    }

    setIsLoadingPersonas(true);
    setGeneratedPersonas([]);
    setPersonasGenerated(false);
    setReviews([]);
    setSummary(null);

    try {
      const categoryContext = category?.replace('-', ' ') || 'general content';
      const personas = await generatePersonas(categoryContext, personaConfig.count, personaConfig.country);
      setGeneratedPersonas(personas);
      setPersonasGenerated(true);
      toast.success(`Generated ${personas.length} unique reviewer personas!`);
    } catch (error: any) {
      console.error('Error generating personas:', error);
      toast.error(`Failed to generate personas: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoadingPersonas(false);
    }
  };

  const generateReviews = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Google AI Studio API key');
      return;
    }

    if (!content.trim() && !uploadedFile) {
      toast.error('Please enter some content or upload a file to review');
      return;
    }

    if (generatedPersonas.length === 0) {
      toast.error('Please generate personas first');
      return;
    }

    setIsLoadingReviews(true);
    setReviews([]);
    setSummary(null);
    setReviewsCompleted(0);

    try {
      // Initialize Google AI with the API key if not already done
      try {
        initializeGoogleAI(apiKey);
      } catch (error: any) {
        toast.error('Failed to initialize Google AI: ' + error.message);
        return;
      }

      const reviewsList: Review[] = [];
      const categoryContext = category?.replace('-', ' ') || 'content';

      // Process reviews one by one to show progress
      for (const persona of generatedPersonas) {
        try {
          const files = [];
          if (uploadedFile) {
            try {
              const filePart = await fileToGenerativePart(uploadedFile);
              files.push(filePart);
            } catch (error) {
              console.error('Error processing file:', error);
              toast.error('Error processing file. Please try again.');
              continue;
            }
          }

          const analysis = await generateAnalysis(content, persona, categoryContext, files);
          
          const review: Review = {
            id: persona.id,
            persona: {
              id: persona.id,
              name: persona.name,
              role: persona.role,
              avatarEmoji: persona.avatarEmoji || '👤',
              background: persona.background,
              expertise: persona.expertise,
              reviewStyle: persona.reviewStyle,
              personality: persona.personality
            },
            analysis: {
              rating: analysis.rating || 'N/A',
              strengths: analysis.strengths || [],
              improvements: analysis.improvements || [],
              suggestions: analysis.suggestions || [],
              overall: analysis.overall || 'No overall feedback provided.'
            }
          };

          reviewsList.push(review);
          setReviews([...reviewsList]);
          setReviewsCompleted(reviewsList.length);
        } catch (error: any) {
          console.error(`Error generating review for ${persona.name}:`, error);
          toast.error(`Skipped review for ${persona.name}: ${error?.message || 'Unknown error'}`);
        }
      }

      if (reviewsList.length > 0) {
        // Generate summary analysis
        try {
          const summary = await generateSummaryAnalysis(reviewsList, categoryContext);
          setSummary(summary);
          setShowResults(true);
        } catch (error: any) {
          console.error('Error generating summary:', error);
          toast.error('Reviews generated, but could not create summary: ' + (error?.message || 'Unknown error'));
        }
      } else {
        toast.error('No reviews were generated. Please try again.');
      }
    } catch (error: any) {
      console.error('Error in review generation process:', error);
      toast.error(`Failed to generate reviews: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setUploadedFile(null);
      setFilePreview(null);
      return;
    }

    setUploadedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          mimeType: file.type,
          data: (e.target?.result as string)?.split(',')[1] || ''
        });
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast.error('Failed to process image file');
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setFilePreview({
        mimeType: 'application/pdf',
        data: file.name
      });
    }
  };

  // Reset personas when configuration changes
  useEffect(() => {
    if (personaConfig.count > 0 && personasGenerated) {
      setPersonasGenerated(false);
      setGeneratedPersonas([]);
      setReviews([]);
      setSummary(null);
    }
  }, [personaConfig.count, personaConfig.country, category]);

  // Helper to generate a conversational intro for persona
  const getPersonaIntro = (persona: Persona) => {
    if (!persona) return '';
    // If personality is already a conversational intro, use it
    if (persona.personality && persona.personality.length > 30 && persona.personality.match(/I am|I'm|My name|Hi|Hello/)) {
      return persona.personality;
    }
    // Otherwise, generate a simple intro
    return `Hi, I'm ${persona.name}, a ${persona.role.toLowerCase()} from our diverse review team. ${persona.personality}`;
  };

  // PersonaModal for details
  const PersonaModal = ({ open, onOpenChange, persona }: { open: boolean, onOpenChange: (v: boolean) => void, persona: Persona | null }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {persona && (
          <>
            <DialogHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <span className="text-white text-2xl">{persona.avatarEmoji}</span>
                </div>
                <div>
                  <DialogTitle className="text-xl text-purple-900">{persona.name}</DialogTitle>
                  <div className="text-sm text-purple-700">{persona.role}</div>
                </div>
              </div>
            </DialogHeader>
            <DialogDescription>
              <div className="mb-3 text-purple-900 font-medium">{getPersonaIntro(persona)}</div>
              <div className="mb-2 text-purple-800"><span className="font-semibold">Expertise:</span> {persona.expertise}</div>
              <div className="mb-2 text-purple-700"><span className="font-semibold">Background:</span> {persona.background}</div>
              <div className="text-xs text-purple-500 mb-2">Review Style: {persona.reviewStyle}</div>
            </DialogDescription>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  // Sidebar categories (should match SidebarDashboard)
  const categories = [
    { id: 'academic', name: 'Academic & Research', icon: '🔬' },
    { id: 'professional', name: 'Professional', icon: '💼' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'ecommerce', name: 'E-Commerce', icon: '🛍️' },
    { id: 'personal', name: 'Personal Dev', icon: '🧠' },
    { id: 'creative', name: 'Creative Work', icon: '🎨' },
    { id: 'legal', name: 'Legal & Policy', icon: '⚖️' },
    { id: 'community', name: 'Community', icon: '👥' }
  ];

  // Find the current category id for sidebar selection
  const getCategoryId = () => {
    // Map route param to sidebar category id
    if (['thesis', 'sop', 'assignment'].includes(category)) return 'academic';
    if (['resume', 'cover-letter', 'proposal'].includes(category)) return 'professional';
    if (['linkedin', 'instagram', 'youtube'].includes(category)) return 'social';
    if (['product-design', 'brand-logo', 'product-description'].includes(category)) return 'ecommerce';
    if (['journal', 'habit-goals'].includes(category)) return 'personal';
    if (['poetry', 'music-lyrics', 'design-critique'].includes(category)) return 'creative';
    if (['policy', 'contract'].includes(category)) return 'legal';
    if (['startup-pitch', 'hackathon'].includes(category)) return 'community';
    return 'academic';
  };

  const handleCategorySelect = (catId: string) => {
    // Find a default use case for the category
    const defaultMap: Record<string, string> = {
      academic: 'thesis',
      professional: 'resume',
      social: 'linkedin',
      ecommerce: 'product-design',
      personal: 'journal',
      creative: 'poetry',
      legal: 'policy',
      community: 'startup-pitch',
    };
    const defaultReview = defaultMap[catId] || 'thesis';
    navigate(`/review/${defaultReview}`);
    setSidebarOpen(false);
  };

  // Use cases for sidebar subcategories
  const useCases = [
    { id: 'thesis', title: 'Thesis Review', category: 'academic', icon: '📄' },
    { id: 'sop', title: 'SOP Review', category: 'academic', icon: '📝' },
    { id: 'assignment', title: 'Assignment Help', category: 'academic', icon: '📚' },
    { id: 'resume', title: 'Resume Review', category: 'professional', icon: '📄' },
    { id: 'cover-letter', title: 'Cover Letter', category: 'professional', icon: '✉️' },
    { id: 'proposal', title: 'Client Proposal', category: 'professional', icon: '📑' },
    { id: 'linkedin', title: 'LinkedIn Post', category: 'social', icon: '🔗' },
    { id: 'instagram', title: 'Instagram Content', category: 'social', icon: '📸' },
    { id: 'youtube', title: 'YouTube Script', category: 'social', icon: '🎬' },
    { id: 'product-design', title: 'Product Design', category: 'ecommerce', icon: '📦' },
    { id: 'brand-logo', title: 'Brand Review', category: 'ecommerce', icon: '🏷️' },
    { id: 'product-description', title: 'Product Copy', category: 'ecommerce', icon: '🛒' },
    { id: 'journal', title: 'Journal Review', category: 'personal', icon: '📔' },
    { id: 'habit-goals', title: 'Habit Feedback', category: 'personal', icon: '✅' },
    { id: 'poetry', title: 'Poetry Review', category: 'creative', icon: '🖋️' },
    { id: 'music-lyrics', title: 'Music Lyrics', category: 'creative', icon: '🎵' },
    { id: 'design-critique', title: 'Design Critique', category: 'creative', icon: '🎨' },
    { id: 'policy', title: 'Policy Review', category: 'legal', icon: '📜' },
    { id: 'contract', title: 'Contract Review', category: 'legal', icon: '📃' },
    { id: 'startup-pitch', title: 'Startup Pitch', category: 'community', icon: '🚀' },
    { id: 'hackathon', title: 'Hackathon Project', category: 'community', icon: '💡' }
  ];

  return (
    <div className="min-h-screen app-main-bg flex" style={{ background: '#1a1a1a', color: '#f5f5f5' }}>
      {/* Sidebar (desktop & mobile) */}
      <div className="hidden md:block">
        <SidebarDashboard
          selectedCategory={getCategoryId()}
          selectedSubcategory={category}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={(id) => { navigate(`/review/${id}`); setSidebarOpen(false); }}
          useCases={useCases}
        />
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 z-50 md:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ height: '100vh' }}>
        <SidebarDashboard
          selectedCategory={getCategoryId()}
          selectedSubcategory={category}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={(id) => { navigate(`/review/${id}`); setSidebarOpen(false); }}
          useCases={useCases}
          onClose={() => setSidebarOpen(false)}
          showClose
        />
      </div>
      {/* Main content */}
      <div className="flex-1 min-h-screen" style={{ marginLeft: '0', marginTop: 0, marginRight: 0, marginBottom: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4 md:ml-64 pt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="text-white hover:bg-purple-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Homepage
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 cursor-pointer">
                  <Info className="w-6 h-6 text-purple-300 hover:text-purple-400" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-[#232323] text-[#f5f5f5] border border-[#404040] max-w-xs">
                <div className="font-semibold mb-1">How it works</div>
                <ul className="text-xs list-disc pl-4">
                  <li>Enter your API key to enable AI features</li>
                  <li>Add your content or upload a file</li>
                  <li>Configure and generate personas</li>
                  <li>Get detailed, multi-perspective feedback</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[700px]">
            <div className="lg:col-span-2 space-y-6 h-full flex flex-col">
              <div className="glass rounded-xl p-6 flex-1" style={{ background: '#2a2a2a', color: '#f5f5f5' }}>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {categoryTitles[category] || 'Content Review'}
                </h1>
                <p className="text-purple-200 mb-6">
                  Get AI-powered feedback from diverse perspectives
                </p>
                <ApiKeyInput
                  apiKey={apiKey}
                  onApiKeyChange={(apiKey) => setApiKey(apiKey)}
                />
                <div className="mb-8">
                  <ContentInput 
                    content={content}
                    onContentChange={setContent}
                    onFileChange={handleFileChange}
                    uploadedFile={uploadedFile}
                    category={category}
                  />
                </div>
                {uploadedFile && (
                  <div className="flex items-center justify-between p-3 rounded-lg border mb-6" style={{ background: '#404040', color: '#f5f5f5', borderColor: '#404040' }}>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-purple-400 mr-2" />
                      <span className="text-sm text-purple-100">{uploadedFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        setFilePreview(null);
                      }}
                      className="text-purple-300 hover:text-white hover:bg-purple-800/50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="mt-8">
                  <Button
                    onClick={generateReviews}
                    disabled={isLoadingReviews || !content.trim() || generatedPersonas.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-lg font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                  >
                    {isLoadingReviews ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Reviews...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Reviews
                      </>
                    )}
                  </Button>
                  {isLoadingReviews && (
                    <div className="flex flex-col items-center mt-6">
                      <div className="text-purple-200 text-sm mb-2">Generating reviews… ({reviewsCompleted}/{personaConfig.count} loaded)</div>
                      <div className="w-full bg-[#232323] rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${Math.round((reviewsCompleted / personaConfig.count) * 100)}%`,
                            background: 'linear-gradient(90deg, #ff6b35 0%, #ff7849 100%)',
                            transition: 'width 0.3s'
                          }}
                        />
                      </div>
                      <div className="text-xs text-purple-300 mt-1">{Math.round((reviewsCompleted / personaConfig.count) * 100)}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6 h-full flex flex-col">
              <PersonaConfiguration 
                config={personaConfig}
                onConfigChange={setPersonaConfig}
                onGeneratePersonas={generatePersonasHandler}
                isLoading={isLoadingPersonas}
                personasGenerated={personasGenerated}
              />
              {generatedPersonas.length > 0 && (
                <>
                  <PersonaModal open={personaModalOpen} onOpenChange={setPersonaModalOpen} persona={selectedPersona} />
                  <div className="glass rounded-xl p-6 flex-1 overflow-y-auto" style={{ background: '#2a2a2a', color: '#f5f5f5', maxHeight: '500px' }}>
                    <h3 className="text-lg font-semibold text-white mb-4">Generated Personas</h3>
                    <div className="space-y-3">
                      {generatedPersonas.map((persona) => (
                        <div 
                          key={persona.id} 
                          className="bg-purple-900/30 backdrop-blur-sm p-4 rounded-lg border border-purple-800/50 hover:border-purple-600/50 transition-colors cursor-pointer" 
                          style={{ background: '#404040', color: '#f5f5f5' }}
                          onClick={() => {
                            setSelectedPersona(persona);
                            setPersonaModalOpen(true);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                <span className="text-white text-lg">{persona.avatarEmoji}</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white truncate">{persona.name}</h4>
                              <p className="text-sm text-purple-200 truncate">{persona.role}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {showResults && (
            <div className="mt-8 bg-purple-900/30 p-6 rounded-lg" style={{ background: '#2a2a2a', color: '#f5f5f5' }}>
              <h2 className="text-2xl font-bold text-white mb-6">Analysis Results</h2>
              {summary && (
                <div className="mb-10 rounded-lg shadow" style={{ background: '#2a2a2a' }}>
                  <h3 className="text-lg font-semibold" style={{ color: '#f5f5f5' }}>Summary Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-lg shadow" style={{ background: '#1a1a1a', padding: '1.5rem' }}>
                      <h4 className="text-sm font-medium" style={{ color: '#10b981' }}>Overall Rating</h4>
                      <p className="text-3xl font-bold" style={{ color: '#f5f5f5' }}>
                        {typeof summary.overallRating === 'string' ? summary.overallRating.split('/')[0] : summary.overallRating}
                      </p>
                    </div>
                    <div className="rounded-lg shadow" style={{ background: '#1a1a1a', padding: '1.5rem' }}>
                      <h4 className="text-sm font-medium" style={{ color: '#10b981' }}>Key Insights</h4>
                      <p style={{ color: '#a0a0a0' }}>{summary.keyInsights}</p>
                    </div>
                    <div className="rounded-lg shadow" style={{ background: '#1a1a1a', padding: '1.5rem' }}>
                      <h4 className="text-sm font-medium" style={{ color: '#f59e0b' }}>Final Thoughts</h4>
                      <p style={{ color: '#a0a0a0' }}>{summary.finalThoughts}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium" style={{ color: '#10b981' }}>Common Strengths</h4>
                      <ul className="space-y-2">
                        {summary.commonStrengths.map((strength, i) => (
                          <li key={i} className="flex items-start">
                            <span style={{ color: '#10b981' }} className="mr-2">✓</span>
                            <span style={{ color: '#a0a0a0' }}>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium" style={{ color: '#f59e0b' }}>Suggested Improvements</h4>
                      <ul className="space-y-2">
                        {summary.suggestedImprovements.map((improvement, i) => (
                          <li key={i} className="flex items-start">
                            <span style={{ color: '#f59e0b' }} className="mr-2">•</span>
                            <span style={{ color: '#a0a0a0' }}>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {isLoadingReviews ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 text-purple-500 animate-spin mb-4" />
                  <p className="text-purple-200 text-lg font-semibold">Generating reviews…</p>
                </div>
              ) : reviews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
                  {reviews.map((review) => {
                    // Truncate the review text to the last full sentence within 200 chars
                    const maxLen = 200;
                    let shortReview = review.analysis.overall;
                    if (shortReview.length > maxLen) {
                      // Find the last period before maxLen
                      const truncated = shortReview.slice(0, maxLen);
                      const lastPeriod = truncated.lastIndexOf('.');
                      if (lastPeriod !== -1 && lastPeriod > 50) {
                        shortReview = truncated.slice(0, lastPeriod + 1).trim();
                      } else {
                        shortReview = truncated.trim();
                      }
                      shortReview += ' ...';
                    }
                    // Parse rating as float, remove /5
                    let ratingNum = review.analysis.rating;
                    if (typeof ratingNum === 'string' && ratingNum.includes('/')) {
                      ratingNum = ratingNum.split('/')[0];
                    }
                    return (
                      <div
                        key={review.id}
                        className="relative rounded-xl shadow-lg p-6 flex flex-col cursor-pointer transform transition-transform duration-200 hover:scale-101 hover:shadow-xl animate-floating"
                        style={{ animationDelay: `${(review.id % 3) * 0.2}s`, background: '#232323', color: '#f5f5f5', border: '1px solid #404040' }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: '#ff7849' }}>
                            <span className="text-white text-lg">{review.persona.avatarEmoji}</span>
                          </div>
                          <div>
                            <h4 className="font-medium" style={{ color: '#ff7849' }}>{review.persona.name}</h4>
                            <p className="text-xs" style={{ color: '#ff7849', opacity: 0.8 }}>{review.persona.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < (parseFloat(ratingNum) || 0)
                                  ? 'font-bold mr-1'
                                  : 'font-bold mr-1'
                              }
                              style={{ color: i < (parseFloat(ratingNum) || 0) ? '#10b981' : '#404040' }}
                            >
                              ●
                            </span>
                          ))}
                          <span className="ml-2 text-sm font-semibold" style={{ color: '#f5f5f5' }}>{ratingNum}</span>
                        </div>
                        <div className="mb-3 italic text-base border-l-4 pl-4 py-2" style={{ background: '#262626', borderColor: '#ff7849', color: '#f5f5f5' }}>
                          &quot;{shortReview}&quot;
                          <div className="mt-2 text-xs text-right" style={{ color: '#ff7849' }}>— {review.persona.name}</div>
                        </div>
                        <div className="mt-auto pt-2 border-t text-xs" style={{ borderColor: '#404040', color: '#a0a0a0' }}>
                          <span className="font-semibold" style={{ color: '#ff7849' }}>About:</span> {review.persona.background}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
