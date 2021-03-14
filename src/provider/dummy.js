import Base from './base.js';

export class Dummy extends Base {
  static slug = 'dummy';
  static schema = [
    {
      name: 'downloader',
      type: 'string',
      description: 'Downloader ta use as ressource type',
      required: true,
    },
    {
      name: 'payload',
      type: 'string',
      description: 'Payload to send to the downloader',
      required: true,
    },
    {
      name: 'asJSON',
      type: 'boolean',
      description: 'Interpret the payload as a JSON value',
      default: "false",
    },
  ];
  
  getNextLink(next) {
    return {
      type: this.config.downloader,
      payload: this.config.asJSON
        ? JSON.parse(this.config.payload)
        : this.config.payload,
    };
  }
}

export default Dummy;
