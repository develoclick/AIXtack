"use client";

import { Sparkles, ArrowUpRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { value: "+2000", label: "Prompts profesionales" },
  { value: "+15", label: "Profesiones cubiertas" },
  { value: "3 IAs", label: "ChatGPT · Claude · Gemini" },
];

export function ProfessionHero() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10">

      {/* Background effects */}
      <div className="absolute inset-0 -z-20 bg-mesh-glow" />
      <div className="absolute inset-0 -z-10 bg-grid-fade" />


      {/* Premium glow */}
      <div className="
        absolute 
        left-1/2 
        top-0 
        h-[450px] 
        w-[450px]
        -translate-x-1/2
        rounded-full
        bg-primary/20
        blur-[140px]
      "/>


      <div className="
        mx-auto 
        flex 
        max-w-5xl 
        flex-col 
        items-center 
        px-5 
        py-20 
        text-center
        sm:px-10
        lg:py-28
      ">


        {/* Badge */}

        <motion.div
          initial={{opacity:0,y:15}}
          animate={{opacity:1,y:0}}
          transition={{duration:.5}}
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/10
            bg-white/[0.05]
            px-5
            py-2
            text-sm
            font-medium
            backdrop-blur-xl
          "
        >

          <Sparkles className="size-4 text-brand"/>

          <span>
            Biblioteca profesional de prompts IA
          </span>

        </motion.div>



        {/* Heading */}

        <motion.h1
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{duration:.6,delay:.1}}
          className="
            max-w-4xl
            text-balance
            text-4xl
            font-bold
            leading-[1.05]
            tracking-tight
            sm:text-6xl
            lg:text-7xl
          "
        >

          Los mejores prompts de IA
          <br />

          para{" "}

          <span className="text-gradient-brand">
            potenciar cada profesión
          </span>


        </motion.h1>



        {/* Description */}

        <motion.p
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{duration:.6,delay:.2}}
          className="
            mt-7
            max-w-3xl
            text-lg
            leading-relaxed
            text-muted-foreground
            sm:text-xl
          "
        >
          Accede a prompts especializados para ChatGPT,
          Claude y Gemini creados para profesionales que
          quieren automatizar tareas, ahorrar tiempo y
          trabajar con inteligencia artificial.
        </motion.p>




        {/* CTA */}

        <motion.div
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{duration:.6,delay:.3}}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >

          

        </motion.div>




       

      </div>

    </section>
  );
}