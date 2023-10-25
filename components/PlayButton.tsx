import { FaPlay } from "react-icons/fa";

const PlayButton = () => {
  return ( 
    <button
      className="
        transition 
        opacity-0 
        rounded-full 
        flex 
        items-center 
        justify-center 
        bg-cyan-500 
        p-4 
        drop-shadow-md 
        translate
        translate-y-1/4
        group-hover:opacity-100 
        group-hover:translate-y-0
        hover:scale-110
      "
    >
      {/* <i className="icon-play text-[25px] ml-1 text-black" /> */}
      <FaPlay className="text-black" />
    </button>
   );
}
 
export default PlayButton;
