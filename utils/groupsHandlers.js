// Lib imports
const fs = require("fs");

const addToGroups = (id) => {
  let data = fs.readFileSync("./data/groupData.json", "utf-8");
  data = JSON.parse(data);
  const found = data.find(({ chatId }) => chatId === id);
  if (!found) {
    data.push({ chatId: id });
    fs.writeFileSync("./data/groupData.json", JSON.stringify(data));
    return true;
  }
};

const checkIfAdded = (id) => {
  let data = fs.readFileSync("./data/groupData.json", "utf-8");
  data = JSON.parse(data);
  const found = data.find(({ chatId }) => chatId === id);
  if (found) {
    return true;
  }
  return false;
};

module.exports = { addToGroups, checkIfAdded };
