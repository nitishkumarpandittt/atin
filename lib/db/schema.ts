import { relations } from "drizzle-orm";
import {
  boolean,
  datetime,
  decimal,
  index,
  int,
  mediumtext,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

// MySQL rejects ON UPDATE with fractional-second precision, so update timestamps in application code.
const timestamps = {
  createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* ------------------------------------------------------------------ catalogue */

export const ranges = mysqlTable(
  "ranges",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    shortName: varchar("short_name", { length: 120 }).notNull(),
    sourceHeading: varchar("source_heading", { length: 191 }).notNull().default(""),
    icon: varchar("icon", { length: 40 }).notNull().default("pill"),
    sortOrder: int("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("ranges_slug_unique").on(t.slug)],
);

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    brand: varchar("brand", { length: 160 }).notNull(),
    dosageForm: varchar("dosage_form", { length: 80 }).notNull().default(""),
    composition: text("composition").notNull(),
    pack: varchar("pack", { length: 160 }).notNull().default(""),
    mrp: decimal("mrp", { precision: 10, scale: 2, mode: "number" }),
    mrpNote: varchar("mrp_note", { length: 80 }),
    gstRate: decimal("gst_rate", { precision: 5, scale: 2, mode: "number" }),
    prescribingSpecialities: varchar("prescribing_specialities", { length: 255 }),
    reviewNote: varchar("review_note", { length: 255 }),
    rangeId: int("range_id").references(() => ranges.id, { onDelete: "set null" }),
    isNew: boolean("is_new").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    sortOrder: int("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("products_slug_unique").on(t.slug), index("products_range_idx").on(t.rangeId)],
);

export const productImages = mysqlTable(
  "product_images",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    filePath: varchar("file_path", { length: 255 }).notNull(),
    alt: varchar("alt", { length: 255 }).notNull().default(""),
    width: int("width").notNull(),
    height: int("height").notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const rangesRelations = relations(ranges, ({ many }) => ({ products: many(products) }));
export const productsRelations = relations(products, ({ one, many }) => ({
  range: one(ranges, { fields: [products.rangeId], references: [ranges.id] }),
  images: many(productImages),
}));
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

/* ------------------------------------------------------------------ enquiries */

export const enquiries = mysqlTable(
  "enquiries",
  {
    id: int("id").autoincrement().primaryKey(),
    kind: varchar("kind", { length: 16, enum: ["enquiry", "callback"] }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    organisation: varchar("organisation", { length: 160 }).notNull().default(""),
    role: varchar("role", { length: 80 }).notNull().default(""),
    email: varchar("email", { length: 191 }),
    phone: varchar("phone", { length: 32 }).notNull(),
    city: varchar("city", { length: 80 }).notNull().default(""),
    preferredTime: varchar("preferred_time", { length: 40 }).notNull().default(""),
    message: text("message"),
    productId: int("product_id").references(() => products.id, { onDelete: "set null" }),
    productLabel: varchar("product_label", { length: 191 }).notNull().default(""),
    status: varchar("status", { length: 16, enum: ["new", "handled"] }).notNull().default("new"),
    emailStatus: varchar("email_status", { length: 20, enum: ["pending", "sent", "failed", "not-configured"] })
      .notNull()
      .default("pending"),
    emailError: varchar("email_error", { length: 500 }),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
  },
  (t) => [index("enquiries_kind_status_idx").on(t.kind, t.status), index("enquiries_created_idx").on(t.createdAt)],
);

/* ------------------------------------------------------------------ website content */

export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: mediumtext("value").notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const credentials = mysqlTable("credentials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  issuingAuthority: varchar("issuing_authority", { length: 160 }).notNull().default(""),
  number: varchar("number", { length: 120 }).notNull().default(""),
  validUntil: varchar("valid_until", { length: 10 }).notNull().default(""),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  ...timestamps,
});

export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  quote: text("quote").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  role: varchar("role", { length: 120 }).notNull().default(""),
  organisation: varchar("organisation", { length: 160 }).notNull().default(""),
  hasPermission: boolean("has_permission").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(false),
  sortOrder: int("sort_order").notNull().default(0),
  ...timestamps,
});

export const blogPosts = mysqlTable(
  "blog_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    excerpt: varchar("excerpt", { length: 400 }).notNull().default(""),
    content: mediumtext("content").notNull(),
    author: varchar("author", { length: 120 }).notNull().default("Atin HealthCare"),
    coverPath: varchar("cover_path", { length: 255 }).notNull().default(""),
    isPublished: boolean("is_published").notNull().default(false),
    publishedOn: varchar("published_on", { length: 10 }).notNull().default(""),
    ...timestamps,
  },
  (t) => [uniqueIndex("blog_posts_slug_unique").on(t.slug)],
);

/* ------------------------------------------------------------------ Better Auth (admin plugin) */

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: datetime("ban_expires", { fsp: 3 }),
  createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    token: varchar("token", { length: 191 }).notNull().unique(),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = mysqlTable(
  "verification",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 191 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({ sessions: many(session), accounts: many(account) }));
export const sessionRelations = relations(session, ({ one }) => ({ user: one(user, { fields: [session.userId], references: [user.id] }) }));
export const accountRelations = relations(account, ({ one }) => ({ user: one(user, { fields: [account.userId], references: [user.id] }) }));
