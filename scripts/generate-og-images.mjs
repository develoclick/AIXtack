import { ImageResponse } from "next/og";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const publicDir = join(import.meta.dirname, "..", "public");

async function toBuffer(response) {
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateOgDefault() {
  const response = new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.35) 0%, rgba(10,10,15,0) 60%)",
          fontFamily: "sans-serif",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 32,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      backgroundImage: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
                      fontSize: 40,
                      fontWeight: 700,
                      color: "#ffffff",
                    },
                    children: "A",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 56,
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                    },
                    children: "AIXtack",
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: 30,
                color: "#c4b5fd",
                textAlign: "center",
                maxWidth: 820,
                lineHeight: 1.4,
              },
              children: "Herramientas, prompts, comparativas y noticias de Inteligencia Artificial en español",
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );

  await writeFile(join(publicDir, "og-default.png"), await toBuffer(response));
  console.log("Generated public/og-default.png");
}

async function generateLogo() {
  const response = new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
          fontFamily: "sans-serif",
        },
        children: {
          type: "div",
          props: {
            style: {
              fontSize: 260,
              fontWeight: 700,
              color: "#ffffff",
            },
            children: "A",
          },
        },
      },
    },
    { width: 512, height: 512 }
  );

  await writeFile(join(publicDir, "logo.png"), await toBuffer(response));
  console.log("Generated public/logo.png");
}

await generateOgDefault();
await generateLogo();
