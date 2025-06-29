import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ContentInputProps {
  content: string;
  onContentChange: (content: string) => void;
  onFileChange: (file: File | null) => void;
  uploadedFile: File | null;
  category?: string;
}

export const ContentInput = ({ 
  content, 
  onContentChange,
  onFileChange,
  uploadedFile, 
  category 
}: ContentInputProps) => {
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onFileChange(null);
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    onFileChange(file);
    console.log('File uploaded:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    if (file.type.startsWith('image/')) {
      toast.info('Image uploaded successfully. The AI will analyze the visual content and extract text.');
    } else if (file.type === 'application/pdf') {
      toast.info('PDF uploaded successfully. The AI will extract and analyze the document content.');
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      toast.info('Text file uploaded successfully. The AI will analyze the content.');
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword' || 
               file.name.endsWith('.doc') || 
               file.name.endsWith('.docx')) {
      toast.info('Document uploaded successfully. The AI will extract and analyze the content.');
    } else {
      toast.info('File uploaded successfully. The AI will process the content.');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 border border-purple-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileText className="h-5 w-5 mr-2 text-purple-400" />
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            Your Content
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={`Enter your ${category?.replace('-', ' ')} content here...`}
          value={content}
          onChange={handleContentChange}
          className="min-h-[300px] bg-purple-900/30 border border-purple-800/50 text-white resize-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
        />
        
        {/* File Upload */}
        <div className="border-2 border-dashed border-purple-700/50 rounded-lg p-6 text-center transition-colors hover:border-purple-600/70">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.bmp,.webp"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex space-x-3">
                <Upload className="h-10 w-10 text-purple-400 p-2 bg-purple-900/30 rounded-lg" />
                <ImageIcon className="h-10 w-10 text-purple-400 p-2 bg-purple-900/30 rounded-lg" />
              </div>
              <p className="text-purple-200 font-medium">
                Upload PDF, DOC, DOCX, TXT, or Image files
              </p>
              <p className="text-sm text-purple-400/80 max-w-md">
                Files will be analyzed by our AI to extract and provide comprehensive feedback
              </p>
              <div className="mt-2 px-4 py-2 bg-purple-800/30 text-purple-200 text-sm rounded-lg border border-purple-700/50 hover:bg-purple-800/50 transition-colors">
                Choose a file
              </div>
            </div>
          </label>
        </div>

        {uploadedFile && (
          <Alert className="bg-purple-900/30 border border-purple-800/50">
            <FileText className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-purple-200">
              File uploaded: <span className="font-medium">{uploadedFile.name}</span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
