import Head from 'next/head'
import NadShoott from '../components/TetrisBoard'

export default function Home() {
  return (
    <>
      <Head>
        <meta
          name="fc:frame"
          content='{
            "version":"vNext",
            "imageUrl":"https://Lure-TetraMON.vercel.app/images/splash.png",
            "button":{"title":"Play"},
            "postUrl":"https://Lure-TetraMON.vercel.app/api/frame"
          }'
        />
        <title>TetraMON</title>
      </Head>
      <Lure />
    </>
  )
}
