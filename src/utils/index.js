import { evaluate } from "mathjs";

function generateExpression() {
  const operators = ["+", "-", "*"];

  const numCount = Math.floor(Math.random() * 3) + 3;
  let expr = "";

  for (let i = 0; i < numCount; i++) {
    expr += Math.floor(Math.random() * 10) + 1;

    if (i < numCount - 1) {
      const op = operators[Math.floor(Math.random() * operators.length)];
      expr += " " + op + " ";
    }
  }

  return expr;
}
function safeEvaluate(expr) {
  console.log({ expr });
  if (typeof expr !== "string") throw new Error("Expression must be a string");

  expr = expr.trim();
  if (expr.length === 0) throw new Error("Empty expression");

  if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
    throw new Error("Invalid characters in expression");
  }

  if (/[\+\-\*\/]$/.test(expr)) {
    throw new Error("Expression ends with an operator");
  }

  return evaluate(expr);
}

function evaluateExpression(question) {
  return Math.round(safeEvaluate(question) * 100) / 100;
}

export { generateExpression, evaluateExpression };
