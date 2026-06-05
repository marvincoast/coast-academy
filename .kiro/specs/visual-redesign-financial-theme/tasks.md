# Implementation Plan: Visual Redesign - Financial Market Theme

## Overview

This implementation plan transforms the Felix Empire Trading course platform into a premium financial market interface with professional dollar analysis and tape reading aesthetics. The implementation maintains the existing React 19 + TypeScript + Vite + TailwindCSS stack while introducing enhanced visual hierarchy, financial market-inspired UI components, improved glassmorphism patterns, and premium micro-interactions. All tasks focus on creating reusable TypeScript/React components with proper type safety, accessibility, and performance optimization.

## Tasks

- [x] 1. Set up design token system and TailwindCSS configuration
  - Create TypeScript interfaces for design tokens (ColorTokens, TypographyTokens, SpacingTokens, EffectTokens)
  - Extend TailwindCSS preset with custom colors (bg, flow, brand, state categories)
  - Add custom typography configuration (Inter, JetBrains Mono, Sora fonts with proper fallbacks)
  - Configure custom spacing scale following 4px base grid
  - Add custom effects (box shadows, backdrop blur, border radius, transitions)
  - Configure font loading with font-display swap and preload for critical fonts
  - Add custom animation keyframes (fade-up, progress-fill, pulse)
  - Validate all token values meet accessibility and performance constraints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1-2.12, 3.1-3.10, 21.1-21.10_

