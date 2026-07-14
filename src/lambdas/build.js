'use strict';

const path = require('path');
const esbuild = require('esbuild');

const LAMBDAS = [
  'lambda-reclamos',
  'lambda-reportes',
  'lambda-procesamiento',
  'lambda-control-plazos',
  'lambda-notificaciones',
];

async function build(nombre) {
  const entry = path.join(__dirname, nombre, 'index.js');
  const outfile = path.join(__dirname, 'dist', nombre, 'index.js');

  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    minify: true,
    sourcemap: false,
    // El SDK de AWS v3 ya viene incluido en el runtime de Lambda Node.js,
    // pero lo empaquetamos igual para fijar version y evitar sorpresas.
    external: [],
    logLevel: 'info',
  });

  console.log(`[build] ${nombre} -> dist/${nombre}/index.js`);
}

async function main() {
  const target = process.argv[2];
  const lista = target ? [target] : LAMBDAS;

  if (target && !LAMBDAS.includes(target)) {
    console.error(`Lambda desconocida: ${target}. Opciones: ${LAMBDAS.join(', ')}`);
    process.exit(1);
  }

  for (const nombre of lista) {
    // eslint-disable-next-line no-await-in-loop
    await build(nombre);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
