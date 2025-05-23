import { Context } from 'grammy';
import { stateService } from '../bot';
import { AreaService } from '../services/AreaService';
import { CharacterService } from '../services/CharacterService';
import { InlineKeyboard } from 'grammy';

const areaService = new AreaService();
const characterService = new CharacterService();

export async function exploreHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Check if the user has a character
  const hasCharacter = await characterService.hasCharacter(userId);
  if (!hasCharacter) {
    await ctx.reply('You need to create a character first. Use /start to begin.');
    return;
  }

  // Get character's current area
  const character = await characterService.getCharacter(userId);
  if (!character) {
    await ctx.reply('Error retrieving character data.');
    return;
  }

  try {
    // Get area description
    const areaDescription = await areaService.describeArea(userId);
    
    const exitsList = areaDescription.exits.length > 0 
      ? areaDescription.exits.join(', ') 
      : 'None';
    
    const npcsList = areaDescription.npcs.length > 0 
      ? areaDescription.npcs.join(', ') 
      : 'None';
    
    const monstersList = areaDescription.monsters.length > 0 
      ? areaDescription.monsters.join(', ') 
      : 'None';
    
    const playersList = areaDescription.players.length > 0 
      ? areaDescription.players.join(', ') 
      : 'None';
    
    // Build exploration options keyboard
    const keyboard = new InlineKeyboard();
    
    // Add movement options if there are exits
    if (areaDescription.exits.length > 0) {
      keyboard.text('Move to another area', 'explore_move');
    }
    
    // Add combat option if there are monsters
    if (areaDescription.monsters.length > 0) {
      keyboard.text('Look for enemies', 'explore_combat');
    }
    
    // Add NPC interaction if there are NPCs
    if (areaDescription.npcs.length > 0) {
      keyboard.text('Talk to NPCs', 'explore_npcs');
    }
    
    // Add search for items option
    keyboard.row().text('Search for items', 'explore_items');
    
    await ctx.reply(
      `You are in ${areaDescription.areaName}.\n\n` +
      `${areaDescription.description}\n\n` +
      `Exits: ${exitsList}\n` +
      `NPCs: ${npcsList}\n` +
      `Monsters: ${monstersList}\n` +
      `Other adventurers: ${playersList}\n\n` +
      'What would you like to do?',
      { reply_markup: keyboard }
    );
    
    // Update user state
    await stateService.updateUserState(userId, {
      action: 'exploring',
      step: 'view_area',
      areaId: character.areaId
    });
  } catch (error) {
    console.error('Error in exploreHandler:', error);
    await ctx.reply('An error occurred while exploring. Please try again.');
  }
}