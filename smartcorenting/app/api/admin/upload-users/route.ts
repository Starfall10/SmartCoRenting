import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { v4 as uuidv4 } from "uuid";

interface CSVUser {
  email: string;
  displayName: string;
  gender?: string;
  genderPreference?: string;
  monthlyBudget?: string;
  preferredLocation?: string;
  moveInDate?: string;
  lengthOfStay?: string;
  propertyType?: string;
  smoking?: string;
  pets?: string;
  sleepSchedule?: string;
  cleanliness?: string;
  noiseTolerance?: string;
  workHabits?: string;
  socialLifestyle?: string;
  guestFrequency?: string;
  cookingFrequency?: string;
  personalSpace?: string;
  activityLevel?: string;
}

function parseCSV(content: string): CSVUser[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const users: CSVUser[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      throw new Error(
        `Row ${i + 1} has ${values.length} columns, expected ${headers.length}`,
      );
    }

    const user: Record<string, string> = {};
    headers.forEach((header, index) => {
      user[header] = values[index];
    });

    users.push(user as unknown as CSVUser);
  }

  return users;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return (
    value.toLowerCase() === "true" ||
    value === "1" ||
    value.toLowerCase() === "yes"
  );
}

function parseNumber(
  value: string | undefined,
  defaultValue: number = 3,
): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : Math.min(5, Math.max(1, num));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }

    const content = await file.text();
    const csvUsers = parseCSV(content);

    if (csvUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: "No users found in CSV" },
        { status: 400 },
      );
    }

    const errors: string[] = [];
    let usersCreated = 0;
    const batch = adminDb.batch();

    for (let i = 0; i < csvUsers.length; i++) {
      const csvUser = csvUsers[i];
      const rowNum = i + 2;

      // Validate required fields
      if (!csvUser.email) {
        errors.push(`Row ${rowNum}: Missing email`);
        continue;
      }

      if (!csvUser.displayName) {
        errors.push(`Row ${rowNum}: Missing displayName`);
        continue;
      }

      // Check if user with this email already exists
      const existingUsers = await adminDb
        .collection("users")
        .where("email", "==", csvUser.email)
        .get();

      if (!existingUsers.empty) {
        errors.push(
          `Row ${rowNum}: User with email ${csvUser.email} already exists`,
        );
        continue;
      }

      // Generate a unique UID for the persona
      const uid = `persona_${uuidv4()}`;
      const now = new Date().toISOString();

      const userData = {
        uid,
        email: csvUser.email,
        displayName: csvUser.displayName,
        createdAt: now,
        updatedAt: now,
        profileComplete: true,
        profileStep: 3,

        // Basic Info
        gender: csvUser.gender || "",
        genderPreference: csvUser.genderPreference || "",
        monthlyBudget: csvUser.monthlyBudget || "",
        preferredLocation: csvUser.preferredLocation || "",
        moveInDate: csvUser.moveInDate || "",
        lengthOfStay: csvUser.lengthOfStay || "",
        propertyType: csvUser.propertyType || "",

        // Yes/No Preferences
        smoking: parseBoolean(csvUser.smoking),
        pets: parseBoolean(csvUser.pets),

        // Lifestyle Preferences (1-5 scale)
        sleepSchedule: parseNumber(csvUser.sleepSchedule),
        cleanliness: parseNumber(csvUser.cleanliness),
        noiseTolerance: parseNumber(csvUser.noiseTolerance),
        workHabits: parseNumber(csvUser.workHabits),
        socialLifestyle: parseNumber(csvUser.socialLifestyle),
        guestFrequency: parseNumber(csvUser.guestFrequency),
        cookingFrequency: parseNumber(csvUser.cookingFrequency),
        personalSpace: parseNumber(csvUser.personalSpace),
        activityLevel: parseNumber(csvUser.activityLevel),

        // Legacy fields
        lifestyleTags: [],
        constraintTags: [],
        bio: "",
      };

      const userRef = adminDb.collection("users").doc(uid);
      batch.set(userRef, userData);
      usersCreated++;
    }

    // Commit the batch
    if (usersCreated > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: errors.length === 0 || usersCreated > 0,
      message:
        usersCreated > 0
          ? `Successfully created ${usersCreated} users`
          : "No users were created",
      usersCreated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error uploading users:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error processing CSV: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}
