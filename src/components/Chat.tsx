import React, { useEffect, useState } from "react";
import mockData from "../mockData.json";
import initChat from "../initChat.json";
import styles from "@/styles/Home.module.css";
import { BiMicrophone } from "react-icons/bi";
import { GoPrimitiveDot } from "react-icons/go";
import { RiLoader5Fill } from "react-icons/ri";

// @ts-ignore
import { SpeechRecognition } from "web-speech-api";

let BrowserSpeechRecognition: SpeechRecognition;

type SpeechRecognitionState = "inactive" | "listening" | "loading";

if (typeof window !== "undefined") {
  BrowserSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
}

function Chat() {
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
        if (lastItem.sender === "human") {
          prev.pop();
          return [...prev, { sender: "human", text: transcript }];
        } else {
          return [...prev, { sender: "human", text: transcript }];
        }
      });
    });

    recognition.addEventListener("end", () => {
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
        body: JSON.stringify({ input, chatBubbles }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setChatBubbles((prev) => {
        return [...prev, { sender: "robot", text: data.result }];
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
            <p className={bubble.sender === "human" ? styles.human : styles.robot}>{bubble.text}</p>
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
