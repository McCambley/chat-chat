import React, { useState } from "react";

function Chat({ text }) {
  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ animal: animalInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setAnimalInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }
  return (
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
  );
}

export default Chat;
