import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin user for editor access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Personal information (singleton - only one record)
export const personalInfo = pgTable("personal_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  tagline: text("tagline"),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  email: text("email").notNull(),
  officeLocation: text("office_location"),
  phone: text("phone"),
  interests: text("interests").array(),
  education: text("education").array(),
  experience: text("experience").array(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPersonalInfoSchema = createInsertSchema(personalInfo).omit({ id: true, updatedAt: true });
export type InsertPersonalInfo = z.infer<typeof insertPersonalInfoSchema>;
export type PersonalInfo = typeof personalInfo.$inferSelect;

// Carousel images for homepage
export const carouselImages = pgTable("carousel_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCarouselImageSchema = createInsertSchema(carouselImages).omit({ id: true, createdAt: true });
export type InsertCarouselImage = z.infer<typeof insertCarouselImageSchema>;
export type CarouselImage = typeof carouselImages.$inferSelect;

// Research papers and projects
export const research = pgTable("research", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  venue: text("venue"),
  date: text("date").notNull(),
  abstract: text("abstract").notNull(),
  pdfUrl: text("pdf_url"),
  externalLink: text("external_link"),
  thumbnailUrl: text("thumbnail_url"),
  citation: text("citation"), // formatted citation text for copy-to-clipboard
  category: text("category").notNull(),
  tags: text("tags").array(),
  featured: boolean("featured").default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertResearchSchema = createInsertSchema(research).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResearch = z.infer<typeof insertResearchSchema>;
export type Research = typeof research.$inferSelect;

// Teaching courses
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseCode: text("course_code").notNull(),
  title: text("title").notNull(),
  semester: text("semester").notNull(),
  description: text("description"),
  syllabusUrl: text("syllabus_url"),
  materialsLink: text("materials_link"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// PhD Students
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  researchArea: text("research_area").notNull(),
  startYear: text("start_year").notNull(),
  websiteUrl: text("website_url"),
  status: text("status").notNull().default("current"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Contact messages
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Events for homepage carousel
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Experience timeline positions
export const experiencePositions = pgTable("experience_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExperiencePositionSchema = createInsertSchema(experiencePositions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExperiencePosition = z.infer<typeof insertExperiencePositionSchema>;
export type ExperiencePosition = typeof experiencePositions.$inferSelect;
