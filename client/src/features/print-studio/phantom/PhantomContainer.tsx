import React, { useEffect, useState } from 'react';
import { Font } from '@react-pdf/renderer';

interface PhantomContainerProps {
  children: React.ReactNode;
  width?: number; // In Points (pt)
  className?: string;
}

/**
 * PHANTOM CONTAINER
 * -----------------
 * A hidden DOM container used for precise measurement of widgets.
 * Key Features:
 * 1. Matches PDF dimensions (default A4 width minus margins).
 * 2. Enforces Font Parity: Loads the exact fonts used in the PDF.
 * 3. Invisible to the user but measurable by the browser.
 */
export const PhantomContainer: React.FC<PhantomContainerProps> = ({ 
  children, 
  width = 595 - 48, // Default A4 width (595pt) minus margins (24pt * 2)
  className 
}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Inject @font-face rules to match React-PDF's registered fonts.
    // This ensures that 'Helvetica' or custom fonts take up the EXACT same 
    // width in the DOM as they do in the PDF engine.
    
    // Note: In a real app, you might map these urls from your Font.register calls
    const styleId = 'phantom-font-faces';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        /* Example: Syncing standard fonts */
        @font-face {
          font-family: 'Helvetica';
          src: local('Helvetica'), local('Arial'); 
          /* Fallback to Arial which is metrically similar to Helvetica */
        }
        
        /* Add custom font registrations here if your PDF uses them */
        /* @font-face { font-family: 'MyCustomFont'; src: url('/fonts/myfont.ttf'); } */
      `;
      document.head.appendChild(style);
    }
    
    // Check if fonts are ready (simple timeout or document.fonts.ready for stricter checks)
    document.fonts.ready.then(() => setFontsLoaded(true));
    
  }, []);

  return (
    <div 
      className={`phantom-renderer ${className || ''}`}
      style={{
        position: 'absolute',
        top: -9999,
        left: -9999,
        visibility: 'hidden',
        // Critical Layout Constraints
        width: `${width}pt`, 
        fontFamily: 'Helvetica, Arial, sans-serif', // Match PDF default
        fontSize: '10pt', // Match PDF default
        lineHeight: 1.2,
        boxSizing: 'border-box',
        // Prevent generic styles from leaking in
        all: 'initial',
        // Re-apply desired inheritance key props
        background: 'white',
        color: 'black',
        // Ensure standard display
        display: 'block',
      }}
      aria-hidden="true"
    >
      {fontsLoaded ? children : null}
    </div>
  );
};
