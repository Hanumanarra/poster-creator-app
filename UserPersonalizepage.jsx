

/**import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { db } from '/firebase';
import './UserPersonalizePage.css'; // Ensure this file is updated for .poster-main-view-area
import { FiArrowLeft, FiEdit2, FiShare2, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const LINE_HEIGHT_MULTIPLIER = 1.2;

export default function UserPersonalizePage() {
  const { id } = useParams();
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [texts, setTexts] = useState([]);
  const [activeTextIndex, setActiveTextIndex] = useState(null);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [isTextEditingInput, setIsTextEditingInput] = useState(false);

  const textInputRef = useRef(null);
  const posterDisplayAreaRef = useRef(null);
  // posterImageRef might not be strictly needed if image fills parent div of known size

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      const fetchPosterData = async () => {
        setLoading(true);
        setError(null);
        try {
          const posterDocRef = doc(db, "poster", id);
          const docSnap = await getDoc(posterDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPoster({ id: docSnap.id, ...data });
            setTexts((data.texts || []).map((text, index) => ({ ...text, id: text.id || `text-${Date.now()}-${index}` })));
            if (data.name) document.title = `Poster: ${data.name}`;
          } else {
            setError("Poster not found.");
            setPoster(null);
            document.title = "Poster Not Found";
          }
        } catch (err) {
          console.error("Error fetching poster:", err);
          setError("Failed to load poster.");
          setPoster(null);
          document.title = "Error Loading Poster";
        } finally {
          setLoading(false);
        }
      };
      fetchPosterData();
    } else {
      setError("No Poster ID provided.");
      setLoading(false);
      document.title = "Invalid Poster";
    }
  }, [id]);

  const togglePersonalize = () => {
    setIsPersonalizing(!isPersonalizing);
    if (isPersonalizing) {
      setActiveTextIndex(null);
      setIsTextEditingInput(false);
    }
  };

  const handleTextDoubleClick = (index) => {
    if (!isPersonalizing) return;
    setActiveTextIndex(index);
    setIsTextEditingInput(true);
  };

  const handleTextBlur = (e, index) => {
    setIsTextEditingInput(false);
    const newTexts = texts.map((text, i) =>
      i === index ? { ...text, content: e.target.value } : text
    );
    setTexts(newTexts);
  };

  const handleTextKeyDown = (e) => { // Index not needed here if blur handles update
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textInputRef.current?.blur();
    }
  };

  // getTextPositioning is no longer used to scale text elements if we want 1:1 view.
  // It might be kept if you plan to have a "fit to screen" mode toggle later.
  // For 1:1 view, scale is 1, offsetX/Y are 0 for text elements.
  // The posterDisplayAreaRef itself will be centered or positioned by its parent.

  useEffect(() => {
    if (isPersonalizing && isTextEditingInput && activeTextIndex !== null && textInputRef.current) {
      const textarea = textInputRef.current;
      textarea.focus();
      textarea.select();
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isPersonalizing, isTextEditingInput, activeTextIndex]);

  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleShare = async () => {
    if (!posterDisplayAreaRef.current || !poster) {
      alert("Poster not loaded yet.");
      return;
    }

    const wasPersonalizing = isPersonalizing;
    if (wasPersonalizing) {
        setIsPersonalizing(false);
        setActiveTextIndex(null);
        setIsTextEditingInput(false);
    }

    const shareBtn = document.querySelector('.btn-share');
    const originalShareBtnText = shareBtn ? shareBtn.innerHTML : '<span>Share</span>';
    if (shareBtn) {
      shareBtn.innerHTML = '<span class="loading-dots">Sharing</span>';
    }

    await new Promise(resolve => setTimeout(resolve, 150)); // Allow UI to update

    try {
      const canvas = await html2canvas(posterDisplayAreaRef.current, {
        backgroundColor: poster?.backgroundColor || '#ffffff', // Use poster's BG
        useCORS: true,
        scale: window.devicePixelRatio || 1, // Use 1 for 1:1 capture, or higher for sharper image if needed
        logging: false,
        width: poster.dimensions.width, // Ensure canvas captures at original dimensions
        height: poster.dimensions.height,
        x: 0, // Capture from top-left of the element
        y: 0,
        scrollX: 0, // Ensure it captures the non-scrolled state of this specific element
        scrollY: 0,
        onclone: (clonedDoc) => {
          const textElements = clonedDoc.querySelectorAll('.user-poster-text-element');
          textElements.forEach(el => {
            el.style.outline = 'none';
            el.style.border = 'none';
          });
          const textareas = clonedDoc.querySelectorAll('.user-poster-text-element textarea');
          textareas.forEach(ta => ta.style.display = 'none');
        }
      });

      if (navigator.share) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], `${poster.name || 'poster'}_personalized.png`, { type: 'image/png' });
        await navigator.share({
          title: `Poster: ${poster.name || 'Shared Poster'}`,
          text: `Check out this personalized poster!`,
          files: [file]
        });
      } else {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${poster.name || 'poster'}_personalized.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Sharing/Downloading failed:', err);
      alert('Could not share or download the poster. See console for details.');
    } finally {
      if (shareBtn) {
        shareBtn.innerHTML = originalShareBtnText;
      }
      if (wasPersonalizing) {
        setIsPersonalizing(true);
      }
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner"></div><p>Loading your poster...</p>
    </div>
  );
  if (error) return (
    <div className="error-state">
      <div className="error-icon">!</div><p className="error-message">{error}</p>
      <Link to="/" className="nav-link-home"><FiArrowLeft /> Return Home</Link>
    </div>
  );
  if (!poster || !poster.dimensions || poster.dimensions.width === 0 || poster.dimensions.height === 0) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div><p>Poster data or dimensions are invalid.</p>
        <Link to="/" className="nav-link-home"><FiArrowLeft /> Return Home</Link>
      </div>
    );
  }

  const actionButtonsJsx = (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }} onClick={togglePersonalize}
        className={`action-btn btn-personalize ${isPersonalizing ? 'active' : ''}`}
        aria-label={isPersonalizing ? 'Finish editing' : 'Edit text'}
      >
        {isPersonalizing ? <><FiCheck size={18} /> <span>Done</span></> : <><FiEdit2 size={18} /> <span>Edit</span></>}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }} onClick={handleShare}
        className="action-btn btn-share" aria-label="Share or download poster"
        disabled={isTextEditingInput}
      >
        <FiShare2 size={18} /> <span>Share</span>
      </motion.button>
    </>
  );

  return (
    <div className={`user-personalize-page ${isMobileView ? 'mobile-view' : 'desktop-view'}`}>
      <motion.header  >
        <Link to="/" className="nav-link-home">
          <FiArrowLeft size={20} /> {!isMobileView && <span>Back</span>}
        </Link>
        {!isMobileView && <div className="desktop-action-buttons">{actionButtonsJsx}</div>}
      </motion.header>


      <main className="poster-main-view-area">
        <motion.div
          className="poster-display-area-user"
          ref={posterDisplayAreaRef}
          style={{
            // Set explicit width and height to poster's original dimensions for 1:1 scale
            width: `${poster.dimensions.width}px`,
            height: `${poster.dimensions.height}px`,
           
            backgroundColor: poster?.backgroundColor || '#fff',
          
          }}
          initial={{ opacity: 0, scale: 0.95 }} // Initial animation for the container
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {poster?.imageUrl && (
            <img
              src={poster.imageUrl}
              alt={poster.name || 'Poster Image'}
              crossOrigin="anonymous"
             
            />
          )}

          {texts.map((textItem, index) => {
            // For 1:1 view, scale is 1, offsetX/Y are 0 relative to posterDisplayAreaRef
            // const { scale, offsetX, offsetY } = getTextPositioning(); // No longer used for text like this

            const currentText = textItem; // Use clearer variable name

            return (
              <div
                key={currentText.id || index}
                className={`user-poster-text-element ${isPersonalizing && activeTextIndex === index && !isTextEditingInput ? 'active-editable' : ''}`}
                style={{
                  position: 'absolute',
                  // Original position, width, and font size, relative to the poster-display-area-user
                  left: `${currentText.x}px`,
                  top: `${currentText.y}px`,
                  width: `${currentText.width}px`,
                  color: currentText.color || '#000000',
                  fontFamily: currentText.fontFamily || 'Arial, sans-serif',
                  fontSize: `${currentText.fontSize}px`, // Original font size
                  lineHeight: `${LINE_HEIGHT_MULTIPLIER}`,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  cursor: isPersonalizing && activeTextIndex === index && !isTextEditingInput ? 'move' : (isPersonalizing ? 'text' : 'default'),
                  userSelect: isPersonalizing && isTextEditingInput && activeTextIndex === index ? 'text' : 'none',
                  padding: '1px 2px', // Minimal padding for the text div itself
                  boxSizing: 'border-box',
                  transform: `rotate(${currentText.rotation || 0}deg)`,
                  transformOrigin: 'top left',
                }}
                onDoubleClick={isPersonalizing ? () => handleTextDoubleClick(index) : undefined}
              >
                {isPersonalizing && isTextEditingInput && activeTextIndex === index ? (
                  <textarea
                   
                    ref={textInputRef}
                    defaultValue={currentText.content}
                    // ... other props ...
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%',
                      height: 'auto',
                      minHeight: `${currentText.fontSize * LINE_HEIGHT_MULTIPLIER}px`,
                      boxSizing: 'border-box',
                      fontFamily: currentText.fontFamily || 'Arial, sans-serif',
                      fontSize: `${currentText.fontSize}px`, // Original font size for editing
                      color: currentText.color || '#000000',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px dashed #007bff',
                      borderRadius: '3px',
                      outline: 'none',
                      padding: '4px 6px',
                      margin: 0,
                      resize: 'none',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowY: 'hidden',
                      zIndex: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      lineHeight: `${LINE_HEIGHT_MULTIPLIER}`,
                    }}
                  />
                ) : (
                  currentText.content
                )}
              </div>
            );
          })}
        </motion.div>
      </main>

      {isMobileView && (
        <motion.footer className='mobile-action-button-footer'>
          {actionButtonsJsx}
        </motion.footer>
      )}
    </div>
  );
} */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { db } from '/firebase';
import './UserPersonalizePage.css';
import { FiArrowLeft, FiEdit2, FiShare2, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const LINE_HEIGHT_MULTIPLIER = 1.2;

export default function UserPersonalizePage() {
    const { id } = useParams();
    const [poster, setPoster] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [texts, setTexts] = useState([]);
    const [activeTextIndex, setActiveTextIndex] = useState(null);
    const [isPersonalizing, setIsPersonalizing] = useState(false);
    const [isTextEditingInput, setIsTextEditingInput] = useState(false);
    const [editingContent, setEditingContent] = useState('');
    const[imageRenderOffsets,setImageRenderOffsets]=useState({x:0,y:0});
    
    // State for display scale factor
    const [displayScale, setDisplayScale] = useState(1);

    const textInputRef = useRef(null);
    const posterDisplayAreaRef = useRef(null);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
    
   

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Poster Data (no changes here from previous version)
    useEffect(() => {
        if (id) {
            const fetchPosterData = async () => {
                setLoading(true); setError(null);
                try {
                    const posterDocRef = doc(db, "poster", id);
                    const docSnap = await getDoc(posterDocRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setPoster({ id: docSnap.id, ...data });
                        setTexts((data.texts || []).map((text, index) => ({ ...text, id: text.id || `text-${Date.now()}-${index}` })));
                        if (data.name) document.title = `Poster: ${data.name}`;
                    } else {
                        setError("Poster not found."); setPoster(null); document.title = "Poster Not Found";
                    }
                } catch (err) {
                    console.error("Error fetching poster:", err); setError("Failed to load poster."); setPoster(null); document.title = "Error Loading Poster";
                } finally { setLoading(false); }
            };
            fetchPosterData();
        } else {
            setError("No Poster ID provided."); setLoading(false); document.title = "Invalid Poster";
        }
    }, [id]);

   useEffect(() => {
    const area = posterDisplayAreaRef.current; // Get ref value once

    if (area && poster && poster.dimensions.width > 0 && poster.dimensions.height > 0) {
        const originalPosterWidth = poster.dimensions.width;
        const originalPosterHeight = poster.dimensions.height;

        const calculateScaleAndOffsets = () => {
            const containerWidth = area.offsetWidth;
            const containerHeight = area.offsetHeight;

            if (containerWidth > 0 && containerHeight > 0 && originalPosterWidth > 0 && originalPosterHeight > 0) {
                // Calculate scale ratios for both dimensions
                const scaleXRatio = containerWidth / originalPosterWidth;
                const scaleYRatio = containerHeight / originalPosterHeight;

                // The 'contain' scale is the smaller of the two, this is the actual scale of the image content
                const newEffectiveScale = Math.min(scaleXRatio, scaleYRatio);
                setDisplayScale(newEffectiveScale); // This is the TRUE scale of the image content

                // Calculate the dimensions of the image AS IT IS RENDERED (scaled)
                const scaledImageWidth = originalPosterWidth * newEffectiveScale;
                const scaledImageHeight = originalPosterHeight * newEffectiveScale;

                // Calculate the empty space (offsets) around the image within its container
                const newOffsetX = (containerWidth - scaledImageWidth) / 2;
                const newOffsetY = (containerHeight - scaledImageHeight) / 2;
                setImageRenderOffsets({ x: newOffsetX, y: newOffsetY });

            } else {
                // Fallback if container or original dimensions are zero
                setDisplayScale(1);
                setImageRenderOffsets({ x: 0, y: 0 });
            }
        };

        calculateScaleAndOffsets(); // Initial calculation on mount or when poster/view changes

        const resizeObserver = new ResizeObserver(() => {
            // Recalculate on container resize
            // Ensure poster and area are still valid before recalculating
            if (posterDisplayAreaRef.current && poster && poster.dimensions.width > 0 && poster.dimensions.height > 0) {
                 calculateScaleAndOffsets();
            }
        });
        resizeObserver.observe(area);

        return () => resizeObserver.unobserve(area); // Cleanup observer
    } else {
        // Reset if no poster or invalid dimensions
        setDisplayScale(1);
        setImageRenderOffsets({ x: 0, y: 0 });
    }
}, [poster, isMobileView]);

    // togglePersonalize, handleTextDoubleClick, handleTextBlur, handleTextKeyDown, handleTextareaInput
    // (no major changes here from previous version, ensure they use editingContent)
    const togglePersonalize = () => {
        if (isPersonalizing && isTextEditingInput && activeTextIndex !== null) {
            const newTexts = texts.map((text, i) =>
                i === activeTextIndex ? { ...text, content: editingContent } : text
            );
            setTexts(newTexts);
            setIsTextEditingInput(false);
        }
        setIsPersonalizing(prev => {
            const next = !prev;
            if (!next) { setActiveTextIndex(null); setIsTextEditingInput(false); }
            return next;
        });
    };

    const handleTextDoubleClick = (index) => {
        if (!isPersonalizing) return;
        setActiveTextIndex(index);
        setEditingContent(texts[index].content);
        setIsTextEditingInput(true);
    };
    
    const handleTextBlur = (index) => {
        if (isPersonalizing && isTextEditingInput && activeTextIndex === index) {
            const newTexts = texts.map((text, i) =>
                i === index ? { ...text, content: editingContent } : text
            );
            setTexts(newTexts);
            setIsTextEditingInput(false);
        }
    };

    const handleTextKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (isPersonalizing && isTextEditingInput && activeTextIndex !== null) {
                const newTexts = texts.map((text, i) =>
                    i === activeTextIndex ? { ...text, content: editingContent } : text
                );
                setTexts(newTexts);
                setIsTextEditingInput(false);
            }
        }
    };
    
    useEffect(() => {
        if (isPersonalizing && isTextEditingInput && activeTextIndex !== null && textInputRef.current) {
            const textarea = textInputRef.current;
            textarea.focus();
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [isPersonalizing, isTextEditingInput, activeTextIndex, editingContent]); // added editingContent

    const handleTextareaInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };


    const handleShare = async () => {
        if (!posterDisplayAreaRef.current || !poster) {
            alert("Poster not loaded yet."); return;
        }
        const wasPersonalizing = isPersonalizing;
        if (wasPersonalizing) { // Ensure text is rendered, not textarea
            setActiveTextIndex(null); setIsTextEditingInput(false);
        }
        const shareBtn = document.querySelector('.btn-share');
        const originalShareBtnText = shareBtn ? shareBtn.innerHTML : '<span>Share</span>';
        if (shareBtn) shareBtn.innerHTML = '<span class="loading-dots">Sharing</span>';
        await new Promise(resolve => setTimeout(resolve, 150));

        try {
            const canvas = await html2canvas(posterDisplayAreaRef.current, {
                backgroundColor: poster?.backgroundColor || '#ffffff',
                useCORS: true,
                scale: window.devicePixelRatio || 2, // Higher scale for better quality if desired
                logging: false,
                // Capture the element at its current (potentially scaled) rendered size
                // Remove explicit width/height if you want WYSIWYG of the scaled view.
                // If you want original full-size image, this needs a different strategy.
                // For now, let's capture what's seen.
                x: 0, y: 0, scrollX: 0, scrollY: 0,
                onclone: (clonedDoc) => {
                    clonedDoc.querySelectorAll('.user-poster-text-element').forEach(el => {
                        el.style.outline = 'none'; el.style.border = 'none';
                    });
                    clonedDoc.querySelectorAll('.user-poster-text-element textarea').forEach(ta => ta.style.display = 'none');
                }
            });
            // ... (rest of sharing logic: navigator.share or download)
            if (navigator.share) {
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], `${poster.name || 'poster'}_personalized.png`, { type: 'image/png' });
                await navigator.share({
                    title: `Poster: ${poster.name || 'Shared Poster'}`,
                    text: `Check out this personalized poster!`,
                    files: [file]
                });
            } else {
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `${poster.name || 'poster'}_personalized.png`;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
            }
        } catch (err) {
            console.error('Sharing/Downloading failed:', err);
            alert('Could not share or download the poster. See console for details.');
        } finally {
            if (shareBtn) shareBtn.innerHTML = originalShareBtnText;
            // No need to explicitly re-enable personalization here, user can click Edit again.
        }
    };

    // Loading, error, no poster states (no changes)
    if (loading) return <div className="loading-state"><div className="loading-spinner"></div><p>Loading your poster...</p></div>;
    if (error) return <div className="error-state"><div className="error-icon">!</div><p className="error-message">{error}</p><Link to="/" className="nav-link-home"><FiArrowLeft /> Return Home</Link></div>;
    if (!poster || !poster.dimensions || poster.dimensions.width === 0 || poster.dimensions.height === 0) {
        return <div className="error-state"><div className="error-icon">⚠️</div><p>Poster data or dimensions are invalid.</p><Link to="/" className="nav-link-home"><FiArrowLeft /> Return Home</Link></div>;
    }
  
    
    const actionButtonsJsx = (
        // ... (action buttons JSX - no change needed here for this issue)
        <>
            <motion.button
                whileTap={{ scale: 0.95 }} onClick={togglePersonalize}
                className={`action-btn btn-personalize ${isPersonalizing ? 'active' : ''}`}
                aria-label={isPersonalizing ? 'Finish editing' : 'Edit text'}
            >
                {isPersonalizing ? <><FiCheck size={18} /> <span>Done</span></> : <><FiEdit2 size={18} /> <span>Edit</span></>}
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }} onClick={handleShare}
                className="action-btn btn-share" aria-label="Share or download poster"
                disabled={isPersonalizing && isTextEditingInput} // Disable share if actively typing in a textarea
            >
                <FiShare2 size={18} /> <span>Share</span>
            </motion.button>
        </>
    );

    return (
        <div className={`user-personalize-page ${isMobileView ? 'mobile-view' : 'desktop-view'}`}>
            <motion.header>
                <Link to="/" className="nav-link-home">
                    <FiArrowLeft size={20} /> {!isMobileView && <span>Back</span>}
                </Link>
                {!isMobileView && <div className="desktop-action-buttons">{actionButtonsJsx}</div>}
            </motion.header>

            <main className="poster-main-view-area">
                <motion.div
                    className="poster-display-area-user"
                    ref={posterDisplayAreaRef}
                    style={{
                        // Set BASE width and height for aspect ratio. CSS max-width/height will constrain it.
                        aspectRatio: (poster.dimensions.width && poster.dimensions.height)
                            ? `${poster.dimensions.width} / ${poster.dimensions.height}`
                            : '16 / 9',
                        width: `${poster.dimensions.width}px`,
                        height: `${poster.dimensions.height}px`,
                        
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    {poster?.imageUrl && (
                        <img
                            src={poster.imageUrl}
                            alt={poster.name || 'Poster Image'}
                            crossOrigin="anonymous"
                            // style removed, will be handled by CSS .poster-display-area-user img
                        />
                    )}

                    {texts.map((textItem, index) => {
                        const currentText = textItem;
                        
                        // Apply displayScale to position, size, and font size
                        const finalScaledX = (currentText.x * displayScale)+imageRenderOffsets.x;
                        const finalScaledY = (currentText.y * displayScale)+imageRenderOffsets.y;
                        const scaledWidth = currentText.width * displayScale;
                        const renderedScaledFontSize = currentText.fontSize * displayScale * 0.85;
                       // const scaledLineHeight = scaledFontSize * 1.2;
                        const scaledPaddingVertical = 4 * displayScale; // Example padding
                        const scaledPaddingHorizontal = 6 * displayScale; // Example padding

                        // Prevent rendering with 0 scale, which can happen briefly
                        if (displayScale === 0) return null;

                        return (
                            <div
                                key={currentText.id || index}
                                className={`user-poster-text-element ${isPersonalizing && activeTextIndex === index && !isTextEditingInput ? 'active-editable' : ''}`}
                                style={{
                                    position: 'absolute',
                                    left: `${finalScaledX}px`,
                                    top: `${finalScaledY}px`,
                                    Width: `${scaledWidth}px`,
                                    display:'inline-block',
                                    color: currentText.color || '#000000',
                                    fontFamily: currentText.fontFamily || 'Arial, sans-serif',
                                    fontSize:`${renderedScaledFontSize}px`,
                                    lineHeight:`${renderedScaledFontSize*1.2}px`,
                                    /**fontSize: `${currentText.fontSize * displayScale * 0.85}px`,
                                    lineHeight: `${currentText.fontSize * displayScale * 0.85 * 1.2}px`,*/
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    cursor: isPersonalizing && activeTextIndex === index && !isTextEditingInput ? 'move' : (isPersonalizing ? 'text' : 'default'),
                                    userSelect: (isPersonalizing && isTextEditingInput && activeTextIndex === index) ? 'text' : 'none',
                                   /** padding: `${scaledPaddingVertical}px ${scaledPaddingHorizontal/2}px`, */
                                    padding: `${4 * displayScale}px ${3 * displayScale}px`,
                                    boxSizing: 'border-box',
                                    transform: `rotate(${currentText.rotation || 0}deg)`,
                                    transformOrigin: 'top left',
                                    background:'transparent',
                                }}
                                onDoubleClick={isPersonalizing ? () => handleTextDoubleClick(index) : undefined}
                            >
                                {isPersonalizing && isTextEditingInput && activeTextIndex === index ? (
                                    <textarea
                                        ref={textInputRef}
                                        value={editingContent}
                                        onChange={(e) => {
                                            setEditingContent(e.target.value);
                                            handleTextareaInput(e);
                                        }}
                                        onBlur={() => handleTextBlur(index)}
                                        onKeyDown={handleTextKeyDown}
                                        style={{
                                            position: 'relative', top: 0, left: 0,
                                            width: '100%',
                                            display:'inline-block',
                                             height: 'auto',
                                            minHeight: `${renderedScaledFontSize * LINE_HEIGHT_MULTIPLIER}px`,
                                            boxSizing: 'border-box',
                                            fontFamily: currentText.fontFamily || 'Arial, sans-serif',
                                            fontSize: `${renderedScaledFontSize}px`, // Use scaled font size
                                            color: currentText.color || '#000000',
                                            lineHeight: `${LINE_HEIGHT_MULTIPLIER}`,
                                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                            border: 'none', outline: '1px dashed #007bff',
                                            borderRadius: '3px',
                                            padding: `${4*displayScale}px ${3*displayScale}px`, // Use scaled padding
                                            margin: 0, resize: 'none', overflowY: 'hidden',
                                            zIndex: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        }}
                                    />
                                ) : (
                                    currentText.content
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            </main>

             {isMobileView && (
                <motion.footer className='mobile-action-button-footer'>
                    {actionButtonsJsx}
                </motion.footer>
            )}
        </div>
    );
}