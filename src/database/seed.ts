import { db } from './kysely.js';
import { AreaType, ClassType, EntityType, EquipmentSlot, ItemType, ObjectiveType, QuestType, SkillType } from '../core/enums.js';

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Seed areas
    await seedAreas();
    
    // Seed monsters
    await seedMonsters();
    
    // Seed NPCs
    await seedNPCs();
    
    // Seed skills
    await seedSkills();
    
    // Seed items
    await seedItems();
    
    // Seed quests
    await seedQuests();

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

async function seedAreas() {
  console.log('Seeding areas...');
  
  // Check if areas already exist
  const existingAreas = await db.selectFrom('areas').select('id').limit(1).execute();
  
  if (existingAreas.length > 0) {
    console.log('Areas already seeded, skipping...');
    return;
  }

  // Insert areas
  await db.insertInto('areas').values([
    {
      name: 'Aetherton',
      description: 'A peaceful town surrounded by lush forests. The central hub for adventurers.',
      type: AreaType.TOWN,
      level_requirement: 1,
      parent_area_id: null,
    },
    {
      name: 'Whispering Woods',
      description: 'A serene forest with ancient trees and chirping birds. Occasional monsters lurk between the trees.',
      type: AreaType.FOREST,
      level_requirement: 1,
      parent_area_id: 1,
    },
    {
      name: 'Shadowed Caverns',
      description: 'Dark caves with strange glowing fungi. Home to various creatures and precious minerals.',
      type: AreaType.CAVE,
      level_requirement: 3,
      parent_area_id: 2,
    },
    {
      name: 'Mistpeak Mountains',
      description: 'Towering mountains shrouded in mist. Dangerous terrain with powerful monsters.',
      type: AreaType.MOUNTAIN,
      level_requirement: 5,
      parent_area_id: 1,
    },
    {
      name: 'Forgotten Ruins',
      description: 'Ancient ruins of a forgotten civilization. Mystery and danger await those who explore.',
      type: AreaType.DUNGEON,
      level_requirement: 8,
      parent_area_id: 4,
    },
  ]).execute();

  console.log('Areas seeded successfully!');
}

async function seedMonsters() {
  console.log('Seeding monsters...');
  
  // Check if monsters already exist
  const existingMonsters = await db.selectFrom('monsters').select('id').limit(1).execute();
  
  if (existingMonsters.length > 0) {
    console.log('Monsters already seeded, skipping...');
    return;
  }

  // Insert monsters
  await db.insertInto('monsters').values([
    {
      name: 'Forest Wolf',
      type: EntityType.MONSTER,
      level: 1,
      max_hp: 20,
      current_hp: 20,
      area_id: 2, // Whispering Woods
      exp_reward: 10,
      gold_reward: 5,
      item_drop_rate: 0.2,
    },
    {
      name: 'Goblin Scout',
      type: EntityType.MONSTER,
      level: 2,
      max_hp: 30,
      current_hp: 30,
      area_id: 2, // Whispering Woods
      exp_reward: 15,
      gold_reward: 8,
      item_drop_rate: 0.3,
    },
    {
      name: 'Cave Bat',
      type: EntityType.MONSTER,
      level: 3,
      max_hp: 25,
      current_hp: 25,
      area_id: 3, // Shadowed Caverns
      exp_reward: 20,
      gold_reward: 10,
      item_drop_rate: 0.2,
    },
    {
      name: 'Cave Spider',
      type: EntityType.MONSTER,
      level: 4,
      max_hp: 40,
      current_hp: 40,
      area_id: 3, // Shadowed Caverns
      exp_reward: 25,
      gold_reward: 12,
      item_drop_rate: 0.3,
    },
    {
      name: 'Mountain Goat',
      type: EntityType.MONSTER,
      level: 5,
      max_hp: 50,
      current_hp: 50,
      area_id: 4, // Mistpeak Mountains
      exp_reward: 30,
      gold_reward: 15,
      item_drop_rate: 0.25,
    },
    {
      name: 'Rock Elemental',
      type: EntityType.MONSTER,
      level: 7,
      max_hp: 80,
      current_hp: 80,
      area_id: 4, // Mistpeak Mountains
      exp_reward: 45,
      gold_reward: 25,
      item_drop_rate: 0.4,
    },
    {
      name: 'Ancient Guardian',
      type: EntityType.MONSTER,
      level: 8,
      max_hp: 100,
      current_hp: 100,
      area_id: 5, // Forgotten Ruins
      exp_reward: 60,
      gold_reward: 30,
      item_drop_rate: 0.5,
    },
  ]).execute();

  console.log('Monsters seeded successfully!');
}

