// app/game/page.tsx
import NadShoott from "@/components/TetrisBoard"

export const metadata = {
  title: "TetraMON",
  description: "Play TetraMON in Farcaster",
  openGraph: {
    title: "TetraMON",
    images: ["https://lure-tetra-mon.vercel.app/images/splash.png"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://lure-tetra-mon.vercel.app/images/splash.png",
    "fc:frame:button:1": "Play",
  },  
};  

export default function GamePage() {
  return <NadShoott />
}
