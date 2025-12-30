
export enum AppState {
  INTRO = 'INTRO',
  COUNTDOWN = 'COUNTDOWN',
  TRANSITION_TO_2026 = 'TRANSITION_TO_2026',
  TREE_ASSEMBLE = 'TREE_ASSEMBLE',
  INTERACTIVE_TREE = 'INTERACTIVE_TREE'
}

export enum TreeDisplayMode {
  COMPACT = 'COMPACT',
  SCATTERED = 'SCATTERED',
  PHOTO_FOCUS = 'PHOTO_FOCUS'
}

export interface UserPhoto {
  id: string;
  url: string;
}
