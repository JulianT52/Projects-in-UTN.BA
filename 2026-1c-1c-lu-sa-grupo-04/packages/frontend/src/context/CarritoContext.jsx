"use client"; 

import { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext(); 

export function CarritoProvider({children}){

    const [turnosPreseleccionados, setTurnosPresseleccionados] = useState([])

    useEffect(() => {
        const carritoGuardado = localStorage.getItem('carritoTurnos');
        if(carritoGuardado){
            setTurnosPresseleccionados(JSON.parse(carritoGuardado));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('carritoTurnos', JSON.stringify(turnosPreseleccionados));
    }, [turnosPreseleccionados]);

    const agregarAlCarrito = (turno) => {
        if(!turnosPreseleccionados.find(t => t._id === turno._id)){
            setTurnosPresseleccionados([... turnosPreseleccionados, turno])
            // iria una alerta no se si de nav o un componente en tipo de alert en caso de exito. 
        } else {
            // iria una alerta no se si de nav o un componente en tipo de alert en caso de que el turno ya esta asignado.
        }
    };

    const eliminarDelCarrito = (idTurno) => {
        setTurnosPresseleccionados(turnosPreseleccionados.filter(t => t._id !== idTurno));
    };

    const limpiarCarrito = () => {
        setTurnosPresseleccionados([]);
    };

    return (
    <CarritoContext.Provider value={{ 
      turnosPreseleccionados, 
      agregarAlCarrito, 
      eliminarDelCarrito,
      limpiarCarrito
    }}>
      {children}
    </CarritoContext.Provider>
  );
}
export const useCarrito = () => useContext(CarritoContext);


