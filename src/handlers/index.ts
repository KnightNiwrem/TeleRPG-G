import type { Composer, Context } from 'grammy';
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

export function registerCommandHandlers<C extends Context>(composer: Composer<C>) {
  // Register command handlers
  composer.command('start', startHandler);
  composer.command('explore', exploreHandler);
  composer.command('combat', combatHandler);
  composer.command('skill', skillHandler);
  composer.command('inventory', inventoryHandler);
  composer.command('quest', questHandler);
  composer.command('attack', attackHandler);
  composer.command('go', goHandler);
  composer.command('equip', equipHandler);
  composer.command('unequip', unequipHandler);
  composer.command('use', useHandler);
  composer.command('drop', dropHandler);

  // Register help command
  composer.command('help', async (ctx) => {
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

  // Register message handler for text messages (handles multi-step interactions)
  composer.on('message:text', messageHandler);
}