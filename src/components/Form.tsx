"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"


import OpenAI from "openai";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const ChatgptForm = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
}

main();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const callChatGPT = async (title: string) => {
    const apiKey = "";
    const endpoint = "https://api.openai.com/v1/completions";

    const prompt = `Title: ${title}`;

    try {
      const result = await axios.post(
        endpoint,
        {
          model: "gpt-3.5-turbo",
          prompt: prompt,
          max_tokens: 100,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      console.log(result , '');

      return result.data.choices[0].text.trim();
    } catch (error) {
      throw new Error("Failed to fetch response from ChatGPT.");
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    setResponse(null);
  
    try {
      if (data.description) {
        setResponse(data.description);
      } else {
        const apiResponse = await callChatGPT(data.title);
        setResponse(apiResponse);
        form.setValue("description", apiResponse);
      }
    } catch (error) {
      setError("Failed to fetch response from ChatGPT.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-[600px] p-10"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-[18px]">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Job Title"
                  {...field}
                  className="border border-gray-300 p-4 w-full rounded-md text-[16px]"
                />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel className="text-[18px]">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=""
                  {...field}
                  className="border border-gray-300 p-4 w-full rounded-md text-[16px]"
                  rows={4}
                  style={{ resize: "none" }}
                  value={field.value}
                />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-[#0b0b33] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Generating..." : "ChatGPT"}
        </Button>
        {error && (
          <div className="mt-4 p-4 border border-red-300 bg-red-100 rounded-md">
            <p className="text-[16px] text-red-700">{error}</p>
          </div>
        )}
      </form>
    </Form>
  );
};

export default ChatgptForm;
