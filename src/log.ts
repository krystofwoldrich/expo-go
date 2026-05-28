const Log = {
  debug(message: string): void {
    if (process.env.DEBUG) {
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
