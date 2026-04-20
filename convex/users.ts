import { v } from "convex/values";
import { query } from "./_generated/server";

export const viewer = query({
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
