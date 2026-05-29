import { env } from './utils/env';

const Log = {
  debug(message: string): void {
    if (env.EXPO_GO_DEBUG) {
      console.error(message);
    }
  },

  log(message: string): void {
    console.log(message);
  },

  warn(message: string): void {
    console.warn(message);
  },
};

export default Log;
