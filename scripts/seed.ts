import { db } from "../server/db";
import { personalInfo, users, research, courses, students, carouselImages } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(users).values({
    username: "admin",
    password: hashedPassword,
  }).onConflictDoNothing();
  console.log("✓ Admin user created (username: admin, password: admin123)");

  // Add personal info
  await db.insert(personalInfo).values({
    name: "Dr. Jane Smith",
    title: "Professor of Actuarial Science",
    tagline: "DATA SCIENCE APPLICATION IN ACTUARIAL SCIENCE",
    bio: "Dr. Jane Smith is a Professor in the Department of Actuarial Science with expertise in applying modern data science techniques to actuarial problems. Her research focuses on machine learning applications in insurance, risk modeling, and computational statistics.",
    email: "jane.smith@university.edu",
    phone: "+1 (234) 567-8900",
    officeLocation: "Department of Actuarial Science\nRoom 301, Mathematics Building\nUniversity Campus",
    photoUrl: "",
    interests: [
      "Machine Learning in Insurance",
      "Risk Modeling",
      "Computational Statistics",
      "Predictive Analytics",
      "Mortality Forecasting"
    ],
    education: [
      "PhD in Statistics, Stanford University (2010)",
      "MS in Actuarial Science, University of Toronto (2006)",
      "BS in Mathematics, MIT (2004)"
    ],
    experience: [
      "Professor, University (2018-Present)",
      "Associate Professor, State University (2014-2018)",
      "Assistant Professor, Tech Institute (2010-2014)"
    ],
  }).onConflictDoNothing();
  console.log("✓ Personal info added");

  // Add sample research
  await db.insert(research).values([
    {
      title: "Machine Learning Approaches to Mortality Forecasting",
      authors: "Smith, J., Johnson, M., & Williams, R.",
      venue: "Journal of Risk and Insurance",
      date: "2024",
      abstract: "This paper explores the application of modern machine learning techniques to mortality forecasting, demonstrating improved accuracy over traditional actuarial methods. We compare neural networks, random forests, and gradient boosting algorithms on historical mortality data from multiple countries.",
      category: ["Machine Learning"],
      tags: ["mortality", "forecasting", "neural networks", "actuarial science"],
      featured: true,
      order: 1,
    },
    {
      title: "Deep Learning for Insurance Pricing",
      authors: "Smith, J., & Chen, L.",
      venue: "Insurance: Mathematics and Economics",
      date: "2023",
      abstract: "We present a deep learning framework for insurance pricing that captures complex non-linear relationships in risk factors. Our approach significantly outperforms traditional GLM-based pricing models.",
      category: ["Machine Learning"],
      tags: ["pricing", "deep learning", "insurance"],
      featured: true,
      order: 2,
    },
    {
      title: "Computational Methods for Extreme Value Analysis",
      authors: "Smith, J.",
      venue: "Computational Statistics & Data Analysis",
      date: "2022",
      abstract: "This work develops efficient computational algorithms for extreme value analysis in insurance applications, with particular focus on tail risk estimation and rare event simulation.",
      category: ["Statistics"],
      tags: ["extreme value theory", "tail risk", "computational methods"],
      featured: true,
      order: 3,
    },
  ]).onConflictDoNothing();
  console.log("✓ Research papers added");

  // Add sample courses
  await db.insert(courses).values([
    {
      courseCode: "ACTS 401",
      title: "Advanced Actuarial Modeling",
      semester: "Fall 2024",
      description: "This course covers advanced topics in actuarial modeling, including machine learning applications, stochastic processes, and modern computational techniques for insurance and pension problems.",
      order: 1,
    },
    {
      courseCode: "ACTS 302",
      title: "Life Contingencies",
      semester: "Spring 2024",
      description: "Introduction to the mathematics of life insurance and annuities, including survival models, life tables, and premium calculation.",
      order: 2,
    },
    {
      courseCode: "STAT 501",
      title: "Computational Statistics",
      semester: "Fall 2024",
      description: "Modern computational methods in statistics, including Monte Carlo methods, optimization algorithms, and machine learning techniques.",
      order: 3,
    },
  ]).onConflictDoNothing();
  console.log("✓ Courses added");

  // Add sample students
  await db.insert(students).values([
    {
      name: "Alex Johnson",
      researchArea: "Machine Learning for Insurance Pricing",
      startYear: "2022",
      status: "current",
      order: 1,
    },
    {
      name: "Maria Garcia",
      researchArea: "Mortality Forecasting with Neural Networks",
      startYear: "2021",
      status: "current",
      order: 2,
    },
    {
      name: "David Chen",
      researchArea: "Risk Modeling in Health Insurance",
      startYear: "2023",
      status: "current",
      order: 3,
    },
  ]).onConflictDoNothing();
  console.log("✓ Students added");

  console.log("\n✅ Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("  Username: admin");
  console.log("  Password: admin123");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
