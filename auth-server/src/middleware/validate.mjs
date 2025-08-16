// src/middleware/validate.mjs
export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Input non valido', details: parsed.error.issues });
    }
    req.body = parsed.data;
    next();
  };
}