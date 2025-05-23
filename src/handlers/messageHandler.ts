import { Context } from 'grammy';
import { stateService } from '../bot.js';
import { CombatService } from '../services/CombatService.js';
import { SkillService } from '../services/SkillService.js';
import { InventoryService } from '../services/InventoryService.js';
import { QuestService } from '../services/QuestService.js';

const combatService = new CombatService();
const skillService = new SkillService();
const inventoryService = new InventoryService();
const questService = new QuestService();

export async function messageHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    return;
  }

  // Get user state
  const state = await stateService.getUserState(userId);
  if (!state) {
    // No active state, no need to process
    return;
  }

  // Get the message text
  const messageText = ctx.message?.text;
  if (!messageText) {
    return;
  }

  // Handle based on current action
  switch (state.action) {
  case 'AWAITING_TARGET_FOR_ATTACK':
    await handleAttackTarget(ctx, userId, messageText);
    break;
  case 'AWAITING_SKILL_CONFIRMATION':
    await handleSkillConfirmation(ctx, userId, messageText, state.skillId);
    break;
  default:
    // No special handling for this state
    break;
  }
}

/**
 * Handle targeting an enemy for attack
 * @param ctx Context
 * @param userId User ID
 * @param targetName Target name provided by user
 */
async function handleAttackTarget(ctx: Context, userId: number, targetName: string) {
  try {
    const result = await combatService.initiateCombat(userId, targetName);
    
    if (!result.success) {
      await ctx.reply(result.message);
      return;
    }
    
    // Combat initiated successfully
    if (result.enemy && result.character) {
      await ctx.reply(
        `You engage ${result.enemy.name}!\n` +
        `Enemy HP: ${result.enemy.currentHp}/${result.enemy.maxHp}\n` +
        `Your HP: ${result.character.currentHp}/${result.character.maxHp}\n` +
        `Your SP: ${result.character.currentSp}/${result.character.maxSp}\n\n` +
        'What will you do?',
        { reply_markup: result.keyboard }
      );
      
      // Update state to in combat
      await stateService.updateUserState(userId, {
        action: 'in_combat',
        step: 'turn_start',
        enemyId: result.enemy.id,
      });
    } else {
      await ctx.reply('Error: Combat data is incomplete. Please try again.');
    }
  } catch (error) {
    console.error('Error initiating combat:', error);
    await ctx.reply('An error occurred while trying to initiate combat. Please try again.');
  } finally {
    // Clear the awaiting target state
    await stateService.clearUserState(userId);
  }
}

/**
 * Handle skill confirmation
 * @param ctx Context
 * @param userId User ID
 * @param message User message
 * @param skillId Skill ID from state
 */
async function handleSkillConfirmation(ctx: Context, userId: number, message: string, skillId?: number) {
  if (!skillId) {
    await ctx.reply('Error: Could not determine which skill to use.');
    await stateService.clearUserState(userId);
    return;
  }
  
  // Check if the message is a confirmation
  const confirmation = message.toLowerCase();
  if (confirmation === 'yes' || confirmation === 'y' || confirmation === 'confirm') {
    // Use the skill
    const result = await skillService.useSkill(userId, skillId);
    await ctx.reply(result.message);
    
    // If in combat, update combat state
    const inCombat = await combatService.isInCombat(userId);
    if (inCombat && result.success) {
      const combatState = await combatService.getCombatState(userId);
      if (combatState && combatState.enemy && combatState.character) {
        await ctx.reply(
          `Enemy HP: ${combatState.enemy.currentHp}/${combatState.enemy.maxHp}\n` +
          `Your HP: ${combatState.character.currentHp}/${combatState.character.maxHp}\n` +
          `Your SP: ${combatState.character.currentSp}/${combatState.character.maxSp}`
        );
      } else {
        await ctx.reply('Combat information could not be retrieved.');
      }
    }
  } else if (confirmation === 'no' || confirmation === 'n' || confirmation === 'cancel') {
    // Cancel skill use
    await ctx.reply('Skill use cancelled.');
  } else {
    // Unclear response
    await ctx.reply('Please confirm with "yes" or "no", or cancel with "cancel".');
    return; // Don't clear state yet
  }
  
  // Clear the state after handling
  await stateService.clearUserState(userId);
}