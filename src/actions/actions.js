const { Markup } = require("telegraf");
const usersDB = require("./../databases/controllers/users.controller");
const actionDB = require("./../databases/controllers/actions.controller");
const path = require("node:path");
const fs = require("node:fs");

const sendStartMsg = async (ctx) => {
  const chatId = ctx.chat.id;
  let user = usersDB.findOne("chatId", chatId);

  if (user) {
    if (user.name !== ctx.update.message.from.first_name) {
      usersDB.update(chatId, "name", ctx.update.message.from.first_name);
      user = usersDB.findOne("chatId", chatId);
    }

    await ctx.reply(
      `خوش برگشتی کاربر ${user.name} !`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("gpt4o", "gpt4o"),
          Markup.button.callback("gpt3-turbo", "turbo"),
        ],
      ])
    );
    return;
  }

  usersDB.create(chatId, ctx.update.message.from.first_name);
  actionDB.create(chatId);

  const welcomVidPath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "welcome",
    "so_welcome_new_user.mp4"
  );
  if (fs.existsSync(welcomVidPath)) {
    await ctx.sendVideo(
      {
        source: welcomVidPath,
      },
      {
        caption: "کاربر جدید ؟؟ خوش اومدی !!",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "gpt4o", callback_data: "gpt4o" },
              { text: "gpt3-turbo", callback_data: "turbo" },
            ],
          ],
        },
      }
    );
    return;
  }

  await ctx.reply(
    "خوش اومدی کاربر جدید.",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("gpt4o", "gpt4o"),
        Markup.button.callback("gpt3-turbo", "turbo"),
      ],
    ])
  );
};

const setDataInRedis = async (pattern, data) => {
  await ctx.editedMessage(sayHello[Math.floor(Math.random() * 10)]);
};

module.exports = { sendStartMsg };
