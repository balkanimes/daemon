import path from 'path';

import { loadConfig, setProviders } from './config.js';
import Logger from './logger.js';
import { move, numberFromEnv } from './helper.js';

import DummyProvider from './provider/dummy.js';
import DummyDownloader from './downloader/dummy.js';

export class Kernel {
  static interval = numberFromEnv('HEHDON_INTERVAL', 3600) * 1000;
  static maxChained = numberFromEnv('HEHDON_MAX_CHAINED', 10);
  static root = path.normalize(process.env.HEHDON_ROOT ?? './download');

  downloaders = [];
  providers = [];

  logger = new Logger();

  loadDebug() {
    Logger.level = Logger.DEBUG;
    this.providers.push(DummyProvider);
    this.downloaders.push(DummyDownloader);
  }

  loadSchema() {
    return setProviders(this.providers.map(p => ({
      name: p.slug,
      schema: p.schema,
    })));
  }

  async update() {
    this.logger.debug('Start update');

    let config;
    try {
      config = await loadConfig();
    } catch (e) {
      this.logger.error(e);
      return;
    }

    for (const entry of config) {
      const logger = this.logger.extends(Logger.c.blue(`[${entry.name}]`));
      logger.debug('Start check');

      try {
        let status = true
        for (let count = 0; status && count < Kernel.maxChained; count++) {
          status = await this.process(entry, logger);

          if (status) {
            logger.debug('Check for a next episode');
          }
        }

        logger.debug(
          status
            ? 'Too many chained. continue later'
            : 'No more episode'
        );
      } catch(e) {
        e && logger.error(e);
        logger.info('Skip due to previous error');
      }
    }

    this.logger.debug('No more entries');
  }

  async process(entry, logger) {
    const provider = this.getProvider(entry, logger);
    provider.logger.debug("Provider loaded");

    provider.logger.debug('Find next episode');
    const next = await provider.getLink();

    if (typeof next === 'undefined') {
      provider.logger.debug('No next episode');
      return false;
    }

    provider.logger.debug('Next episode found');
    provider.logger
      .extends(this.logger.c.red('Type:'))
      .extends(next.type)
      .extends(this.logger.c.red('Payload:'))
      .inspect(next.payload);

    const downloader = this.getDownloader(next, logger);
    downloader.logger.debug("Downloader loaded");
    
    let error = false;
    try {
      downloader.logger.debug("Download episode");
      const tmpFile = await downloader.download();
      downloader.logger.debug(`Episode downloaded at ${tmpFile}`);
  
      const ext = path.parse(tmpFile).ext;
      downloader.logger.debug("Move downloaded episode");
      await move(tmpFile, provider.getAbsolutePath(next.filename + ext));
      // await discord(entry, next).catch(() => true);
    } catch(e) {
      downloader.logger.error(e);
      error = true;
    } finally {
      downloader.logger.debug("Clean up");
      await downloader.clean();

      if (error) {
        throw null;
      }

      return true;
    }
  }

  getProvider(entry, logger) {
    const Provider = this.providers.find(v => entry.pipeline.provider === v.slug);
    if (typeof Provider === 'undefined') {
      logger.warn(`Unknow provider ${entry.pipeline.provider}`);
      throw null;
    }

    return new Provider({
      config: entry,
      logger: logger.extends(Logger.c.green(`[${Provider.slug}]`)),
      root: Kernel.root,
    });
  }

  getDownloader(data, logger) {
    const Downloader = this.downloaders.find(v => data.type === v.slug);
    if (typeof Downloader === 'undefined') {
      logger.warn(`Unknow downloader ${data.type}`);
      throw null;
    }

    let l = logger.extends(Logger.c.yellow(`[${Downloader.slug}]`));
    if (data.number) {
      l = l.extends(Logger.c.blueBright(`[Episode ${data.number}]`));
    }

    return new Downloader({
      payload: data.payload,
      logger: l,
    });
  }

  async cron() {
    await this.update();
    this.timeout = setTimeout(() => this.cron(), Kernel.interval);
  }
}

export default Kernel;
