import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Users, Globe, Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { PersonaConfig } from '@/types/review';

interface PersonaConfigurationProps {
  config: PersonaConfig;
  onConfigChange: (config: PersonaConfig) => void;
  onGeneratePersonas: () => void;
  isLoading: boolean;
  personasGenerated: boolean;
}

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Japan', 'South Korea', 'India', 'China', 'Brazil', 
  'Netherlands', 'Sweden', 'Switzerland', 'Singapore', 'New Zealand'
];

export const PersonaConfiguration = ({
  config,
  onConfigChange,
  onGeneratePersonas,
  isLoading,
  personasGenerated
}: PersonaConfigurationProps) => {
  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 border border-purple-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-400" />
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            Persona Configuration
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-3">
          <Label className="text-purple-200 text-sm font-medium flex items-center">
            <Globe className="h-4 w-4 mr-2 text-purple-400" />
            Country/Region
          </Label>
          <Select
            value={config.country}
            onValueChange={(value) => onConfigChange({ ...config, country: value })}
          >
            <SelectTrigger className="bg-purple-900/30 border border-purple-800/50 text-white hover:border-purple-600/50 focus:ring-1 focus:ring-purple-500/30">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent className="bg-purple-900 border border-purple-800/50">
              {countries.map((country) => (
                <SelectItem 
                  key={country} 
                  value={country}
                  className="hover:bg-purple-800/50 focus:bg-purple-800/50 text-purple-100"
                >
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-purple-800/30" />

        {/* Number of Personas */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-purple-200 text-sm font-medium">
              Number of Personas
            </Label>
            <span className="text-purple-300 font-medium">{config.count}</span>
          </div>
          <Slider
            value={[config.count]}
            onValueChange={(value) => onConfigChange({ ...config, count: value[0] })}
            max={20}
            min={1}
            step={1}
            className="w-full [&>span:first-child]:h-2 [&>span:first-child]:bg-purple-900/50 [&>span:first-child_span]:bg-gradient-to-r from-purple-500 to-violet-500"
          />
          <div className="flex justify-between text-xs text-purple-400/80">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <Separator className="bg-purple-800/30" />

        {/* Info about automatic tone mixing */}
        <div className="bg-purple-800/20 p-4 rounded-lg border border-purple-700/30">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">🎭</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Automatic Tone Mixing</h4>
              <p className="text-sm text-purple-200 mt-1">
                Each persona will have a unique review style and tone automatically assigned for diverse feedback.
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-purple-800/30" />

        {/* Generate Button */}
        <Button
          onClick={onGeneratePersonas}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6 text-base font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Personas...
            </>
          ) : personasGenerated ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
              <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                Personas Ready
              </span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              Generate Personas
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
