import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

const processes = [];

function run(label, args, cwd) {
  const child = spawn(node, args, {
    cwd: path.join(root, cwd),
    stdio: 'inherit',
    shell: false,
  });

  child.on('error', (err) => {
    console.error(`[${label}] no pudo iniciar: ${err.message}`);
    for (const p of processes) {
      if (p !== child) {
        try { p.kill(); } catch { /* ignorar */ }
      }
    }
    process.exit(1);
  });

  child.on('exit', (code) => {
    const c = code ?? 0;
    if (c !== 0) {
      console.error(`[${label}] terminó con código ${c}`);
      for (const p of processes) {
        if (p !== child) {
          try { p.kill(); } catch { /* ignorar */ }
        }
      }
      process.exit(c);
    }
  });

  processes.push(child);
  return child;
}

// Backend: tsx watch (recarga en caliente de src/index.ts)
const backend = run('backend', ['node_modules/tsx/dist/cli.mjs', 'watch', 'src/index.ts'], 'backend');

// Frontend: Vite dev server
const frontend = run('frontend', ['node_modules/vite/bin/vite.js'], 'frontend');

const shutdown = (signal) => {
  console.log(`\n[${signal}] Cerrando ZAVADIVKER MOTOS...`);
  for (const p of [backend, frontend]) {
    if (!p.killed) p.kill('SIGTERM');
  }
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
