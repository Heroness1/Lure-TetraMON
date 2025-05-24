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
    "fc:frame:post_url": "https://lure-tetra-mon.vercel.app/api/frame",
  },
};

export default function GamePage() {
  return <NadShoott />
}
