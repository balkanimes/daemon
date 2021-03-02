import fs from 'fs/promises';
import path from 'path';
import os from 'os';

import Base from './base.js';

export class Dummy extends Base {
  static slug = 'dummy';

  async download() {
    const p = path.join(os.tmpdir(), 'hehdon-dummy.txt');

    await fs.writeFile(p, `==== Hehdon Dummy Downloader ====\n${
      typeof this.payload === 'string' ? this.payload : JSON.stringify(this.payload, null, 2)
    }`);

    this.logger.extends(this.logger.c.red('Payload:')).inspect(this.payload);
    return p;
  }
}

export default Dummy;
