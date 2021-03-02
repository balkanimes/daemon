import fs from 'fs';
import path from 'path';

export async function move(oldPath, newPath) {
  await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(oldPath);
    const writeStream = fs.createWriteStream(newPath);

    readStream.on('error', reject);
    writeStream.on('error', reject);

    readStream.on('close', () => resolve(fs.promises.unlink(oldPath)));

    readStream.pipe(writeStream);
  });
}

export function numberFromEnv(key, def) {
  if (typeof process.env[key] === 'undefined') {
    return def;
  }

  const v = Number(process.env[key]);
  if (isNaN(v)) {
    throw new Error(`Invalid value for ${key}. Number expected`);
  }
  
  return v;
}