async function seedNPCs() {
  console.log('Seeding NPCs...');
  
  // Check if NPCs already exist
  const existingNPCs = await db.selectFrom('npcs').select('id').limit(1).execute();
  
  if (existingNPCs.length > 0) {
    console.log('NPCs already seeded, skipping...');
    return;
  }

  // Insert NPCs
  await db.insertInto('npcs').values([
    {
      name: 'Elder Thorne',
      type: EntityType.NPC,
      level: 10,
      max_hp: 200,
      current_hp: 200,
      area_id: 1, // Aetherton
      dialogue: 'Welcome to Aetherton, young adventurer! The world is in need of heroes like you.',
      is_quest_giver: true,
    },
    {
      name: 'Merchant Gilda',
      type: EntityType.NPC,
      level: 5,
      max_hp: 100,
      current_hp: 100,
      area_id: 1, // Aetherton
      dialogue: 'Looking to buy or sell something? I have the finest goods in all of Aetherton!',
      is_quest_giver: false,
    },
    {
      name: 'Ranger Elwin',
      type: EntityType.NPC,
      level: 8,
      max_hp: 150,
      current_hp: 150,
      area_id: 2, // Whispering Woods
      dialogue: 'The woods have been more dangerous lately. Be careful as you explore, and watch out for goblins.',
      is_quest_giver: true,
    },
    {
      name: 'Miner Durin',
      type: EntityType.NPC,
      level: 7,
      max_hp: 140,
      current_hp: 140,
      area_id: 3, // Shadowed Caverns
      dialogue: 'These caves hold rich minerals, but also many dangers. Could you help me gather some resources?',
      is_quest_giver: true,
    },
    {
      name: 'Hermit Kaela',
      type: EntityType.NPC,
      level: 12,
      max_hp: 180,
      current_hp: 180,
      area_id: 4, // Mistpeak Mountains
      dialogue: "Few make it this far up the mountain. I've been studying the ancient ruins nearby. There's power there... and danger.",
      is_quest_giver: true,
    },
  ]).execute();

  console.log('NPCs seeded successfully!');
}

async function seedSkills() {
  console.log('Seeding skills...');
  
  // Check if skills already exist
  const existingSkills = await db.selectFrom('skills').select('id').limit(1).execute();
  
  if (existingSkills.length > 0) {
    console.log('Skills already seeded, skipping...');
    return;
  }

  // Insert skills
  await db.insertInto('skills').values([
    // Warrior skills
    {
      name: 'Slash',
      description: 'A powerful slash attack that deals physical damage.',
      type: SkillType.ATTACK,
      damage: 15,
      healing: 0,
      sp_cost: 5,
      cooldown: 0,
      class_restriction: ClassType.WARRIOR,
      level_requirement: 1,
    },
    {
      name: 'Battle Cry',
      description: 'A loud battle cry that increases your strength for a short time.',
      type: SkillType.BUFF,
      damage: 0,
      healing: 0,
      sp_cost: 10,
      cooldown: 3,
      class_restriction: ClassType.WARRIOR,
      level_requirement: 3,
    },
    
    // Mage skills
    {
      name: 'Fireball',
      description: 'Conjure a ball of fire to damage your enemy.',
      type: SkillType.ATTACK,
      damage: 20,
      healing: 0,
      sp_cost: 8,
      cooldown: 0,
      class_restriction: ClassType.MAGE,
      level_requirement: 1,
    },
    {
      name: 'Frost Nova',
      description: 'Summon a freezing burst that damages and slows enemies.',
      type: SkillType.ATTACK,
      damage: 15,
      healing: 0,
      sp_cost: 12,
      cooldown: 2,
      class_restriction: ClassType.MAGE,
      level_requirement: 3,
    },
    
    // Rogue skills
    {
      name: 'Backstab',
      description: 'Attack the enemy from behind for increased damage.',
      type: SkillType.ATTACK,
      damage: 25,
      healing: 0,
      sp_cost: 7,
      cooldown: 1,
      class_restriction: ClassType.ROGUE,
      level_requirement: 1,
    },
    {
      name: 'Smoke Bomb',
      description: 'Throw a smoke bomb that reduces enemy accuracy.',
      type: SkillType.DEBUFF,
      damage: 0,
      healing: 0,
      sp_cost: 10,
      cooldown: 3,
      class_restriction: ClassType.ROGUE,
      level_requirement: 3,
    },
    
    // Cleric skills
    {
      name: 'Heal',
      description: 'Restore health to yourself.',
      type: SkillType.HEAL,
      damage: 0,
      healing: 20,
      sp_cost: 10,
      cooldown: 1,
      class_restriction: ClassType.CLERIC,
      level_requirement: 1,
    },
    {
      name: 'Smite',
      description: 'Call down divine energy to damage an enemy.',
      type: SkillType.ATTACK,
      damage: 15,
      healing: 5,
      sp_cost: 8,
      cooldown: 0,
      class_restriction: ClassType.CLERIC,
      level_requirement: 3,
    },
  ]).execute();

  console.log('Skills seeded successfully!');
}

