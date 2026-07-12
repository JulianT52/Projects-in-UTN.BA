import { Gig } from "../domain/gig.js"
import { Categoria } from "../domain/categoria.js"
import { Usuario } from "../domain/usuario.js"

export class GigRepository {
    constructor() {
        this.gigs = new Map()
        this.idCounter = 1
    }

    crear(gig) {
        const id = this.idCounter++
        gig.id = id
        this.gigs.set(id, gig)
        return gig
    }

    obtenerTodos() {
        return Array.from(this.gigs.values())
    }

    obtenerPorId(id) {
        return this.gigs.get(Number(id)) || null
    }

    obtenerPorCategoria(categoriaId) {
        return this.obtenerTodos().filter(
            (gig) => Number(gig.categoria?.id) === Number(categoriaId)
        )
    }

    buscarPorTexto(termino) {
        const texto = termino.trim().toLowerCase()
        if (!texto) return []

        return this.obtenerTodos().filter((gig) => {
            const contenido = [
                gig.nombre,
                gig.descripcion,
                gig.categoria?.nombre,
                gig.categoria?.descripcion
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()

            return contenido.includes(texto)
        })
    }

    obtenerPorCriterios({ termino, categoriaId }) {
        let resultados = this.obtenerTodos()

        if (categoriaId !== undefined && categoriaId !== null) {
            resultados = resultados.filter(
                (gig) => Number(gig.categoria?.id) === Number(categoriaId)
            )
        }

        if (termino && termino.trim() !== "") {
            const texto = termino.trim().toLowerCase()
            resultados = resultados
                .map((gig) => {
                    const contenido = [
                        gig.nombre,
                        gig.descripcion,
                        gig.categoria?.nombre,
                        gig.categoria?.descripcion
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase()

                    let score = 0
                    if (contenido.includes(texto)) score += 1
                    if (gig.nombre.toLowerCase().startsWith(texto)) score += 3
                    if (gig.categoria?.nombre?.toLowerCase().includes(texto)) score += 2

                    return { gig, score }
                })
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .map((item) => item.gig)
        }

        return resultados
    }

    agregarOpinion(gigId, opinion) {
        const gig = this.obtenerPorId(gigId)
        if (!gig) return null

        gig.opiniones = gig.opiniones || []
        gig.opiniones.push(opinion)
        return gig
    }
}

export const gigRepository = new GigRepository()

