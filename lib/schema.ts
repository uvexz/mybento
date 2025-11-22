import { pgTable, text, uuid, serial, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Better Auth user table
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  username: text("username").notNull().unique(),
  bio: text("bio"),
  backgroundImage: text("background_image"),
  profileColor: text("profile_color"),
  role: text("role").default("user"),
});

// Better Auth session table
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

// Better Auth account table
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

// Better Auth verification table
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Application tables
export const cards = pgTable('cards', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    type: text('type').notNull(),
    url: text('url'),
    imageUrl: text('image_url'),
    icon: text('icon'),
    colorClass: text('color_class').default('bg-gray-100'),
    customBgColor: text('custom_bg_color'),
    customTextColor: text('custom_text_color'),
    size: text('size').default('small'),
    order: integer('order').default(0),
    clicks: integer('clicks').default(0),
    buttonText: text('button_text'),
    githubData: text('github_data'),
    contactInfo: text('contact_info'),
    mastodonData: text('mastodon_data'),
    articleContent: text('article_content'),
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
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
    shortCode: text('short_code').unique().notNull(),
    originalUrl: text('original_url').notNull(),
    title: text('title'),
    clicks: integer('clicks').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

// Site settings table
export const siteSettings = pgTable('site_settings', {
    id: serial('id').primaryKey(),
    key: text('key').unique().notNull(),
    value: text('value'),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// User permissions table
export const userPermissions = pgTable('user_permissions', {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull().unique(),
    canUploadImages: boolean('can_upload_images').default(true).notNull(),
    maxImages: integer('max_images').default(50).notNull(),
    maxShortLinks: integer('max_short_links').default(100).notNull(),
    maxCards: integer('max_cards').default(50).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// User images table
export const userImages = pgTable('user_images', {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
    url: text('url').notNull(),
    filename: text('filename').notNull(),
    size: integer('size').notNull(), // in bytes
    type: text('type').notNull(), // image/jpeg, image/png, etc.
    usedIn: text('used_in'), // 'avatar', 'background', 'card', null
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [index('user_images_userId_idx').on(table.userId)]);

// Relations
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  cards: many(cards),
  shortLinks: many(shortLinks),
  permissions: one(userPermissions, {
    fields: [user.id],
    references: [userPermissions.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
