import { Context } from 'grammy';
import { stateService } from '../bot';
import { InventoryService } from '../services/InventoryService';

const inventoryService = new InventoryService();

export async function unequipHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get the slot name from the command arguments
  const text = ctx.message?.text || '';
  const args = text.split(' ').slice(1);
  const slotName = args.join(' ').trim().toUpperCase();

  if (!slotName) {
    await ctx.reply('Please specify a slot to unequip. Example: /unequip WEAPON');
    return;
  }

  // Try to unequip the item
  try {
    const result = await inventoryService.unequipItemFromSlot(userId, slotName);
    
    if (result.success) {
      await ctx.reply(`Item unequipped from ${slotName} slot successfully!`);
    } else {
      await ctx.reply(result.message);
    }
  } catch (error) {
    console.error('Error unequipping item:', error);
    await ctx.reply('An error occurred while trying to unequip the item.');
  }
}