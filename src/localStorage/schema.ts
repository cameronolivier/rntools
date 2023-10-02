import z from "zod";

export default z.object({
  feature: z.boolean().optional(),
});
