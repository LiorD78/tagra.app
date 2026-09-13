#!/usr/bin/env node
// Odvodí <lastmod> v sitemap.xml z data posledního obsahového commitu daného
// souboru (ne plošných sweepů: patička, verze nav.js / assets/js skriptů).
// Použití:
//   node tools/sitemap_lastmod.js            přepíše sitemap.xml
//   node tools/sitemap_lastmod.js --dry-run  jen vypíše tabulku loc | starý | nový

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(REPO_ROOT, 'sitemap.xml');
const DRY_RUN = process.argv.includes('--dry-run');

function locToFile(loc) {
  const url = new URL(loc);
  let p = url.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  return p === '' ? 'index.html' : `${p}/index.html`;
}

function git(args) {
  return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
}

function gitShow(rev, file) {
  try {
    return execFileSync('git', ['show', `${rev}:${file}`], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'], // soubor nemusí v revizi existovat, to je očekávané
    });
  } catch {
    return null; // soubor v dané revizi neexistuje
  }
}

function stripSweepParts(content) {
  return content
    .replace(/<footer[\s\S]*?<\/footer>/g, '')
    .split('\n')
    .filter((line) => !line.includes('nav.js?v='))
    .filter((line) => !(line.includes('assets/js/') && line.includes('?v=')))
    .join('\n');
}

function isSweepCommit(hash, file) {
  const after = gitShow(hash, file);
  if (after === null) return false; // nemělo by nastat pro commit, co soubor mění
  const before = gitShow(`${hash}^`, file);
  if (before === null) return false; // soubor v tomto commitu vznikl -> obsahová změna
  return stripSweepParts(before) === stripSweepParts(after);
}

function lastContentDate(file) {
  let log;
  try {
    log = git(['log', '--format=%H%x09%cs', '--', file]).trim();
  } catch {
    return null;
  }
  if (!log) return null;
  const commits = log.split('\n').map((line) => {
    const [hash, date] = line.split('\t');
    return { hash, date };
  });
  for (const commit of commits) {
    if (!isSweepCommit(commit.hash, file)) {
      return commit.date;
    }
  }
  // Nemělo by nastat (poslední commit v historii vždy soubor vytváří), ale
  // pro jistotu vrať datum nejstaršího commitu.
  return commits[commits.length - 1].date;
}

function main() {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const urlBlockRe = /<url>[\s\S]*?<\/url>/g;
  const rows = [];

  const newXml = xml.replace(urlBlockRe, (block) => {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    if (!locMatch || !lastmodMatch) return block;

    const loc = locMatch[1];
    const oldDate = lastmodMatch[1];
    const file = locToFile(loc);

    let newDate = lastContentDate(file);
    if (!newDate) {
      rows.push({ loc, oldDate, newDate: oldDate, note: `soubor nenalezen v git historii: ${file}` });
      return block;
    }

    rows.push({ loc, oldDate, newDate });
    return block.replace(
      /<lastmod>[^<]+<\/lastmod>/,
      `<lastmod>${newDate}</lastmod>`
    );
  });

  if (DRY_RUN) {
    console.log('loc\tstarý\tnový');
    for (const r of rows) {
      console.log(`${r.loc}\t${r.oldDate}\t${r.newDate}${r.note ? `\t(${r.note})` : ''}`);
    }
    return;
  }

  fs.writeFileSync(SITEMAP_PATH, newXml, 'utf8');
  console.log(`Hotovo. Zpracováno ${rows.length} <url> záznamů.`);
}

main();
