import * as fs from "fs";
import * as readline from "readline";
import { Scanner } from "./scanner";

export class Lox {
    public static hadError: boolean;

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
    }

    public static runPrompt(): void {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '-> '
        });

        rl.write("nini REPL. Press Ctrl + C to exit.\n");
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

        for (const token of tokens) {
            console.log(token.toString());
        }
    }

    public static error(line: number, message: string): void {
        this.report(line, "", message);
    }

    public static report(line: number, where: string, message: string): void {
        const msg = `[line ${line}] Error${where.startsWith(" ") ? where : " " + where}: ${message}`;
        console.error(msg);

        this.hadError = true;
    }
}

(function main() {
    const args = process.argv.slice(2);

    if (args.length > 1) {
        console.log("Usage: nini [script]");
        process.exit(64);
    } else if (args.length == 1) {
        Lox.runFile(args[0]);
    } else {
        Lox.runPrompt();
    }

})();
