import { z } from "zod";

import { cuidInput, hexColorInput, trimmedString } from "./common";

export const createTagInput = z.object({
  name: trimmedString(1, 50),
  color: hexColorInput,
});

export const updateTagInput = z.object({
  id: cuidInput,
  name: trimmedString(1, 50).optional(),
  color: hexColorInput.optional(),
});

export const deleteTagInput = z.object({
  id: cuidInput,
});

export type CreateTagInput = z.infer<typeof createTagInput>;
export type UpdateTagInput = z.infer<typeof updateTagInput>;
export type DeleteTagInput = z.infer<typeof deleteTagInput>;
