import * as fs from "fs";
import * as readline from "readline";
import { Scanner } from "./scanner";
import { Token } from "./token";
import { TokenTypes } from "./token-type";
import { Parser } from './parser';
import { AstPrinter } from "./ast-printer";
import { RuntimeError } from "./runtime-error";
import { Interpreter } from "./interpreter";

export class Lox {
    private static interpreter = new Interpreter();
    public static hadError = false;
    public static hadRuntimeError = false;

    public static runFile(path: string): void {
        let source;
        try {
            source = fs.readFileSync(path, { encoding: 'utf8' });
        } catch (err) {
            console.error(`Error:\n\t${err.message}`);
            process.exit(64);
        }

        if (source) this.run(source);
        if (this.hadError) process.exit(64);
        if (this.hadRuntimeError) process.exit(70);
    }

    public static runPrompt(): void {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '-> '
        });

        rl.write("lox.ts REPL. Press Ctrl + C to exit.\n");
        rl.prompt();

        rl.on("line", async line => {
            const source = line.trim();
            this.run(source);

            // If the user makes a mistake, it shouldn’t kill their entire session:
            this.hadError = false;
            rl.prompt();
        });
    }

    private static run(source: string): void {
        const scanner = new Scanner(source);
        const tokens = scanner.scanTokens();
        const parser = new Parser(tokens);
        const statements = parser.parse();

        if (this.hadError) return;

        if (statements === null) {
            console.log("Program terminated due to error!");
        }
        else {
            this.interpreter.interpret(statements);
        }

        // console.log(new AstPrinter().print(expression));
    }

    public static error(token: Token | number, message: string): void {
        if (typeof token === 'number') {
            this.report(token, "", message);
        } else {
            if (token.type === TokenTypes.EOF) {
                this.report(token.line, " at end", message);
            } else {
                this.report(token.line, ` at '${token.lexeme}'`, message);
            }
        }
    }

    public static runtimeError(err: RuntimeError) {
        this.report(err.token.line, '', err.message);
        this.hadRuntimeError = true;
    }

    public static report(line: number, where: string, message: string): void {
        const msg = `[line ${line}] Error${where}: ${message}`;
        console.error(msg);

        this.hadError = true;
    }
}

(function main() {
    const args = process.argv.slice(2);

    if (args.length > 1) {
        console.log("Usage: ./lox [script]");
        process.exit(64);
    } else if (args.length == 1) {
        Lox.runFile(args[0]);
    } else {
        Lox.runPrompt();
    }

})();
