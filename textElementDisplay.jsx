import React, { useRef, useEffect } from 'react';
import { useAutoFontSize } from './useAutoFontSize'; // Assuming this is correctly implemented
import './TextElementDisplay.css'; // Create this CSS file for handle styles

const TextElementDisplay = ({
    textItem,
    scale,
    isActive,
    isInlineEditing,
    onInitiateDrag,
    onInitiateResize,
    onClick,
    onDoubleClick,
    onTextEditEnd,
    inlineTextInputRef
}) => {
    const localTextRef = useRef(null);

    const calculatedFs = useAutoFontSize(
        textItem.content,
        textItem.fontFamily,
        textItem.width,
        textItem.fontSize,
        8,
        scale
    );

    const handleMouseDown = (e) => {
        if (!isInlineEditing && isActive && onInitiateDrag && !e.target.classList.contains('resize-handle')) {
            if (e.target.tagName.toLowerCase() === 'textarea') {
                return;
            }
            onInitiateDrag(e, textItem.id, localTextRef.current);
        }
    };

    useEffect(() => {
        if (isInlineEditing && isActive && inlineTextInputRef && inlineTextInputRef.current) {
            const textarea = inlineTextInputRef.current;
            textarea.focus();
            textarea.select();
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [isInlineEditing, isActive, inlineTextInputRef, textItem.content]);

    const handleTextareaInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const editingFontSize = 18;

    const handleResizeMouseDown = (e, direction) => {
        e.stopPropagation(); // Prevent parent div's onMouseDown (drag)
        if (onInitiateResize) {
            onInitiateResize(e, textItem.id, direction);
        }
    };

    const resizeHandles = [
        { direction: 'n', cursor: 'ns-resize' },
        { direction: 's', cursor: 'ns-resize' },
        { direction: 'e', cursor: 'ew-resize' },
        { direction: 'w', cursor: 'ew-resize' },
        { direction: 'ne', cursor: 'nesw-resize' },
        { direction: 'nw', cursor: 'nwse-resize' },
        { direction: 'se', cursor: 'nwse-resize' },
        { direction: 'sw', cursor: 'nesw-resize' },
    ];

    return (
        <div
            ref={localTextRef}
            className={`text-element ${isActive && !isInlineEditing ? 'active' : ''} ${isActive && isInlineEditing ? 'inline-editing-active' : ''}`}
            style={{
                position: 'absolute',
                left: `${(textItem.x * scale) + (textItem.offsetX || 0)}px`,
                top: `${(textItem.y * scale) + (textItem.offsetY || 0)}px`,
                width: `${textItem.width * scale}px`,
                height: 'auto',
                color: textItem.color,
                fontFamily: textItem.fontFamily,
                fontSize: `${calculatedFs * scale}px`,
                cursor: isActive && !isInlineEditing ? 'move' : (isInlineEditing ? 'text' : 'pointer'),
                boxSizing: 'border-box',
                wordBreak: 'break-word',
                padding: '3px 5px',
                userSelect: isInlineEditing ? 'text' : 'none',
                outline: (isActive && !isInlineEditing) ? '1px dashed #007bff' : 'none',
                zIndex: isActive ? 11 : 10, // Ensure active element is on top
            }}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onMouseDown={handleMouseDown}
        >
            {isActive && isInlineEditing ? (
                <textarea
                    ref={inlineTextInputRef}
                    defaultValue={textItem.content}
                    onInput={handleTextareaInput}
                    onBlur={(e) => onTextEditEnd(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onTextEditEnd(e.target.value);
                            if (e.target.blur) e.target.blur();
                        }
                    }}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%',
                        minHeight: `${editingFontSize}px`,
                        boxSizing: 'border-box',
                        fontFamily: textItem.fontFamily,
                        fontSize: `${editingFontSize}px`,
                        color: '#000000',
                        border: '1px solid #007bff',
                        outline: 'none',
                        padding: '5px',
                        margin: 0, resize: 'none',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        overflowY: 'hidden', zIndex: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                />
            ) : (
                textItem.content
            )}

            {/* Resize Handles */}
            {isActive && !isInlineEditing && onInitiateResize && resizeHandles.map(handle => (
                <div
                    key={handle.direction}
                    className={`resize-handle resize-handle-${handle.direction}`}
                    title="Resize"
                    style={{ cursor: handle.cursor }}
                    onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
                />
            ))}
        </div>
    );
};

export default TextElementDisplay;