/**
 * ThemeTokens.jsx
 * Satu-satunya file tema — ganti warna di sini, berlaku di seluruh app.
 */

export const tokens = {
  // ── Background ──────────────────────────────
  bg:               '#D4EDF5',
  bgSecondary:      '#C2E4EF',
  cardBg:           '#ffffff',
  cardBorder:       '#A8D4E0',

  // ── Gradient & Aksen ────────────────────────
  headerBg:         'linear-gradient(135deg, #00838F, #006B77)',
  headerColor:      '#ffffff',
  accentGradient:   'linear-gradient(135deg, #00838F, #006B77)',
  accentColor:      '#00838F',
  accentShadow:     'rgba(0,131,143,0.2)',
  accentIconBg:     'rgba(255,255,255,0.15)',
  accentIconColor:  '#ffffff',

  // ── Teks ────────────────────────────────────
  textPrimary:      '#0A3D47',
  textSub:          '#52889A',
  textOnDark:       'rgba(255,255,255,0.85)',

  // ── Tabel ───────────────────────────────────
  rowOdd:           '#ffffff',
  rowEven:          '#F0F9FB',
  rowHover:         'rgba(0,131,143,0.06)',
  zeroBg:           '#E8F5F7',
  zeroColor:        '#8BBBC8',
  divider:          'rgba(0,131,143,0.1)',

  // ── UI ──────────────────────────────────────
  btnBorder:        '#B8DCE5',
  hoverBg:          'rgba(0,131,143,0.06)',
  paginBg:          'rgba(0,131,143,0.06)',
  iconBg:           'rgba(0,131,143,0.08)',
  tooltipBg:        '#0A3D47',
  tooltipBorder:    'rgba(0,131,143,0.3)',
  barColor:         '#00838F',

  // ── Badge ───────────────────────────────────
  badgeBg:          '#E0F4F7',
  badgeColor:       '#006B77',
  badgeBorder:      '#B8DCE5',

  // ── Sidebar ─────────────────────────────────
  sidebarBg:        '#005F6B',
  sidebarBorder:    'rgba(255,255,255,0.12)',
  sidebarCard:      'rgba(255,255,255,0.08)',
  sidebarCardBorder:'rgba(255,255,255,0.15)',
  activeBg:         'linear-gradient(135deg, #3DBFBF, #009FAF)',
  activeColor:      '#ffffff',
  sidebarText:      '#ffffff',
  sidebarTextSub:   'rgba(255,255,255,0.55)',
  sidebarHoverBg:   'rgba(255,255,255,0.08)',
};

export function getTokens() {
  return tokens;
}