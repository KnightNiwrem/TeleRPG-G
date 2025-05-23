import { Context } from 'grammy';
import { stateService } from '../bot.js';
import { InventoryService } from '../services/InventoryService.js';
import { InlineKeyboard } from 'grammy';

const inventoryService = new InventoryService();

export async function inventoryHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get user inventory
  const items = await inventoryService.getInventory(userId);
  
  if (items.length === 0) {
    await ctx.reply('Your inventory is empty. Defeat enemies to get items!');
    return;
  }
  
  // Group items by type
  const equipment = items.filter(item => item.type === 'EQUIPMENT');
  const consumables = items.filter(item => item.type === 'CONSUMABLE');
  const materials = items.filter(item => item.type === 'MATERIAL');
  
  let inventoryText = 'Your Inventory:\n\n';
  
  if (equipment.length > 0) {
    inventoryText += 'Equipment:\n';
    equipment.forEach(item => {
      inventoryText += `- ${item.name} (${item.equipped ? 'Equipped' : 'Not Equipped'})\n`;
    });
    inventoryText += '\n';
  }
  
  if (consumables.length > 0) {
    inventoryText += 'Consumables:\n';
    consumables.forEach(item => {
      inventoryText += `- ${item.name} (x${item.quantity})\n`;
    });
    inventoryText += '\n';
  }
  
  if (materials.length > 0) {
    inventoryText += 'Materials:\n';
    materials.forEach(item => {
      inventoryText += `- ${item.name} (x${item.quantity})\n`;
    });
  }
  
  // Create keyboard with options
  const keyboard = new InlineKeyboard()
    .text('Equipment', 'inventory_equipment')
    .text('Consumables', 'inventory_consumables')
    .row()
    .text('Materials', 'inventory_materials')
    .text('Back', 'inventory_back');
  
  await ctx.reply(inventoryText, { reply_markup: keyboard });
  
  // Set user state
  await stateService.setUserState(userId, {
    action: 'inventory_menu',
    step: 'view_inventory',
  });
}