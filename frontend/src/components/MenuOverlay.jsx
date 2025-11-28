import React from 'react';

export const MenuOverlay = ({ isOpen, onClose, onToDoListClick, onManageTodoTypesClick }) => {
  if (!isOpen) return null;

  // Adjust these coordinates to match where elements appear in your menu.png image
  // Coordinates are percentages of the image dimensions
  
  // Area for the X close button (upper left corner)
  const CLOSE_BUTTON_AREA = {
    top: '1%',       // Distance from top of image
    left: '4%',      // Distance from left of image
    width: '10%',     // Width of clickable area
    height: '4%'     // Height of clickable area
  };

  // Area for "To Do List" text
  const TODO_LIST_AREA = {
	top: '47.5%',      // Distance from top of image (placeholder - adjust as needed)
    left: '4%',      // Distance from left of image (placeholder - adjust as needed)
    width: '50%',    // Width of clickable area (placeholder - adjust as needed)
    height: '5%'     // Height of clickable area (placeholder - adjust as needed)
  };

  // Area for "Manage Todo Types" text/button
  const MANAGE_TODO_TYPES_AREA = {
    top: '53%',      // Distance from top of image
    left: '4%',     // Distance from left of image
    width: '50%',    // Width of clickable area
    height: '5%'    // Height of clickable area
  };

  return (
    <>
      {/* Backdrop to close menu when clicking outside */}
      <div className="menu-backdrop" onClick={onClose} />
      
      {/* Menu image that slides in from the left */}
      <div className="menu-slide-container">
        <div className="menu-image-container">
          <img 
            src="/menu.png" 
            alt="Menu" 
            className="menu-image"
          />
          
          {/* Clickable area over the X close button (upper left) */}
          <div 
            className="menu-close-clickable-area"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              position: 'absolute',
              top: CLOSE_BUTTON_AREA.top,
              left: CLOSE_BUTTON_AREA.left,
              width: CLOSE_BUTTON_AREA.width,
              height: CLOSE_BUTTON_AREA.height,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              // Uncomment below for debugging to see the clickable area:
              // backgroundColor: 'rgba(255, 0, 0, 0.2)'
            }}
            title="Close menu"
          />

          {/* Clickable area over "To Do List" text in the image */}
          <div 
            className="todo-list-clickable-area"
            onClick={(e) => {
              e.stopPropagation();
              onToDoListClick();
            }}
            style={{
              position: 'absolute',
              top: TODO_LIST_AREA.top,
              left: TODO_LIST_AREA.left,
              width: TODO_LIST_AREA.width,
              height: TODO_LIST_AREA.height,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              // Uncomment below for debugging to see the clickable area:
              // backgroundColor: 'rgba(0, 255, 0, 0.2)'
            }}
            title="Click to open To Do List"
          />

          {/* Clickable area over "Manage Todo Types" text/button in the image */}
          {onManageTodoTypesClick && (
            <div 
              className="manage-todo-types-clickable-area"
              onClick={(e) => {
                e.stopPropagation();
                onManageTodoTypesClick();
              }}
              style={{
                position: 'absolute',
                top: MANAGE_TODO_TYPES_AREA.top,
                left: MANAGE_TODO_TYPES_AREA.left,
                width: MANAGE_TODO_TYPES_AREA.width,
                height: MANAGE_TODO_TYPES_AREA.height,
                cursor: 'pointer',
                backgroundColor: 'transparent',
                // Uncomment below for debugging to see the clickable area:
                // backgroundColor: 'rgba(0, 0, 255, 0.2)'
              }}
              title="Click to manage Todo Types"
            />
          )}
        </div>
      </div>
    </>
  );
};

