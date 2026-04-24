import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  easy: "basic vocabulary, simple grammar (present/past simple, articles, common prepositions), suitable for early high school (A2 CEFR)",
  medium: "intermediate vocabulary, mixed tenses, conditionals, phrasal verbs, reading comprehension snippets (B1-B2 CEFR)",
  hard: "advanced vocabulary, idioms, nuanced grammar (subjunctive, inversion, reported speech), literary analysis (B2-C1 CEFR)",
  endless: "MIXED difficulty — randomly blend easy (A2), medium (B1-B2), and hard (B2-C1) English questions. Vary topics across vocabulary, grammar, idioms, and reading comprehension. Make each question feel fresh and unpredictable.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { level = "easy", count = 5 } = await req.json().catch(() => ({}));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const description = LEVEL_DESCRIPTIONS[level] ?? LEVEL_DESCRIPTIONS.easy;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are an English teacher creating engaging multiple-choice quiz questions for high school students. Always vary question types: vocabulary, grammar, reading comprehension, idioms.",
            },
            {
              role: "user",
              content: `Generate ${count} ${level}-level English questions. Difficulty: ${description}. Each question must have exactly 4 options and one correct answer.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_questions",
                description: "Return the generated quiz questions",
                parameters: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          options: {
                            type: "array",
                            items: { type: "string" },
                            minItems: 4,
                            maxItems: 4,
                          },
                          correctIndex: {
                            type: "integer",
                            minimum: 0,
                            maximum: 3,
                          },
                          explanation: { type: "string" },
                        },
                        required: [
                          "question",
                          "options",
                          "correctIndex",
                          "explanation",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["questions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_questions" },
          },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error", response.status, text);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    const parsed = typeof args === "string" ? JSON.parse(args) : args;

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-questions error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
