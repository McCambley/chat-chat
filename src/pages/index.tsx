import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <>
      <Head>
        <title>Chat Chat</title>
        <meta name="description" content="Have a sit down chat with ChatGPT" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Chat />
      </main>
    </>
  );
}
