const {Command_template} = require("../config/templates");
const Discord = require("discord.js");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.ballas = {
      name: "Балласы",
      members: [],
      color: `#FF06E4`,
      image: `https://pbs.twimg.com/media/EAvVHyJXUAEsJfz.jpg`,
      points: 0,
      exodus: {
        win: [
          "Балласы устроили зассаду и на моменте неожиданности, перестреляли Грув-стритовцев.\n**Победа за Балассами!**",
          "Во время перестрелки, несколько Балласов прокрались к Грув-стритовцам в спину и перетянули на себя перевес сил, одержав победу.\n**Победа за Балассами!**",
          "Удачно подкупленный коп успешно помог вам перестрелять Грув-стритовцев, победа за Балласами.\n**Победа за Балассами!**"
        ]
      }
    };

    this.vagos = {
      name: "Грув-стрит",
      members: [],
      color: `08D90B`,
      image: `https://pbs.twimg.com/media/Dm2EwM_U0AAXQKE.jpg`,
      points: 0,
      exodus: {
        win: [
          "Грув-стритовцы стащили Insurgent с базы Merryweather и получили преимущество.\n**Победа за Грув-стрит!**",
          "Предпринятая попытка Балласов отжать часть Веспуччи-бич, закончилась крахом, поскольку кто-то был кротом и все успешно слил:)\n**Победа за Грув-стрит!**",
          "В потной схватке за территорию силы были практически равны, пока не появился наш кореш с РПГ, район Балласов успешно наш!\n**Победа за Грув-стрит!**"
        ]
      }
    };

    this.options = {
      permissions: [],

      channels: [],
      custom_perms: [],
      slash: {
        name: "test",
        description: "Комадна для тестов [BOT_OWNER]"
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");
    //🟣 🟡
    let {vagos, ballas} = this;
    let time = 60000;

    let embed_text = `Начались разборки банд, выберите за какую команду вы хотите учавствовать.\n\nПобедившие участники получат по 100💸`;

    let choice_message = new Discord.MessageEmbed()
      .setColor("WHITE")
      .setTitle(`**Разборки банд!**`)
      .setDescription(
        `${embed_text}\n\nИгра начнется через: ${this.f.time(time)}`
      )
      .setImage(
        `https://rockstargames.su/file/wp-content/uploads/2018/08/c81a75-20161228031507_1.jpg`
      )
      .setTimestamp();

    let gang_buttons = [
      new Discord.MessageButton({
        type: "BUTTON",
        label: "🟣 Балласы",
        customId: "ballas",
        style: 2,
        disabled: false
      }),
      new Discord.MessageButton({
        type: "BUTTON",
        label: "🟢 Грув-стрит",
        customId: "vagos",
        style: 2,
        disabled: false
      })
    ];

    let buttons_row = new Discord.MessageActionRow().addComponents(
      ...gang_buttons
    );

    let msg_sent = await this.interaction.reply({
      embeds: [choice_message],
      components: [buttons_row],
      fetchReply: true
    });

    let filter = button => button.isButton();

    let collector = msg_sent.createMessageComponentCollector({filter});

    collector.on("collect", button => {
      if (!button.isButton()) return;

      button.update({components: msg_sent.components});

      if (
        ballas.members.includes(button.member.id) ||
        vagos.members.includes(button.member.id)
      )
        return this.msgFalseH(`Вы уже состоите в одной из комманд!`);

      switch (button.customId) {
        case "vagos":
          vagos.members.push(button.member.id);
          this.interaction.followUp(
            `${button.member} Успешно присоединился к команде **${vagos.name}**!`
          );
          break;
        case "ballas":
          ballas.members.push(button.member.id);
          this.interaction.followUp(
            `${button.member} Успешно присоединился к команде **${ballas.name}**!`
          );
          break;
        default:
      }
    });

    collector.on("end", () => {
      this.interaction.editReply({
        components: []
      });
    });

    let interval_resolve = () =>
      new Promise(resolve => {
        setInterval(() => {
          time -= 15000;

          choice_message.setDescription(
            `${embed_text}\n\n${
              time <= 0
                ? "Игра уже началась!"
                : `Игра начнется через: ${this.f.time(time)}`
            }`
          );

          msg_sent.edit({
            embeds: [choice_message]
          });

          if (time <= 0) resolve(true);
        }, 15000);
      });

    await interval_resolve();

    collector.stop();

    if (!ballas.members[0] && !vagos.members[0])
      return this.interaction.followUp(
        `Бой не состоится, недостаточно участников :(`
      );

    this.interaction.followUp("Банды сформированы, бой начинается!");

    this.current_round = 1;

    this.game();
  }

  async game() {
    await this.timeout(4000);

    let winner_num = this.random(); // 0 или 1

    let winner = [this.vagos, this.ballas][winner_num];

    let winner_exodus = winner.exodus.win;

    let current_reply = this.random(0, winner_exodus.length - 1);

    this.interaction.followUp(
      `**Раунд ${this.current_round++}**:\n ${winner_exodus[current_reply]}`
    );
    winner_exodus.splice(current_reply, 1);
    winner.points += 1;

    if (winner.points >= 3) this.win(winner);
    else this.game();
  }

  async win(winner) {
    let winner_members = winner.members;

    let users_db = this.db.collection("users");
    let users_data = await users_db.find().toArray();

    let members = users_data.filter(user =>
      winner_members.includes(user.login)
    );

    for (let member_id of winner_members) {
      let member = members.filter(member => member.login === member_id)[0];

      if (!member) {
        users_db.insertOne({
          login: member_id,
          coins: 100
        });
      } else {
        users_db.updateOne(
          {
            login: member.login
          },
          {
            $set: {
              coins: (member.coins || 0) + 100
            }
          }
        );
      }
    }
    await this.final_reply(winner);
  }

  async final_reply(winner) {
    let embed = new Discord.MessageEmbed()
      .setColor(winner.color)
      .setTitle(`Команда \`${winner.name}\` одержала победу!`)
      .setDescription(
        `Участники ${winner.members
          .map(id => `<@${id}>`)
          .join(`,`)} получили по 100 монет!`
      )
      .setImage(winner.image)
      .setTimestamp();

    this.interaction.followUp({embeds: [embed]});
  }

  random(min = 0, max = 1) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  timeout(time) {
    return new Promise(resolve => setTimeout(() => resolve(true), time));
  }
}

module.exports = Command;
