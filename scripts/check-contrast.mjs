#!/usr/bin/env node
/**
 * Verifies the palette in app/globals.css against WCAG 2.1 contrast minima.
 *
 *   node scripts/check-contrast.mjs
 *
 * Exits non-zero if any pair fails in either theme.
 *
 * `rule` and `rule-2` are not checked: they are decorative hairlines between
 * rows and sections, which WCAG 1.4.11 does not cover. Form controls, which
 * must be seen to be used, are bordered with `field`, and that is checked.
 *
 * Keep the values below in sync with the light-dark() pairs in globals.css.
 */

const LIGHT = {
  paper: '#ffffff',
  'paper-2': '#f5f7fa',
  ink: '#0b1a33',
  'ink-soft': '#3f4b63',
  'ink-mute': '#677287',
  'ink-hover': '#1c2d4d',
  field: '#7f899c',
  accent: '#b8520a',
  'on-accent': '#ffffff',
  good: '#1a7f37',
  bad: '#b42822',
  'grade-again': '#c8342f',
  'grade-hard': '#7a6a55',
  'grade-good': '#1a7f37',
  'grade-easy': '#2a78d6',
}

const DARK = {
  paper: '#0c121c',
  'paper-2': '#131b28',
  ink: '#e8ecf3',
  'ink-soft': '#b3bccb',
  'ink-mute': '#8a94a7',
  'ink-hover': '#ffffff',
  field: '#5d6a82',
  accent: '#f08a3c',
  'on-accent': '#0c121c',
  good: '#4cc474',
  bad: '#f08080',
  'grade-again': '#e66767',
  'grade-hard': '#b49c7c',
  'grade-good': '#3fb862',
  'grade-easy': '#5b9cf0',
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
  for (const fg of ['ink', 'ink-soft', 'ink-mute', 'accent', 'good', 'bad']) {
    for (const bg of ['paper', 'paper-2']) {
      out.push([`${fg} on ${bg}`, ratio(p[fg], p[bg]), AA_TEXT])
    }
  }
  for (const bg of ['paper', 'paper-2']) {
    out.push([`field on ${bg}`, ratio(p.field, p[bg]), AA_UI])
  }
  // Grade dots and forecast bars are non-text marks.
  for (const grade of ['again', 'hard', 'good', 'easy']) {
    out.push([`grade-${grade} on paper`, ratio(p[`grade-${grade}`], p.paper), AA_UI])
  }
  // Solid buttons: paper text on an ink fill, at rest and on hover.
  out.push(['paper on ink', ratio(p.paper, p.ink), AA_TEXT])
  out.push(['paper on ink-hover', ratio(p.paper, p['ink-hover']), AA_TEXT])
  out.push(['on-accent on accent', ratio(p['on-accent'], p.accent), AA_TEXT])
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

const lightFailures = report('LIGHT', LIGHT)
const darkFailures = report('DARK', DARK)

console.log(`\nlight: ${lightFailures} failure(s)   dark: ${darkFailures} failure(s)\n`)

if (lightFailures + darkFailures > 0) {
  console.error(`Palette has ${lightFailures + darkFailures} contrast failure(s).`)
  process.exit(1)
}
