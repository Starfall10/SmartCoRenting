import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// Get user by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ user: null, exists: false });
    }

    return NextResponse.json({ user: userDoc.data(), exists: true });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await adminDb.collection("users").doc(uid).get();

    if (existingUser.exists) {
      return NextResponse.json({
        user: existingUser.data(),
        isNew: false,
      });
    }

    // Create new user
    const newUser = {
      uid,
      email,
      displayName: displayName || "",
      photoURL: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileComplete: false,
      profileStep: 1,
      fullName: "",
      gender: "",
      age: null,
      preferredLocation: "",
      moveInDate: "",
      lengthOfStay: "",
      monthlyBudget: "",
      genderPreference: "",
      propertyType: "",
      lifestyleTags: [],
      constraintTags: [],
      bio: "",
    };

    await adminDb.collection("users").doc(uid).set(newUser);

    return NextResponse.json({ user: newUser, isNew: true });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { uid, ...updateData } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();

    await adminDb.collection("users").doc(uid).update(updateData);

    // Get updated user
    const updatedUser = await adminDb.collection("users").doc(uid).get();

    return NextResponse.json({ user: updatedUser.data(), success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
