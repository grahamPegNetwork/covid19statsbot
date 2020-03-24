require('dotenv').config();
const fetch = require("node-fetch");
const Telegraf = require('telegraf');
const bot = new Telegraf(process.env['TELEGRAM_BOT_TOKEN']);
// Register listeners
const quickstart = `Hello and welcome to the COVID-19 Stats Bot!
*Usage*
/global Returns current global stats
/country <country name> Returns country specific stats`;

const getGlobalStats = async() => {
  const stats = await fetch(`https://corona.lmao.ninja/all`);
  return stats.json();
}
const getCountryStats = async(country) => {
  if (!country) {
      return { error: 'Please specify a country name.' }
  } else if (country) {
      try { const a = await fetch(`https://corona.lmao.ninja/countries/${country}`); return await a.json();
      } catch (e) { return { error: 'Country not found. Please try again.' } }
  }
}
bot.command('global', async(ctx) => {
  var stats = await getGlobalStats();
  var updated = new Date(stats.updated * 1000);
  var message = `*Global Stats*
Currently Infected: ${stats.cases - stats.deaths - stats.recovered}
Deaths: ${stats.deaths}
Recovered: ${stats.recovered}
Total Cases: ${stats.cases}
Last Updated:
${updated}
  `;
  ctx.reply(message, {parse_mode: "markdown"})
})
bot.command('country', async(ctx) => {
  var country = await getCountryStats(ctx.message.text.substring(9));
  if (!country.error) {
    var message = `*Country*: ${country.country}
*Daily Stats*
New Cases: ${country.todayCases}
Deaths: ${country.todayDeaths}

*Total Stats*
Infected: ${country.cases-country.deaths-country.recovered}
Deaths: ${country.deaths}
Recovered: ${country.recovered}
Infection Rate: ${country.casesPerOneMillion/10000}%`;
  } else {
    var message = country.error;
  }
  ctx.reply(message, {parse_mode: "markdown"})
})
bot.start((ctx) => ctx.reply(quickstart, {parse_mode: "markdown"}));
bot.help((ctx) => ctx.reply(quickstart, {parse_mode: "markdown"}));
bot.launch();