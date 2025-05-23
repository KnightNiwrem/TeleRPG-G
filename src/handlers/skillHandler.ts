import { Context } from 'grammy';
import { stateService } from '../bot';
import { SkillService } from '../services/SkillService';
import { InlineKeyboard } from 'grammy';

const skillService = new SkillService();

export async function skillHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get the user's skills
  const skills = await skillService.getCharacterSkills(userId);
  
  if (skills.length === 0) {
    await ctx.reply('You do not have any skills yet. Level up to unlock skills!');
    return;
  }
  
  // Create a keyboard with the skills
  const keyboard = new InlineKeyboard();
  skills.forEach((skill, index) => {
    if (index > 0 && index % 2 === 0) {
      keyboard.row();
    }
    keyboard.text(`${skill.name} (SP: ${skill.spCost})`, `skill_use_${skill.id}`);
  });
  
  await ctx.reply('Your Skills:', { reply_markup: keyboard });
  
  // Set user state
  stateService.setUserState(userId, {
    action: 'skill_menu',
    step: 'view_skills',
  });
}