import React, { useMemo } from 'react';
import * as diff from 'diff';

export default function DiffViewer({ original, modified }) {
  const diffParts = useMemo(() => {
    let oldFormatted = original || '';
    let newFormatted = modified || '';

    // Attempt to pretty-print to ensure formatting differences don't clutter the diff
    try { 
      if (oldFormatted.trim()) oldFormatted = JSON.stringify(JSON.parse(oldFormatted), null, 2); 
    } catch (e) {}
    
    try { 
      if (newFormatted.trim()) newFormatted = JSON.stringify(JSON.parse(newFormatted), null, 2); 
    } catch (e) {}

    // Calculate line-by-line differences
    return diff.diffLines(oldFormatted, newFormatted);
  }, [original, modified]);

  return (
    <div className="diff-viewer">
      {diffParts.map((part, index) => {
        const className = part.added
          ? 'diff-added'
          : part.removed
            ? 'diff-removed'
            : 'diff-unchanged';
            
        // We use span because white-space: pre-wrap will naturally handle the newlines in part.value
        return (
          <span key={index} className={`diff-part ${className}`}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
}
