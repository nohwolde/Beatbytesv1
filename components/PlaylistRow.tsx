import Image from "next/image";
import * as playlistImage from '@/public/images/playlist.jpeg';

interface PlaylistRowProps {
  playlist: any;
  image: string;
  onClick?: () => void;
}

const PlaylistRow: React.FC<PlaylistRowProps> = ({
  playlist, image, onClick
}) => {
  return (
    <div 
      key={playlist.id} 
      onClick={onClick}
      className="
      flex 
      items-center 
      gap-x-3 
      cursor-pointer 
      hover:bg-neutral-800/50 
      w-full 
      p-2 
      rounded-md
      "
    >
      <div 
        className="
          relative 
          rounded-md 
          min-h-[48px] 
          min-w-[48px] 
          overflow-hidden
        "
      >
        <Image
          fill
          src={image? image : playlistImage}
          alt="ArtistItem"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className="text-white truncate">{playlist.name}</p>
        <p className="text-neutral-400 text-sm truncate">
          {playlist.subtitle}
        </p>
      </div>
    </div>
  );
}

export default PlaylistRow;