import { Generated, ColumnType, Insertable, Selectable, Updateable } from 'kysely';
import { ClassType, EntityType, EquipmentSlot, ItemType, SkillType, AreaType, QuestType, ObjectiveType } from '../core/enums';

// Define database schema types for Kysely

// Characters table
export interface CharactersTable {
  id: Generated<number>;
  user_id: number;
  name: string;
  type: EntityType;
  class: ClassType;
  level: number;
  experience: number;
  max_hp: number;
  current_hp: number;
  max_sp: number;
  current_sp: number;
  strength: number;
  intelligence: number;
  dexterity: number;
  wisdom: number;
  vitality: number;
  area_id: number;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

// Monsters table
export interface MonstersTable {
  id: Generated<number>;
  name: string;
  type: EntityType;
  level: number;
  max_hp: number;
  current_hp: number;
  area_id: number;
  exp_reward: number;
  gold_reward: number;
  item_drop_rate: number;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

// NPCs table
export interface NPCsTable {
  id: Generated<number>;
  name: string;
  type: EntityType;
  level: number;
  max_hp: number;
  current_hp: number;
  area_id: number;
  dialogue: string;
  is_quest_giver: boolean;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

// Skills table
export interface SkillsTable {
  id: Generated<number>;
  name: string;
  description: string;
  type: SkillType;
  damage: number;
  healing: number;
  sp_cost: number;
  cooldown: number;
  class_restriction: ClassType | null;
  level_requirement: number;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

// Character skills table (many-to-many relationship)
export interface CharacterSkillsTable {
  character_id: number;
  skill_id: number;
  last_used: ColumnType<Date, Date | string | null, Date | string | null>;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;

  // Composite primary key in the migration
}

// Items table
export interface ItemsTable {
  id: Generated<number>;
  name: string;
  description: string;
  type: ItemType;
  value: number;
  rarity: number;
  equipment_slot: EquipmentSlot | null;
  stat_bonus: ColumnType<Record<string, number> | null, string | Record<string, number> | null, string | Record<string, number> | null>;
  usable: boolean;
  use_effect: string | null;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

// Inventory items table (many-to-many relationship)
export interface InventoryItemsTable {
  character_id: number;
  item_id: number;
  quantity: number;
  equipped: boolean;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;

  // Composite primary key in the migration
}

// Areas table
export interface AreasTable {
  id: Generated<number>;
  name: string;
  description: string;
  type: AreaType;
  level_requirement: number;
  parent_area_id: number | null;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

// Quests table
export interface QuestsTable {
  id: Generated<number>;
  name: string;
  description: string;
  type: QuestType;
  level_requirement: number;
  exp_reward: number;
  gold_reward: number;
  item_rewards: number[] | null;
  area_id: number;
  npc_id: number | null;
  prerequisite_quest_ids: number[] | null;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

// Quest objectives table
export interface QuestObjectivesTable {
  id: Generated<number>;
  quest_id: number;
  description: string;
  type: ObjectiveType;
  target_id: number | null;
  target: number;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

// Character quests table (many-to-many relationship)
export interface CharacterQuestsTable {
  character_id: number;
  quest_id: number;
  active: boolean;
  completed: boolean;
  started_at: ColumnType<Date, Date | string, never>;
  completed_at: ColumnType<Date, Date | string | null, Date | string | null>;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;

  // Composite primary key in the migration
}

// Character quest objectives progress table
export interface CharacterQuestObjectivesTable {
  character_id: number;
  quest_id: number;
  objective_id: number;
  progress: number;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;

  // Composite primary key in the migration
}

// Define the Database interface
export interface Database {
  characters: CharactersTable;
  monsters: MonstersTable;
  npcs: NPCsTable;
  skills: SkillsTable;
  character_skills: CharacterSkillsTable;
  items: ItemsTable;
  inventory_items: InventoryItemsTable;
  areas: AreasTable;
  quests: QuestsTable;
  quest_objectives: QuestObjectivesTable;
  character_quests: CharacterQuestsTable;
  character_quest_objectives: CharacterQuestObjectivesTable;
}

// Define reusable types for database operations
export type Character = Selectable<CharactersTable>;
export type NewCharacter = Insertable<CharactersTable>;
export type CharacterUpdate = Updateable<CharactersTable>;

export type Monster = Selectable<MonstersTable>;
export type NewMonster = Insertable<MonstersTable>;
export type MonsterUpdate = Updateable<MonstersTable>;

export type NPC = Selectable<NPCsTable>;
export type NewNPC = Insertable<NPCsTable>;
export type NPCUpdate = Updateable<NPCsTable>;

export type Skill = Selectable<SkillsTable>;
export type NewSkill = Insertable<SkillsTable>;
export type SkillUpdate = Updateable<SkillsTable>;

export type CharacterSkill = Selectable<CharacterSkillsTable>;
export type NewCharacterSkill = Insertable<CharacterSkillsTable>;
export type CharacterSkillUpdate = Updateable<CharacterSkillsTable>;

export type Item = Selectable<ItemsTable>;
export type NewItem = Insertable<ItemsTable>;
export type ItemUpdate = Updateable<ItemsTable>;

export type InventoryItem = Selectable<InventoryItemsTable>;
export type NewInventoryItem = Insertable<InventoryItemsTable>;
export type InventoryItemUpdate = Updateable<InventoryItemsTable>;

export type Area = Selectable<AreasTable>;
export type NewArea = Insertable<AreasTable>;
export type AreaUpdate = Updateable<AreasTable>;

export type Quest = Selectable<QuestsTable>;
export type NewQuest = Insertable<QuestsTable>;
export type QuestUpdate = Updateable<QuestsTable>;

export type QuestObjective = Selectable<QuestObjectivesTable>;
export type NewQuestObjective = Insertable<QuestObjectivesTable>;
export type QuestObjectiveUpdate = Updateable<QuestObjectivesTable>;

export type CharacterQuest = Selectable<CharacterQuestsTable>;
export type NewCharacterQuest = Insertable<CharacterQuestsTable>;
export type CharacterQuestUpdate = Updateable<CharacterQuestsTable>;

export type CharacterQuestObjective = Selectable<CharacterQuestObjectivesTable>;
// Player interaction states table
export interface PlayerInteractionStatesTable {
  player_id: number;
  current_action: string;
  action_context: ColumnType<Record<string, any>, string | Record<string, any>, string | Record<string, any>>;
  expires_at: ColumnType<Date, Date | string | null, Date | string | null>;
  created_at: ColumnType<Date, Date | string, never>;
  updated_at: ColumnType<Date, Date | string, Date | string>;
}

export type NewPlayerInteractionState = Insertable<PlayerInteractionStatesTable>;
export type PlayerInteractionStateUpdate = Updateable<PlayerInteractionStatesTable>;