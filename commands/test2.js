const { Command_template } = require("../config/templates");
const Discord = require("discord.js");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: [],

      channels: [],
      custom_perms: ["OWNER"],
      slash: {
        name: "test2",
        description: "test",
      },
    };
  }

  async execute() {
    var XLSX = require("xlsx");
    var exData = XLSX.readFile("./data/table.xls");

    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    let data = Object.keys(exData.Sheets).map((name) => ({
      name,
      data: XLSX.utils.sheet_to_json(exData.Sheets[name]),
    }));

    console.log(data);
  }
}

module.exports = Command;
