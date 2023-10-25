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

import './globals.css'

const font = Figtree({ subsets: ['latin'] })

export const metadata = {
  title: 'Beatbytes',
  description: 'Music without limits',
}

export const revalidate = 0;

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
        <link
          rel="preload"
          href="/musive-icons.ttf"
          as="font"
          crossOrigin=""
          type="font/ttf"
        />
        <link rel="stylesheet" href="globals.css" />
        <script defer src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"></script>
      </head> 
      <body className={font.className}>
        <ToasterProvider />
        <SupabaseProvider>
          <UserProvider>
            <SearchProvider>
              <ModalProvider products={products} />
              <Sidebar songs={userSongs}>
                {children}
              </Sidebar>
              <Player />
            </SearchProvider>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
