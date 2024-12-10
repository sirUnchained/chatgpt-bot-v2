const { Telegraf, Markup } = require("telegraf");

const actionsDB = require("./databases/controllers/actions.controller");
const usersDB = require("./databases/controllers/users.controller");

const { sendStartMsg } = require("./actions/actions");
const {
  sendGptResult,
  sendGptOptions,
} = require("./modules/chat_gpt/chat_gpt.actions");
const {
  sendTranslationEngine,
  sendTargetLanguage,
  translateText,
} = require("./modules/translate/translate.actions");
const {
  readPicSendText,
  selectPicLang,
} = require("./modules/photo_text/photo_text.actions");
const {
  checkMessageAndBAN,
  checkCommandsAndRun,
} = require("./modules/group_administration/group_administration.actions");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  await sendStartMsg(ctx);
});

const sayHello = [
  "سلام عزیزم چه کمکی از من ساخته است؟",
  "درود برتو کاربر گرامی چطور کمکت کنم؟",
  "وقت بخیر چطور میتونم کمکت کنم؟",
  "سلام امیدوارم حالت عالی باشه چه کمکی از من بر میاد؟",
  "Hello user, how can i help you?",
  "Howdy doody, how can i help you?",
  "سلام عزیزم چه کمکی از من ساخته است؟",
  "سلام جیگر چه کاری ازم برمیاذ؟",
  "hallo mein Freund, wie kann ich dir helfen?",
  "مرحباً صديقي، كيف يمكنني مساعدتك؟",
];
// chat gpt actions
bot.action("chat_gpt", async (ctx) => {
  actionsDB.update(ctx.chat.id, "current_status", "gpt");

  await sendGptOptions(ctx);
});
bot.action("turbo", async (ctx) => {
  actionsDB.update(ctx.chat.id, "gpt", "gpt3.5-turbo");

  try {
    await ctx.editMessageText(sayHello[Math.floor(Math.random() * 10)]);
  } catch (error) {
    await ctx.reply(sayHello[Math.floor(Math.random() * 10)]);
  }
});
bot.action("gpt4o", async (ctx) => {
  actionsDB.update(ctx.chat.id, "gpt", "gpt4o");

  try {
    await ctx.editMessageText(sayHello[Math.floor(Math.random() * 10)]);
  } catch (error) {
    await ctx.reply(sayHello[Math.floor(Math.random() * 10)]);
  }
});
// translate bot actions
bot.action("chose_translation_engine", async (ctx) => {
  actionsDB.update(ctx.chat.id, "current_status", "translation");

  await sendTranslationEngine(ctx);
});
bot.action("google", async (ctx) => {
  actionsDB.update(ctx.chat.id, "t_engine", "google");

  await sendTargetLanguage(ctx);
});
bot.action("microsoft", async (ctx) => {
  actionsDB.update(ctx.chat.id, "t_engine", "microsoft");

  await sendTargetLanguage(ctx);
});
bot.action("yandex", async (ctx) => {
  actionsDB.update(ctx.chat.id, "t_engine", "yandex");

  await sendTargetLanguage(ctx);
});
bot.action("en", async (ctx) => {
  actionsDB.update(ctx.chat.id, "t_lang", "en");

  await ctx.reply("خب حالا متن فارسی رو بده ببینیم چه میکنم .");
});
bot.action("fr", async (ctx) => {
  actionsDB.update(ctx.chat.id, "t_lang", "fr");

  await ctx.reply("خب حالا متن فارسی رو بده ببینیم چه میکنم .");
});
bot.action("de", async (ctx) => {
  actionsDB.update(ctx.chat.id, "t_lang", "de");

  await ctx.reply("خب حالا متن فارسی رو بده ببینیم چه میکنم .");
});
bot.action("tr", async (ctx) => {
  actionsDB.update(ctx.chat.id, "t_lang", "tr");

  await ctx.reply("خب حالا متن فارسی رو بده ببینیم چه میکنم .");
});
// photo to text
bot.action("photo_text", async (ctx) => {
  await selectPicLang(ctx);
});
bot.action("eng", async (ctx) => {
  const chatId = ctx.chat.id;
  actionsDB.update(chatId, "pic_lang", "eng");

  await ctx.reply("خب حالا عکسو بده ببینم چه میکنم.");
});
bot.action("fra", async (ctx) => {
  const chatId = ctx.chat.id;
  actionsDB.update(chatId, "pic_lang", "fra");

  await ctx.reply("خب حالا عکسو بده ببینم چه میکنم.");
});
bot.action("deu", async (ctx) => {
  const chatId = ctx.chat.id;
  actionsDB.update(chatId, "pic_lang", "deu");

  await ctx.reply("خب حالا عکسو بده ببینم چه میکنم.");
});
bot.action("tur", async (ctx) => {
  const chatId = ctx.chat.id;
  actionsDB.update(chatId, "pic_lang", "tur");

  await ctx.reply("خب حالا عکسو بده ببینم چه میکنم.");
});
bot.action("fas", async (ctx) => {
  const chatId = ctx.chat.id;
  actionsDB.update(chatId, "pic_lang", "fas");

  await ctx.reply("خب حالا عکسو بده ببینم چه میکنم.");
});
// group administration
bot.on("new_chat_members", async (ctx) => {
  if (!usersDB.findOne("chatId", ctx.chat.id)) {
    usersDB.create(ctx.chat.id, ctx.update.message?.from.first_name);
  }
  await ctx.reply(
    `خوش اومدی ${ctx.message.new_chat_members[0].first_name} عزیز.`
  );
});
bot.on("left_chat_member", async (ctx) => {
  await ctx.reply(`کاربر ${ctx.message.left_chat_member.first_name} لفت داد.`);
});

bot.on("text", async (ctx) => {
  const userText = ctx.text;
  const chatId = ctx.chat.id;
  const action = actionsDB.findOne("chatId", chatId);
  const currentUser = usersDB.findOne("chatId", chatId);
  const chatType = ctx.chat.type;

  if (chatType === "private") {
    switch (true) {
      case action.current_status === "gpt":
        await sendGptResult(ctx, chatId, userText);
        break;
      case action.current_status === "translation":
        await translateText(ctx, chatId, userText);
        break;

      // case action.current_status === "coding":
      //   break;

      default:
        await ctx.reply("هنوز تعیین نکردی برات چیکار کنم.");
        break;
    }
  } else {
    await checkMessageAndBAN(ctx);

    if (ctx.message.reply_to_message) await checkCommandsAndRun(ctx);
  }
});
bot.on("photo", async (ctx) => {
  await readPicSendText(ctx);
});
bot.action("back", async (ctx) => {
  await sendStartMsg(ctx);
});

bot
  .launch()
  .then(() => {
    console.log("robot is running !");
  })
  .catch((err) => {
    console.log("error =>", err);
  });
