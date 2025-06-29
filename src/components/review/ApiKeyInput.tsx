
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 border border-purple-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Key className="h-5 w-5 mr-2 text-purple-400" />
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            Google AI Studio Configuration
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <Label htmlFor="api-key" className="text-purple-200 text-sm font-medium">
              Google AI Studio API Key
            </Label>
            <p className="text-xs text-purple-400/80 mb-1.5">
              Required for AI-powered reviews
            </p>
            <Input
              id="api-key"
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              className="bg-purple-900/30 border border-purple-800/50 text-white placeholder-purple-700 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
            />
          </div>
          <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3">
            <p className="text-xs text-purple-300 leading-relaxed">
              Your API key is stored locally and never shared. Get one at{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-200 font-medium hover:text-white hover:underline transition-colors"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
