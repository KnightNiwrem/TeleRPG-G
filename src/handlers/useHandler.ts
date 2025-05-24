import { Context } from 'grammy';
import { InventoryService } from '../services/InventoryService.js';

const inventoryService = new InventoryService();

export async function useHandler(ctx: Context) {
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
    await ctx.reply('Please specify an item to use. Example: /use Health Potion');
    return;
  }

  // Try to use the item
  try {
    const result = await inventoryService.useItemByName(userId, itemName);
    
    if (result.success) {
      await ctx.reply(`${itemName} used successfully! ${result.message}`);
    } else {
      await ctx.reply(result.message);
    }
  } catch (error) {
    console.error('Error using item:', error);
    await ctx.reply('An error occurred while trying to use the item.');
  }
}