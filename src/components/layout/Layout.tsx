import { type ReactNode } from 'react';

// This component expects 'children', which will be the page content we pass to it.
interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    // This div is the root of our app's view.
    // - min-h-screen: Makes sure it's at least the full height of the screen.
    // - bg-background: Uses our custom background color.
    // - font-primary: Sets Roboto as the default font for the whole app.
    // - text-text-primary: Sets the default text color.
    <div className="min-h-screen bg-background font-primary text-text-primary">
      {/* In a mobile app, a header might go here */}
      
      <main className="px-4 py-8">
        {/* We add some basic padding on the sides (px-4) and top/bottom (py-8) */}
        {children}
      </main>

      {/* For a mobile-first app, a BottomNav component will go here later */}
    </div>
  );
};

export default Layout;