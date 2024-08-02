import { Figtree } from 'next/font/google'

import getSongsByUserId from '@/actions/getSongsByUserId'
import getActiveProductsWithPrices from '@/actions/getActiveProductsWithPrices'
import Sidebar from '@/components/Sidebar'
import ToasterProvider from '@/providers/ToasterProvider'
import UserProvider from '@/providers/UserProvider'
import ModalProvider from '@/providers/ModalProvider'
import SearchProvider from '@/providers/SearchProvider'
import SupabaseProvider from '@/providers/SupabaseProvider'
import Player from '@/components/Player'
import { useRouter } from 'next/navigation'
import VideoPlayerMemo from '@/components/VideoPlayerMemo'
import VideoPlayerProvider from '@/providers/VideoPlayerProvider';
import './globals.css'
import VideoPlayer from '@/components/VideoPlayer'

const font = Figtree({ subsets: ['latin'] })

export const metadata = {
  title: 'Beatbytes',
  description: 'Music without limits',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const products = await getActiveProductsWithPrices();
  const userSongs = await getSongsByUserId();


  return (
    <html lang="en">
      <head>
        {/* <link
          rel="preload"
          href="/musive-icons.ttf"
          as="font"
          crossOrigin=""
          type="font/ttf"
        /> */}
        <script defer src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"></script>
        
        <script defer src="../node_modules/codem-isoboxer/dist/iso_boxer.min.js"></script>
        <script defer src="../node_modules/lcevc_dec.js/dist/lcevc_dec.min.js"></script>
        <script defer src="../node_modules/material-design-lite/dist/material.min.js"></script>
        <script defer src="../node_modules/dialog-polyfill/dist/dialog-polyfill.js"></script>
        <script defer src="../node_modules/awesomplete/awesomplete.min.js"></script>
        <script defer src="../node_modules/popper.js/dist/umd/popper.min.js"></script>
        <script defer src="../node_modules/tippy.js/umd/index.min.js"></script>
        <script defer src="../node_modules/pwacompat/pwacompat.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/mux.js@5.5.3/dist/mux.min.js">  </script>

        <script src="https://cdn.jsdelivr.net/npm/shaka-player@3.2.2/dist/shaka-player.compiled.js"></script> 

      </head> 
      <body className={font.className}>
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <SearchProvider>
              {/* <VideoPlayerProvider> */}
                <ModalProvider products={products} />
                <div className="flex w-full h-full overflow-y-auto py-0.5">
                  <Sidebar songs={userSongs}>
                    {children}
                  </Sidebar>
                  <Player />
                </div>
            </SearchProvider>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
