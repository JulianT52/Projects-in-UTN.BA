export class Usuario{
    
    constructor(nombreUsuario, password){
        if (!nombreUsuario) throw new Error("El nombre del usuario es obligatorio");
        if (!password) throw new Error("La contraseña del usuario es obligatoria");
        //this.id = "GeneratedRandomString";
        //Me parece que el id lo genera la base de datos?
        this.nombreUsuario = nombreUsuario;
        this.password = password;        
    }
}