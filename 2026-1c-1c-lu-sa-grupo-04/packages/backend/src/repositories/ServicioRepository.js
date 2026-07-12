import express from "express"
import { NotFoundError } from "../errors/errores.js"
import { PracticaModel } from "../models/PracticaModel.js"
import { CatalogoEspecialidadModel} from "../models/CatalogoEspecialidadModel.js"

export class ServicioRepository{

    async obtenerPorId(idServicio){
        const practica = await PracticaModel.findById(idServicio)
        if(!practica){
            const especialidad = await EspecialidadModel.findById(idServicio)
            return especialidad;
            if(!especialidad){
                throw new NotFoundError("No se encontro una practica o especialidad asociada")
            }
        }
        return practica;
    }
}
