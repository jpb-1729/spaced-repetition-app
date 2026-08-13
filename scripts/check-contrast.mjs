#!/usr/bin/env node
/**
 * Verifies the palette in app/globals.css against WCAG 2.1 contrast minima.
 *
 *   node scripts/check-contrast.mjs
 *
 * Exits non-zero if any pair in the DARK theme regresses. The LIGHT theme is
 * reported but not enforced: it has four pre-existing failures (ink-mute is
 * 3.26:1 on paper and is used by `.label` at 9.5px). Fixing those is a visual
 * change to every page, so it is tracked separately rather than blocking here.
 *
 * Keep the values below in sync with the light-dark() pairs in globals.css.
 */

const LIGHT = {
  paper: '#f1efe9',
  'paper-2': '#e8e5dd',
  card: '#f8f7f4',
  ink: '#16150f',
  'ink-soft': '#4b4a42',
  'ink-mute': '#86847a',
  rule: '#16150f',
  vermillion: '#c1402a',
  cobalt: '#2c4a86',
  moss: '#4a6141',
  'on-accent': '#f1efe9',
}

const DARK = {
  paper: '#14130f',
  'paper-2': '#201d18',
  card: '#1a1712',
  ink: '#ece9e1',
  'ink-soft': '#b5b1a5',
  'ink-mute': '#8b8879',
  rule: '#767065',
  vermillion: '#e2664a',
  cobalt: '#7fa3e0',
  moss: '#93b184',
  'on-accent': '#14130f',
}

const AA_TEXT = 4.5
const AA_UI = 3 // WCAG 1.4.11, non-text contrast

function luminance(hex) {
  const channels = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function pairs(p) {
  const out = []
  for (const fg of ['ink', 'ink-soft', 'ink-mute', 'vermillion', 'cobalt', 'moss']) {
    for (const bg of ['paper', 'paper-2', 'card']) {
      out.push([`${fg} on ${bg}`, ratio(p[fg], p[bg]), AA_TEXT])
    }
  }
  out.push(['rule on paper', ratio(p.rule, p.paper), AA_UI])
  for (const accent of ['vermillion', 'cobalt', 'moss']) {
    out.push([`on-accent on ${accent}`, ratio(p['on-accent'], p[accent]), AA_TEXT])
  }
  return out
}

function report(title, palette) {
  console.log(`\n── ${title} ──`)
  let failures = 0
  for (const [name, value, min] of pairs(palette)) {
    const ok = value >= min
    if (!ok) failures++
    const mark = ok ? '✅' : '❌'
    console.log(`  ${mark} ${name.padEnd(26)} ${value.toFixed(2).padStart(6)}  (min ${min})`)
  }
  return failures
}

const lightFailures = report('LIGHT (reported, not enforced)', LIGHT)
const darkFailures = report('DARK (enforced)', DARK)

console.log(`\nlight: ${lightFailures} known failure(s)   dark: ${darkFailures} failure(s)\n`)

if (darkFailures > 0) {
  console.error(`Dark theme has ${darkFailures} contrast failure(s).`)
  process.exit(1)
}
