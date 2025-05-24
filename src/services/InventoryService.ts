import { db } from '../database/kysely.js';
import { InventoryItem, Item } from '../core/types.js';
import { EquipmentSlot } from '../core/enums.js';
import { sql } from 'kysely';

/**
 * InventoryService - Handles inventory-related operations
 */
export class InventoryService {
  /**
   * Get a character's inventory
   * @param userId Telegram user ID
   * @returns Array of inventory items with details
   */
  async getInventory(userId: number): Promise<(InventoryItem & Item)[]> {
    // Get character ID
    const character = await db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return [];
    }
    
    // Get inventory items with details
    const inventoryItems = await db
      .selectFrom('inventory_items')
      .innerJoin('items', 'items.id', 'inventory_items.item_id')
      .select([
        'inventory_items.item_id as itemId',
        'inventory_items.quantity',
        'inventory_items.equipped',
        'items.name',
        'items.description',
        'items.type',
        'items.value',
        'items.rarity',
        'items.equipment_slot as equipmentSlot',
        'items.stat_bonus as statBonus',
        'items.usable',
        'items.use_effect as useEffect'
      ])
      .where('inventory_items.character_id', '=', character.id)
      .execute();
    
    // Map to combined InventoryItem & Item interface
    return inventoryItems.map(item => ({
      characterId: character.id,
      itemId: item.itemId,
      quantity: item.quantity,
      equipped: item.equipped,
      id: item.itemId,
      name: item.name,
      description: item.description,
      type: item.type,
      value: item.value,
      rarity: item.rarity,
      equipmentSlot: item.equipmentSlot,
      statBonus: item.statBonus,
      usable: item.usable,
      useEffect: item.useEffect
    }));
  }

  /**
   * Add an item to a character's inventory
   * @param userId Telegram user ID
   * @param itemId Item ID
   * @param quantity Quantity to add
   * @returns Boolean indicating success
   */
  async addItem(userId: number, itemId: number, quantity: number = 1): Promise<boolean> {
    // Get character ID
    const character = await db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return false;
    }
    
    // Check if item exists in inventory
    const existingItem = await db
      .selectFrom('inventory_items')
      .select(['quantity'])
      .where('character_id', '=', character.id)
      .where('item_id', '=', itemId)
      .executeTakeFirst();
    
    if (existingItem) {
      // Update existing item quantity
      await db
        .updateTable('inventory_items')
        .set({ quantity: existingItem.quantity + quantity })
        .where('character_id', '=', character.id)
        .where('item_id', '=', itemId)
        .execute();
    } else {
      // Add new item to inventory
      await db
        .insertInto('inventory_items')
        .values({
          character_id: character.id,
          item_id: itemId,
          quantity,
          equipped: false,
          created_at: new Date(),
          updated_at: new Date()
        })
        .execute();
    }
    
    return true;
  }

  /**
   * Remove an item from a character's inventory
   * @param userId Telegram user ID
   * @param itemId Item ID
   * @param quantity Quantity to remove
   * @returns Boolean indicating success
   */
  async removeItem(userId: number, itemId: number, quantity: number = 1): Promise<boolean> {
    // Get character ID
    const character = await db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return false;
    }
    
    // Check if item exists in inventory
    const existingItem = await db
      .selectFrom('inventory_items')
      .select(['quantity'])
      .where('character_id', '=', character.id)
      .where('item_id', '=', itemId)
      .executeTakeFirst();
    
    if (!existingItem) {
      return false;
    }
    
    if (existingItem.quantity <= quantity) {
      // Remove item completely
      await db
        .deleteFrom('inventory_items')
        .where('character_id', '=', character.id)
        .where('item_id', '=', itemId)
        .execute();
    } else {
      // Reduce quantity
      await db
        .updateTable('inventory_items')
        .set({ quantity: existingItem.quantity - quantity })
        .where('character_id', '=', character.id)
        .where('item_id', '=', itemId)
        .execute();
    }
    
    return true;
  }

  /**
   * Toggle equipment status of an item
   * @param userId Telegram user ID
   * @param itemId Item ID
   * @returns Boolean indicating success
   */
  async toggleEquip(userId: number, itemId: number): Promise<boolean> {
    // Get character ID
    const character = await db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return false;
    }
    
    // Get item details
    const inventoryItem = await db
      .selectFrom('inventory_items')
      .innerJoin('items', 'items.id', 'inventory_items.item_id')
      .select([
        'inventory_items.equipped',
        'items.equipment_slot as equipmentSlot'
      ])
      .where('inventory_items.character_id', '=', character.id)
      .where('inventory_items.item_id', '=', itemId)
      .executeTakeFirst();
    
    if (!inventoryItem || !inventoryItem.equipmentSlot) {
      return false;
    }
    
    // If equipping, unequip any existing item in the same slot
    if (!inventoryItem.equipped) {
      // Find any currently equipped item in the same slot
      await db
        .updateTable('inventory_items')
        .innerJoin('items', 'items.id', 'inventory_items.item_id')
        .set({ equipped: false })
        .where('inventory_items.character_id', '=', character.id)
        .where('items.equipment_slot', '=', inventoryItem.equipmentSlot)
        .where('inventory_items.equipped', '=', true)
        .execute();
    }
    
    // Toggle equipped status
    await db
      .updateTable('inventory_items')
      .set({ equipped: !inventoryItem.equipped })
      .where('character_id', '=', character.id)
      .where('item_id', '=', itemId)
      .execute();
    
    return true;
  }

  /**
   * Use a consumable item
   * @param userId Telegram user ID
   * @param itemId Item ID
   * @returns Object with success status and message
   */
  async useItem(userId: number, itemId: number): Promise<{ success: boolean; message: string }> {
    // Get character
    const character = await db
      .selectFrom('characters')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return { success: false, message: 'Character not found' };
    }
    
    // Get item details
    const item = await db
      .selectFrom('inventory_items')
      .innerJoin('items', 'items.id', 'inventory_items.item_id')
      .select([
        'inventory_items.quantity',
        'items.name',
        'items.usable',
        'items.use_effect as useEffect'
      ])
      .where('inventory_items.character_id', '=', character.id)
      .where('inventory_items.item_id', '=', itemId)
      .executeTakeFirst();
    
    if (!item) {
      return { success: false, message: 'Item not found in inventory' };
    }
    
    if (!item.usable) {
      return { success: false, message: `${item.name} cannot be used` };
    }
    
    // Process item effect
    let message = '';
    let updated = false;
    
    if (item.useEffect?.includes('Restores 20 HP')) {
      // Heal character
      const newHp = Math.min(character.max_hp, character.current_hp + 20);
      await db
        .updateTable('characters')
        .set({ current_hp: newHp })
        .where('id', '=', character.id)
        .execute();
      
      message = `Used ${item.name}. HP restored to ${newHp}/${character.max_hp}`;
      updated = true;
    } else if (item.useEffect?.includes('Restores 20 SP')) {
      // Restore SP
      const newSp = Math.min(character.max_sp, character.current_sp + 20);
      await db
        .updateTable('characters')
        .set({ current_sp: newSp })
        .where('id', '=', character.id)
        .execute();
      
      message = `Used ${item.name}. SP restored to ${newSp}/${character.max_sp}`;
      updated = true;
    } else {
      message = `Used ${item.name}, but nothing happened`;
      updated = true;
    }
    
    if (updated) {
      // Remove one from quantity
      await this.removeItem(userId, itemId, 1);
    }
    
    return { success: updated, message };
  }

  /**
   * Equip an item by name
   * @param userId Telegram user ID
   * @param itemName Item name (full or partial match)
   * @returns Object with success status and message
   */
  async equipItem(userId: number, itemName: string): Promise<{ success: boolean; message: string }> {
    // Get character ID
    const character = await db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return { success: false, message: 'Character not found' };
    }
    
    // Find item by name (using case-insensitive partial match)
    const inventoryItem = await db
      .selectFrom('inventory_items')
      .innerJoin('items', 'items.id', 'inventory_items.item_id')
      .select([
        'inventory_items.item_id as itemId',
        'inventory_items.equipped',
        'items.name',
        'items.type',
        'items.equipment_slot as equipmentSlot'
      ])
      .where('inventory_items.character_id', '=', character.id)
      .where(sql`LOWER(items.name)`, 'like', `%${itemName.toLowerCase()}%`)
      .executeTakeFirst();
    
    if (!inventoryItem) {
      return { success: false, message: `Could not find "${itemName}" in your inventory.` };
    }
    
    // Check if item is equipment
    if (inventoryItem.type !== 'EQUIPMENT' || !inventoryItem.equipmentSlot) {
      return { success: false, message: `${inventoryItem.name} cannot be equipped.` };
    }
    
    // If already equipped, return success
    if (inventoryItem.equipped) {
      return { success: true, message: `${inventoryItem.name} is already equipped.` };
    }
    
    // Unequip any existing item in the same slot
    await db
      .updateTable('inventory_items')
      .innerJoin('items', 'items.id', 'inventory_items.item_id')
      .set({ equipped: false })
      .where('inventory_items.character_id', '=', character.id)
      .where('items.equipment_slot', '=', inventoryItem.equipmentSlot)
      .where('inventory_items.equipped', '=', true)
      .execute();
    
    // Equip the new item
    await db
      .updateTable('inventory_items')
      .set({ equipped: true })
      .where('character_id', '=', character.id)
      .where('item_id', '=', inventoryItem.itemId)
      .execute();
    
    return { success: true, message: `${inventoryItem.name} equipped successfully.` };
  }

  /**
   * Unequip an item from a specific slot
   * @param userId Telegram user ID
   * @param slotName Equipment slot name (e.g., WEAPON, HEAD, BODY)
   * @returns Object with success status and message
   */
  async unequipItemFromSlot(userId: number, slotName: string): Promise<{ success: boolean; message: string }> {
    // Get character ID
    const character = await db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return { success: false, message: 'Character not found' };
    }
    
    // Validate slot name
    try {
      // Implicit validation by trying to cast
      slotName as EquipmentSlot;
    } catch {
      return { success: false, message: `Invalid equipment slot: ${slotName}. Valid slots are: ${Object.values(EquipmentSlot).join(', ')}` };
    }
    
    // Find equipped item in the specified slot
    const equippedItem = await db
      .selectFrom('inventory_items')
      .innerJoin('items', 'items.id', 'inventory_items.item_id')
      .select([
        'inventory_items.item_id as itemId',
        'items.name'
      ])
      .where('inventory_items.character_id', '=', character.id)
      .where('items.equipment_slot', '=', slotName as unknown as string)
      .where('inventory_items.equipped', '=', true)
      .executeTakeFirst();
    
    if (!equippedItem) {
      return { success: false, message: `You don't have anything equipped in the ${slotName} slot.` };
    }
    
    // Unequip the item
    await db
      .updateTable('inventory_items')
      .set({ equipped: false })
      .where('character_id', '=', character.id)
      .where('item_id', '=', equippedItem.itemId)
      .execute();
    
    return { success: true, message: `${equippedItem.name} unequipped from ${slotName} slot.` };
  }

  /**
   * Use an item by name
   * @param userId Telegram user ID
   * @param itemName Item name (full or partial match)
   * @returns Object with success status and message
   */
  async useItemByName(userId: number, itemName: string): Promise<{ success: boolean; message: string }> {
    // Get character
    const character = await db
      .selectFrom('characters')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return { success: false, message: 'Character not found' };
    }
    
    // Find item by name (using case-insensitive partial match)
    const item = await db
      .selectFrom('inventory_items')
      .innerJoin('items', 'items.id', 'inventory_items.item_id')
      .select([
        'inventory_items.item_id as itemId',
        'inventory_items.quantity',
        'items.name',
        'items.usable',
        'items.use_effect as useEffect'
      ])
      .where('inventory_items.character_id', '=', character.id)
      .where(sql`LOWER(items.name)`, 'like', `%${itemName.toLowerCase()}%`)
      .executeTakeFirst();
    
    if (!item) {
      return { success: false, message: `Could not find "${itemName}" in your inventory.` };
    }
    
    if (!item.usable) {
      return { success: false, message: `${item.name} cannot be used.` };
    }
    
    // Process item effect
    let message = '';
    let updated = false;
    
    if (item.useEffect?.includes('Restores') && item.useEffect?.includes('HP')) {
      // Extract HP amount from effect
      const hpMatch = item.useEffect.match(/Restores (\d+) HP/);
      const hpAmount = hpMatch ? parseInt(hpMatch[1]) : 20;
      
      // Heal character
      const newHp = Math.min(character.max_hp, character.current_hp + hpAmount);
      await db
        .updateTable('characters')
        .set({ current_hp: newHp })
        .where('id', '=', character.id)
        .execute();
      
      message = `HP restored to ${newHp}/${character.max_hp}`;
      updated = true;
    } else if (item.useEffect?.includes('Restores') && item.useEffect?.includes('SP')) {
      // Extract SP amount from effect
      const spMatch = item.useEffect.match(/Restores (\d+) SP/);
      const spAmount = spMatch ? parseInt(spMatch[1]) : 20;
      
      // Restore SP
      const newSp = Math.min(character.max_sp, character.current_sp + spAmount);
      await db
        .updateTable('characters')
        .set({ current_sp: newSp })
        .where('id', '=', character.id)
        .execute();
      
      message = `SP restored to ${newSp}/${character.max_sp}`;
      updated = true;
    } else {
      message = `You used ${item.name}, but nothing happened`;
      updated = true;
    }
    
    if (updated) {
      // Remove one from quantity
      await this.removeItem(userId, item.itemId, 1);
    }
    
    return { success: updated, message };
  }

  /**
   * Drop an item from inventory by name
   * @param userId Telegram user ID
   * @param itemName Item name (full or partial match)
   * @param quantity Quantity to drop
   * @returns Object with success status and message
   */
  async dropItem(userId: number, itemName: string, quantity: number = 1): Promise<{ success: boolean; message: string }> {
    // Get character ID
    const character = await db
      .selectFrom('characters')
      .select('id')
      .where('user_id', '=', userId)
      .executeTakeFirst();
    
    if (!character) {
      return { success: false, message: 'Character not found' };
    }
    
    // Find item by name (using case-insensitive partial match)
    const inventoryItem = await db
      .selectFrom('inventory_items')
      .innerJoin('items', 'items.id', 'inventory_items.item_id')
      .select([
        'inventory_items.item_id as itemId',
        'inventory_items.quantity',
        'inventory_items.equipped',
        'items.name'
      ])
      .where('inventory_items.character_id', '=', character.id)
      .where(sql`LOWER(items.name)`, 'like', `%${itemName.toLowerCase()}%`)
      .executeTakeFirst();
    
    if (!inventoryItem) {
      return { success: false, message: `Could not find "${itemName}" in your inventory.` };
    }
    
    // Check if item is equipped
    if (inventoryItem.equipped) {
      return { success: false, message: `${inventoryItem.name} is currently equipped. Please unequip it first.` };
    }
    
    // Check quantity
    if (quantity <= 0) {
      return { success: false, message: 'Quantity must be greater than 0.' };
    }
    
    if (inventoryItem.quantity < quantity) {
      return { success: false, message: `You only have ${inventoryItem.quantity} ${inventoryItem.name}(s).` };
    }
    
    // Drop the item
    await this.removeItem(userId, inventoryItem.itemId, quantity);
    
    return { success: true, message: `Dropped ${quantity} ${inventoryItem.name}(s).` };
  }
}