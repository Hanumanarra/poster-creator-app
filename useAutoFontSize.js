// useAutoFontSize.js
import { useState, useEffect } from 'react';

// Helper function to check if text fits within the given constraints
const checkFit = (text, fontFamily, originalFontSizeToTest, originalItemWidth, currentScale) => {
    if (!text || !fontFamily || originalFontSizeToTest <= 0 || originalItemWidth <= 0) {
        return true; // Vacuously true if no text or invalid dimensions/font
    }

    // Create a temporary element for measurement
    const measurementElement = document.createElement('div');
    document.body.appendChild(measurementElement);

    // Style the temporary element
    measurementElement.style.visibility = 'hidden';      // Not visible to the user
    measurementElement.style.position = 'absolute';      // Does not affect layout
    measurementElement.style.whiteSpace = 'pre-wrap';    // Respect newlines and wrap text
    measurementElement.style.wordBreak = 'break-word';   // Break words to fit width
    measurementElement.style.fontFamily = fontFamily;
    // Apply scaling to dimensions for accurate measurement in preview context
    measurementElement.style.fontSize = `${originalFontSizeToTest * currentScale}px`;
    measurementElement.style.width = `${originalItemWidth * currentScale}px`;
    measurementElement.style.padding = '0';              // No padding
    measurementElement.style.border = 'none';            // No border
    measurementElement.style.boxSizing = 'content-box';  // Width is content width
    measurementElement.textContent = text;               // Set the text content

    // Check if the scrollWidth (actual content width) exceeds the clientWidth (container width)
    // A small tolerance (e.g., 1-2px) can account for subpixel rendering differences
    const fitsHorizontally = measurementElement.scrollWidth <= measurementElement.clientWidth + 2;

    document.body.removeChild(measurementElement); // Clean up the temporary element
    return fitsHorizontally;
};

export function useAutoFontSize(
    text,                     // The text content
    fontFamily,               // Font family
    itemWidth,                // Original (unscaled) width of the text item
    maxFontSize,              // User-defined maximum font size (unscaled)
    minFontSize = 8,          // Minimum sensible font size (unscaled)
    scale = 1                 // Current preview scale factor
) {
    const [calculatedFontSize, setCalculatedFontSize] = useState(maxFontSize);

    useEffect(() => {
        if (!text?.trim() || !fontFamily || !itemWidth || itemWidth <= 0 || maxFontSize < minFontSize) {
            setCalculatedFontSize(maxFontSize); // Default or invalid params
            return;
        }

        let optimalFs = minFontSize; // Start with the minimum possible font size
        // Iterate downwards from maxFontSize to find the largest size that fits
        for (let currentFs = maxFontSize; currentFs >= minFontSize; currentFs -= 1) { // Step can be 0.5 for finer control
            if (checkFit(text, fontFamily, currentFs, itemWidth, scale)) {
                optimalFs = currentFs; // This font size fits
                break; // Found the largest fitting font size
            }
        }
        setCalculatedFontSize(optimalFs);
    }, [text, fontFamily, itemWidth, maxFontSize, minFontSize, scale]);

    return calculatedFontSize;
}