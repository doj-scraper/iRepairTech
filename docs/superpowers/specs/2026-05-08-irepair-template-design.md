# iRepair Technologies Template Design

## Goal

Turn the current project into a sellable premium-industrial ecommerce template for a Houston wholesale cellphone repair parts business. The template should feel like a believable real operation with strong merchandising, clear operational signals, and reusable design primitives that carry across storefront, account, and admin surfaces.

## Brand Direction

### Positioning

iRepair Technologies should read as a wholesale business with inventory, dispatch capability, and repeat-buyer workflows, not a generic startup storefront. The visual language should feel operational, tactile, and credible without becoming cold or overly corporate.

### Palette

- Midnight Navy: `#101A2A`
- Oxidized Teal: `#1F6F78`
- Brass Gold: `#B88A3B`
- Warm Concrete: `#E9E4DB`
- Graphite: `#2C3138`
- Dust White: `#F7F4EE`

### Identity System

- Primary mark: `iRepair Technologies` wordmark
- Secondary badge: Houston / wholesale / dispatch credibility cues
- Tertiary mark: compact monogram for favicon and compact placements

## Visual System

### Core Feel

- Premium-industrial rather than glossy luxury
- Structured, merchandised, image-forward presentation
- Strong product framing, crisp borders, and layered surfaces
- Subtle physical motion using transform and opacity only

### Layout Principles

- Detached floating header rather than a flat strip
- Large, breathable sections with clear operational storytelling
- Product grids that prioritize scanability and wholesale buying cues
- Reusable card shells that can support storefront, account, and admin variants

### Product Merchandising System

The product card is the signature component of the template.

- Outer machined shell with inner content core
- Strong image bay with controlled aspect ratio and framed media
- Stock, MOQ, and product type chips near the top of the card
- Price and CTA anchored at the bottom for quick scanning
- Hover behavior: subtle lift, border glow, image zoom, CTA intensification, chip emphasis
- Variants for part, service, low stock, out of stock, featured, and admin views

### Motion

- Bulletin strip with restrained movement
- Fade-up entry motion on major sections
- Card hover motion based on lift, glow, and image interpolation
- Button hover motion with nested icon movement
- No flashy bounce or novelty transitions

## Surface Plan

### Shared Primitives

- Refresh design tokens in `globals.css`
- Upgrade `Button`, `Card`, `Badge`, `Input`, and `Textarea`
- Introduce reusable branded shells, section labels, metric chips, and panel headers

### Header / Footer / Bulletin

- Floating, high-credibility header with mobile navigation
- Brand copy emphasizing Houston stock, wholesale-only, and dispatch timing
- Bulletin strip focused on inventory/operations rather than generic marketing copy
- Footer upgraded into a believable business contact and trust area

### Homepage

- Hero reframed around Houston inventory, wholesale pricing, and fast dispatch
- Signature merch card or featured inventory module above the fold
- Trust sections for MOQ, volume pricing, support, and fulfillment
- Stronger visual differentiation between marketing and buying sections

### Catalog

- Distinct merchandised grid using the new product card system
- Better hierarchy between parts and services
- Stronger empty/loading states using the same brand language

### Checkout / Auth / Success

- Unified branded conversion surfaces rather than plain forms
- More trustworthy order summary and progress framing
- Inputs and feedback updated to the new component system

### Dashboard / Customer History

- Customer account page should show recent orders, order status, totals, and a clearer business relationship view
- Add profile/account framing so login feels like a real buyer portal

### Admin Board

- Upgrade the admin page from a raw utility screen into an operations board
- Maintain clarity and speed, but use the same brand primitives and metrics language

## Data and Architecture Constraints

- Preserve Stripe checkout + webhook enqueue-only + worker processing architecture
- Preserve Supabase + RLS boundaries
- Prefer server-first Next.js patterns where feasible
- Keep type safety strict and remove weak or drifting edges encountered during the refactor

## Repo Organization

- Create `docs/` as the home for project documents other than `ARCHITECTURE.md`, `README.md`, and `AGENTS.md`
- Group moved documents by purpose so the repo feels maintainable to template buyers and collaborators

## Validation

- Run the repo’s existing validation commands
- Add no new frameworks unless required to support existing project capabilities
- Finish with a full repo review, then commit and push
