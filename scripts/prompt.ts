// Hidden password prompt shared by the account scripts: echoes * per character, never the value.
export function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    process.stdout.write(question);

    if (!stdin.isTTY) {
      // Piped input: read one line without echo control.
      let buf = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (chunk) => {
        buf += chunk;
        const nl = buf.indexOf("\n");
        if (nl !== -1) {
          stdin.pause();
          process.stdout.write("\n");
          resolve(buf.slice(0, nl).replace(/\r$/, ""));
        }
      });
      stdin.on("error", reject);
      return;
    }

    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (key: string) => {
      for (const ch of key) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "") {
          stdin.setRawMode(false);
          process.stdout.write("\n");
          process.exit(130);
        }
        if (ch === "" || ch === "\b") {
          if (value.length) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        value += ch;
        process.stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });
}
