
import React from 'react';
import { Link } from 'react-router-dom';
import { CarIcon, FacebookIcon, TwitterIcon, InstagramIcon } from './IconComponents';
import { useSiteContent } from '../hooks/useSiteContent';

const Footer: React.FC = () => {
  const { siteContent } = useSiteContent();

  if (!siteContent) return null;

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-foreground text-2xl font-bold mb-4">
                <CarIcon className="h-8 w-8 text-accent" />
                <span>{siteContent.siteName}</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your trusted partner in finding the perfect vehicle. Quality, transparency, and service you can rely on.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/inventory" className="text-base text-muted-foreground hover:text-foreground">Inventory</Link></li>
              <li><Link to="/about" className="text-base text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link to="/contact" className="text-base text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/faq" className="text-base text-muted-foreground hover:text-foreground">FAQ</Link></li>
              <li><a href="#" className="text-base text-muted-foreground hover:text-foreground">Financing</a></li>
              <li><Link to="/privacy-policy" className="text-base text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
           <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Follow Us</h3>
            <div className="flex space-x-6 mt-4">
              <a href={siteContent.socialHandles.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><span className="sr-only">Facebook</span><FacebookIcon className="h-6 w-6" /></a>
              <a href={siteContent.socialHandles.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><span className="sr-only">Twitter</span><TwitterIcon className="h-6 w-6" /></a>
              <a href={siteContent.socialHandles.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><span className="sr-only">Instagram</span><InstagramIcon className="h-6 w-6" /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 md:flex md:items-center md:justify-between">
          <p className="text-base text-muted-foreground md:order-1">&copy; {new Date().getFullYear()} {siteContent.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
