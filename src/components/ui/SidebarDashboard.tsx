import React from 'react';
import { X } from 'lucide-react';

// You may want to move the categories array to a shared location
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

export default function SidebarDashboard({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  useCases = [],
  onClose,
  showClose = false
}: {
  selectedCategory: string;
  selectedSubcategory?: string;
  onCategorySelect: (id: string) => void;
  onSubcategorySelect?: (id: string) => void;
  useCases?: { id: string; title: string; category: string; icon?: any }[];
  onClose?: () => void;
  showClose?: boolean;
}) {
  const subcategories = useCases.filter(uc => uc.category === selectedCategory);
  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 bg-[#161616] border-r border-[#404040] z-40 flex flex-col shadow-xl"
      style={{ minWidth: 220 }}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#404040]">
        <span className="text-lg font-bold text-[#ff6b35]">Categories</span>
        {showClose && (
          <button onClick={() => onClose && onClose()} className="p-1 rounded hover:bg-[#232323]" aria-label="Close sidebar">
            <X className="w-6 h-6 text-[#a0a0a0]" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategorySelect(cat.id)}
            className={`w-full flex items-center px-5 py-3 text-left text-[#f5f5f5] hover:bg-[#232323] transition-colors rounded-lg mb-1 ${selectedCategory === cat.id ? 'bg-[#232323] font-bold text-[#ff6b35]' : ''}`}
          >
            <span className="mr-3 text-xl">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
        {/* Subcategories (use cases) */}
        {subcategories.length > 0 && (
          <div className="mt-4 border-t border-[#404040] pt-2">
            <div className="text-xs uppercase tracking-wider text-[#a0a0a0] px-5 mb-2">Subcategories</div>
            {subcategories.map((uc) => (
              <button
                key={uc.id}
                onClick={() => onSubcategorySelect && onSubcategorySelect(uc.id)}
                className={`w-full flex items-center px-8 py-2 text-left text-[#f5f5f5] hover:bg-[#232323] transition-colors rounded-lg mb-1 ${selectedSubcategory === uc.id ? 'bg-[#232323] font-bold text-[#ff6b35]' : ''}`}
              >
                {uc.icon && <span className="mr-2 text-lg">{typeof uc.icon === 'string' ? uc.icon : <uc.icon className="w-4 h-4" />}</span>}
                <span>{uc.title}</span>
              </button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
} 