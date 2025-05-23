import { Context } from 'grammy';
import { stateService } from '../bot';
import { QuestService } from '../services/QuestService';
import { InlineKeyboard } from 'grammy';

const questService = new QuestService();

export async function questHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get active and available quests
  const activeQuests = await questService.getActiveQuests(userId);
  const availableQuests = await questService.getAvailableQuests(userId);
  
  if (activeQuests.length === 0 && availableQuests.length === 0) {
    await ctx.reply('No quests available at the moment. Try exploring more areas!');
    return;
  }
  
  let questText = 'Your Quests:\n\n';
  
  if (activeQuests.length > 0) {
    questText += 'Active Quests:\n';
    activeQuests.forEach(quest => {
      questText += `- ${quest.name}: ${quest.description}\n`;
      
      if (quest.objectives.length > 0) {
        quest.objectives.forEach(objective => {
          questText += `   * ${objective.description}: ${objective.progress}/${objective.target}\n`;
        });
      }
      
      questText += '\n';
    });
  }
  
  if (availableQuests.length > 0) {
    questText += 'Available Quests:\n';
    availableQuests.forEach(quest => {
      questText += `- ${quest.name}: ${quest.description}\n`;
    });
  }
  
  // Create keyboard with options
  const keyboard = new InlineKeyboard();
  
  // Add buttons for available quests
  availableQuests.forEach((quest, index) => {
    if (index > 0 && index % 2 === 0) {
      keyboard.row();
    }
    keyboard.text(`Accept: ${quest.name}`, `quest_accept_${quest.id}`);
  });
  
  if (availableQuests.length > 0 && activeQuests.length > 0) {
    keyboard.row();
  }
  
  // Add buttons for active quests
  activeQuests.forEach((quest, index) => {
    if (index > 0 && index % 2 === 0) {
      keyboard.row();
    }
    keyboard.text(`Details: ${quest.name}`, `quest_details_${quest.id}`);
  });
  
  await ctx.reply(questText, { reply_markup: keyboard });
  
  // Set user state
  stateService.setUserState(userId, {
    action: 'quest_menu',
    step: 'view_quests',
  });
}