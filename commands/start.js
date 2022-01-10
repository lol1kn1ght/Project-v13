const {Command_template} = require("../config/templates");
const Discord = require("discord.js");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: [],
      custom_perms: [],
      slash: {
        name: "start",
        description: "Начать свою карьеру"
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");
    let dialogues = this.f.dialogues;

    let hello_buttons = [
      new Discord.MessageButton({
        type: "BUTTON",
        label: dialogues.first_game.buttons.agree,
        customId: "agree",
        style: 3,
        disabled: false
      }),
      new Discord.MessageButton({
        type: "BUTTON",
        label: dialogues.first_game.buttons.deny,
        customId: "deny",
        style: 4,
        disabled: false
      })
    ];

    let hello_row = new Discord.MessageActionRow().addComponents(
      ...hello_buttons
    );

    let hello_message = await this.msg(dialogues.first_game.hello_message, {
      fetchReply: true,
      components: [hello_row]
    });

    let answer = await hello_message
      .awaitMessageComponent(
        interact => interact.user.id === this.interaction.member.id,
        {
          max: 1,
          time: 30000,
          errors: ["time"]
        }
      )
      .catch(err => {
        this.msg(dialogues.first_game.deny);
        return;
      });

    if (!answer) {
      this.msg(dialogues.first_game.deny);
      return;
    }

    answer.update({components: []});

    switch (answer.customId) {
      case "agree":
        let cars_db = this.db.collection("cars");
        let cars_data = await cars_db.find({class: "Спорткары"}).toArray();

        let first_car = cars_data[this.f.random(0, cars_data.length - 1)];
        let second_car = cars_data[this.f.random(0, cars_data.length - 1)];
        while (second_car.id === first_car.id) {
          second_car = cars_data[this.f.random(0, cars_data.length - 1)];
        }

        let cars = [first_car, second_car].reverse();

        let game = new this.f.games.Steal_car(this, {
          db: this.db,
          user: this.interaction.member,
          cars: cars
        });

        game.execute();
        break;

      case "deny":
        this.msg(dialogues.first_game.deny);

        return;
        break;
      default:
    }
  }
}

module.exports = Command;
