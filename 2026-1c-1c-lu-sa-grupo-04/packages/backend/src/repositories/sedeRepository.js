import { SedeModel } from "../models/SedeModel.js";

export class SedeRepository {
    async guardar(sedeData) {
        const nuevaSede = new SedeModel(sedeData);
        return await nuevaSede.save();
    }

    async obtenerTodas() {
        return await SedeModel.find();
    }
}