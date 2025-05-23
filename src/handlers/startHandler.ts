import { Context } from 'grammy';
import { stateService } from '../bot.js';
import { CharacterService } from '../services/CharacterService.js';
import { InlineKeyboard } from 'grammy';

// Import character-related types
import { ClassType } from '../core/enums.js';

const characterService = new CharacterService();

export async function startHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Check if the user already has a character
  const hasCharacter = await characterService.hasCharacter(userId);
  
  if (hasCharacter) {
    // If the user already has a character, show character info
    const character = await characterService.getCharacter(userId);
    if (!character) {
      await ctx.reply('Error retrieving your character. Please try again later.');
      return;
    }
    
    await ctx.reply(
      `Your character: ${character.name}\n` +
      `Class: ${character.class}\n` +
      `Level: ${character.level}\n` +
      `HP: ${character.currentHp}/${character.maxHp}\n` +
      `SP: ${character.currentSp}/${character.maxSp}\n` +
      `Experience: ${character.experience}/${character.level * 100}`
    );
  } else {
    // If the user doesn't have a character, start the character creation process
    await stateService.setUserState(userId, {
      action: 'creating_character',
      step: 'choose_class',
    });
    
    const keyboard = new InlineKeyboard()
      .text('Warrior', 'class_warrior')
      .text('Mage', 'class_mage')
      .row()
      .text('Rogue', 'class_rogue')
      .text('Cleric', 'class_cleric');
    
    await ctx.reply(
      'Welcome to RiftChronicles! Let\'s create your character.\n\n' +
      'First, choose your class:',
      { reply_markup: keyboard }
    );
  }
}