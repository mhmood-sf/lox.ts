const { readdirSync } = require("fs");
const { execFileSync } = require("child_process");

const tests = readdirSync(`${process.cwd()}/tests`).filter(f => f.endsWith(".lox"));
let failed = 0;

for (const test of tests) {
    console.log(`Running test: ${test}`);
    try {
        execFileSync(`${process.cwd()}/lox.cmd`, [`./tests/${test}`], {
            cwd: process.cwd(),
            shell: true
        });

        console.log("Passed ✅");
    } catch (err) {
        console.error("Failed ⛔");
        failed++;
    }
}

console.log(`\n${tests.length - failed} passed, ${failed} failed`);
