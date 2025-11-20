import React from 'react';
import FaqItem from '../components/FaqItem';
import { useSiteContent } from '../hooks/useSiteContent';

const Faq: React.FC = () => {
  const { siteContent } = useSiteContent();
  const faqData = siteContent?.faq || [];
  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <div className="mt-12">
          {faqData.map((item, index) => (
            <FaqItem key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;