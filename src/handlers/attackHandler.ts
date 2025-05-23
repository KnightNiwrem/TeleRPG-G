import { Context } from 'grammy';
import { stateService } from '../bot';
import { CombatService } from '../services/CombatService';
import { AreaService } from '../services/AreaService';

const combatService = new CombatService();
const areaService = new AreaService();

export async function attackHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get the target from the command arguments
  const text = ctx.message?.text || '';
  const args = text.split(' ').slice(1);
  const targetName = args.join(' ').trim();

  // If no target is specified, set state to awaiting target and prompt user
  if (!targetName) {
    // Check if user is already in combat
    const inCombat = await combatService.isInCombat(userId);
    
    if (inCombat) {
      await ctx.reply('You are already in combat! Use /combat to see your options.');
      return;
    }

    // Set state to awaiting target
    await stateService.setState(userId, 'AWAITING_TARGET_FOR_ATTACK', {}, 300); // 5 minute timeout
    
    // Get enemies in current area
    const enemies = await areaService.getEnemiesInArea(userId);
    
    if (enemies.length === 0) {
      await ctx.reply('There are no enemies to attack in this area. Try exploring another area.');
      await stateService.clearUserState(userId);
      return;
    }

    // List available targets
    const enemyList = enemies.map(enemy => `- ${enemy.name}`).join('\n');
    await ctx.reply(`Who would you like to attack?\n\n${enemyList}\n\nReply with the name of your target.`);
    return;
  }

  // If target is specified, initiate combat with that target
  try {
    const result = await combatService.initiateCombat(userId, targetName);
    
    if (!result.success) {
      await ctx.reply(result.message);
      return;
    }
    
    // Combat initiated successfully
    await ctx.reply(
      `You engage ${result.enemy.name}!\n` +
      `Enemy HP: ${result.enemy.currentHp}/${result.enemy.maxHp}\n` +
      `Your HP: ${result.character.currentHp}/${result.character.maxHp}\n` +
      `Your SP: ${result.character.currentSp}/${result.character.maxSp}\n\n` +
      'What will you do?',
      { reply_markup: result.keyboard }
    );
    
    // Set state to in combat
    await stateService.updateUserState(userId, {
      action: 'in_combat',
      step: 'turn_start',
      enemyId: result.enemy.id,
    });
  } catch (error) {
    console.error('Error initiating combat:', error);
    await ctx.reply('An error occurred while trying to initiate combat. Please try again.');
  }
}