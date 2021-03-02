export class Base {
  constructor({ payload, logger }) {
    this.payload = payload;
    this.logger = logger;
  }

  download() {
    throw new Error('download not implemented');
  }

  clean() {
    this.logger.debug('Nothing to clean up');
  }
}

export default Base;
