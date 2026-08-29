import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// MOCKS BÁSICOS (Se implementarán en el Módulo 3)
export const getMisChats = query({
  args: {},
  handler: async (ctx, args) => {
    return [];
  }
});
