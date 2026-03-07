import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * DELETE /api/admin/delete-personas
 * Delete all users with IDs starting with "persona_"
 */
export async function DELETE() {
  try {
    // Get all users with IDs starting with "persona_"
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.get();

    const personaIds: string[] = [];
    snapshot.forEach((doc) => {
      if (doc.id.startsWith("persona_")) {
        personaIds.push(doc.id);
      }
    });

    if (personaIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No persona users found to delete",
        deletedCount: 0,
      });
    }

    // Delete in batches of 500 (Firestore limit)
    const batchSize = 500;
    let deletedCount = 0;

    for (let i = 0; i < personaIds.length; i += batchSize) {
      const batch = adminDb.batch();
      const batchIds = personaIds.slice(i, i + batchSize);

      for (const personaId of batchIds) {
        // Delete user document
        batch.delete(usersRef.doc(personaId));

        // Also delete any match results associated with this persona
        const matchResultsRef = adminDb
          .collection("matches")
          .doc(personaId)
          .collection("results");
        const matchResults = await matchResultsRef.get();
        matchResults.forEach((matchDoc) => {
          batch.delete(matchDoc.ref);
        });
      }

      await batch.commit();
      deletedCount += batchIds.length;
    }

    // Also clean up any cached matches that reference deleted personas
    const allMatchesSnapshot = await adminDb.collection("matches").get();
    for (const matchDoc of allMatchesSnapshot.docs) {
      if (!matchDoc.id.startsWith("persona_")) {
        // This is a real user - clean up their cached results that reference personas
        const resultsRef = matchDoc.ref.collection("results");
        const resultsSnapshot = await resultsRef.get();

        const cleanupBatch = adminDb.batch();
        let hasDeletes = false;

        resultsSnapshot.forEach((resultDoc) => {
          if (resultDoc.id.startsWith("persona_")) {
            cleanupBatch.delete(resultDoc.ref);
            hasDeletes = true;
          }
        });

        if (hasDeletes) {
          await cleanupBatch.commit();
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} persona users`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error deleting personas:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error deleting personas: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}
