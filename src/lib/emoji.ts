// Emojis are shown in black and white everywhere on the site (see `.emo` in globals.css).
export const EMOJI = /(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)/gu;

/** Wraps every emoji of an HTML string in a span the stylesheet turns grey. */
export const monoEmoji = (html: string) => html.replace(EMOJI, '<span class="emo">$1</span>');
