export const validateSchema = (schema) => {
    return (req, res, next) => {
        try {
            const dataToValidate = {
                body: req.body,
                params: req.params,
                query: req.query
            }

            const result = schema.safeParse(dataToValidate)

            if (!result.success) {
                const errors = result.error.issues.map((error) => ({
                    path: error.path.join("."),
                    message: error.message,
                    type: error.code
                }))

                return res.status(400).json({
                    error: "Validación fallida",
                    details: errors
                })
            }

            next()
        } catch (error) {
            console.error("Error en validación:", error.message)
            res.status(500).json({
                error: "Error interno en validación"
            })
        }
    }
}

export default validateSchema
