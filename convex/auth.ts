import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import bcrypt from "bcryptjs";

// Internal mutation to create user (called from action)
export const createUser = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash: args.passwordHash,
      createdAt: Date.now(),
    });

    const sessionId = await ctx.db.insert("sessions", {
      userId,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return { userId, sessionId };
  },
});

// Sign up action (uses bcrypt)
export const signUp = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"users">; sessionId: Id<"sessions"> }> => {
    // Validate inputs
    if (!args.email || !args.password || !args.name) {
      throw new Error("All fields are required");
    }

    if (args.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Check if user already exists
    const existingUser = await ctx.runQuery(internal.auth.checkUserExists, {
      email: args.email.toLowerCase(),
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password with bcrypt (allowed in actions)
    const passwordHash = await bcrypt.hash(args.password, 10);

    // Create user via internal mutation
    return await ctx.runMutation(internal.auth.createUser, {
      email: args.email.toLowerCase(),
      name: args.name,
      passwordHash,
    });
  },
});

// Internal query to check if user exists
export const checkUserExists = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return !!user;
  },
});

// Internal mutation to create session
export const createSession = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Delete old sessions for this user
    const oldSessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const session of oldSessions) {
      await ctx.db.delete(session._id);
    }

    // Create new session (30 days)
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return { userId: args.userId, sessionId };
  },
});

// Internal query to get user by email
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Sign in action (uses bcrypt)
export const signIn = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: Id<"users">; sessionId: Id<"sessions"> }> => {
    // Find user
    const user: { _id: Id<"users">; passwordHash: string } | null = await ctx.runQuery(internal.auth.getUserByEmail, {
      email: args.email.toLowerCase(),
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password with bcrypt (allowed in actions)
    const isValid = await bcrypt.compare(args.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Create session via internal mutation
    return await ctx.runMutation(internal.auth.createSession, {
      userId: user._id,
    });
  },
});

// Sign out mutation
export const signOut = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
  },
});

// Get current user from session
export const getCurrentUser = query({
  args: {
    sessionId: v.optional(v.id("sessions")),
  },
  handler: async (ctx, args) => {
    if (!args.sessionId) {
      return null;
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
    };
  },
});
