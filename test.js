import Kernel from './src/kernel.js';
import Base from './src/provider/base.js';

export class Test extends Base {
  static slug = 'test';
  static schema = [
    {
      name: "test.string",
      type: "string",
      description: "A string",
      required: true,
    },
    {
      name: "test.array",
      type: "string",
      array: true,
      description: "A string array",
    },
    {
      name: "test.number",
      type: "number",
      description: "A number",
    },
    {
      name: "test.boolean",
      type: "boolean",
      description: "A boolean",
    },
  ];
}

const k = new Kernel();
k.loadDebug();
k.providers.push(Test);

k.loadSchema().then(async () => {
  await k.update();
  process.exit();
});
