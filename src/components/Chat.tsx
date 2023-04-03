import { trace } from "console";
import React, { useState } from "react";

if (typeof window !== "undefined") {
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
}

function Chat({ text }) {
  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState();
  const [prompt, setPrompt] = useState("");

  function startChat() {
    let transcript = "";
    if (!SpeechRecognition) {
      console.log("Speech Recognition is not supported");
      return;
    }

    console.log("");
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.start();

    recognition.addEventListener("result", (e) => {
      transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      console.log({ transcript });
      setPrompt(transcript);

      // if (e.results[0].isFinal) {
      //   sender = !sender;
      //   const now = new Date();

      //   newUtterance = document.createElement("p");
      //   newUtterance.classList.add("utterance");
      //   newUtterance.textContent = "...";
      //   speech.appendChild(newUtterance);

      //   data.textContent = `${sender ? "Sent" : "Received"} at ${now.getHours()}:${now.getMinutes()}`;
      //   data = document.createElement("p");
      //   data.classList.add("data");
      //   speech.appendChild(data);

      //   speech.scrollTop = speech.scrollHeight;
      // }
    });

    recognition.addEventListener("end", () => {
      getResponse(transcript);
      console.log("Speech recognition ended");
    });
  }

  async function getResponse(input) {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setAnimalInput("");
      setPrompt("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    getResponse();
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="chat"
          placeholder="What's on your mind?"
          value={animalInput}
          onChange={(e) => setAnimalInput(e.target.value)}
        />
        <input type="submit" value="Chat" />
        <p>{result}</p>
      </form>
      <button onClick={startChat}>🎙️</button>
      <p>{prompt}</p>
    </>
  );
}

export default Chat;
