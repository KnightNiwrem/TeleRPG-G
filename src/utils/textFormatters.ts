/**
 * Text formatting utilities for Telegram messages
 */

/**
 * Format text as bold
 * @param text Text to format
 * @returns Formatted text
 */
export function bold(text: string): string {
  return `*${text}*`;
}

/**
 * Format text as italic
 * @param text Text to format
 * @returns Formatted text
 */
export function italic(text: string): string {
  return `_${text}_`;
}

/**
 * Format text as underlined
 * @param text Text to format
 * @returns Formatted text
 */
export function underline(text: string): string {
  return `__${text}__`;
}

/**
 * Format text as strikethrough
 * @param text Text to format
 * @returns Formatted text
 */
export function strikethrough(text: string): string {
  return `~${text}~`;
}

/**
 * Format text as code
 * @param text Text to format
 * @returns Formatted text
 */
export function code(text: string): string {
  return `\`${text}\``;
}

/**
 * Format text as code block
 * @param text Text to format
 * @param language Optional language for syntax highlighting
 * @returns Formatted text
 */
export function codeBlock(text: string, language: string = ''): string {
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

/**
 * Create a URL with custom text
 * @param text Display text
 * @param url URL
 * @returns Formatted text
 */
export function link(text: string, url: string): string {
  return `[${text}](${url})`;
}

/**
 * Escape markdown special characters
 * @param text Text to escape
 * @returns Escaped text
 */
export function escapeMarkdown(text: string): string {
  return text
    .replace(/\_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\~/g, '\\~')
    .replace(/\`/g, '\\`')
    .replace(/\>/g, '\\>')
    .replace(/\#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\-/g, '\\-')
    .replace(/\=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/\!/g, '\\!');
}

/**
 * Format a progress bar
 * @param current Current value
 * @param max Maximum value
 * @param length Length of the progress bar
 * @param filledChar Character for filled sections
 * @param emptyChar Character for empty sections
 * @returns Formatted progress bar
 */
export function progressBar(
  current: number,
  max: number,
  length: number = 10,
  filledChar: string = '█',
  emptyChar: string = '░'
): string {
  const percentage = Math.min(1, Math.max(0, current / max));
  const filledLength = Math.round(length * percentage);
  const emptyLength = length - filledLength;
  
  return filledChar.repeat(filledLength) + emptyChar.repeat(emptyLength);
}

/**
 * Format experience display with level progress
 * @param exp Current experience points
 * @param level Current level
 * @returns Formatted experience text
 */
export function formatExperience(exp: number, level: number): string {
  const expForNextLevel = level * 100;
  const progressPercent = Math.min(100, Math.round((exp / expForNextLevel) * 100));
  const bar = progressBar(exp, expForNextLevel, 10);
  
  return `Level ${level} (${exp}/${expForNextLevel} XP) - ${progressPercent}%\n${bar}`;
}
