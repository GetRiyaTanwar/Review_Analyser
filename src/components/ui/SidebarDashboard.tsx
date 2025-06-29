import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Categories array
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

interface UseCase {
  id: string;
  title: string;
  category: string;
  icon?: any;
}

interface SidebarDashboardProps {
  selectedCategory: string;
  selectedSubcategory?: string;
  onCategorySelect: (id: string) => void;
  onSubcategorySelect?: (id: string) => void;
  useCases?: UseCase[];
  onClose?: () => void;
  showClose?: boolean;
}

export default function SidebarDashboard({
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  useCases = [],
  onClose,
  showClose = false
}: SidebarDashboardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const subcategories = useCases.filter(uc => uc.category === selectedCategory);

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar when showClose is true (for mobile)
  useEffect(() => {
    if (showClose) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [showClose]);

  return (
    <>
      {/* Toggle Button - Fixed to the edge of the sidebar */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 z-50 p-2 rounded-full bg-[#161616] border border-[#404040] hover:bg-[#232323] transition-all duration-300 ${
          isOpen ? 'left-[calc(16rem-12px)]' : 'left-4'
        }`}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-[#a0a0a0]" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#a0a0a0]" />
        )}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full bg-[#161616] border-r border-[#404040] z-40 flex flex-col shadow-xl transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 md:w-16'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#404040] h-[64px] overflow-hidden">
          <span className={`whitespace-nowrap ${!isOpen ? 'opacity-0 w-0' : ''}`}>Categories</span>
          <div className="w-6 h-6" />
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {!isOpen ? (
            <div className="flex flex-col items-center py-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.id)}
                  className="p-3 my-1 rounded-lg hover:bg-[#232323] transition-colors"
                  title={cat.name}
                >
                  <span className="text-xl">{cat.icon}</span>
                </button>
              ))}
            </div>
          ) : (
            <>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.id)}
                  className={`w-full flex items-center px-5 py-3 text-left text-[#f5f5f5] hover:bg-[#232323] transition-colors rounded-lg mb-1 ${
                    selectedCategory === cat.id ? 'bg-[#232323] font-bold text-[#ff6b35]' : ''
                  }`}
                >
                  <span className="mr-3 text-xl">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
              
              {subcategories.length > 0 && (
                <div className="mt-4 border-t border-[#404040] pt-2">
                  <div className="text-xs uppercase tracking-wider text-[#a0a0a0] px-5 mb-2">
                    Subcategories
                  </div>
                  {subcategories.map((uc) => (
                    <button
                      key={uc.id}
                      onClick={() => onSubcategorySelect?.(uc.id)}
                      className={`w-full flex items-center px-8 py-2 text-left text-[#f5f5f5] hover:bg-[#232323] transition-colors rounded-lg mb-1 ${
                        selectedSubcategory === uc.id ? 'bg-[#232323] font-bold text-[#ff6b35]' : ''
                      }`}
                    >
                      {uc.icon && (
                        <span className="mr-2 text-lg">
                          {typeof uc.icon === 'string' ? uc.icon : <uc.icon className="w-4 h-4" />}
                        </span>
                      )}
                      <span>{uc.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}