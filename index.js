import { Lox } from "./src/lox.ts";

// TODO: Build with React, deploy to Deno Deploy.

const runBtn = document.getElementById("run");
const clearBtn = document.getElementById("clear");
const openReplBtn = document.getElementById("open-repl");
const codePane = document.getElementById("code-pane");
const outputPane = document.getElementById("output-pane");

runBtn.addEventListener("click", e => {
    const source = codePane.value;
    const { log } = console;
    const output = [];
    console.log = (str) => output.push(str);
    Lox.run(source);
    outputPane.innerText = output.join("\n");
    console.log = log;
});

clearBtn.addEventListener("click", e => {
    codePane.value = "";
});
