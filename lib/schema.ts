import { pgTable, text, uuid, serial, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    username: text('username').unique().notNull(),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    image: text('image'),
    bio: text('bio'),
    role: text('role').default('user'), // enum support in pg is possible but text is simpler for now
    backgroundImage: text('background_image'),
    profileColor: text('profile_color'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const cards = pgTable('cards', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    type: text('type').notNull(),
    url: text('url'),
    icon: text('icon'),
    colorClass: text('color_class').default('bg-gray-100'),
    size: text('size').default('small'),
    order: integer('order').default(0),
    clicks: integer('clicks').default(0),
    buttonText: text('button_text'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const cardClicks = pgTable('card_clicks', {
    id: serial('id').primaryKey(),
    cardId: uuid('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
    clickedAt: timestamp('clicked_at').defaultNow(),
    userAgent: text('user_agent'),
    referer: text('referer'),
});

export const shortLinks = pgTable('short_links', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    shortCode: text('short_code').unique().notNull(),
    originalUrl: text('original_url').notNull(),
    title: text('title'),
    clicks: integer('clicks').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});
