const { run } = require('../index');
const path = require('node:path');

const args = process.argv.slice(2);

// Need this.
args.unshift('widgets');

try {
  run(args, {
    currentDir: path.resolve(path.dirname(process.argv[1]), '..'),
    targetDir: path.resolve(process.cwd(), './packages'),
  });
} catch (e) {
  console.error(e.message);
}
