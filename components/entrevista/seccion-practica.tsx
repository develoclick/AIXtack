"use client";

import { ChecklistDiaPrevio } from "./checklist-dia-previo";
import { HistoriasStar } from "./historias-star";
import { Pestanas } from "./pestanas";
import { PracticaCronometrada, type PreguntaPractica } from "./practica-cronometrada";
import type { GrupoChecklist } from "@/lib/entrevista/estudio";

export type IdPractica = "practica" | "historias" | "previo";

interface Props {
  pestana: IdPractica;
  alCambiarPestana: (id: IdPractica) => void;
  pregunta: PreguntaPractica | null;
  alCambiarPregunta: (texto: string) => void;
  fuenteCv: string;
  grupos: GrupoChecklist[];
  alTerminarTiempo: () => void;
  alAviso: (texto: string, accion?: { etiqueta: string; alHacer: () => void }) => void;
  alEvento: (nombre: string) => void;
}

/** Herramientas de práctica que no necesitan la IA: cronómetro y grabadora, banco de historias STAR y checklist del día previo. */
export function SeccionPractica({ pestana, alCambiarPestana, pregunta, alCambiarPregunta, fuenteCv, grupos, alTerminarTiempo, alAviso, alEvento }: Props) {
  return (
    <section id="practica" aria-labelledby="titulo-practica" className="tarjeta scroll-mt-24 p-5 sm:p-8">
      <h2 id="titulo-practica" className="text-xl font-semibold leading-tight sm:text-2xl">
        Practica con lo que ya tienes
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Estas herramientas funcionan en tu navegador y no necesitan la IA: cronometra tus respuestas, grábate para escucharte, arma tus historias STAR y repasa la checklist del día previo.</p>
      <div className="mt-5">
        <Pestanas
          etiqueta="Herramientas de práctica"
          prefijo="prac"
          pestanas={[
            { id: "practica", etiqueta: "Práctica cronometrada" },
            { id: "historias", etiqueta: "Mis historias STAR" },
            { id: "previo", etiqueta: "Checklist del día previo" },
          ]}
          valor={pestana}
          alCambiar={alCambiarPestana}
        >
          {pestana === "practica" && <PracticaCronometrada pregunta={pregunta} alCambiarPregunta={alCambiarPregunta} fuenteCv={fuenteCv} alTerminarTiempo={alTerminarTiempo} />}
          {pestana === "historias" && <HistoriasStar fuenteCv={fuenteCv} alAviso={alAviso} alEvento={alEvento} />}
          {pestana === "previo" && <ChecklistDiaPrevio grupos={grupos} />}
        </Pestanas>
      </div>
    </section>
  );
}
