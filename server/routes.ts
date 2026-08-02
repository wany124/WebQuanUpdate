import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import multer from "multer";
import { ObjectStorageService } from "./objectStorage";
import {
  users,
  personalInfo,
  carouselImages,
  research,
  courses,
  students,
  contactMessages,
  events,
  pastTalks,
  experiencePositions,
  insertUserSchema,
  insertPersonalInfoSchema,
  insertCarouselImageSchema,
  insertPastTalkSchema,
  insertResearchSchema,
  insertCourseSchema,
  insertStudentSchema,
  insertContactMessageSchema,
  insertEventSchema,
  insertExperiencePositionSchema,
} from "@shared/schema";
import { object } from "zod";



const PgSession = connectPgSimple(session);
const upload = multer({ storage: multer.memoryStorage() });
const objectStorage = new ObjectStorageService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }

  app.use(
    session({
      store: new PgSession({
        pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: app.get("env") === "production",
      },
    })
  );

  // Authentication middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }


  // Auth Routes

  app.post("/api/login", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, result.data.username))
        .limit(1);

      if (!user || !(await bcrypt.compare(result.data.password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/user", async (req, res, next) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      next(error);
    }
  });

  // File Upload Routes
  app.post("/api/upload/image", requireAuth, upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const url = await objectStorage.uploadFile(req.file, "images");
      res.json({ url });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/upload/pdf", requireAuth, upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const url = await objectStorage.uploadFile(req.file, "pdfs");
      res.json({ url });
    } catch (error) {
      next(error);
    }
  });

  // Personal Info Routes
  app.get("/api/personal-info", async (req, res, next) => {
    try {
      const [info] = await db.select().from(personalInfo).limit(1);
      if (!info) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(info);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/personal-info", requireAuth, async (req, res, next) => {
    try {
      const result = insertPersonalInfoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [newInfo] = await db.insert(personalInfo).values(result.data).returning();
      res.json(newInfo);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/personal-info", requireAuth, async (req, res, next) => {
    try {
      const result = insertPersonalInfoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [existing] = await db.select().from(personalInfo).limit(1);
      if (!existing) {
        return res.status(404).json({ message: "Not found" });
      }

      const [updated] = await db
        .update(personalInfo)
        .set({ ...result.data, updatedAt: new Date() })
        .where(eq(personalInfo.id, existing.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  // Carousel Routes
  app.get("/api/carousel", async (req, res, next) => {
    try {
      const images = await db
        .select()
        .from(carouselImages)
        .orderBy(carouselImages.order);
      res.json(images);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/carousel", requireAuth, async (req, res, next) => {
    try {
      const result = insertCarouselImageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [newImage] = await db.insert(carouselImages).values(result.data).returning();
      res.json(newImage);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/carousel/:id", requireAuth, async (req, res, next) => {
    try {
      const result = insertCarouselImageSchema.partial().omit({ id: true, createdAt: true, updatedAt: true }).safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [updated] = await db
        .update(carouselImages)
        .set({ ...result.data, updatedAt: new Date() })
        .where(eq(carouselImages.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });


  app.delete("/api/carousel/:id", requireAuth, async (req, res, next) => {
    try {
      await db.delete(carouselImages).where(eq(carouselImages.id, req.params.id));
      res.json({ message: "Deleted" });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/talks - Get all past talks
app.get("/api/talks", async (req, res, next) => {
  try {
    const talks = await db
      .select()
      .from(pastTalks)
      .orderBy(desc(pastTalks.date));

    res.json(talks);
  } catch (error) {
    next(error);
  }
});

// GET /api/talks/:id - Get single talk
app.get("/api/talks/:id", async (req, res, next) => {
  try {
    const [talk] = await db
      .select()
      .from(pastTalks)
      .where(eq(pastTalks.id, parseInt(req.params.id)))
      .limit(1);

    if (!talk) {
      return res.status(404).json({ message: "Talk not found" });
    }

    res.json(talk);
  } catch (error) {
    next(error);
  }
});

// POST /api/talks - Create new talk
app.post("/api/talks", requireAuth, async (req, res, next) => {
  try {
    const result = insertPastTalkSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const [newTalk] = await db
      .insert(pastTalks)
      .values(result.data)
      .returning();

    res.status(201).json(newTalk);
  } catch (error) {
    next(error);
  }
});

// PUT /api/talks/:id - Update talk
app.put("/api/talks/:id", requireAuth, async (req, res, next) => {
  try {
    const result = insertPastTalkSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const [updated] = await db
      .update(pastTalks)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(pastTalks.id, parseInt(req.params.id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Talk not found" });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/talks/:id - Delete talk
app.delete("/api/talks/:id", requireAuth, async (req, res, next) => {
  try {
    const [deleted] = await db
      .delete(pastTalks)
      .where(eq(pastTalks.id, parseInt(req.params.id)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ message: "Talk not found" });
    }

    res.json({ message: "Talk deleted successfully" });
  } catch (error) {
    next(error);
  }
});

  // Research Routes
  app.get("/api/research", async (req, res, next) => {
    try {
      const papers = await db
        .select()
        .from(research)
        .orderBy(desc(research.date), research.order);
      res.json(papers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/research/featured", async (req, res, next) => {
    try {
      const papers = await db
        .select()
        .from(research)
        .where(eq(research.featured, true))
        .orderBy(desc(research.date), research.order)
        .limit(6);
      res.json(papers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/research/:id", async (req, res, next) => {
    try {
      const [paper] = await db
        .select()
        .from(research)
        .where(eq(research.id, req.params.id))
        .limit(1);

      if (!paper) {
        return res.status(404).json({ message: "Not found" });
      }
      res.json(paper);
    } catch (error) {
      next(error);
    }
  });

  // POST /api/research - Create with file uploads


  app.post("/api/research", upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const data = { ...req.body };
    
    // Parse tags
    if (data.tags && typeof data.tags === 'string') {
      data.tags = JSON.parse(data.tags);
    } else {
      data.tags = [];
    }
    
    // Parse boolean
    data.featured = data.featured === 'true';
    
    // Parse number
    data.order = parseInt(data.order) || 0;
    
    // Upload files and get URLs
    if (files?.pdf?.[0]) {
      data.pdfUrl = await objectStorage.uploadFile(files.pdf[0], 'research/pdfs');
    }
    
    if (files?.thumbnail?.[0]) {
      data.thumbnailUrl = await objectStorage.uploadFile(files.thumbnail[0], 'research/images');
    }
    
    // Clean up empty strings - set to undefined so DB defaults/nulls work
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === 'null') {
        data[key] = undefined;
      }
    });
    
    console.log('Final data:', data);
    
    const [newResearch] = await db.insert(research).values(data).returning();
    res.json(newResearch);
  } catch (error) {
    console.error('Error creating research:', error);
    res.status(500).json({ message: error.message });
  }
});
  

// Research Analytics Routes
app.post("/api/research/:id/view", async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Update view count atomically
    await db
      .update(research)
      .set({
        viewCount: sql`${research.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(research.id, id));

    res.json({ 
      success: true, 
      message: "View count updated successfully" 
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/research/:id/download", async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Update download count atomically
    await db
      .update(research)
      .set({
        downloadCount: sql`${research.downloadCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(research.id, id));

    res.json({ 
      success: true, 
      message: "Download count updated successfully" 
    });
  } catch (error) {
    next(error);
  }
});

  // PUT /api/research/:id - Update with file uploads
  app.put("/api/research/:id", upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const data = { ...req.body };
      
      // Parse and clean up the data (same as POST)
      if (data.tags) {
        try {
          data.tags = JSON.parse(data.tags);
        } catch {
          data.tags = [];
        }
      }
      
      data.featured = data.featured === 'true';
      data.order = parseInt(data.order) || 0;
      
      if (!data.venue || data.venue === '') data.venue = null;
      if (!data.pdfUrl || data.pdfUrl === '') data.pdfUrl = null;
      if (!data.externalLink || data.externalLink === '') data.externalLink = null;
      if (!data.thumbnailUrl || data.thumbnailUrl === '') data.thumbnailUrl = null;
      if (!data.citation || data.citation === '') data.citation = null;
      
      // Upload new files if provided
      if (files?.pdf && files.pdf[0]) {
        data.pdfUrl = await objectStorage.uploadFile(files.pdf[0], 'research/pdfs');
      }
      
      if (files?.thumbnail && files.thumbnail[0]) {
        data.thumbnailUrl = await objectStorage.uploadFile(files.thumbnail[0], 'research/images');
      }
      
      console.log('Update data:', data); // Debug log
      
      const [updated] = await db.update(research)
        .set(data)
        .where(eq(research.id, req.params.id))
        .returning();
      
      res.json(updated);
    } catch (error) {
      console.error('Error updating research:', error);
      res.status(500).json({ message: error.message });
    }
  });

  
  app.delete("/api/research/:id", requireAuth, async (req, res, next) => {
    try {
      await db.delete(research).where(eq(research.id, req.params.id));
      res.json({ message: "Deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Course Routes
  app.get("/api/courses", async (req, res, next) => {
    try {
      const allCourses = await db
        .select()
        .from(courses)
        .orderBy(desc(courses.semester), courses.order);
      res.json(allCourses);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses", requireAuth, async (req, res, next) => {
    try {
      const result = insertCourseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [newCourse] = await db.insert(courses).values(result.data).returning();
      res.json(newCourse);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/courses/:id", requireAuth, async (req, res, next) => {
    try {
      const result = insertCourseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [updated] = await db
        .update(courses)
        .set({ ...result.data, updatedAt: new Date() })
        .where(eq(courses.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/courses/:id", requireAuth, async (req, res, next) => {
    try {
      await db.delete(courses).where(eq(courses.id, req.params.id));
      res.json({ message: "Deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Student Routes
  app.get("/api/students", async (req, res, next) => {
    try {
      const allStudents = await db
        .select()
        .from(students)
        .orderBy(students.status, desc(students.startYear), students.order);
      res.json(allStudents);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/students", requireAuth, async (req, res, next) => {
    try {
      const result = insertStudentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [newStudent] = await db.insert(students).values(result.data).returning();
      res.json(newStudent);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/students/:id", requireAuth, async (req, res, next) => {
    try {
      const result = insertStudentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [updated] = await db
        .update(students)
        .set({ ...result.data, updatedAt: new Date() })
        .where(eq(students.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/students/:id", requireAuth, async (req, res, next) => {
    try {
      await db.delete(students).where(eq(students.id, req.params.id));
      res.json({ message: "Deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Contact Message Routes
  app.post("/api/contact", async (req, res, next) => {
    try {
      const result = insertContactMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [message] = await db.insert(contactMessages).values(result.data).returning();
      res.json(message);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/contact", requireAuth, async (req, res, next) => {
    try {
      const messages = await db
        .select()
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt));
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });



  // Experience Position Routes
  app.get("/api/experience", async (req, res, next) => {
    try {
      const positions = await db
        .select()
        .from(experiencePositions)
        .orderBy(experiencePositions.order);
      res.json(positions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/experience", requireAuth, async (req, res, next) => {
    try {
      const result = insertExperiencePositionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [newPosition] = await db.insert(experiencePositions).values(result.data).returning();
      res.json(newPosition);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/experience/:id", requireAuth, async (req, res, next) => {
    try {
      const updateSchema = insertExperiencePositionSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
      const result = updateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const [updated] = await db
        .update(experiencePositions)
        .set({ ...result.data, updatedAt: new Date() })
        .where(eq(experiencePositions.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/experience/:id", requireAuth, async (req, res, next) => {
    try {
      await db.delete(experiencePositions).where(eq(experiencePositions.id, req.params.id));
      res.json({ message: "Deleted" });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
