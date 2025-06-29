
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  RefreshCw, 
  Sparkles,
  User,
  MessageSquare,
  Calendar,
  Star,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Review, SummaryAnalysis, ReviewData } from '@/types/review';

const getRatingColor = (rating: string) => {
  const num = parseInt(rating, 10);
  if (isNaN(num)) return 'bg-gray-500';
  if (num >= 4.5) return 'bg-green-600';
  if (num >= 4) return 'bg-green-500';
  if (num >= 3.5) return 'bg-yellow-500';
  if (num >= 3) return 'bg-orange-500';
  return 'bg-red-500';
};

const Results = () => {
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'reviews'>('summary');
  const [expandedReview, setExpandedReview] = useState<number | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('reviewData');
    if (savedData) {
      setReviewData(JSON.parse(savedData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const toggleReview = (id: number) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  const handleCopyFeedback = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownloadResults = () => {
    if (!reviewData) return;

    const { category, originalContent, reviews, summary } = reviewData;
    
    let content = `AI Review Summary - ${category}
`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Add summary
    content += `OVERALL RATING: ${summary.overallRating}/5\n\n`;
    
    content += `STRENGTHS:\n${summary.strengths.map(s => `• ${s}`).join('\n')}\n\n`;
    content += `AREAS FOR IMPROVEMENT:\n${summary.improvements.map(i => `• ${i}`).join('\n')}\n\n`;
    content += `RECOMMENDATIONS:\n${summary.recommendations.map(r => `• ${r}`).join('\n')}\n\n`;
    content += `FINAL THOUGHTS:\n${summary.finalThoughts}\n\n`;
    
    // Add individual reviews
    content += `--- INDIVIDUAL REVIEWS ---\n\n`;
    
    reviews.forEach(review => {
      content += `${review.persona.name} (${review.persona.role})\n`;
      content += `Rating: ${review.analysis.rating}/5\n\n`;
      content += `Strengths:\n${review.analysis.strengths.map(s => `• ${s}`).join('\n')}\n\n`;
      content += `Improvements:\n${review.analysis.improvements.map(i => `• ${i}`).join('\n')}\n\n`;
      content += `Suggestions:\n${review.analysis.suggestions.map(s => `• ${s}`).join('\n')}\n\n`;
      content += `Overall: ${review.analysis.overall}\n\n`;
      content += '―'.repeat(50) + '\n\n';
    });

    // Add original content
    content += `\n--- ORIGINAL CONTENT ---\n\n${originalContent}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-review-${category.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Results downloaded successfully!');
  };

  if (!reviewData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const { category, originalContent, reviews, summary } = reviewData;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-purple-600 hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="space-x-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={handleDownloadResults}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with Reviewers */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Reviewers</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {reviews.length} AI reviewers analyzed your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reviews.map((review) => (
                    <div 
                      key={review.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${expandedReview === review.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleReview(review.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                          {review.persona.avatarEmoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{review.persona.name}</p>
                          <p className="text-xs text-gray-500 truncate">{review.persona.role}</p>
                        </div>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getRatingColor(review.analysis.rating)}`}>
                          {review.analysis.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'summary' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'reviews' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Individual Reviews
              </button>
            </div>

            {/* Summary Tab */}
            {activeTab === 'summary' && summary ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Summary Analysis</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCopyFeedback(JSON.stringify(summary, null, 2))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overall Rating */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <h3 className="font-semibold">Overall Rating</h3>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">{summary.overallRating}</span>
                        <span className="ml-1 text-gray-500">/ 5</span>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold">Key Strengths</h3>
                      </div>
                      <ul className="space-y-2 pl-7">
                        {summary.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">Areas for Improvement</h3>
                      </div>
                      <ul className="space-y-2 pl-7">
                        {summary.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start">
                            <Lightbulb className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-purple-500" />
                        <h3 className="font-semibold">Recommendations</h3>
                      </div>
                      <ul className="space-y-2 pl-7">
                        {summary.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Final Thoughts */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-cyan-500" />
                        <h3 className="font-semibold">Final Thoughts</h3>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">{summary.finalThoughts}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                            {review.persona.avatarEmoji}
                          </div>
                          <div>
                            <h3 className="font-semibold">{review.persona.name}</h3>
                            <p className="text-sm text-gray-500">{review.persona.role}</p>
                          </div>
                        </div>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getRatingColor(review.analysis.rating)}`}>
                          {review.analysis.rating}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Strengths */}
                        {review.analysis.strengths.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-700 flex items-center mb-2">
                              <ThumbsUp className="h-4 w-4 mr-1.5" />
                              Strengths
                            </h4>
                            <ul className="space-y-1.5 pl-6">
                              {review.analysis.strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm text-gray-700">
                                  • {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Improvements */}
                        {review.analysis.improvements.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-blue-700 flex items-center mb-2">
                              <TrendingUp className="h-4 w-4 mr-1.5" />
                              Areas for Improvement
                            </h4>
                            <ul className="space-y-1.5 pl-6">
                              {review.analysis.improvements.map((improvement, idx) => (
                                <li key={idx} className="text-sm text-gray-700">
                                  • {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestions */}
                        {review.analysis.suggestions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-purple-700 flex items-center mb-2">
                              <Lightbulb className="h-4 w-4 mr-1.5" />
                              Suggestions
                            </h4>
                            <ul className="space-y-1.5 pl-6">
                              {review.analysis.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="text-sm text-gray-700">
                                  • {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Overall Impression */}
                        <div>
                          <h4 className="text-sm font-medium text-cyan-700 flex items-center mb-2">
                            <MessageSquare className="h-4 w-4 mr-1.5" />
                            Overall Impression
                          </h4>
                          <p className="text-sm text-gray-700 pl-6">
                            {review.analysis.overall}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleCopyFeedback(JSON.stringify(review.analysis, null, 2))}
                      >
                        <Copy className="h-3 w-3 mr-1.5" />
                        Copy Feedback
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button
            onClick={() => navigate(`/review/${reviewData.category}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New Review
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="text-white border-slate-600 hover:bg-white/10 px-8 py-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Choose Different Category
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
