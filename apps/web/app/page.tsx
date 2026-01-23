"use client";
import { useEffect, useState } from "react"; 
import client from "../lib/client";

export default function Home() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // This is type-safe. If you change 'json' to 'form' in backend, this errors.
      const res = await client.hello.$post({
        json: { name: "Next.js Developer" },
      });
      const data = await res.json();
      setMsg(data.message);
    };
    fetchData();
  }, []);

  if (!msg) return <p>Loading...</p>;
  return <h1>Backend says: {msg}</h1>;
}