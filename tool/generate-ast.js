const { writeFileSync } = require("fs");

function defineType(content, baseName, className, fieldList) {
    const fields = fieldList.split(',');

    content += `export class ${className} {\n`;

    for (const field of fields) {
        const name = field.split(":")[0].trim();
        const type = field.split(":")[1].trim();
        content += `    public ${name}: ${type};\n`;
    }

    content += '\n';
    content += `    public constructor(${fieldList}) {\n`;

    for (const field of fields) {
        const name = field.split(":")[0].trim();

        content += `        this.${name} = ${name};\n`;
    }

    content += '    }\n\n';

    content += '    public accept<T>(visitor: Visitor<T>): T {\n';
    content += `        return visitor.visit${className}${baseName}(this);\n`;
    content += '    }\n}\n\n';

    return content;
}

function defineVisitor(content, baseName, types) {
    content += 'export interface Visitor<T> {\n';
    
    for (const type of types) {
        const typeName = type.split(":")[0].trim();

        content += `    visit${typeName}${baseName}: (${baseName.toLowerCase()}: ${typeName}) => T;\n`;
    }

    content += '}\n\n';
    return content;
}

function defineAst(outDir, baseName, types, imports) {
    const path = outDir + '/' + baseName.toLowerCase() + '.ts';
    let content = imports.endsWith(';') ? imports + '\n\n' : imports + ';\n\n';
    
    content = defineVisitor(content, baseName, types);

    const classNames = types.map(v => v.split(" : ")[0].trim());
    content += `export type ${baseName} = ${classNames.join(" | ")};\n\n`;

    for (const type of types) {
        const className = type.split(" : ")[0].trim();
        const fields = type.split(" : ")[1].trim();

        content = defineType(content, baseName, className, fields);
    }

    writeFileSync(path, content);
}

(function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error("Usage: node generate-ast <outdir>");
        process.exit(1);
    }

    const outDir = args[0];

    defineAst(outDir, "Expr", [
        "Assign   : name: Token, value: Expr",
        "Binary   : left: Expr, operator: Token, right: Expr",
        "Call     : callee: Expr, paren: Token, args: Expr[]",
        "Getter   : obj: Expr, name: Token", // Named Getter instead of Get for consistency with Setter
        "Grouping : expression: Expr",
        "Literal  : value: LoxLiteral",
        "Logical  : left: Expr, operator: Token, right: Expr",
        "Setter   : obj: Expr, name: Token, val: Expr", // Named Setter instead of Set cause of collision with the JS Set
        "This     : keyword: Token", 
        "Unary    : operator: Token, right: Expr",
        "Variable : name: Token"
    ], 'import { Token, LoxLiteral } from "./token"');

    defineAst(outDir, "Stmt", [
        "Block      : statements: Stmt[]",
        "Class      : name: Token, methods: Func[]",
        "Expression : expression: Expr",
        "Func       : name: Token, params: Token[], body: Stmt[]",
        "If         : condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null",
        "Print      : expression: Expr",
        "Return     : keyword: Token, value: Expr | null",
        // initializer is Expr | null to stop typescript from complaining.
        "Var        : name: Token, initializer: Expr | null",
        "While      : condition: Expr, body: Stmt"
    ], 'import { Expr } from "./expr";\nimport { Token } from "./token"');

})();
