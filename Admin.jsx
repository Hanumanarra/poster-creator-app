/**import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { storage, db } from '/firebase';
import './Admin.css';

export default function Admin() {
  const [imageUrl, setImageURL] = useState('');
  const [texts, setTexts] = useState([]);
  const [activeTextIndex, setActiveTextIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({width: 0, height: 0});
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const imgRef = useRef(null);
  const functions = getFunctions();

  // Single savePoster function
  const savePoster = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (!imageUrl) {
      alert("Please add an image first");
      setIsSaving(false);
      return;
    }

    try {
      const posterData = {
        imageUrl, // This will save the URL to Firebase
        texts,
        name: e.target.name.value,
        description: e.target.description.value,
        dimensions: imageDimensions,
        createdAt:serverTimestamp(),
        isEditable:true
      
      };
      

      // Add a new document to the "posters" collection
      const docRef = await addDoc(collection(db, "poster"), posterData);
      
      console.log("Poster saved with ID: ", docRef.id);
     alert("Poster created successfully!");
      
      // Reset the form
      setImageURL('');
      setTexts([]);
      e.target.reset();
      
    } catch (error) {
      console.error("Error saving poster: ", error);
      alert("Error saving poster");

      if(error.code){
         console.error("Function error code:", error.code);
       console.error("Function error message:", error.message);
       // error.details might contain the original error message from the function
       alert(`Error saving poster: ${error.message}`);
          } else {
       alert("An unknown error occurred while saving the poster.");
    }
    } finally {
    setIsSaving(false);
  }
};
  const handleImageLoad = () => {
    if (imgRef.current) {
      setImageDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight
      });
    }
  };

  const handleFileChange = async(e) => {
    if (e.target.files.length > 0) {
      setIsUploading(true);
      const file = e.target.files[0];
      try {
        const storageRef = ref(storage, `posters/${Date.now()}_${file.name}`);

        await uploadBytes(storageRef, file);

        const url = await getDownloadURL(storageRef);

        setImageURL(url); // This sets the URL that will be saved
        setTexts([]);
      } catch(error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload image. Please try again");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUrlChange = (e) => {
    setImageURL(e.target.value); // This also sets the URL that will be saved
    setTexts([]);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const addText = () => {
    const newText = {
      id: Date.now(),
      content: 'Double click to edit',
      x: 50,
      y: 50,
      color: '#000000',
      fontSize: 17,
      width: 150
    };
    setTexts([...texts, newText]);
    setActiveTextIndex(texts.length);
  };

  const handleTextDrag = (e, index) => {
    if (isEditing) return;
    
    const previewRect = previewRef.current.getBoundingClientRect();
    const scaleX = previewRect.width / imageDimensions.width;
    const scaleY = previewRect.height / imageDimensions.height;
    const scale = Math.min(scaleX, scaleY);
    
    const imgLeft = previewRect.left + (previewRect.width - imageDimensions.width * scale) / 2;
    const imgTop = previewRect.top + (previewRect.height - imageDimensions.height * scale) / 2;
    
    let x = (e.clientX - imgLeft) / scale;
    let y = (e.clientY - imgTop) / scale;
    
    // Boundary checks
    x = Math.max(0, Math.min(x, imageDimensions.width - texts[index].width));
    y = Math.max(0, Math.min(y, imageDimensions.height - 30));

    const newTexts = [...texts];
    newTexts[index] = {
      ...newTexts[index],
      x,
      y
    };
    setTexts(newTexts);
  };

  const handleTextClick = (index) => {
    setActiveTextIndex(index);
  };

  const handleTextDoubleClick = (index) => {
    setActiveTextIndex(index);
    setIsEditing(true);
  };

  const handleTextBlur = (e, index) => {
    const newTexts = [...texts];
    newTexts[index] = {
      ...newTexts[index],
      content: e.target.value
    };
    setTexts(newTexts);
    setIsEditing(false);
    setActiveTextIndex(null);
  };

  const handleTextKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTexts = [...texts];
      newTexts[index] = {
        ...newTexts[index],
        content: e.target.value
      };
      setTexts(newTexts);
      setIsEditing(false);
      setActiveTextIndex(null);
    }
  };

  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditing]);

  return (
    <main className="admin-main">
      <div className="navigation">
        <Link to='/' className="back-link">← Back to Previous Page</Link>
      </div>
      
      <div className="admin-content">
        <div className="creator-card">
          <div className="creator-header">
            <h2>Create New Poster</h2>
          </div>
          
          <form className="creator-form" onSubmit={savePoster}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input 
                id="name"
                className="form-input"
                placeholder="Enter poster name" 
                type="text"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <input
                id="description"
                className="form-input"
                placeholder="Description"
                type="text"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Image Source</label>
              <div className="image-source-container">
                <input
                  id="image-url"
                  className="form-input url-input"
                  type="url" 
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={handleUrlChange}
                />
                <div className="file-upload-wrapper">
                  <input 
                    ref={fileInputRef}
                    id="file-upload"
                    className="file-upload-input"
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button 
                    type="button"
                    className="file-upload-button"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Choose File"}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="upload-guidelines">
              <h4 className="guidelines-title">Upload Guidelines</h4>
              
              <div className="guideline-section">
                <h5 className="guideline-subtitle">For Images:</h5>
                <ul className="guideline-list">
                  <li>Minimum Width: 1000px</li>
                  <li>Minimum Height: 250px</li>
                  <li>Files smaller than 1.5MB are preferred</li>
                </ul>
              </div>
              
              <div className="guideline-section">
                <h5 className="guideline-subtitle">For GIFs:</h5>
                <ul className="guideline-list">
                  <li>Maximum Width and Height: 800px</li>
                  <li>Maximum File Size: 5MB</li>
                  <li>Frames per second: less than 75</li>
                </ul>
              </div>
            </div>
            
            <button 
              type="submit"
              className="submit-button"
              disabled={isUploading || isSaving}
            >
              {isSaving ? "Saving..." : isUploading ? "Uploading..." : "Create Poster"}
            </button>
          </form>
        </div>
        
        <div className="preview-card">
          <div 
            className="preview-area" 
            ref={previewRef}
            style={{
              width: `${Math.min(imageDimensions.width, 700)}px`,
              height: `${Math.min(imageDimensions.height, 700)}px`,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            {imageUrl ? (
              <div className="image-container">
                <img 
                  ref={imgRef}
                  src={imageUrl} 
                  alt="Preview" 
                  className="preview-image"
                  onLoad={handleImageLoad}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain' 
                  }}
                />
                {texts.map((text, index) => {
                  const scaleX = previewRef.current?.offsetWidth / imageDimensions.width;
                  const scaleY = previewRef.current?.offsetHeight / imageDimensions.height;
                  const scale = Math.min(scaleX, scaleY);
                  
                  return (
                    <div
                      key={text.id}
                      className={`text-element ${index === activeTextIndex ? 'active' : ''}`}
                      style={{
                        position: 'absolute',
                        left: `${text.x * scale}px`,
                        top: `${text.y * scale}px`,
                        color: text.color,
                        fontSize: `${text.fontSize}px`,
                        width: `${text.width}px`,
                        cursor: 'move',
                        userSelect: 'none',
                        transform: `translate(${
                          (previewRef.current?.offsetWidth - imageDimensions.width * scale) / 2
                        }px, ${
                          (previewRef.current?.offsetHeight - imageDimensions.height * scale) / 2
                        }px)`
                      }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setDragImage(new Image(), 0, 0);
                        e.dataTransfer.setData('text/plain', '');
                      }}
                      onDragEnd={(e) => handleTextDrag(e, index)}
                      onClick={() => handleTextClick(index)}
                      onDoubleClick={() => handleTextDoubleClick(index)}
                    >
                      {index === activeTextIndex && isEditing ? (
                        <input
                          type="text"
                          ref={textInputRef}
                          defaultValue={text.content}
                          onBlur={(e) => handleTextBlur(e, index)}
                          onKeyDown={(e) => handleTextKeyDown(e, index)}
                          style={{
                            color: text.color,
                            fontSize: `${text.fontSize}px`,
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'inherit'
                          }}
                        />
                      ) : (
                        text.content
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="preview-placeholder">Poster preview will appear here</p>
            )}
            {imageUrl && (
              <button 
                className="add-text-button"
                onClick={addText}
                disabled={isUploading}
              >
                Aa
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}*/

