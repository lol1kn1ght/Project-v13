const Canvas = require("canvas");
const Discord = require("discord.js");
const {Command_template} = require("../../config/templates");

module.exports = class Steal_Car extends Command_template {
  constructor(context, args) {
    if (!context || !args || !args.db || !args.user || !args.cars)
      throw new Error("Один из нужных аргументов отсутствует.");

    super(context.interaction);
    Object.assign(this, args, context);
  }

  async execute() {
    let dialogues = this.f.dialogues;

    let cars_buttons = [];

    for (let car of this.cars) {
      cars_buttons.push(
        new Discord.MessageButton({
          type: "BUTTON",
          label: car.name,
          customId: car.id,
          style: 2,
          disabled: false
        })
      );
    }

    let cars_row = new Discord.MessageActionRow().addComponents(
      ...cars_buttons
    );
    let choice_message = await this.msg(dialogues.first_game.agree, {
      components: [cars_row],
      fetchReply: true
    });

    let choice = await choice_message.awaitMessageComponent(
      interact => interact.user.id === this.interaction.member.id,
      {
        time: 30000,
        errors: ["time"]
      }
    );

    console.log(choice);
  }
};
