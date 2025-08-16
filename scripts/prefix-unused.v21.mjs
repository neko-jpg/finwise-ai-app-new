import { Project } from "ts-morph";
import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";

const targetDir = process.argv[2] ?? "src/components/finwise";

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}

const files = walk(targetDir);
const project = new Project({ skipAddingFilesFromTsConfig: true });
project.addSourceFilesAtPaths(files);

let changed = 0;

for (const sf of project.getSourceFiles()) {
  let local = 0;

  // 関数・メソッド・arrow function のパラメータ
  const fnLike = [
    ...sf.getFunctions(),
    ...sf.getVariableDeclarations()
      .filter(v => v.getInitializer()?.getKindName?.() === "ArrowFunction")
      .map(v => v.getInitializer()),
    ...sf.getClasses().flatMap(c => c.getMethods())
  ].filter(Boolean);

  for (const fn of fnLike) {
    for (const p of fn.getParameters?.() ?? []) {
      const nameNode = p.getNameNode?.();
      if (!nameNode || nameNode.getKindName() !== "Identifier") continue; // ← destructuringはスキップ
      const name = p.getName();
      if (name.startsWith("_")) continue;
      const refs = p.findReferences?.() ?? [];
      const total = refs.reduce((a, r) => a + r.getReferences().length, 0);
      if (total <= 1) { p.rename(`_${name}`); local++; }
    }
  }

  // 変数宣言（単純識別子のみ）
  for (const v of sf.getVariableDeclarations()) {
    const nn = v.getNameNode();
    if (!nn || nn.getKindName() !== "Identifier") continue; // ← BindingPattern除外
    const name = nn.getText();
    if (name.startsWith("_")) continue;
    const refs = v.findReferences();
    const total = refs.reduce((a, r) => a + r.getReferences().length, 0);
    if (total <= 1) { v.rename(`_${name}`); local++; }
  }

  if (local) changed += local;
}

await project.save();
console.log(`prefixed ${changed} unused identifiers with '_'`);