// Admin.jsx
// Admin.jsx
// Admin.jsx


// Admin.jsx
// Admin.jsx
// Admin.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, addDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { storage, db } from '/firebase.js'; // Ensure this path is correct

import { FaTrashAlt, FaPalette, FaFont, FaArrowsAltH } from "react-icons/fa";
import './Admin.css';
import TextElementDisplay from './textElementDisplay.jsx'; // Make sure filename matches casing
import { defaultFontFamily } from "./fontConfig.js";

export default function Admin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [imageUrl, setImageURL] = useState('');
  const [texts, setTexts] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);
  const [isInlineTextEditing, setIsInlineTextEditing] = useState(false);

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [posterName, setPosterName] = useState('');
  const [posterDescription, setPosterDescription] = useState('');
  const[resizingTextInfo,setResizingTextInfo]=useState(null);


  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const inlineTextInputRef = useRef(null);
  const imgRef = useRef(null);

  // State for custom drag
  const [draggingTextInfo, setDraggingTextInfo] = useState(null);
  // { id, initialMouseX, initialMouseY, initialTextX, initialTextY, textElementWidth, textElementHeight }

  const isEditMode = !!id;

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);
      const loadPoster = async () => {
        try {
          const posterDocRef = doc(db, "poster", id);
          const docSnap = await getDoc(posterDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPosterName(data.name || '');
            setPosterDescription(data.description || '');
            setImageURL(data.imageUrl || '');
            setTexts((data.texts || []).map(t => ({ ...t, fontFamily: t.fontFamily || defaultFontFamily })));
            setImageDimensions(data.dimensions || { width: 0, height: 0 });
          } else {
            console.log("No such document to edit!");
            navigate("/admin");
          }
        } catch (error) {
          console.error("Error loading poster:", error);
          alert("Failed to load poster data.");
        } finally {
          setIsLoadingData(false);
        }
      };
      loadPoster();
    } else {
      setPosterName('');
      setPosterDescription('');
      setImageURL('');
      setTexts([]);
      setImageDimensions({ width: 0, height: 0 });
      setActiveTextId(null);
      setIsInlineTextEditing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [id, navigate]);

  const handleFileChange = async (e) => {
    if (e.target.files.length > 0) {
      setIsUploading(true);
      const file = e.target.files[0];
      try {
        const uniqueStorageRef = storageRef(storage, `posters/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(uniqueStorageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        setImageURL(url);
        setTexts([]);
        setImageDimensions({ width: 0, height: 0 }); // Reset dimensions for new image
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Image upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const savePoster = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    if (!imageUrl) {
      alert("Please add an image first");
      setIsSaving(false);
      return;
    }
    if (!posterName.trim()) {
      alert("Please enter a poster name.");
      setIsSaving(false);
      return;
    }

    const textsToSave = texts.map(({ isEditingPanel, offsetX, offsetY, ...rest }) => rest);

    try {
      const posterDataToSave = {
        imageUrl,
        texts: textsToSave,
        name: posterName,
        description: posterDescription,
        dimensions: imageDimensions,
      };

      if (isEditMode) {
        posterDataToSave.updatedAt = serverTimestamp();
        await updateDoc(doc(db, "poster", id), posterDataToSave);
        alert("Poster updated successfully!");
      } else {
        posterDataToSave.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, "poster"), posterDataToSave);
        const adminUrl = `${window.location.origin}/admin/${docRef.id}`;
        console.log(`Poster created!\nAdmin URL: ${adminUrl}\n (copied to clipboard)`);
        alert(`Poster created!\nAdmin URL: ${adminUrl}\n (copied to clipboard)`);
        try {
          await navigator.clipboard.writeText(adminUrl);
        } catch (err) {
          console.warn("Failed to copy URL", err);
        }
        navigate('/');
      }
    } catch (error) {
      console.error("Save/Update failed:", error);
      alert("Failed to save/update poster: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImageDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight
      });
    }
  };

  const handleUrlChange = (e) => {
    setImageURL(e.target.value);
    setTexts([]);
    setImageDimensions({ width: 0, height: 0 });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const addText = () => {
    if (!imageDimensions.width || !imageDimensions.height) {
      alert("Image dimensions not fully loaded. Please wait a moment and try again, or re-upload the image.");
      return;
    }
    const initialWidth = 400;
    const initialMaxFontSize = 50;
    const centeredX = imageDimensions.width / 2 - initialWidth / 2;
    const centeredY = imageDimensions.height / 2 - (initialMaxFontSize * 1.2) / 2; // Rough centering

    const newText = {
      id: Date.now(),
      content: 'New Text',
      x: Math.max(0, centeredX),
      y: Math.max(0, centeredY),
      color: '#000000',
      fontSize: initialMaxFontSize,
      fontFamily: defaultFontFamily,
      width: initialWidth,
      isEditingPanel: true,
    };
    setTexts(prevTexts => [...prevTexts.map(t => ({ ...t, isEditingPanel: false })), newText]);
    setActiveTextId(newText.id);
    setIsInlineTextEditing(false);
  };

  const updateTextProperty = (textId, property, value) => {
    setTexts(prevTexts =>
      prevTexts.map(text =>
        text.id === textId ? { ...text, [property]: value } : text
      )
    );
  };

  const deleteText = (textIdToDelete) => {
    setTexts(prevTexts => prevTexts.filter(text => text.id !== textIdToDelete));
    if (activeTextId === textIdToDelete) {
      setActiveTextId(null);
      setIsInlineTextEditing(false);
    }
  };

  const toggleTextPropertiesPanel = (textId) => {
    setTexts(prevTexts =>
      prevTexts.map(text =>
        text.id === textId ? { ...text, isEditingPanel: !text.isEditingPanel } : { ...text, isEditingPanel: false }
      )
    );
    setActiveTextId(textId);
    setIsInlineTextEditing(false);
  };

  const handlePreviewTextClick = (textId) => {
    setActiveTextId(textId);
    setIsInlineTextEditing(false);
  };

  const handlePreviewTextDoubleClick = (textId) => {
    setActiveTextId(textId);
    setIsInlineTextEditing(true);
    setTexts(prevTexts =>
      prevTexts.map(text =>
        text.id === textId ? { ...text, isEditingPanel: false } : text
      )
    );
  };

  const handleTextEditingFinished = (textId, finalContent) => {
    updateTextProperty(textId, 'content', finalContent);
    setIsInlineTextEditing(false);
  };


  // --- Custom Drag Logic ---
  const handleInitiateDrag = (event, textId, textElementNode) => {
    event.preventDefault();
    const textData = texts.find(t => t.id === textId);
    if (!textData || !previewRef.current || !textElementNode) return;

    const previewRect = previewRef.current.getBoundingClientRect();
    
    let currentImageScale = 1;
    if (imageDimensions.width > 0 && previewRef.current.offsetWidth > 0) { // Added check for previewRef offsetWidth
        const scaleX = previewRef.current.offsetWidth / imageDimensions.width;
        const scaleY = previewRef.current.offsetHeight / imageDimensions.height;
        currentImageScale = Math.min(scaleX, scaleY); // Use consistent scaling logic
    }
    
    const elementRect = textElementNode.getBoundingClientRect();
    const mouseXInPreview = event.clientX - previewRect.left;
    const mouseYInPreview = event.clientY - previewRect.top;
    
    const elementLeftInPreview = elementRect.left - previewRect.left;
    const elementTopInPreview = elementRect.top - previewRect.top;

    setDraggingTextInfo({
      id: textId,
      offsetX: mouseXInPreview - elementLeftInPreview,
      offsetY: mouseYInPreview - elementTopInPreview,
      originalTextWidth: textData.width,
      originalTextHeight: textElementNode.offsetHeight / currentImageScale,
    });
  };
 
  const handleInitiateResize = (event, textId, direction) => {
    event.preventDefault();
    event.stopPropagation();

    const textData = texts.find(t => t.id === textId);
    if (!textData || !previewRef.current || !imageDimensions.width) return;

    const previewRect = previewRef.current.getBoundingClientRect(); // Needed for scale calc relative to actual display
    const previewWidth = previewRect.width; 
    const previewHeight = previewRect.height;

    let currentImageScale = 1;

    if (imageDimensions.width > 0 && imageDimensions.height > 0) {
      const scaleX = previewWidth / imageDimensions.width;
      const scaleY = previewHeight / imageDimensions.height;
      currentImageScale = Math.min(scaleX, scaleY);
    } else {
      return; // Cannot calculate scale
    }

    setResizingTextInfo({
      id: textId,
      direction,
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialTextX: textData.x,
      initialTextY: textData.y,
      initialWidth: textData.width,
      initialFontSize: textData.fontSize,
      currentImageScale: currentImageScale,
    });
  };

  // useEffect for handling resize mouse movements
  useEffect(() => {
    const handleResizeMouseMove = (event) => {
      if (!resizingTextInfo || !previewRef.current || !imageDimensions.width) return;

      const {
        id, direction, initialMouseX, initialMouseY,
        initialTextX, initialTextY, initialWidth, initialFontSize,
        currentImageScale
      } = resizingTextInfo;
      
      const textToResize = texts.find(t => t.id === id);
      if (!textToResize) return; // Should not happen if resizingTextInfo is set

      const deltaXRaw = event.clientX - initialMouseX;
      const deltaYRaw = event.clientY - initialMouseY;

      const deltaX = deltaXRaw / currentImageScale;
      const deltaY = deltaYRaw / currentImageScale;

      let newX = initialTextX;
      let newY = initialTextY;
      let newWidth = initialWidth;
      let newFontSize = initialFontSize;

      const MIN_WIDTH = 50; // From your slider
      const MAX_WIDTH = imageDimensions.width; // Max width is image width
      const MIN_FONT_SIZE = 10; // From your slider
      const MAX_FONT_SIZE = 150; // From your slider
      const FONT_SIZE_SENSITIVITY = 0.35; // Adjust for desired sensitivity

      // Horizontal adjustments
      if (direction.includes('e')) {
        newWidth = initialWidth + deltaX;
      }
      if (direction.includes('w')) {
        newWidth = initialWidth - deltaX;
        newX = initialTextX + deltaX;
      }

      // Vertical adjustments (affecting fontSize)
      if (direction.includes('s')) {
        newFontSize = initialFontSize + deltaY * FONT_SIZE_SENSITIVITY;
      }
      if (direction.includes('n')) {
        newFontSize = initialFontSize - deltaY * FONT_SIZE_SENSITIVITY;
        newY = initialTextY + deltaY;
      }

      // Clamp width and adjust X if clamped from West
      if (newWidth < MIN_WIDTH) {
        if (direction.includes('w')) {
          newX = initialTextX + (initialWidth - MIN_WIDTH);
        }
        newWidth = MIN_WIDTH;
      }
      if (newWidth > MAX_WIDTH) {
         if (direction.includes('w')) {
           newX = initialTextX + (initialWidth - MAX_WIDTH);
         }
         newWidth = MAX_WIDTH;
      }
      
      // Clamp X to be within image bounds [0, imageDimensions.width - newWidth]
      if (newX < 0) {
        if (direction.includes('w')) { // If clamped because newX < 0
            newWidth = initialTextX + initialWidth; // Width becomes whatever was from 0 to original right edge
        }
        newX = 0;
      }
      if (newX + newWidth > imageDimensions.width) {
        if (direction.includes('e')) { // Resizing East, newWidth makes it exceed
            newWidth = imageDimensions.width - newX;
        } else if (direction.includes('w')) { // Resizing West, newX makes it exceed (less common if newX < 0 is handled)
            // This case means newX is positive, but newX + newWidth is too large.
            // Recalculate newX based on clamped width from right edge.
            // initialTextX + initialWidth = originalRightEdge
            // newX = originalRightEdge - newWidth
            newX = (initialTextX + initialWidth) - newWidth;
        }
         // Ensure width itself isn't making it too large if X is okay
        if (newWidth > imageDimensions.width - newX) {
            newWidth = imageDimensions.width - newX;
        }
      }


      // Clamp font size and adjust Y if clamped from North
      if (newFontSize < MIN_FONT_SIZE) {
        if (direction.includes('n')) {
          const dyForMinFont = (initialFontSize - MIN_FONT_SIZE) / FONT_SIZE_SENSITIVITY;
          newY = initialTextY + dyForMinFont;
        }
        newFontSize = MIN_FONT_SIZE;
      }
      if (newFontSize > MAX_FONT_SIZE) {
        if (direction.includes('n')) {
          const dyForMaxFont = (initialFontSize - MAX_FONT_SIZE) / FONT_SIZE_SENSITIVITY;
          newY = initialTextY + dyForMaxFont;
        }
        newFontSize = MAX_FONT_SIZE;
      }

      // Clamp Y to be within image bounds [0, imageDimensions.height - (approx element height)]
      // Approximating element height for clamping Y is complex due to font rendering.
      // For now, basic Y clamping:
      if (newY < 0) newY = 0;
      // if (newY + approxElementHeight > imageDimensions.height) newY = imageDimensions.height - approxElementHeight;


      setTexts(prevTexts =>
        prevTexts.map(text => {
          if (text.id === id) {
            return {
              ...text,
              x: Math.round(newX),
              y: Math.round(newY),
              width: Math.round(Math.max(MIN_WIDTH, newWidth)), // Final safety clamp for width
              fontSize: Math.round(Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newFontSize))), // Final safety clamp
            };
          }
          return text;
        })
      );
    };

    const handleResizeMouseUp = () => {
      if (resizingTextInfo) {
        setResizingTextInfo(null);
      }
    };

    if (resizingTextInfo) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [resizingTextInfo, texts, imageDimensions, setTexts]);

  
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!draggingTextInfo || !previewRef.current || !imageDimensions.width) return;

      const { id, offsetX, offsetY, originalTextWidth, originalTextHeight } = draggingTextInfo;
      
      const previewRect = previewRef.current.getBoundingClientRect();
      const currentPreviewWidth = previewRef.current.offsetWidth;
      const currentPreviewHeight = previewRef.current.offsetHeight;

      let currentImageScale = 1;
      if (imageDimensions.width > 0 && imageDimensions.height > 0) { // Ensure dimensions are positive
          const scaleX = currentPreviewWidth / imageDimensions.width;
          const scaleY = currentPreviewHeight / imageDimensions.height;
          currentImageScale = Math.min(scaleX, scaleY);
      } else {
          return; // Avoid division by zero or invalid scale
      }
      
      const scaledImageWidth = imageDimensions.width * currentImageScale;
      const scaledImageHeight = imageDimensions.height * currentImageScale;
      const imgContainerLeftOffset = (currentPreviewWidth - scaledImageWidth) / 2;
      const imgContainerTopOffset = (currentPreviewHeight - scaledImageHeight) / 2;

      let newScaledX = event.clientX - previewRect.left - imgContainerLeftOffset - offsetX;
      let newScaledY = event.clientY - previewRect.top - imgContainerTopOffset - offsetY;

      let originalX = newScaledX / currentImageScale;
      let originalY = newScaledY / currentImageScale;

      originalX = Math.max(0, Math.min(originalX, imageDimensions.width - originalTextWidth));
      originalY = Math.max(0, Math.min(originalY, imageDimensions.height - originalTextHeight));
      
      setTexts(prevTexts =>
        prevTexts.map(text =>
          text.id === id ? { ...text, x: Math.round(originalX), y: Math.round(originalY) } : text
        )
      );
    };

    const handleMouseUp = () => {
      if (draggingTextInfo) {
        setDraggingTextInfo(null);
      }
    };

    if (draggingTextInfo) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTextInfo, texts, imageDimensions, previewRef]); // Added previewRef

  if (isLoadingData && isEditMode) {
    return <main className="admin-main"><p>Loading poster details...</p></main>;
  }

  return (
    <main className="admin-main">
      <div className="navigation">
        <Link to='/' className="back-link">← Back to Main Page</Link>
      </div>
      <div className="admin-content">
        <div className="creator-card">
          <div className="creator-header">
            <h2>{isEditMode ? "Edit Poster" : "Create New Poster"}</h2>
          </div>
          <form className="creator-form" onSubmit={savePoster}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input id="name" className="form-input" placeholder="Enter poster name" type="text" value={posterName} onChange={(e) => setPosterName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <input id="description" className="form-input" placeholder="Description" type="text" value={posterDescription} onChange={(e) => setPosterDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Image Source</label>
              <div className="image-source-container">
                <input id="image-url" className="form-input url-input" type="url" placeholder="Enter image URL" value={imageUrl} onChange={handleUrlChange} />
                <div className="file-upload-wrapper">
                  <input ref={fileInputRef} id="file-upload" className="file-upload-input" type="file" accept="image/*" onChange={handleFileChange} />
                  <button type="button" className="file-upload-button" onClick={triggerFileInput} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Choose File"}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-elements-controls">
              <h4>Text Elements</h4>
              {texts.length === 0 && <p className="no-texts-message">No text elements added. Click "Aa" on the preview.</p>}
              {texts.map((textItem) => (
                <div key={textItem.id} className={`text-control-panel ${activeTextId === textItem.id && textItem.isEditingPanel ? 'active-panel' : ''}`}>
                  <div className="panel-header" onClick={() => toggleTextPropertiesPanel(textItem.id)}>
                    <span>{textItem.content.substring(0, 25)}{textItem.content.length > 25 ? '...' : ''}</span>
                    <div className="panel-actions">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteText(textItem.id); }}
                        className="delete-text-btn"
                        title="Delete text"
                        type="button"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                  {textItem.isEditingPanel && activeTextId === textItem.id && (
                    <div className="panel-body">
                      <div className="property-control">
                        <label htmlFor={`textColor-${textItem.id}`}><FaPalette /> Color</label>
                        <input type="color" id={`textColor-${textItem.id}`} value={textItem.color} onChange={(e) => updateTextProperty(textItem.id, 'color', e.target.value)} />
                      </div>
                      <div className="property-control">
                        <label htmlFor={`fontSize-${textItem.id}`}><FaFont /> Max Size</label>
                        <input type="range" id={`fontSize-${textItem.id}`} min="10" max="150" value={textItem.fontSize} onChange={(e) => updateTextProperty(textItem.id, 'fontSize', parseInt(e.target.value, 10))} />
                        <span>{textItem.fontSize}px</span>
                      </div>
                      <div className="property-control">
                        <label htmlFor={`textWidth-${textItem.id}`}><FaArrowsAltH /> Width</label>
                        <input type="range" id={`textWidth-${textItem.id}`} min="50" max={imageDimensions.width || 400} value={textItem.width} onChange={(e) => updateTextProperty(textItem.id, 'width', parseInt(e.target.value, 10))} />
                        <span>{textItem.width}px</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="upload-guidelines">
              <h4 className="guidelines-title">Upload Guidelines</h4>
              <div className="guideline-section">
                <h5 className="guideline-subtitle">For Images:</h5>
                <ul className="guideline-list"><li>Minimum Width: 1000px</li><li>Minimum Height: 250px</li><li>Files smaller than 1.5MB are preferred</li></ul>
              </div>
              <div className="guideline-section">
                <h5 className="guideline-subtitle">For GIFs:</h5>
                <ul className="guideline-list"><li>Maximum Width and Height: 800px</li><li>Maximum File Size: 5MB</li><li>Frames per second: less than 75</li></ul>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isUploading || isSaving || (isLoadingData && isEditMode)}>
              {isSaving ? "Saving..." : (isEditMode ? "Update Poster" : "Create Poster")}
            </button>
          </form>
        </div>

        <div className="preview-card">
          <div
            className={`preview-area ${imageUrl ? 'has-image' : ''}`}
            ref={previewRef}
            style={{
              aspectRatio: (imageDimensions.width && imageDimensions.height) ? `${imageDimensions.width} / ${imageDimensions.height}` : '16 / 9',
              maxWidth: '700px',
              width: '100%',
              minHeight: '300px',
              cursor: draggingTextInfo ? 'grabbing' : 'default',
            }}
          >
            {imageUrl ? (
              <div className="image-container">
                <img ref={imgRef} src={imageUrl} alt="Preview" className="preview-image" onLoad={handleImageLoad} />
                {texts.map((textItem) => {
                  if (!previewRef.current || !imageDimensions.width || !imageDimensions.height) return null;
                  
                  const previewWidth = previewRef.current.offsetWidth;
                  const previewHeight = previewRef.current.offsetHeight; // Get actual preview area height

                  let currentImageScale = 1;
                  if (imageDimensions.width > 0 && imageDimensions.height > 0) { // Ensure dimensions are positive
                      const scaleX = previewWidth / imageDimensions.width;
                      const scaleY = previewHeight / imageDimensions.height;
                      currentImageScale = Math.min(scaleX, scaleY);
                  } else {
                      return null; // Or some default scale if dimensions are not ready
                  }

                  const scaledImageWidth = imageDimensions.width * currentImageScale;
                  const scaledImageHeight = imageDimensions.height * currentImageScale; // Use scaled height for offsetY
                  
                  const currentOffsetX = (previewWidth - scaledImageWidth) / 2;
                  const currentOffsetY = (previewHeight - scaledImageHeight) / 2; // Correct centering
                  
                  return (
                    <TextElementDisplay
                      key={textItem.id}
                      textItem={{ ...textItem, fontFamily: textItem.fontFamily || defaultFontFamily, offsetX: currentOffsetX, offsetY: currentOffsetY }}
                      scale={currentImageScale}
                      isActive={activeTextId === textItem.id}
                      isInlineEditing={activeTextId === textItem.id && isInlineTextEditing}

                      onInitiateDrag={handleInitiateDrag}
                      onInitiateResize={handleInitiateResize}
                      onClick={() => handlePreviewTextClick(textItem.id)}
                      onDoubleClick={() => handlePreviewTextDoubleClick(textItem.id)}
                      onTextEditEnd={(finalContent) => handleTextEditingFinished(textItem.id, finalContent)}
                      inlineTextInputRef={activeTextId === textItem.id && isInlineTextEditing ? inlineTextInputRef : null}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="preview-placeholder">Poster preview will appear here</p>
            )}
            {imageUrl && (
              <button
                type="button"
                className="add-text-button"
                onClick={addText}
                disabled={isUploading || (isLoadingData && isEditMode) || !imageDimensions.width}
              >
                Aa
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}