async function seedItems() {
  console.log('Seeding items...');
  
  // Check if items already exist
  const existingItems = await db.selectFrom('items').select('id').limit(1).execute();
  
  if (existingItems.length > 0) {
    console.log('Items already seeded, skipping...');
    return;
  }

  // Insert items
  await db.insertInto('items').values([
    // Equipment
    {
      name: 'Rusty Sword',
      description: 'An old, rusty sword. Better than nothing.',
      type: ItemType.EQUIPMENT,
      value: 10,
      rarity: 1,
      equipment_slot: EquipmentSlot.WEAPON,
      stat_bonus: { strength: 1 },
      usable: false,
      use_effect: null,
    },
    {
      name: 'Wooden Staff',
      description: 'A simple wooden staff for channeling magic.',
      type: ItemType.EQUIPMENT,
      value: 10,
      rarity: 1,
      equipment_slot: EquipmentSlot.WEAPON,
      stat_bonus: { intelligence: 1 },
      usable: false,
      use_effect: null,
    },
    {
      name: 'Leather Armor',
      description: 'Basic leather armor that provides minimal protection.',
      type: ItemType.EQUIPMENT,
      value: 15,
      rarity: 1,
      equipment_slot: EquipmentSlot.BODY,
      stat_bonus: { max_hp: 5 },
      usable: false,
      use_effect: null,
    },
    
    // Consumables
    {
      name: 'Health Potion',
      description: 'A small vial of red liquid that restores health.',
      type: ItemType.CONSUMABLE,
      value: 5,
      rarity: 1,
      equipment_slot: null,
      stat_bonus: null,
      usable: true,
      use_effect: 'Restores 20 HP',
    },
    {
      name: 'Mana Potion',
      description: 'A small vial of blue liquid that restores spirit points.',
      type: ItemType.CONSUMABLE,
      value: 5,
      rarity: 1,
      equipment_slot: null,
      stat_bonus: null,
      usable: true,
      use_effect: 'Restores 20 SP',
    },
    
    // Materials
    {
      name: 'Wolf Pelt',
      description: 'The pelt of a wolf. Used for crafting and quests.',
      type: ItemType.MATERIAL,
      value: 3,
      rarity: 1,
      equipment_slot: null,
      stat_bonus: null,
      usable: false,
      use_effect: null,
    },
    {
      name: 'Spider Silk',
      description: 'Fine, strong silk from a cave spider. Used for crafting and quests.',
      type: ItemType.MATERIAL,
      value: 5,
      rarity: 2,
      equipment_slot: null,
      stat_bonus: null,
      usable: false,
      use_effect: null,
    },
  ]).execute();

  console.log('Items seeded successfully!');
}

async function seedQuests() {
  console.log('Seeding quests and objectives...');
  
  // Check if quests already exist
  const existingQuests = await db.selectFrom('quests').select('id').limit(1).execute();
  
  if (existingQuests.length > 0) {
    console.log('Quests already seeded, skipping...');
    return;
  }

  // Insert quests
  const [firstQuest] = await db.insertInto('quests').values([
    {
      name: 'Welcome to RiftChronicles',
      description: 'Elder Thorne welcomes you to Aetherton and asks you to explore the nearby Whispering Woods.',
      type: QuestType.MAIN,
      level_requirement: 1,
      exp_reward: 50,
      gold_reward: 10,
      item_rewards: [1], // Rusty Sword
      area_id: 1, // Aetherton
      npc_id: 1, // Elder Thorne
      prerequisite_quest_ids: null,
    },
  ]).returning('id').execute();

  // Insert quest objectives
  await db.insertInto('quest_objectives').values([
    {
      quest_id: firstQuest.id,
      description: 'Explore the Whispering Woods',
      type: ObjectiveType.EXPLORE,
      target_id: 2, // Whispering Woods area
      target: 1,
    },
  ]).execute();

  const [secondQuest] = await db.insertInto('quests').values([
    {
      name: 'Forest Menace',
      description: 'Ranger Elwin asks you to help reduce the wolf population in Whispering Woods.',
      type: QuestType.SIDE,
      level_requirement: 1,
      exp_reward: 100,
      gold_reward: 20,
      item_rewards: [4], // Health Potion
      area_id: 2, // Whispering Woods
      npc_id: 3, // Ranger Elwin
      prerequisite_quest_ids: [firstQuest.id],
    },
  ]).returning('id').execute();

  // Insert quest objectives
  await db.insertInto('quest_objectives').values([
    {
      quest_id: secondQuest.id,
      description: 'Defeat Forest Wolves',
      type: ObjectiveType.KILL,
      target_id: 1, // Forest Wolf monster
      target: 3,
    },
    {
      quest_id: secondQuest.id,
      description: 'Collect Wolf Pelts',
      type: ObjectiveType.COLLECT,
      target_id: 6, // Wolf Pelt item
      target: 3,
    },
  ]).execute();

  console.log('Quests and objectives seeded successfully!');
}

// Run the seed function
seedDatabase().catch(console.error);