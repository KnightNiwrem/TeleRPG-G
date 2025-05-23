import { ClassType, EntityType, EquipmentSlot, ItemType, SkillType, AreaType, QuestType, ObjectiveType } from './enums';

// Base entity interface
export interface Entity {
  id: number;
  name: string;
  type: EntityType;
  level: number;
  maxHp: number;
  currentHp: number;
}

// Character interface
export interface Character extends Entity {
  userId: number;
  class: ClassType;
  experience: number;
  maxSp: number;
  currentSp: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  wisdom: number;
  vitality: number;
  areaId: number;
}

// Monster interface
export interface Monster extends Entity {
  areaId: number;
  expReward: number;
  goldReward: number;
  itemDropRate: number;
}

// NPC interface
export interface NPC extends Entity {
  areaId: number;
  dialogue: string;
  isQuestGiver: boolean;
}

// Skill interface
export interface Skill {
  id: number;
  name: string;
  description: string;
  type: SkillType;
  damage: number;
  healing: number;
  spCost: number;
  cooldown: number;
  classRestriction: ClassType | null;
  levelRequirement: number;
}

// Character skill association
export interface CharacterSkill {
  characterId: number;
  skillId: number;
  lastUsed: Date | null;
}

// Item interface
export interface Item {
  id: number;
  name: string;
  description: string;
  type: ItemType;
  value: number;
  rarity: number;
  equipmentSlot: EquipmentSlot | null;
  statBonus: { [key: string]: number } | null;
  usable: boolean;
  useEffect: string | null;
}

// Inventory item association
export interface InventoryItem {
  characterId: number;
  itemId: number;
  quantity: number;
  equipped: boolean;
}

// Area interface
export interface Area {
  id: number;
  name: string;
  description: string;
  type: AreaType;
  levelRequirement: number;
  parentAreaId: number | null;
}

// Quest interface
export interface Quest {
  id: number;
  name: string;
  description: string;
  type: QuestType;
  levelRequirement: number;
  expReward: number;
  goldReward: number;
  itemRewards: number[] | null;
  areaId: number;
  npcId: number | null;
  prerequisiteQuestIds: number[] | null;
}

// Quest objective interface
export interface QuestObjective {
  id: number;
  questId: number;
  description: string;
  type: ObjectiveType;
  targetId: number | null;
  target: number;
  progress: number;
}

// Character quest association
export interface CharacterQuest {
  characterId: number;
  questId: number;
  active: boolean;
  completed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  objectives: QuestObjective[];
  // Properties from Quest that are included in the QuestService response
  name: string;
  description: string;
  type: QuestType;
  expReward: number;
  goldReward: number;
  itemRewards: number[] | null;
  id?: number; // Added for quest_details reference
}

// User state types for state management without sessions
export type UserStateAction = 
  | 'idle' 
  | 'creating_character' 
  | 'exploring' 
  | 'in_combat' 
  | 'searching_combat' 
  | 'skill_menu' 
  | 'inventory_menu' 
  | 'quest_menu'
  | 'AWAITING_TARGET'
  | 'AWAITING_SKILL_CONFIRMATION'
  | 'AWAITING_TARGET_FOR_ATTACK';

export type UserStateStep = 
  | 'initial' 
  | 'choose_class' 
  | 'choose_name' 
  | 'choose_area' 
  | 'view_area' 
  | 'turn_start' 
  | 'turn_action' 
  | 'view_skills' 
  | 'view_inventory' 
  | 'view_quests'
  | 'select_target'
  | 'confirm_action';

export interface UserState {
  action: UserStateAction;
  step: UserStateStep;
  data?: Record<string, any>;
  timestamp?: number;
  enemyId?: number;
  areaId?: number;
  itemId?: number;
  skillId?: number;
  questId?: number;
}