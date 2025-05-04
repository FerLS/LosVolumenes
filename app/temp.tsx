"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { code, Defectica } from "./fonts/fonts";

export default function Temp() {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const countdownDate = new Date("2024-12-25T00:00:00+01:00").getTime();
      const currentDate = new Date().getTime();
      const difference = countdownDate - currentDate;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const esNavidad =
    new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" })
    ).getDate() >= 25;
  return (
    <main className="flex flex-col items-center justify-center h-[100dvh] w-screen bg-black ">
      <div className="bg-white rounded-b-[3rem] w-full grow flex flex-col items-center justify-center outline-4 outline-white outline-offset-8 outline z-10">
        <h1
          className="text-2xl  text-black text-center"
          style={{ fontFamily: Defectica.style.fontFamily }}
        >
          {esNavidad ? (
            <>
              Parece que... <br />
              Esta casi listo
            </>
          ) : (
            <>
              Esto Aun <br />
              no esta listo...
            </>
          )}
        </h1>
        {!esNavidad && (
          <h2
            className="text-xl text-black text-center mt-4"
            style={{ fontFamily: code.style.fontFamily }}
          >
            {countdown}
          </h2>
        )}
      </div>
      {!esNavidad ? (
        <Image src="/bueno.gif" alt="Placeholder" width={400} height={200} />
      ) : (
        <div
          className="bg-black w-full h-[80%] flex items-center justify-center p-10 text-center"
          style={{ fontFamily: code.style.fontFamily }}
        >
          <p>
            Veo que eres impaciente jajaja, la vd me da rabia decirte esto pero
            no me dio tiempo hacerlo justo para la medianoche, de verdad tenia
            ganas pero no he parado &#40;de hecho estoy escribiendo esto a las
            23:30&#41;
            <br />
            <br />
            Esta casicasi hecho por eso me da rabia, me faltarian dos horas y ya
            pero claro es nochebuena.En fin en mi casa se dan los regalos el dia
            de Navidad, asi que mañana ten por seguro que lo tendras, me hace
            ilusion que lo veas.
            <br />
            <br />
            De todas formas, feliz Navidad Monica :&#41;
          </p>
        </div>
      )}
    </main>
  );
}
