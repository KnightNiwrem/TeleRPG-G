import { Bot } from 'grammy';
import { startHandler } from './startHandler.js';
import { exploreHandler } from './exploreHandler.js';
import { combatHandler } from './combatHandler.js';
import { skillHandler } from './skillHandler.js';
import { inventoryHandler } from './inventoryHandler.js';
import { questHandler } from './questHandler.js';
import { attackHandler } from './attackHandler.js';
import { goHandler } from './goHandler.js';
import { messageHandler } from './messageHandler.js';
import { equipHandler } from './equipHandler.js';
import { unequipHandler } from './unequipHandler.js';
import { useHandler } from './useHandler.js';
import { dropHandler } from './dropHandler.js';

export function registerCommandHandlers(bot: Bot) {
  // Register command handlers
  bot.command('start', startHandler);
  bot.command('explore', exploreHandler);
  bot.command('combat', combatHandler);
  bot.command('skill', skillHandler);
  bot.command('inventory', inventoryHandler);
  bot.command('quest', questHandler);
  bot.command('attack', attackHandler);
  bot.command('go', goHandler);
  bot.command('equip', equipHandler);
  bot.command('unequip', unequipHandler);
  bot.command('use', useHandler);
  bot.command('drop', dropHandler);

  // Register message handler for text messages (handles multi-step interactions)
  bot.on('message:text', messageHandler);

  // Register help command
  bot.command('help', async (ctx) => {
    await ctx.reply(
      'Welcome to RiftChronicles! Available commands:\n' +
      '/start - Create a character or view your character\n' +
      '/explore - Explore areas in the game world\n' +
      '/go <direction> - Move to a connected area\n' +
      '/attack [target] - Attack a monster in your area\n' +
      '/combat - Engage in combat with monsters\n' +
      '/skill - View and use your skills\n' +
      '/inventory - View your inventory\n' +
      '/equip <item_name> - Equip an item\n' +
      '/unequip <slot_name> - Unequip an item from a slot\n' +
      '/use <item_name> - Use a consumable item\n' +
      '/drop <item_name> [quantity] - Drop items from inventory\n' +
      '/quest - View available quests and progress\n' +
      '/help - Show this help message'
    );
  });
}