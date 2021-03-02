import fs from 'fs';
import path from 'path';

class Base {
  constructor({ config, logger, root }) {
    this._config = config;
    this.config = config.mergedConfig;

    this._root = path.join(root, config.directory);
    if (!this._root.startsWith(root)) {
      throw new Error(`Invalid path "${config.directory}".`);
    }

    this._filename = config.directory.split('/')[0];
    this.logger = logger;
  }

  async getLink() {
    const next = await this.getNextEp();

    if (next === undefined) {
      return undefined;
    }
    
    this.logger = this.logger.extends(this.logger.c.blueBright(`[Episode ${next}]`));
    this.logger.debug(`Next to download: ${next}`);

    return {
      filename: this.getFilename(next),
      number: next,
      ...this.getNextLink(next),
    };
  }

  getNextLink(next) {
    throw new Error('getLinkNext not implemented');
  }

  getDownloaded() {
    return fs.promises.readdir(this._root).catch(()=>[]);
  }

  async _getDownloadedEp() {
    return (await this.getDownloaded())
      .map(v => path.parse(v).name)
      .map(v => v.replace(this._filename + '-', ''));
  }

  async getNextEp() {
    const start = this._config.filter?.start ?? 1;
    const end = this._config.filter?.end ?? Infinity;
    const exclude = this._config.filter?.exclude?.map(v => v.toString());
    const include = this._config.filter?.include?.map(v => v.toString()) ?? [];

    const downloaded = await this._getDownloadedEp();
    for (const i of include) {
      if (!downloaded.includes(i)) {
        return i;
      }
    }

    for (let i = start; i <= end; i++) {
      const j = i.toString();

      if (exclude?.includes(j)) {
        continue;
      }

      if (!downloaded.includes(j)) {
        return j;
      }
    }
  }

  getFilename(ep) {
    return `${this._filename}-${ep}`;
  }

  getAbsolutePath(filename) {
    return path.join(this._root, filename);
  }
}

export default Base;