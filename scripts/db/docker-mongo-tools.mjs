#!/usr/bin/env node
/**
 * mongodump / mongorestore внутри Docker MongoDB.
 * Читает .env только через fs (без bash source / ssh heredoc).
 * Пароль передаётся в docker exec через spawn argv — не через shell.
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

function readEnvVar(filePath, key) {
  if (!existsSync(filePath)) {
    throw new Error(`Файл не найден: ${filePath}`);
  }

  let value = '';
  const text = readFileSync(filePath, 'utf8');

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '').trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const k = line.slice(0, eq).trim();
    if (k !== key) continue;

    value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
  }

  return value;
}

function withAuthSource(uri, authDb) {
  if (!uri.includes('@') || /[?&]authSource=/.test(uri)) {
    return uri;
  }
  const sep = uri.includes('?') ? '&' : '?';
  return `${uri}${sep}authSource=${encodeURIComponent(authDb)}`;
}

function buildMongoArgs(envFile, dbName) {
  const url =
    readEnvVar(envFile, 'DATABASE_URL') ||
    readEnvVar(envFile, 'MONGODB_URI');
  const login = readEnvVar(envFile, 'DATABASE_LOGIN');
  const pass = readEnvVar(envFile, 'DATABASE_PASS');
  const authDb =
    readEnvVar(envFile, 'DATABASE_AUTH_SOURCE') ||
    readEnvVar(envFile, 'MONGODB_AUTH_SOURCE') ||
    'admin';

  if (login) {
    if (!pass) {
      throw new Error(
        'DATABASE_LOGIN задан, но DATABASE_PASS пустой в .env. ' +
          'Укажите пароль MongoDB в файле (это не пароль SSH).',
      );
    }

    return [
      '--host',
      '127.0.0.1',
      '--port',
      '27017',
      '--username',
      login,
      '--password',
      pass,
      '--authenticationDatabase',
      authDb,
      '--db',
      dbName,
    ];
  }

  if (!url) {
    throw new Error(
      'В .env нет DATABASE_URL и нет DATABASE_LOGIN / DATABASE_PASS',
    );
  }

  return ['--uri', withAuthSource(url, authDb), '--db', dbName];
}

function dockerExec(container, command, args) {
  const result = spawnSync('docker', ['exec', container, command, ...args], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    container: { type: 'string', short: 'c' },
    env: { type: 'string', short: 'e' },
    db: { type: 'string', short: 'd' },
    out: { type: 'string', short: 'o' },
    in: { type: 'string', short: 'i' },
  },
});

const action = positionals[0];
const container = values.container;
const envFile = values.env;
const dbName = values.db;

if (!container || !envFile || !dbName || !action) {
  console.error(
    'Использование: docker-mongo-tools.mjs <dump|restore> -c CONTAINER -e .env -d DB [--out PATH | --in PATH]',
  );
  process.exit(1);
}

const mongoArgs = buildMongoArgs(envFile, dbName);

if (action === 'dump') {
  if (!values.out) {
    console.error('Для dump нужен --out');
    process.exit(1);
  }
  dockerExec(container, 'mongodump', [...mongoArgs, '--out', values.out]);
} else if (action === 'restore') {
  if (!values.in) {
    console.error('Для restore нужен --in');
    process.exit(1);
  }
  dockerExec(container, 'mongorestore', [
    ...mongoArgs,
    '--drop',
    values.in,
  ]);
} else {
  console.error(`Неизвестное действие: ${action}`);
  process.exit(1);
}
