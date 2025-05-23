import { Context } from 'grammy';
import { stateService } from '../bot.js';
import { InventoryService } from '../services/InventoryService.js';

const inventoryService = new InventoryService();

export async function equipHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get the item name from the command arguments
  const text = ctx.message?.text || '';
  const args = text.split(' ').slice(1);
  const itemName = args.join(' ').trim();

  if (!itemName) {
    await ctx.reply('Please specify an item to equip. Example: /equip Leather Armor');
    return;
  }

  // Try to equip the item
  try {
    const result = await inventoryService.equipItem(userId, itemName);
    
    if (result.success) {
      await ctx.reply(`${itemName} equipped successfully!`);
    } else {
      await ctx.reply(result.message);
    }
  } catch (error) {
    console.error('Error equipping item:', error);
    await ctx.reply('An error occurred while trying to equip the item.');
  }
}