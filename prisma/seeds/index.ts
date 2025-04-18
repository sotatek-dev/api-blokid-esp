import { exec } from 'child_process';
import 'dotenv/config.js';
import { ServerConfig } from 'server-config/index';

(async function seed() {
  if (!ServerConfig.isProductionEnv()) {
    exec(`yarn tool:genadmin -e admin@sotatek.com -p Sota@001`);
  }
})();
