import { Context } from 'grammy';
import { stateService } from '../bot';
import { AreaService } from '../services/AreaService';
import { CharacterService } from '../services/CharacterService';

const areaService = new AreaService();
const characterService = new CharacterService();

export async function goHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get the direction from the command arguments
  const text = ctx.message?.text || '';
  const args = text.split(' ').slice(1);
  const direction = args.join(' ').trim().toLowerCase();

  if (!direction) {
    await ctx.reply('Please specify a direction or area name. Example: /go north or /go Greenhaven Outskirts');
    return;
  }

  // Get character's current area
  const character = await characterService.getCharacter(userId);
  if (!character) {
    await ctx.reply('You need to create a character first. Use /start to begin.');
    return;
  }

  // Get connected areas
  const connectedAreas = await areaService.getConnectedAreas(character.areaId);
  
  // Find matching area by name (partial match) or by direction
  let targetArea = connectedAreas.find(area => 
    area.name.toLowerCase().includes(direction) ||
    (direction === 'north' && area.id > character.areaId) ||
    (direction === 'south' && area.id < character.areaId) ||
    (direction === 'east' && area.id % 2 === 0) ||
    (direction === 'west' && area.id % 2 !== 0)
  );

  if (!targetArea) {
    const availableDirections = connectedAreas.map(area => area.name).join(', ');
    await ctx.reply(`You cannot go that way. Available paths: ${availableDirections || 'None'}`);
    return;
  }

  // Move to the target area
  const success = await areaService.moveCharacterToArea(userId, targetArea.id);
  
  if (!success) {
    await ctx.reply('Failed to move to the specified area.');
    return;
  }

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
  
  await ctx.reply(
    `You have arrived at ${areaDescription.areaName}.\n\n` +
    `${areaDescription.description}\n\n` +
    `Exits: ${exitsList}\n` +
    `NPCs: ${npcsList}\n` +
    `Monsters: ${monstersList}\n` +
    `Other adventurers: ${playersList}\n\n` +
    'Use /explore to look around or /attack to engage in combat.'
  );
  
  // Update user state
  await stateService.updateUserState(userId, {
    action: 'exploring',
    step: 'view_area',
    areaId: targetArea.id
  });
}