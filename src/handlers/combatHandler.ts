import { Context } from 'grammy';
import { stateService } from '../bot.js';
import { CombatService } from '../services/CombatService.js';
import { InlineKeyboard } from 'grammy';

const combatService = new CombatService();

export async function combatHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Check if player is already in combat
  const inCombat = await combatService.isInCombat(userId);
  
  if (inCombat) {
    // Show combat status and options
    const combatState = await combatService.getCombatState(userId);
    
    if (combatState && combatState.enemy && combatState.character) {
      const keyboard = new InlineKeyboard()
        .text('Attack', 'combat_attack')
        .text('Use Skill', 'combat_skill')
        .row()
        .text('Use Item', 'combat_item')
        .text('Flee', 'combat_flee');
      
      await ctx.reply(
        `You are in combat with ${combatState.enemy.name}!\n` +
        `Enemy HP: ${combatState.enemy.currentHp}/${combatState.enemy.maxHp}\n` +
        `Your HP: ${combatState.character.currentHp}/${combatState.character.maxHp}\n` +
        `Your SP: ${combatState.character.currentSp}/${combatState.character.maxSp}\n\n` +
        'What will you do?',
        { reply_markup: keyboard }
      );
    } else {
      await ctx.reply('Unable to retrieve combat information. Please try again.');
      // Clear combat state if it's corrupted
      await stateService.clearUserState(userId);
    }
  } else {
    // Start a new combat
    await ctx.reply('Searching for enemies...');
    
    // Set state to indicate searching for combat
    stateService.setUserState(userId, {
      action: 'searching_combat',
      step: 'initial',
    });
    
    // Simulate finding an enemy (in a real implementation, this would be handled by a service)
    setTimeout(async () => {
      const enemy = await combatService.findEnemy(userId);
      
      if (!enemy) {
        await ctx.reply('No enemies found. Try exploring a different area!');
        stateService.clearUserState(userId);
        return;
      }
      
      await combatService.startCombat(userId, enemy.id);
      
      const keyboard = new InlineKeyboard()
        .text('Attack', 'combat_attack')
        .text('Use Skill', 'combat_skill')
        .row()
        .text('Use Item', 'combat_item')
        .text('Flee', 'combat_flee');
      
      await ctx.reply(
        `You encountered a ${enemy.name}!\n` +
        `Enemy HP: ${enemy.currentHp}/${enemy.maxHp}\n\n` +
        'What will you do?',
        { reply_markup: keyboard }
      );
      
      // Update state to in combat
      stateService.setUserState(userId, {
        action: 'in_combat',
        step: 'turn_start',
        enemyId: enemy.id,
      });
    }, 1000);
  }
}