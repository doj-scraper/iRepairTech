# DESIGN CALIBRATION TODO LIST
## Updated: 2026-05-06 19:42:42

## 🔧 STEP 2: FONT AUDIT & IMPLEMENTATION
### 🚨 Font Search & Replace (High Priority)
- [ ] Run font audit command excluding third-party dependencies
  ```bash
  grep -ri 'Arial\|Helvetica' ./src/ | grep -v 'node_modules\|chrome'
  ```
- [ ] Implement premium font stack in `tailwind.config.ts`
  ```ts
  // Before
  fontFamily: {
    display: ['Arial', 'Helvetica', 'sans-serif'],
    sans: ['Tahoma', 'Verdana', 'Arial', 'sans-serif'],
  },
  
  // After
  fontFamily: {
    display: ['Clash Display', '_sans', 'sans-serif'],
    sans: ['Clash Display', 'Geist', 'Noto Sans', 'sans-serif'],
  },
  ```
- [ ] Update font variables in `src/constants/design-system.ts`
  ```ts
  // Before
  fonts: {
    body: 'Helvetica, sans-serif',
    display: 'Arial Black, sans-serif',
  }
  
  // After
  fonts: {
    body: 'Geist, sans-serif',
    display: 'Clash Display, sans-serif',
  }
  ```
- [ ] Validate font implementation across components
  - Primary text elements (h1-h6, buttons, cards)
  - UI components (inputs, cards, modals)
  - Sysml_light Design system tokens

### 🎨 UI Style Modernization (High Priority)
- [ ] Implement Grid Layout Specifications
  ```tsx
  // Before
<div className="grid grid-cols-3 gap-4 sm:grid-cols-[1fr 2fr 1fr]" />
  
  // After
  <div className="grid grid-cols-[1fr 2fr 1fr] gap-8 sm:grid-cols-[1/3 2/3 1/3] md:grid-cols-auto lg:grid-cols-[3/4 1/4]">
    {/* Content */}
<div>
  ```
- [ ] Adjust spacing system for premium breathing room
  ```ts
  // Update in tailwind.config.ts
  theme: {
    spacing: {
      'xxs': '4px',
      'xs': '8px',
      'sm': '12px',
      'md': '16px',
      'lg': '24px',
      'xl': '32px',
      '2xl': '40px',
      '3xl': '48px',
      '4xl': '56px',
      '5xl': '64px',
    }
  }
  ```
- [ ] Replace metro-style cutoff pages with premium layouts
  ```tsx
  // Before
  <Container className="max-w-6xl mx-auto" />
  
  // After
  <Container className="max-w-7xl px-6 sm:px-8 lg:px-12 xl:px-8">
    {/* Add asymmetric grid structure */}
Container>
  ```

## ✅ STEP 3: COMPONENT OPTIMIZATION
### 🬗 Motion & Animation Enhancements
- [ ] Upgrade card hover animations
  ```ts
  // card.tsx
  className="
    rounded-[120px] 
    hover:shadow-xl slow pan-up
    transition-all duration-300 ease-in-out-backout nudge-2xl
  "
  ```
- [ ] Enhance button interactions
  ```ts
  // button.tsx
  const PillButton = ({ children }) => (
   <button className="
        rounded-full px-6 py-3 
        bg-gradient-to-r from-black to-black/60 
        shadow sm:shadow-lg 
        group
        motion:transform
        motion-hover:scale-105 motion-hover:transition radio
    ">
      {children}
   </button>
  )
  ```
- [ ] Implement scroll reveal animations
  ```ts
  // Install framer-motion package
  npm install framer-motion

  // Usage example
  import { motion } from 'framer-motion';

  <motion.div
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={fadeInOffset}
  >
    {/* Content */}
  </motion.div>
  ```

## 📊 DIRECTIVE FOR EXECUTION
1. **Font Implementation Checklist**
   - [ ] Complete font search and replace
   - [ ] Verify all primary components updated
   - [ ] Test font rendering at different screen densities
   - [ ] Validate against typographic scale standards

2. **Layout Adjustment Protocol**
   - [ ] Confirm asymmetric grid ratios
   - [ ] Verify spacing at different breakpoints
   - [ ] Test overflow handling for content width
   - [ ] Implement fallback for mobile layouts

3. **Animation System Validation**
   - [ ] Check transition durations (150-300ms range)
   - [ ] Validate hover states activation
   - [ ] Test scroll performance on low-end devices
   - [ ] Confirm animation cancellation handling

## 🧪 VERIFICATION STEPS
- [ ] Run design audit using metrical inspection
- [ ] Perform semantic markup validation
- [ ] Conduct cross-browser compatibility testing
- [ ] Execute design consistency checklist (UXQA-2023)

---
*This document was generated using the High-End Visual Design and Artifacts Builder skills.*
