import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
console.log("pdfParse typeof:", typeof pdfParse);
console.log("pdfParse keys:", Object.keys(pdfParse));
if (typeof pdfParse !== 'function') {
  console.log("pdfParse.default typeof:", typeof pdfParse.default);
}
