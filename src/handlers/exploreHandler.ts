import { Context } from 'grammy';
import { stateService } from '../bot';
import { AreaService } from '../services/AreaService';
import { InlineKeyboard } from 'grammy';

const areaService = new AreaService();

export async function exploreHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }

  // Get available areas for the player
  const areas = await areaService.getAvailableAreas(userId);
  
  if (areas.length === 0) {
    await ctx.reply('No areas available for exploration yet. Complete the tutorial first!');
    return;
  }
  
  // Create inline keyboard with available areas
  const keyboard = new InlineKeyboard();
  areas.forEach((area, index) => {
    if (index > 0 && index % 2 === 0) {
      keyboard.row();
    }
    keyboard.text(area.name, `explore_area_${area.id}`);
  });
  
  await ctx.reply('Choose an area to explore:', { reply_markup: keyboard });
  
  // Set user state to exploring
  stateService.setUserState(userId, {
    action: 'exploring',
    step: 'choose_area',
  });
}