import { Scanner } from "./scanner.ts";
import { Token } from "./token.ts";
import { Parser } from "./parser.ts";
import { RuntimeError } from "./runtime-error.ts";
import { Interpreter } from "./interpreter.ts";
import { Resolver } from "./resolver.ts";

// import { AstPrinter } from "./ast-printer.ts";

export class Lox {
  private static interpreter = new Interpreter();
  public static hadError = false;
  public static hadRuntimeError = false;

  public static runFile(path: string): void {
    try {
      const source = Deno.readTextFileSync(path);

      if (source) this.run(source);
      if (this.hadError) Deno.exit(64);
      if (this.hadRuntimeError) Deno.exit(70);
    } catch (err) {
      console.error(`Error:\n\t${err.message}`);
      Deno.exit(64);
    }

  }

  public static runPrompt(): Promise<void> {
    console.log("lox.ts REPL. Press Ctrl + C to exit.");

    while (true) {
      const text = prompt("::");
      const source = text ? text.trim() : "";
      this.run(source);
      this.hadError = false;
    }
  }

  private static run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const statements = parser.parse();

    if (this.hadError) return;

    if (statements === null) {
      console.log("Program terminated due to error!");
    } else {
      const resolver = new Resolver(this.interpreter);
      resolver.resolve(...statements);

      // Stop if there were any resolution errors.
      if (this.hadError) return;

      this.interpreter.interpret(statements);
    }

    // console.log(new AstPrinter().print(expression));
  }

  public static error(token: Token | number, message: string): void {
    if (typeof token === "number") {
      this.report(token, "", message);
    } else {
      if (token.type === "EOF") {
        this.report(token.line, " at end", message);
      } else {
        this.report(token.line, ` at '${token.lexeme}'`, message);
      }
    }
  }

  public static runtimeError(err: RuntimeError) {
    this.report(err.token.line, "", err.message);
    this.hadRuntimeError = true;
  }

  public static report(line: number, where: string, message: string): void {
    const msg = `[line ${line}] Error${where}: ${message}`;
    console.error(msg);

    this.hadError = true;
  }
}
