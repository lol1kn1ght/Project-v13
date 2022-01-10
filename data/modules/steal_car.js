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
    let images = this.f.images.steal_car;

    let cars_buttons = [];
    let filtred_cars = this.cars.sort(function(a, b) {
      return a.id - b.id;
    });

    let image_ids = [];

    for (let car of this.cars) {
      image_ids.push(car.id);
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

    let car_images = await images[image_ids.join("_")];
    let image_path = car_images[this.f.random(0, car_images.length - 1)];
    const attachment = new Discord.MessageAttachment(image_path, "cars.png");
    let embed = new Discord.MessageEmbed()
      .setDescription(dialogues.first_game.agree)
      .setFooter(this.interaction.user.tag)
      .setTimestamp()
      .setColor(this.f.config.colorEmbed)
      .setImage("attachment://sample.png");

    let cars_row = new Discord.MessageActionRow().addComponents(
      ...cars_buttons
    );

    let choice_message = await this.send(embed, {
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