- [ ] 2. Implement core utility functions
  - [-] 2.1 Create formatPrice utility function
    - Implement number formatting with proper decimal places and thousand separators
    - Add currency parameter support with ISO 4217 validation
    - Apply tabular-nums font feature for digit alignment
    - Handle negative values with proper sign placement
    - Validate input values (finite numbers, decimals 0-8)
    - _Requirements: 6.2, 6.3, 6.4, 6.11, 17.7-17.12_

  - [-] 2.2 Create getFlowColor utility function
    - Implement value comparison logic (current vs previous)
    - Return bid color (#00C853) for positive changes
    - Return ask color (#FF5252) for negative changes
    - Return neutral color for zero change
    - Support solid and subtle variants with appropriate alpha values
    - _Requirements: 2.12, 5.7, 5.8, 6.5, 6.6, 6.7, 17.1-17.6_

  - [-] 2.3 Create applyMarketTheme utility function
    - Accept HTMLElement and MarketTheme parameters
    - Set CSS custom properties on element for theme colors
    - Validate element is mounted and theme colors are valid CSS values
    - Update element style synchronously without removing existing properties
    - _Requirements: 20.1-20.10_

  - [ ] 2.4 Create animation utility functions
    - Implement applyStaggeredAnimation for entrance animations
    - Add performance monitoring with requestAnimationFrame timing
    - Implement animation preference detection and localStorage persistence
    - Add will-change transform hints for frequently animated elements
    - _Requirements: 12.1-12.10, 13.1-13.10_

- [~] 3. Checkpoint - Verify utility functions and design tokens
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement GlassCard component
  - [~] 4.1 Create GlassCard TypeScript component with proper interfaces
    - Define GlassCardProps interface (children, variant, depth, hover, className, as)
    - Implement variant support (default, elevated, gold, interactive)
    - Implement depth levels (surface, elevated, overlay) with appropriate backgrounds and borders
    - Apply backdrop-blur-glass (12px) and rounded-2xl border radius
    - Add hover effects (border-brand-gold/25, shadow-card-hover, -translate-y-0.5 transform)
    - Support polymorphic rendering with 'as' prop for semantic HTML
    - Use tailwind-merge for className merging without conflicts
    - Add proper TypeScript generics for polymorphic component
    - _Requirements: 4.1-4.13, 16.1-16.10_

  - [~] 4.2 Write unit tests for GlassCard component
    - Test all variant and depth combinations render correct classes
    - Test hover effects apply correctly when hover=true
    - Test polymorphic rendering with different element types
    - Test className merging without conflicts
    - Test accessibility with proper focus states
    - _Requirements: 4.1-4.13, 23.1-23.4_

- [ ] 5. Implement StatCard component
  - [~] 5.1 Create StatCard TypeScript component with proper interfaces
    - Define StatCardProps interface (icon, label, value, subtitle, trend, trendValue, highlight, loading, onClick, className)
    - Render icon in circular background with hover response
    - Display value using large display typography (Sora font, stat-number class)
    - Implement trend indicator (up/down/neutral) with appropriate colors and arrow icons
    - Add highlight state with gold accent border and background
    - Implement loading skeleton state
    - Add hover lift effect (-translate-y-0.5) when onClick provided
    - Apply 200ms transition duration for all hover effects
    - _Requirements: 8.1-8.12_

  - [~] 5.2 Write unit tests for StatCard component
    - Test all trend variants render correct colors and icons
    - Test highlight state applies gold accent
    - Test loading state displays skeleton
    - Test hover effects when onClick provided
    - Test accessibility with proper ARIA labels
    - _Requirements: 8.1-8.12, 23.1-23.4_

- [ ] 6. Implement ProgressBar component
  - [~] 6.1 Create ProgressBar TypeScript component with proper interfaces
    - Define ProgressBarProps interface (value, max, label, showPercentage, variant, size, animate, className)
    - Calculate percentage as (value / max) × 100
    - Apply smooth width transition over 700ms with ease-out timing
    - Implement variant support (default, gold, bid, ask) with appropriate gradient fills
    - Support size variants (sm, md, lg) with appropriate heights
    - Display label and percentage with proper formatting
    - Add ARIA attributes (role progressbar, aria-valuenow, aria-valuemin, aria-valuemax)
    - Trigger progress-fill animation on mount when animate=true
    - _Requirements: 9.1-9.12_

  - [~] 6.2 Write unit tests for ProgressBar component
    - Test percentage calculation accuracy
    - Test all variant and size combinations
    - Test animation triggers on mount
    - Test ARIA attributes for accessibility
    - Test label and percentage display
    - _Requirements: 9.1-9.12, 23.1-23.4_

- [ ] 7. Implement MarketBadge component
  - [~] 7.1 Create MarketBadge TypeScript component with proper interfaces
    - Define MarketBadgeProps interface (children, icon, variant, size, pulse, className)
    - Render with rounded-full shape
    - Implement variant support (gold, bid, ask, neutral, info) with appropriate colors
    - Support optional icon with proper spacing
    - Add pulse animation for live status indicators
    - Support size variants (sm, md) with appropriate padding and font sizes
    - _Requirements: 10.1-10.11_

  - [~] 7.2 Write unit tests for MarketBadge component
    - Test all variant combinations render correct colors
    - Test icon display with proper spacing
    - Test pulse animation when pulse=true
    - Test size variants apply correct styles
    - _Requirements: 10.1-10.11, 23.1-23.4_

- [~] 8. Checkpoint - Verify core UI components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement PriceDisplay component
  - [~] 9.1 Create PriceDisplay TypeScript component with proper interfaces
    - Define PriceDisplayProps interface (value, change, changePercent, currency, size, showChange, animate, className)
    - Use formatPrice utility for number formatting with thousand separators
    - Apply tabular-nums font feature (JetBrains Mono) for digit alignment
    - Use getFlowColor utility for color coding based on change direction
    - Implement showChange to display change value and changePercent
    - Add counter-up animation when animate=true
    - Support size variants (sm, md, lg, xl) with appropriate font sizes
    - Handle negative values with proper sign placement
    - _Requirements: 6.1-6.11_

  - [~] 9.2 Write unit tests for PriceDisplay component
    - Test formatPrice integration with various decimal places
    - Test color coding for positive/negative/zero changes
    - Test showChange displays change and percentage correctly
    - Test animation triggers when animate=true
    - Test all size variants render correctly
    - _Requirements: 6.1-6.11, 23.1-23.4_

- [ ] 10. Implement MarketTicker component
  - [~] 10.1 Create MarketTicker TypeScript component with proper interfaces
    - Define MarketTickerProps and MarketTickerItem interfaces
    - Implement infinite scrolling animation with seamless loop using CSS transforms
    - Configure speed variants (slow: 24s, normal: 18s, fast: 12s)
    - Display symbol, price, change, changePercent, volume, timestamp for each item
    - Apply bid color (green) for positive changes, ask color (red) for negative
    - Implement compact variant with reduced spacing and font sizes
    - Maintain 60fps performance using GPU-accelerated transforms
    - Add ARIA labels for screen reader accessibility
    - _Requirements: 5.1-5.11_

  - [~] 10.2 Write unit tests for MarketTicker component
    - Test infinite scrolling animation with all speed variants
    - Test color coding for positive/negative changes
    - Test compact variant reduces spacing correctly
    - Test ARIA labels for accessibility
    - Test performance with large datasets
    - _Requirements: 5.1-5.11, 23.1-23.4_

- [ ] 11. Implement TapeReadingVisualization component
  - [~] 11.1 Create TapeReadingVisualization TypeScript component with proper interfaces
    - Define TapeReadingVisualizationProps and TapeEntry interfaces
    - Display timestamp, price, volume, side, isAggressive for each entry
    - Show newest entries at top with scrolling behavior
    - Apply bid color (green) for bid side, ask color (red) for ask side
    - Highlight entries with volume exceeding highlightThreshold
    - Apply subtle fade-out effect to older entries
    - Animate new entries with slide-down effect
    - Limit display to maxEntries when specified
    - Support detailed and compact variants
    - _Requirements: 7.1-7.11_

  - [~] 11.2 Write unit tests for TapeReadingVisualization component
    - Test newest entries display at top
    - Test color coding for bid/ask sides
    - Test volume highlighting above threshold
    - Test fade-out effect on older entries
    - Test entry limit with maxEntries
    - Test detailed vs compact variants
    - _Requirements: 7.1-7.11, 23.1-23.4_

- [ ] 12. Implement DataGrid component
  - [~] 12.1 Create DataGrid TypeScript component with proper interfaces
    - Define DataGridProps and DataGridColumn interfaces with TypeScript generics
    - Render semantic HTML table (thead, tbody, th, td)
    - Implement column sorting with visual indicators
    - Apply row highlighting based on highlightRow predicate
    - Implement loading state with skeleton rows
    - Display emptyMessage when data is empty
    - Support column alignment (left, center, right)
    - Add ARIA labels and keyboard navigation for accessibility
    - Make rows interactive with hover effects when onRowClick provided
    - _Requirements: 11.1-11.12_

  - [~] 12.2 Write unit tests for DataGrid component
    - Test column sorting functionality
    - Test row highlighting with predicate
    - Test loading state displays skeleton
    - Test empty state displays message
    - Test keyboard navigation
    - Test ARIA labels for accessibility
    - _Requirements: 11.1-11.12, 23.1-23.4_

- [~] 13. Checkpoint - Verify market-specific components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement animation system and performance optimization
  - [~] 14.1 Create useStaggeredAnimation custom hook
    - Accept ref, selector, baseDelay, and animationClass parameters
    - Apply incremental delay to each element based on index
    - Limit maximum delay to 1000ms for performance
    - Clean up animation classes on unmount
    - Use CSS custom property for animation-delay
    - _Requirements: 13.1-13.10_

  - [~] 14.2 Implement performance monitoring and optimization
    - Monitor frame rate using requestAnimationFrame timing
    - Detect devices that cannot maintain 60fps
    - Automatically disable non-critical animations on weak devices
    - Store animation preference in localStorage
    - Provide user setting to manually enable/disable animations
    - Apply React.memo to expensive components (DataGrid, TapeReadingVisualization)
    - Implement virtual scrolling for lists exceeding 50 items
    - Debounce real-time market data updates to 100ms intervals
    - _Requirements: 12.1-12.10, 18.1-18.12_

  - [~] 14.3 Write performance tests
    - Test frame rate monitoring accuracy
    - Test animation disabling on performance degradation
    - Test localStorage persistence of animation preference
    - Test React.memo optimization effectiveness
    - Test virtual scrolling with large datasets
    - _Requirements: 12.1-12.10, 18.1-18.12, 23.1-23.4_

- [ ] 15. Implement responsive design and accessibility features
  - [~] 15.1 Add responsive breakpoint utilities
    - Configure mobile layout for viewports < 640px
    - Configure tablet layout for viewports 640px-1023px
    - Configure desktop layout for viewports ≥ 1024px
    - Ensure minimum touch target size of 44x44px on mobile
    - Test responsive behavior at breakpoints: 320px, 640px, 768px, 1024px, 1280px, 1920px
    - _Requirements: 14.1-14.10_

  - [~] 15.2 Implement accessibility features
    - Add visible focus states with brand gold color (2px width, 2px offset)
    - Ensure all interactive elements are keyboard accessible
    - Maintain logical tab order for keyboard navigation
    - Add skip-to-content link for keyboard users
    - Validate all text meets 4.5:1 contrast ratio (WCAG AA)
    - Provide ARIA labels for icon-only buttons
    - Use semantic HTML elements (header, nav, main, article, section, footer)
    - Sanitize ARIA labels to prevent misleading announcements
    - _Requirements: 15.1-15.12_

  - [~] 15.3 Write accessibility tests
    - Test keyboard navigation through all interactive elements
    - Test focus states visibility
    - Test ARIA labels with screen reader simulation
    - Test color contrast ratios with automated tools
    - Test semantic HTML structure
    - _Requirements: 15.1-15.12, 23.5-23.8_

- [ ] 16. Implement error handling and fallbacks
  - [~] 16.1 Add error boundaries and fallback mechanisms
    - Implement React error boundaries to prevent component crashes
    - Add fallback for browsers without backdrop-filter support
    - Implement font loading retry after 5 seconds on failure
    - Add console warnings for invalid color values with fallback to defaults
    - Enable horizontal scrolling when content exceeds container width
    - Implement network request retry with exponential backoff
    - Add loading states for asynchronous operations
    - Log errors for monitoring and debugging
    - _Requirements: 19.1-19.10_

  - [~] 16.2 Write error handling tests
    - Test error boundaries catch and display errors gracefully
    - Test backdrop-filter fallback on unsupported browsers
    - Test font loading retry mechanism
    - Test invalid color value handling
    - Test network retry with exponential backoff
    - _Requirements: 19.1-19.10, 23.1-23.4_

- [~] 17. Checkpoint - Verify animation, responsive design, and error handling
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Create example page templates and integrate with existing platform
  - [~] 18.1 Create DashboardPage template
    - Build welcome banner with GlassCard (gold variant) and ProgressBar
    - Create stats grid with StatCard components (lessons, simulations, exam, ranking)
    - Apply staggered entrance animations (animate-fade-up-1 through animate-fade-up-4)
    - Integrate with existing course data from Supabase
    - Add MarketTicker to top bar with real-time data
    - _Requirements: 1.1-23.8 (integration of all components)_

  - [~] 18.2 Create CourseDetailPage template
    - Build course header with GlassCard and course metadata
    - Display lesson list with DataGrid component
    - Show progress tracking with ProgressBar components
    - Add TapeReadingVisualization for market data context
    - Integrate with existing course service API
    - _Requirements: 1.1-23.8 (integration of all components)_

  - [~] 18.3 Update existing pages with new components
    - Replace existing card components with GlassCard
    - Update progress indicators with new ProgressBar component
    - Add MarketBadge to status indicators
    - Apply new typography system (Sora for headings, JetBrains Mono for data)
    - Ensure backward compatibility with existing features
    - _Requirements: 1.1-23.8 (integration of all components)_

- [~] 19. Write integration tests for page templates
  - Test DashboardPage renders all components correctly
  - Test CourseDetailPage integrates with course service API
  - Test navigation between pages maintains state
  - Test responsive behavior on mobile, tablet, and desktop
  - Test accessibility with keyboard navigation and screen readers
  - _Requirements: 23.5-23.8_

- [~] 20. Write end-to-end tests with Playwright
  - Test complete user journey from dashboard to course completion
  - Test market data updates in real-time components
  - Test animation performance across different devices
  - Test accessibility with @axe-core/playwright
  - Test responsive design at all breakpoints
  - _Requirements: 23.5-23.8_

- [~] 21. Final checkpoint and performance validation
  - Run Lighthouse performance audit (target score ≥ 90)
  - Verify First Contentful Paint (FCP) < 1.5s
  - Verify Largest Contentful Paint (LCP) < 2.5s
  - Verify Time to Interactive (TTI) < 3.5s on 3G network
  - Verify component library bundle size < 50KB gzipped
  - Run npm audit and fix high/critical vulnerabilities
  - Verify all animations maintain 60fps
  - Test font loading with font-display swap
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All components use TypeScript with strict type checking enabled
- Design tokens are centralized in TailwindCSS preset for consistency
- All animations use GPU-accelerated transforms and opacity for 60fps performance
- Glassmorphism effects use three-tier depth system (surface, elevated, overlay)
- Color system follows financial market semantics (bid=green, ask=red, gold=brand)
- All components maintain WCAG AA accessibility standards (4.5:1 contrast ratio)
- Font loading uses font-display swap to prevent Flash of Invisible Text (FOIT)
- Performance optimization includes React.memo, virtual scrolling, and debouncing
- Error boundaries prevent component crashes from breaking the entire application
- Responsive design supports viewports from 320px to 2560px
- Integration with existing Supabase backend and React Query for data fetching
- All components are reusable and composable following atomic design principles

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["4.1", "5.1", "6.1", "7.1"] },
    { "id": 3, "tasks": ["4.2", "5.2", "6.2", "7.2", "9.1"] },
    { "id": 4, "tasks": ["9.2", "10.1", "11.1", "12.1"] },
    { "id": 5, "tasks": ["10.2", "11.2", "12.2", "14.1", "14.2"] },
    { "id": 6, "tasks": ["14.3", "15.1", "15.2", "16.1"] },
    { "id": 7, "tasks": ["15.3", "16.2", "18.1", "18.2"] },
    { "id": 8, "tasks": ["18.3", "19", "20"] }
  ]
}
```
