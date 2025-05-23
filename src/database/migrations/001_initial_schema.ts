import { Kysely, sql } from 'kysely';
import { Database } from '../schema.js';

export async function up(db: Kysely<Database>): Promise<void> {
  // Create characters table
  await db.schema
    .createTable('characters')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('class', 'varchar', (col) => col.notNull())
    .addColumn('level', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('experience', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('max_hp', 'integer', (col) => col.notNull())
    .addColumn('current_hp', 'integer', (col) => col.notNull())
    .addColumn('max_sp', 'integer', (col) => col.notNull())
    .addColumn('current_sp', 'integer', (col) => col.notNull())
    .addColumn('strength', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('intelligence', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('dexterity', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('wisdom', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('area_id', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create index on user_id for characters table
  await db.schema
    .createIndex('characters_user_id_idx')
    .on('characters')
    .column('user_id')
    .execute();

  // Create monsters table
  await db.schema
    .createTable('monsters')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('level', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('max_hp', 'integer', (col) => col.notNull())
    .addColumn('current_hp', 'integer', (col) => col.notNull())
    .addColumn('area_id', 'integer', (col) => col.notNull())
    .addColumn('exp_reward', 'integer', (col) => col.notNull())
    .addColumn('gold_reward', 'integer', (col) => col.notNull())
    .addColumn('item_drop_rate', 'real', (col) => col.notNull().defaultTo(0.1))
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create index on area_id for monsters table
  await db.schema
    .createIndex('monsters_area_id_idx')
    .on('monsters')
    .column('area_id')
    .execute();

  // Create NPCs table
  await db.schema
    .createTable('npcs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('level', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('max_hp', 'integer', (col) => col.notNull())
    .addColumn('current_hp', 'integer', (col) => col.notNull())
    .addColumn('area_id', 'integer', (col) => col.notNull())
    .addColumn('dialogue', 'text', (col) => col.notNull())
    .addColumn('is_quest_giver', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create index on area_id for NPCs table
  await db.schema
    .createIndex('npcs_area_id_idx')
    .on('npcs')
    .column('area_id')
    .execute();

  // Create skills table
  await db.schema
    .createTable('skills')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('damage', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('healing', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('sp_cost', 'integer', (col) => col.notNull())
    .addColumn('cooldown', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('class_restriction', 'varchar')
    .addColumn('level_requirement', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create character_skills table (many-to-many relationship)
  await db.schema
    .createTable('character_skills')
    .addColumn('character_id', 'integer', (col) => col.notNull())
    .addColumn('skill_id', 'integer', (col) => col.notNull())
    .addColumn('last_used', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addPrimaryKeyConstraint('character_skills_pkey', ['character_id', 'skill_id'])
    .execute();

  // Create indexes for character_skills table
  await db.schema
    .createIndex('character_skills_character_id_idx')
    .on('character_skills')
    .column('character_id')
    .execute();

  await db.schema
    .createIndex('character_skills_skill_id_idx')
    .on('character_skills')
    .column('skill_id')
    .execute();

  // Create items table
  await db.schema
    .createTable('items')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('value', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('rarity', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('equipment_slot', 'varchar')
    .addColumn('stat_bonus', 'jsonb')
    .addColumn('usable', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('use_effect', 'text')
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create inventory_items table (many-to-many relationship)
  await db.schema
    .createTable('inventory_items')
    .addColumn('character_id', 'integer', (col) => col.notNull())
    .addColumn('item_id', 'integer', (col) => col.notNull())
    .addColumn('quantity', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('equipped', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addPrimaryKeyConstraint('inventory_items_pkey', ['character_id', 'item_id'])
    .execute();

  // Create indexes for inventory_items table
  await db.schema
    .createIndex('inventory_items_character_id_idx')
    .on('inventory_items')
    .column('character_id')
    .execute();

  await db.schema
    .createIndex('inventory_items_item_id_idx')
    .on('inventory_items')
    .column('item_id')
    .execute();

  // Create areas table
  await db.schema
    .createTable('areas')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('level_requirement', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('parent_area_id', 'integer')
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create index on parent_area_id for areas table
  await db.schema
    .createIndex('areas_parent_area_id_idx')
    .on('areas')
    .column('parent_area_id')
    .execute();

  // Create quests table
  await db.schema
    .createTable('quests')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('level_requirement', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('exp_reward', 'integer', (col) => col.notNull())
    .addColumn('gold_reward', 'integer', (col) => col.notNull())
    .addColumn('item_rewards', 'jsonb')
    .addColumn('area_id', 'integer', (col) => col.notNull())
    .addColumn('npc_id', 'integer')
    .addColumn('prerequisite_quest_ids', 'jsonb')
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create indexes for quests table
  await db.schema
    .createIndex('quests_area_id_idx')
    .on('quests')
    .column('area_id')
    .execute();

  await db.schema
    .createIndex('quests_npc_id_idx')
    .on('quests')
    .column('npc_id')
    .execute();

  // Create quest_objectives table
  await db.schema
    .createTable('quest_objectives')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('quest_id', 'integer', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull())
    .addColumn('target_id', 'integer')
    .addColumn('target', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create index on quest_id for quest_objectives table
  await db.schema
    .createIndex('quest_objectives_quest_id_idx')
    .on('quest_objectives')
    .column('quest_id')
    .execute();

  // Create character_quests table (many-to-many relationship)
  await db.schema
    .createTable('character_quests')
    .addColumn('character_id', 'integer', (col) => col.notNull())
    .addColumn('quest_id', 'integer', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('completed', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('started_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('completed_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addPrimaryKeyConstraint('character_quests_pkey', ['character_id', 'quest_id'])
    .execute();

  // Create indexes for character_quests table
  await db.schema
    .createIndex('character_quests_character_id_idx')
    .on('character_quests')
    .column('character_id')
    .execute();

  await db.schema
    .createIndex('character_quests_quest_id_idx')
    .on('character_quests')
    .column('quest_id')
    .execute();

  // Create character_quest_objectives table
  await db.schema
    .createTable('character_quest_objectives')
    .addColumn('character_id', 'integer', (col) => col.notNull())
    .addColumn('quest_id', 'integer', (col) => col.notNull())
    .addColumn('objective_id', 'integer', (col) => col.notNull())
    .addColumn('progress', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addPrimaryKeyConstraint('character_quest_objectives_pkey', [
      'character_id',
      'quest_id',
      'objective_id',
    ])
    .execute();

  // Create indexes for character_quest_objectives table
  await db.schema
    .createIndex('character_quest_objectives_character_id_idx')
    .on('character_quest_objectives')
    .column('character_id')
    .execute();

  await db.schema
    .createIndex('character_quest_objectives_quest_id_idx')
    .on('character_quest_objectives')
    .column('quest_id')
    .execute();

  await db.schema
    .createIndex('character_quest_objectives_objective_id_idx')
    .on('character_quest_objectives')
    .column('objective_id')
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Drop tables in reverse order
  await db.schema.dropTable('character_quest_objectives').execute();
  await db.schema.dropTable('character_quests').execute();
  await db.schema.dropTable('quest_objectives').execute();
  await db.schema.dropTable('quests').execute();
  await db.schema.dropTable('areas').execute();
  await db.schema.dropTable('inventory_items').execute();
  await db.schema.dropTable('items').execute();
  await db.schema.dropTable('character_skills').execute();
  await db.schema.dropTable('skills').execute();
  await db.schema.dropTable('npcs').execute();
  await db.schema.dropTable('monsters').execute();
  await db.schema.dropTable('characters').execute();
}