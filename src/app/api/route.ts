import { NextResponse } from "next/server";
import openai from "../../../openAiServices";

export async function GET(request: Request) {
  return NextResponse.json({ message: 'success' })
}
export async function POST(request: Request, response: Response) {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  const data = await request.json();
  return NextResponse.json({ receivedData: data })
}

// export default function handler(req, res) {
//   console.log("hi");
//   if (req.method === "POST") {
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");

//     const { prompt } = req.body;

//     const response = openai.createCompletion(
//       {
//         model: "text-davinci-003",
//         prompt,
//         max_tokens: 50,
//         temperature: 0.7,
//         stream: true,
//       },
//       { responseType: "stream" }
//     );

//     response.then((resp) => {
//       resp.data.on("data", (data) => {
//         const lines = data
//           .toString()
//           .split("\n")
//           .filter((line) => line.trim() !== "");

//         for (const line of lines) {
//           const message = line.replace(/^data: /, "");
//           if (message === "[DONE]") {
//             res.end();
//             return;
//           }

//           const parsed = JSON.parse(message);

//           const data = { response: parsed.choices[0].text };

//           const writeData = `data: ${JSON.stringify(data)}`;

//           res.write(writeData);
//         }
//       });
//     });

//     req.on("close", () => {
//       res.end();
//     });
//   } else {
//     res.status(405).json({ error: "Method Not Allowed" });
//   }
// }
