import { Lox } from "./src/lox.ts";

const args = Deno.args;

if (args.length > 1) {
    console.log("Usage: ./lox [script]");
    Deno.exit(64);
}

if (args.length == 1) {
    Lox.runFile(args[0]);
    Deno.exit(0);
}

Lox.runPrompt();
