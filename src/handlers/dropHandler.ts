import { Context } from 'grammy';
import { InventoryService } from '../services/InventoryService.js';

const inventoryService = new InventoryService();

export async function dropHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get the item name and quantity from the command arguments
  const text = ctx.message?.text || '';
  const args = text.split(' ');
  
  // Check if the last argument is a number (quantity)
  const lastArg = args[args.length - 1];
  let quantity = 1;
  let itemName: string;
  
  if (/^\d+$/.test(lastArg)) {
    quantity = parseInt(lastArg);
    itemName = args.slice(1, args.length - 1).join(' ').trim();
  } else {
    itemName = args.slice(1).join(' ').trim();
  }

  if (!itemName) {
    await ctx.reply('Please specify an item to drop. Example: /drop Health Potion 2');
    return;
  }

  // Try to drop the item
  try {
    const result = await inventoryService.dropItem(userId, itemName, quantity);
    
    if (result.success) {
      await ctx.reply(`Dropped ${quantity} ${itemName}(s).`);
    } else {
      await ctx.reply(result.message);
    }
  } catch (error) {
    console.error('Error dropping item:', error);
    await ctx.reply('An error occurred while trying to drop the item.');
  }
}