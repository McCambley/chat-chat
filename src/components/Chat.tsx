import React, { useEffect, useState } from "react";
import mockData from "../mockData.json";
import initChat from "../initChat.json";
import styles from "@/styles/Home.module.css";
import { BiMicrophone } from "react-icons/bi";
import { GoPrimitiveDot } from "react-icons/go";
import { RiLoader5Fill } from "react-icons/ri";
import transformPunctuation from "@/utils/transformPunctuation";
import transformList from "@/utils/transformList";

// @ts-ignore
import { SpeechRecognition } from "web-speech-api";

let BrowserSpeechRecognition: SpeechRecognition;

type SpeechRecognitionState = "inactive" | "listening" | "loading";

if (typeof window !== "undefined") {
  BrowserSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
}

function Chat() {
  // @ts-ignore
  const [chatBubbles, setChatBubbles] = useState<Bubble[]>(initChat);
  const [speechRecognitionState, setSpeechRecognitionState] = useState<SpeechRecognitionState>("inactive");

  function startChat() {
    setSpeechRecognitionState("listening");
    let transcript = "";
    if (!BrowserSpeechRecognition) {
      console.log("Speech Recognition is not supported");
      return;
    }

    const recognition = new BrowserSpeechRecognition();
    recognition.interimResults = true;
    recognition.start();

    recognition.addEventListener("result", (e: SpeechRecognitionEvent) => {
      transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      setChatBubbles((prev) => {
        const lastItem = prev[prev.length - 1];
        if (lastItem.role === "user") {
          prev.pop();
          return [...prev, { role: "user", content: transcript }];
        } else {
          return [...prev, { role: "user", content: transcript }];
        }
      });
    });

    recognition.addEventListener("end", () => {
      speechSynthesis.cancel();
      setSpeechRecognitionState("loading");
      getResponse(transcript, chatBubbles);
    });
  }

  async function getResponse(input: string, chatBubbles: Bubble[]) {
    if (!input) {
      return setSpeechRecognitionState("inactive");
    }
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: transformPunctuation(input), chatBubbles }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      let text = data.result.message.content;
      console.log(text);

      const toSay = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();

      for (const voice of voices) {
        if (voice.name === "Google UK English Male" || voice.voiceURI === "Google UK English Male") {
          toSay.voice = voice;
          toSay.rate = 1.2;
        }
      }

      speechSynthesis.speak(toSay);

      text = transformList(text);

      setChatBubbles((prev) => {
        return [...prev, { role: "assistant", content: text }];
      });

      setSpeechRecognitionState("inactive");
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        alert(error.message);
      } else {
        console.error("Unknown error occurred:", error);
        alert(JSON.stringify(error));
      }
    }
  }

  return (
    <section className={styles.chat}>
      {chatBubbles.map((bubble, index: number) => {
        return (
          <div className={styles.row} key={index}>
            <p className={bubble.role === "user" ? styles.human : styles.robot}>{bubble.content}</p>
          </div>
        );
      })}
      <div className={styles.footer}>
        <button className={styles.footer_button} onClick={startChat}>
          {speechRecognitionState === "inactive" && <BiMicrophone />}
          {speechRecognitionState === "listening" && <GoPrimitiveDot className={styles.dot} />}
          {speechRecognitionState === "loading" && <RiLoader5Fill className={styles.loader} />}{" "}
        </button>
      </div>
    </section>
  );
}

export default Chat;
