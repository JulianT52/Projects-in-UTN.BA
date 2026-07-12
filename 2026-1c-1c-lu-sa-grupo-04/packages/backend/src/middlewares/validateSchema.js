export default function validateSchema(schemaOrMap, source = 'body') {
  if (schemaOrMap?.safeParse) {
    return (req, res, next) => {
      const result = schemaOrMap.safeParse(req[source])
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: formatValidationError(result.error),
        })
      }
      req.validated = result.data
      next()
    }
  }

  return (req, res, next) => {
    const validated = {}
    for (const [src, schema] of Object.entries(schemaOrMap)) {
      const result = schema.safeParse(req[src])
      if (!result.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: formatValidationError(result.error),
        })
      }
      Object.assign(validated, result.data)
    }
    req.validated = validated
    next()
  }
}

function formatValidationError(error) {
  const issues = error.issues ?? error.errors ?? []
  return issues.map((e) => ({
    path: Array.isArray(e.path) ? e.path.join('.') : String(e.path ?? ''),
    message: e.message,
  }))
}
