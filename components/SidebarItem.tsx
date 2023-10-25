import Link from 'next/link';
import { IconType } from 'react-icons';
import { twMerge } from 'tailwind-merge';
import classnames from 'classnames';

interface SidebarItemProps {
  // icon: IconType;
  label: string;
  active: boolean;
  href: string;
  name: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  // icon: Icon,
  label,
  active,
  href,
  name
}) => {
  const iconName = () => {
    if (!active) {
      return `icon-${name.toLowerCase()} mobile:text-[20px] text-white`;
    } else {
      return `icon-${name.toLowerCase()}_filled mobile:text-[20px]`;
    }
  };

  return ( 
    <Link href={href}>
      <div
        className="group select-none cursor-pointer mt-2 flex flex-row items-center mobile:flex-col tablet:flex-col
      mini-laptop:w-full mini-laptop:mt-6 mobile:mt-0 tablet:mt-0 mobile:mx-8 tablet:mx-10"
      >
        <i
          className={classnames(
            iconName(),
            {
              "opacity-70 group-hover:opacity-100": !active,
            },
            "mr-4 mobile:mr-0 tablet:mr-0 mobile:mb-1 tablet:mb-1"
          )}
        ></i>
        <p className="truncate w-100">{label}</p>
      </div>
    </Link>
    // <Link
    //   href={href} 
    //   className={twMerge(`
    //     flex 
    //     flex-row 
    //     h-auto 
    //     items-center 
    //     w-full 
    //     gap-x-4 
    //     text-md 
    //     font-medium
    //     cursor-pointer
    //     hover:text-white
    //     transition
    //     text-neutral-400
    //     py-1`,
    //     active && "text-white"
    //     )
    //   }
    // >
    //   <Icon size={26} />
    //   <p className="truncate w-100">{label}</p>
    // </Link>
   );
}

export default SidebarItem;