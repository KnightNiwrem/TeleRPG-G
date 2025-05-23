import { Bot } from 'grammy';
import { startHandler } from './startHandler';
import { exploreHandler } from './exploreHandler';
import { combatHandler } from './combatHandler';
import { skillHandler } from './skillHandler';
import { inventoryHandler } from './inventoryHandler';
import { questHandler } from './questHandler';

export function registerCommandHandlers(bot: Bot) {
  // Register command handlers
  bot.command('start', startHandler);
  bot.command('explore', exploreHandler);
  bot.command('combat', combatHandler);
  bot.command('skill', skillHandler);
  bot.command('inventory', inventoryHandler);
  bot.command('quest', questHandler);

  // Register help command
  bot.command('help', async (ctx) => {
    await ctx.reply(
      'Welcome to RiftChronicles! Available commands:\n' +
      '/start - Create a character or view your character\n' +
      '/explore - Explore areas in the game world\n' +
      '/combat - Engage in combat with monsters\n' +
      '/skill - View and use your skills\n' +
      '/inventory - Manage your inventory\n' +
      '/quest - View available quests and progress\n' +
      '/help - Show this help message'
    );
  });
}