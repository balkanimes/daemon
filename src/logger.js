import util from 'util';
import c from 'ansi-colors';

c.enabled = process.stdout.isTTY || false;

export class Logger {
  static c = c;
  c = c;

  static DEBUG = -1;
  static LOG = 0;
  static INFO = 1;
  static WARN = 2;
  static ERROR = 3;

  static level = 0;

  constructor(...prefix) {
    this.prefix = prefix;
  }

  extends(...prefix) {
    return new this.constructor(...this.prefix, ...prefix);
  }

  format({ message, addDate = true, prefix = [], suffix = []}) {
    return [
      addDate ? c.magenta(`[${
        new Date().toISOString().slice(0, 19).replace('T', ' ')
      }]`) : null,
      ...prefix,
      ... this.prefix,
      ...suffix,
      message,
    ].filter(v=>v).join(' ');
  }

  _createLevel(level, handler = v => v) {
    return (message) => {
      if (this.constructor.level > level) {
        return;
      }

      const msg = this.format(handler({ message }));

      if (level >= this.constructor.WARN) {
        console.error(msg);
      } else {
        console.log(msg);
      }
    }
  }

  debug = this._createLevel(Logger.DEBUG, data => ({
    ...data,
    message: c.gray(data.message),
  }));

  inspect = this._createLevel(Logger.DEBUG, data => ({
    ...data,
    message: util.inspect(data.message, {
      depth: Infinity,
      colors: c.enabled,
    }),
  }));

  log = this._createLevel(Logger.LOG);

  info = this._createLevel(Logger.INFO, data => ({
    ...data,
    suffix: [c.cyan('[INFO]')],
  }));

  warn = this._createLevel(Logger.WARN, data => ({
    ...data,
    prefix: [c.yellowBright('[WARN]')],
    message: c.yellowBright(data.message),
  }));

  error = this._createLevel(Logger.ERROR, data => ({
    ...data,
    prefix: [c.redBright.bold('[ERROR]')],
    message: c.redBright(data.message),
  }));
}

export default Logger;
