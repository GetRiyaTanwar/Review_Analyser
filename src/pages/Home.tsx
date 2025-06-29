import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Briefcase, 
  Smartphone, 
  ShoppingCart, 
  Brain, 
  Palette, 
  Scale, 
  Users,
  ChevronRight,
  Sparkles,
  Menu
} from 'lucide-react';
import SidebarDashboard from '@/components/ui/SidebarDashboard';

interface UseCase {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  color: string;
}

const useCases: UseCase[] = [
  // Academic & Research
  { id: 'thesis', title: 'Thesis Review', description: 'Get expert feedback on your dissertation', category: 'academic', icon: GraduationCap, color: 'bg-blue-500' },
  { id: 'sop', title: 'SOP Review', description: 'Perfect your statement of purpose', category: 'academic', icon: GraduationCap, color: 'bg-blue-500' },
  { id: 'assignment', title: 'Assignment Help', description: 'Review essays, reports, and code', category: 'academic', icon: GraduationCap, color: 'bg-blue-500' },
  
  // Professional & Workplace
  { id: 'resume', title: 'Resume Review', description: 'Optimize your CV for better opportunities', category: 'professional', icon: Briefcase, color: 'bg-green-500' },
  { id: 'cover-letter', title: 'Cover Letter', description: 'Craft compelling cover letters', category: 'professional', icon: Briefcase, color: 'bg-green-500' },
  { id: 'proposal', title: 'Client Proposal', description: 'Review business proposals', category: 'professional', icon: Briefcase, color: 'bg-green-500' },
  
  // Social Media
  { id: 'linkedin', title: 'LinkedIn Post', description: 'Enhance your professional posts', category: 'social', icon: Smartphone, color: 'bg-purple-500' },
  { id: 'instagram', title: 'Instagram Content', description: 'Perfect your captions and stories', category: 'social', icon: Smartphone, color: 'bg-purple-500' },
  { id: 'youtube', title: 'YouTube Script', description: 'Improve your video content', category: 'social', icon: Smartphone, color: 'bg-purple-500' },
  
  // E-Commerce
  { id: 'product-design', title: 'Product Design', description: 'Get feedback on your product concepts', category: 'ecommerce', icon: ShoppingCart, color: 'bg-orange-500' },
  { id: 'brand-logo', title: 'Brand Review', description: 'Review logos and slogans', category: 'ecommerce', icon: ShoppingCart, color: 'bg-orange-500' },
  { id: 'product-description', title: 'Product Copy', description: 'Optimize product descriptions', category: 'ecommerce', icon: ShoppingCart, color: 'bg-orange-500' },
  
  // Personal Development
  { id: 'journal', title: 'Journal Review', description: 'Reflect on your thoughts and goals', category: 'personal', icon: Brain, color: 'bg-pink-500' },
  { id: 'habit-goals', title: 'Habit Feedback', description: 'Get support for your goals', category: 'personal', icon: Brain, color: 'bg-pink-500' },
  
  // Creative Work
  { id: 'poetry', title: 'Poetry Review', description: 'Enhance your creative writing', category: 'creative', icon: Palette, color: 'bg-indigo-500' },
  { id: 'music-lyrics', title: 'Music Lyrics', description: 'Perfect your song lyrics', category: 'creative', icon: Palette, color: 'bg-indigo-500' },
  { id: 'design-critique', title: 'Design Critique', description: 'Get feedback on visual designs', category: 'creative', icon: Palette, color: 'bg-indigo-500' },
  
  // Legal & Policy
  { id: 'policy', title: 'Policy Review', description: 'Review policy drafts', category: 'legal', icon: Scale, color: 'bg-red-500' },
  { id: 'contract', title: 'Contract Review', description: 'Identify contract risks', category: 'legal', icon: Scale, color: 'bg-red-500' },
  
  // Community
  { id: 'startup-pitch', title: 'Startup Pitch', description: 'Get investor perspective', category: 'community', icon: Users, color: 'bg-teal-500' },
  { id: 'hackathon', title: 'Hackathon Project', description: 'Review your project ideas', category: 'community', icon: Users, color: 'bg-teal-500' }
];

const categories = [
  { id: 'academic', name: '🔬 Academic & Research', icon: GraduationCap },
  { id: 'professional', name: '💼 Professional', icon: Briefcase },
  { id: 'social', name: '📱 Social Media', icon: Smartphone },
  { id: 'ecommerce', name: '🛍️ E-Commerce', icon: ShoppingCart },
  { id: 'personal', name: '🧠 Personal Dev', icon: Brain },
  { id: 'creative', name: '🎨 Creative Work', icon: Palette },
  { id: 'legal', name: '⚖️ Legal & Policy', icon: Scale },
  { id: 'community', name: '👥 Community', icon: Users }
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('academic');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const filteredUseCases = useCases.filter(useCase => useCase.category === selectedCategory);

  const handleUseCaseClick = (useCaseId: string) => {
    navigate(`/review/${useCaseId}`);
  };

  return (
    <div className="min-h-screen app-main-bg flex" style={{ background: '#1a1a1a', color: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
      {/* Animated bubbles background */}
      <div className="bubbles-bg">
        {[...Array(14)].map((_, i) => (
          <div key={i} className={`bubble bubble-${i+1}`}></div>
        ))}
      </div>
      {/* Sidebar (desktop & mobile) */}
      <div className="hidden md:block">
        <SidebarDashboard
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 z-50 md:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ height: '100vh' }}>
        <SidebarDashboard
          selectedCategory={selectedCategory}
          onCategorySelect={(cat) => { setSelectedCategory(cat); setSidebarOpen(false); }}
          onClose={() => setSidebarOpen(false)}
          showClose
        />
      </div>
      {/* Main content */}
      <div className="flex-1 min-h-screen" style={{ marginLeft: '0', marginTop: 0, marginRight: 0, marginBottom: 0 }}>
        {/* Header */}
        <header className="relative z-10 py-8 flex items-center justify-between px-6 md:ml-64">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">PersonaReview</span>
          </div>
        </header>
        {/* Hero Section */}
        <section className="relative z-10 py-12 px-6 md:ml-64">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Get AI-Powered
              <span className="text-gradient block">Peer Reviews</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 animate-fade-in">
              Receive feedback from multiple AI personas tailored to your content type. 
              Perfect for students, professionals, and creators.
            </p>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full transform hover:scale-105 transition-all animate-scale-in"
              onClick={() => document.getElementById('use-cases')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Review
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
        {/* Use Cases Section */}
        <section id="use-cases" className="relative z-10 py-12 px-6 md:ml-64">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">{categories.find(c => c.id === selectedCategory)?.name || 'Category'}</h2>
              <p className="text-slate-300 text-lg">Select a use case to get started</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUseCases.map((useCase, index) => {
                const IconComponent = useCase.icon;
                return (
                  <Card 
                    key={useCase.id} 
                    className="glass hover:bg-white/10 transition-all duration-300 cursor-pointer group transform hover:scale-105 animate-fade-in border-slate-700"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleUseCaseClick(useCase.id)}
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {useCase.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-3">
                        {useCase.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(cat => cat.id === useCase.category)?.name || useCase.category}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="relative z-10 py-12 mt-20 px-6 md:ml-64">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-white">PersonaReview</span>
            </div>
            <p className="text-slate-400">
              Powered by Google AI Studio • Built for creators, students, and professionals
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
