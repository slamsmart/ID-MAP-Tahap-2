# ID-MAP Frontend Summary

## 1. Overview

Frontend ID-MAP dibangun dengan Next.js 14 App Router, React 18, TypeScript, dan TailwindCSS. UI terdiri dari halaman publik, dashboard role-based, peta interaktif, live chat, dan PWA support.

Root layout berada di `src/app/layout.tsx` dan memasang:
- Global metadata and SEO.
- Font loading.
- Convex provider.
- Language provider.
- LiveChat.
- InstallPrompt.
- ServiceWorkerRegistrar.

## 2. Frontend Structure

```text
src/app/
  admin/
  api/
  daftar/
  donasi-cepat/
  edukasi-ekosistem-pesisir/
  faq/
  jelajahi-peta-mangrove/
  lupa-password/
  masuk/
  mitra/
  mitra-kami/
  offline/
  proyek/
  tentang/
  uji-coba-peta/
  user/
  verifikator/

src/components/
  chat/
  dashboard/
  landing/
  map/
  pwa/
  shared/
  ui/
```

## 3. Public Pages

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/proyek` | Public project listing |
| `/donasi-cepat/[projectId]` | Fast donation flow |
| `/jelajahi-peta-mangrove` | Interactive mangrove map |
| `/uji-coba-peta` | Carbon/support estimation tool |
| `/edukasi-ekosistem-pesisir` | Coastal ecosystem education |
| `/tentang` | About ID-MAP |
| `/faq` | Frequently asked questions |
| `/mitra-kami` | Partner information |
| `/masuk` | Login |
| `/daftar` | Registration |
| `/lupa-password` | Password reset |
| `/offline` | Offline fallback |

## 4. Dashboard Pages

| Route | Role | Focus |
|---|---|---|
| `/user` | Sahabat | Donation, impact, history, certificate |
| `/mitra` | Mitra | Project, funding, KYC, MRV |
| `/verifikator` | Verifikator | Verification, GIS data, content editing |
| `/admin` | Admin | Operations, users, KYC, project, transaction, reports |

Note: `/corporate` exists in codebase, but Corporate Carbon Purchase Flow is not part of the current documentation scope.

## 5. Component Areas

| Folder | Purpose |
|---|---|
| `components/landing` | Landing page sections such as hero, stats, project, services |
| `components/dashboard` | Dashboard shell and panels |
| `components/map` | Map layers and map-specific components |
| `components/shared` | Navbar, footer, session guard, transitions |
| `components/chat` | Live chat UI |
| `components/pwa` | Install prompt and service worker registration |
| `components/ui` | Generic UI components and skeletons |

## 6. UX Principles

| Principle | Implementation Direction |
|---|---|
| Trust-first | Show verified status, transparent contribution, project details |
| Mobile-first | Donation and public pages must work well on phone |
| Role clarity | Each dashboard focuses only on role-specific tasks |
| Progressive disclosure | Advanced MRV/admin controls hidden from public |
| Human language | Avoid heavy technical jargon in public UI |
| Accessible by default | Labels, visible focus, keyboard support, contrast |

## 7. Main UI Patterns

### Navbar

Purpose:
- Public navigation.
- Auth entry.
- Brand recognition.

Expected behavior:
- Responsive mobile menu.
- Clear active route.
- CTA to login/register or dashboard.

### Project Card

Purpose:
- Show project title, image, location, status, progress, funding, and CTA.

Important states:
- Draft/internal.
- Dalam Proses.
- Terverifikasi.
- Loading.
- Empty project list.

### Donation Modal/Page

Purpose:
- Select donation amount.
- Show impact estimate.
- Create QRIS/invoice.
- Show payment status.

Important states:
- Loading QRIS.
- Payment pending.
- Payment paid.
- Payment failed.
- Rate limited.

### Dashboard Sidebar

Purpose:
- Role-specific navigation.
- Keep repeated workflows discoverable.

Important states:
- Mobile collapsed.
- Active route.
- Logout.

### AI Panel / Live Chat

Purpose:
- Answer public questions.
- Help dashboard users analyze mangrove/project context.

Important states:
- Streaming/loading.
- Provider failure.
- Rate limited.
- Empty conversation.

### Map

Purpose:
- Visualize coastal data layers.

Layer examples:
- Mangrove.
- Abrasion.
- Turtle.
- Pokmaswas.

Important states:
- Client-only render.
- Tile loading.
- Layer toggle.
- Marker popup.

## 8. Responsive Requirements

| Breakpoint | Behavior |
|---|---|
| Mobile | Stacked layout, compact nav, touch-friendly buttons |
| Tablet | Partial grid, manageable dashboard spacing |
| Desktop | Sidebar dashboard, multi-column cards |
| Wide | Constrained content width to avoid unreadable lines |

## 9. Accessibility Requirements

Baseline:
- Every form input has a visible label or accessible label.
- Error messages are tied to fields.
- Icon-only buttons have `aria-label`.
- Focus states remain visible.
- Color contrast targets WCAG AA.
- Image content has meaningful alt text.
- Keyboard navigation works for modal, menu, and form.
- Escape closes modal/dropdown where relevant.

## 10. Frontend Performance

Current strategy:
- Next.js image optimization where used.
- WebP assets in public images.
- Map resources preconnected/dns-prefetched.
- Client-only rendering for map-heavy components where necessary.
- Loading skeletons for dashboard.
- Service worker and install prompt for PWA experience.

Recommended next:
- Audit Core Web Vitals.
- Reduce duplicated dashboard UI.
- Lazy-load heavy map and AI panels.
- Add error boundaries to dashboard panels.
- Add visual regression screenshots for landing and dashboard.

## 11. Frontend Risks

| Risk | Mitigation |
|---|---|
| Dashboard UI duplication | Extract shared DataTable, StatCard, DetailPanel |
| Heavy map render | Dynamic import, layer lazy loading |
| Payment state confusion | Clear pending/paid/failed UI states |
| AI response latency | Streaming/loading state and fallback message |
| Mobile overflow | Test primary pages on small viewport |

