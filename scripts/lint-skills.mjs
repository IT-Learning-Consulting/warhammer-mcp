#!/usr/bin/env node
// lint-skills.mjs — frontmatter lint for .claude/skills/wfrp-*/SKILL.md
//
// Verifies presence of required fields per master §S2:
//   name, description, effort, primitives_used, deletes_tools, bugs_subsumed
//
// Exit 0 = all valid; exit 1 = any failure (path + field printed).

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Skills root resolution (in order):
//   1. CLI arg: `node scripts/lint-skills.mjs <path>`
//   2. env var: WFRP_SKILLS_ROOT
//   3. `<repo>/../../warhammer_system/.claude/skills` (vault adjacent to D:\foundry-vtt-mcp)
//   4. `E:/warhammer_system/.claude/skills` (this developer's vault)
function resolveSkillsRoot() {
  if (process.argv[2]) return resolve(process.argv[2]);
  if (process.env.WFRP_SKILLS_ROOT) return resolve(process.env.WFRP_SKILLS_ROOT);
  const candidates = [
    resolve(__dirname, '..', '..', 'warhammer_system', '.claude', 'skills'),
    'E:/warhammer_system/.claude/skills',
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return candidates[0];
}

const SKILLS_ROOT = resolveSkillsRoot();

const REQUIRED_FIELDS = [
  'name',
  'description',
  'effort',
  'primitives_used',
  'deletes_tools',
  'bugs_subsumed',
];

const ARRAY_FIELDS = new Set(['primitives_used', 'deletes_tools', 'bugs_subsumed']);

function extractFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;
  return lines.slice(1, end);
}

function parseFrontmatter(fmLines) {
  const out = {};
  let i = 0;
  while (i < fmLines.length) {
    const line = fmLines[i];
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!match) { i++; continue; }
    const [, key, rawValue] = match;
    const value = rawValue.trim();

    // Block scalar: `key: |` followed by indented lines
    if (value === '|' || value === '>') {
      const block = [];
      i++;
      while (i < fmLines.length && /^\s+/.test(fmLines[i])) {
        block.push(fmLines[i].replace(/^\s{2}/, ''));
        i++;
      }
      out[key] = block.join('\n').trim();
      continue;
    }

    // Inline array `[a, b, c]`
    if (value.startsWith('[') && value.endsWith(']')) {
      out[key] = value
        .slice(1, -1)
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      i++;
      continue;
    }

    // Block list: empty value followed by `- item` lines
    if (value === '') {
      const arr = [];
      i++;
      while (i < fmLines.length && /^\s*-\s+/.test(fmLines[i])) {
        arr.push(fmLines[i].replace(/^\s*-\s+/, '').trim());
        i++;
      }
      if (arr.length > 0) {
        out[key] = arr;
      } else {
        out[key] = '';
      }
      continue;
    }

    out[key] = value;
    i++;
  }
  return out;
}

function listWfrpSkills(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter(name => name.startsWith('wfrp-'))
    .map(name => join(root, name))
    .filter(p => statSync(p).isDirectory())
    .map(p => join(p, 'SKILL.md'))
    .filter(p => existsSync(p));
}

function lintSkill(path) {
  const errors = [];
  const content = readFileSync(path, 'utf8');
  const fmLines = extractFrontmatter(content);
  if (!fmLines) {
    return [`${path}: missing or malformed frontmatter (expected --- delimited block at top)`];
  }
  const fm = parseFrontmatter(fmLines);
  for (const field of REQUIRED_FIELDS) {
    if (!(field in fm)) {
      errors.push(`${path}: missing required field "${field}"`);
      continue;
    }
    const val = fm[field];
    if (ARRAY_FIELDS.has(field)) {
      if (!Array.isArray(val)) {
        errors.push(`${path}: field "${field}" must be an array (got ${typeof val})`);
      }
    } else {
      if (typeof val !== 'string' || val.length === 0) {
        errors.push(`${path}: field "${field}" must be a non-empty string`);
      }
    }
  }
  return errors;
}

function main() {
  const skills = listWfrpSkills(SKILLS_ROOT);
  const allErrors = [];
  for (const path of skills) {
    allErrors.push(...lintSkill(path));
  }
  if (allErrors.length > 0) {
    console.error(`lint-skills: ${allErrors.length} issue(s) across ${skills.length} skill(s)`);
    for (const e of allErrors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log(`lint-skills: ${skills.length} skill${skills.length === 1 ? '' : 's'} checked, all valid`);
  process.exit(0);
}

main();
