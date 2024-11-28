import Image from "next/image";
import background from "../../public/home_bg.png";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute top-10 left-0 w-full h-full inset-0 z-0">
        <Image
          src={background}
          alt="Background Image"
          layout="fill" 
          objectFit="cover" 
          objectPosition="center"
        />
      </div>
      <div className="absolute w-full min-h-screen flex flex-col justify-center items-center text-black p-8 z-30">
        <h1 className="text-6xl font-bold text-start ">Hop in, <span className="block">Morris!</span></h1>
        <p className="text-2xl mt-6 text-center">Join the ride - help grow a tree, one leaf at a time!</p>
        <div className="mt-28">
        <p className="text-2xl">Pick your role</p>
        </div>
        <div className="flex gap-9 mt-6">
          <button className="px-5 py-1 rounded-xl bg-black text-white md:w-60">Driver</button>
          <button className="px-2 py-1 rounded-xl text-black ring-1 ring-black md:w-60">Passenger</button>
        </div>

        
      </div>
    </div>
  );
}