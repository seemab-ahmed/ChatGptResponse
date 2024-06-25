import { NextResponse } from "next/server";
// import openai from "../../../../openAiServices";
import OpenAI from "openai";


export async function GET(request: Request) {
  return NextResponse.json({ message: "success" });
}


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  console.log('am heres');
  
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  const data = await request.json();
  const { prompt } = data;

  try {
    const openaiResponse = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: "hi",
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log(openaiResponse);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder("utf-8");
        const reader = openaiResponse.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Stream completed");
            controller.close();
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(message);
              const responseData = { response: parsed.choices[0].text };
              const writeData = `data: ${JSON.stringify(responseData)}\n\n`;

              controller.enqueue(encoder.encode(writeData));
            } catch (error) {
              console.error("Error parsing chunk:", error);
            }
          }
        }
      },
    });

    return new Response(readableStream, { headers });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
