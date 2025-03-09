'use client';

import { Book, Github, Heart, Twitter } from 'lucide-react';
import Link from 'next/link';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink = ({ href, children }: FooterLinkProps) => (
  <Link 
    href={href}
    className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
  >
    {children}
  </Link>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Book className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-purple-400">ReadingApp</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your digital reading companion. Discover, read, and collect your favorite books.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-200 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/search">Search Books</FooterLink></li>
              <li><FooterLink href="/library">My Library</FooterLink></li>
              <li><FooterLink href="/coins">Buy Coins</FooterLink></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gray-200 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/help">Help Center</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-gray-200 font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <FooterLink href="https://twitter.com">
                <Twitter className="h-5 w-5" />
              </FooterLink>
              <FooterLink href="https://github.com">
                <Github className="h-5 w-5" />
              </FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} ReadingApp. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-4 sm:mt-0">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-purple-400" />
              <span>for readers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;