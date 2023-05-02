import { Lox } from "../src/lox.ts";

const tests = Array.from(Deno.readDirSync(`${Deno.cwd()}/tests`)).filter(f => f.name.endsWith(".lox"));

let failed = 0;


// We don't want any output logged for tests.
const { log, error } = console;
const stdout = new Map();

for (const test of tests) {
  // Capture stdout/stderr.
  stdout.set(test, []);
  console.log = stdout.get(test).push;
  Lox.runFile("./tests/" + test.name);
  log(`Passed ${test.name} ✅`);
}
