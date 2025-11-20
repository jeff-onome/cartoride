import React, { useState } from 'react';
import type { FaqItem as FaqItemType } from '../types';

interface FaqItemProps {
  item: FaqItemType;
}

const FaqItem: React.FC<FaqItemProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        className="w-full text-left flex justify-between items-center py-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-foreground">{item.question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      {isOpen && (
        <div className="pb-6 pr-10">
          <p className="text-muted-foreground">{item.answer}</p>
        </div>
      )}
    </div>
  );
};

export default FaqItem;