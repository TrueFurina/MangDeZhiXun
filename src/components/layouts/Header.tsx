import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Brain } from 'lucide-react';

const navigation = [
  { name: '首页', path: '/' },
  { name: '能力评估', path: '/assessment' },
  { name: '标准库', path: '/positions' },
  { name: '个人中心', path: '/profile' },
];

export default function Header() {
  const location = useLocation();

  const NavLinks = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            location.pathname === item.path
              ? 'text-primary'
              : 'text-foreground/80'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
            <img 
              src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260402/file-ao6wt1jg4um8.jpg@w_1659" 
              alt="芒小橘" 
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-lg font-bold gradient-text">AI胜任力评估</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 lg:flex">
          <NavLinks />
        </nav>

        {/* CTA Button */}
        <div className="hidden items-center space-x-4 lg:flex">
          <Link to="/assessment">
            <Button className="gradient-primary" asChild>
              <span>开始评估</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <nav className="flex flex-col space-y-4 mt-8">
              <NavLinks />
              <Link to="/assessment" className="pt-4">
                <Button className="w-full gradient-primary" asChild>
                  <span>开始评估</span>
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
