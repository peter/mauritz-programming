#!/usr/bin/env node

function variableValue(variables, variable) {
  return variables.findIndex(v => v === variable) + 1;
}

function randomIndex(list) {
  return Math.round(Math.random() * (list.length - 1));
}

function randomList(list) {
  return list.map(v => list[randomIndex(list)]);
}

function shuffle(list) {
  const remaining = [...list];
  const result = [];
  while (remaining.length > 0) {
    const index = randomIndex(remaining);
    result.push(remaining[index]);
    remaining.splice(index, 1);
  }
  return result;
}

function sum(list) {
  return list.reduce((acc, value) => acc + value, 0);
}

function range(length) {
  const result = [];
  for (let i = 0; i < length; ++i) {
    result.push(i);
  }
  return result;
}

function orderedVariables(length) {
  return range(length).map(index => String.fromCharCode(65 + index));
}

function isSolution(variables, table) {
  const value = v => variableValue(variables, v);
  for (let rowIndex = 0; rowIndex < table.rows.length; ++rowIndex) {
    if (table.rowSums[rowIndex] !== sum(table.rows[rowIndex].map(value)))
      return false;
  }
  for (let columnIndex = 0; columnIndex < table.rows.length; ++columnIndex) {
    if (
      table.columnSums[columnIndex] !==
      sum(table.rows.map(row => value(row[columnIndex])))
    )
      return false;
  }
  return true;
}

function findSolution(table) {
  let firstVariables = orderedVariables(table.rows.length);
  const getAvailable = vars => firstVariables.filter(v => !vars.includes(v));
  let variables = firstVariables;
  let attempts = 0;
  while (!isSolution(variables, table)) {
    attempts += 1;
    for (let index = variables.length - 1; index >= 0; --index) {
      const available = getAvailable(variables.slice(0, index));
      const currentIndex = available.findIndex(v => v === variables[index]);
      const nextIndex = currentIndex + 1;
      if (nextIndex < available.length) {
        const nextAvailable = available.slice(nextIndex).sort();
        variables = [
          ...variables.slice(0, index),
          available[nextIndex],
          ...nextAvailable
        ];
        break;
      }
    }
  }
  return { attempts, variables };
}

function getTable(variables) {
  const value = v => variableValue(variables, v);
  let rows = variables.map(() => randomList(variables));
  const rowSums = rows.map(row => sum(row.map(value)));
  const columnSums = variables.map((_, columnIndex) =>
    sum(rows.map(row => value(row[columnIndex])))
  );
  return { rows, rowSums, columnSums };
}

function printTable(table) {
  for (const [index, row] of table.rows.entries()) {
    console.log(row, table.rowSums[index]);
  }
  console.log(table.columnSums);
}

function prettyVariables(variables) {
  return variables.map(v => `${v}=${variableValue(variables, v)}`).join(", ");
}

function tableHtml(variables, table) {
  const rowHtml = row => row.map(v => `<td>${v}</td>`).join("\n");
  const html = table.rows
    .map((row, index) => `<tr>${rowHtml([...row, table.rowSums[index]])}</tr>`)
    .join("\n");
  return `
    <html>
      <body>
        <div style="display: none">${prettyVariables(variables)}</div>
        <table border="1" cellspacing="10" cellpadding="10">
          ${html}
          <tr>${rowHtml(table.columnSums)}</tr>
        </table>
      </body>
    </html>
  `;
}

function main() {
  const variables = parseInt(process.argv[2])
    ? shuffle(orderedVariables(parseInt(process.argv[2])))
    : (process.argv[2] || "").split("");
  if (variables.length === 0)
    throw new Error(
      "Please specify variables ordered by value, i.e. CABED means C=1, A=2, B=3, E=4, D=5"
    );
  console.log("variables", prettyVariables(variables));
  const table = getTable(variables);
  if (!isSolution(variables, table))
    throw new Error("Variables do not solve table");
  const { attempts, variables: foundVariables } = findSolution(table);
  console.log("Attempts to find variables", attempts);
  if (!isSolution(foundVariables, table))
    throw new Error("Could not find variables that solve table");
  // console.log(tableHtml(variables, table));
  printTable(table);
}

module.exports = {
  shuffle
};

if (require.main === module) main();
