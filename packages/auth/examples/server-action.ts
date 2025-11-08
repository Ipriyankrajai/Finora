/**
 * Example Server Actions with authentication
 */

"use server";

import { requireAuth, getCurrentUser } from "@finora/auth/server";
import { revalidatePath } from "next/cache";

// Example 1: Protected server action that requires authentication
export async function updateProfile(formData: FormData) {
  // This will throw an error if the user is not authenticated
  const session = await requireAuth();

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;

  // Update user profile in database
  // await db.user.update({
  //   where: { id: session.user.id },
  //   data: { name, bio },
  // });

  console.log(`Updating profile for ${session.user.id}:`, { name, bio });

  revalidatePath("/profile");

  return { success: true };
}

// Example 2: Server action that uses current user
export async function createPost(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in to create a post" };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Create post in database
  // const post = await db.post.create({
  //   data: {
  //     title,
  //     content,
  //     authorId: user.id,
  //   },
  // });

  console.log(`Creating post for ${user.id}:`, { title, content });

  revalidatePath("/posts");

  return { success: true };
}

// Example 3: Server action with custom error handling
export async function deleteAccount() {
  try {
    const session = await requireAuth();

    // Delete user account
    // await db.user.delete({
    //   where: { id: session.user.id },
    // });

    console.log(`Deleting account for ${session.user.id}`);

    // Sign out the user
    // await serverSignOut();

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { error: "Failed to delete account" };
  }
}

// Example 4: Server action with conditional authentication
export async function likePost(postId: string) {
  const user = await getCurrentUser();

  if (!user) {
    // Allow anonymous likes but don't persist them
    return { success: true, anonymous: true };
  }

  // Persist like for authenticated users
  // await db.like.create({
  //   data: {
  //     postId,
  //     userId: user.id,
  //   },
  // });

  console.log(`User ${user.id} liked post ${postId}`);

  revalidatePath(`/posts/${postId}`);

  return { success: true, anonymous: false };
}

