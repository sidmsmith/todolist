# Setting Up the WMS Screenshot Background

## Quick Setup

1. **Save your screenshot** with one of these names:
   - `wms-background.png` (recommended)
   - `wms-background.jpg`
   - `wms-background.jpeg`

2. **Place it in the `frontend/public/` folder:**
   ```
   todolist/
   └── frontend/
       └── public/
           └── wms-background.png  ← Put your screenshot here
   ```

3. **The app will automatically use it!**

## Image Requirements

- **Format**: PNG, JPG, or JPEG
- **Size**: Any size (will be scaled to fit)
- **Recommended**: High resolution for clarity when displayed

## Current Setup

The clipboard badge (📋) icon is positioned in the **top-right corner** where the "?" help icon is in your screenshot.

- **Position**: Fixed in top-right corner
- **Styling**: Semi-transparent white background with shadow for visibility
- **Size**: 40x40px (matches typical WMS icon sizes)

## Adjusting Badge Position

If you need to adjust where the badge appears, edit `frontend/src/styles/globals.css`:

```css
.todo-badge-container {
  position: fixed;
  top: 8px;        /* Adjust vertical position */
  right: 16px;     /* Adjust horizontal position */
  z-index: 1000;
}
```

## Alternative: Use Image from Assets Folder

If you prefer to import the image, you can:

1. Place it in `frontend/src/assets/wms-background.png`
2. Update `App.jsx`:
   ```jsx
   import wmsBg from './assets/wms-background.png';
   
   // Then in the component:
   <img src={wmsBg} alt="WMS Interface" />
   ```

## Fallback Behavior

If the image file doesn't exist, you'll see a dark background with a message. This helps identify if the image path is incorrect.

