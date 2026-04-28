import { GoogleGenAI } from "@google/genai"

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })

export async function POST(req: Request) {
  const { activities, blockers, tomorrowPlan, date } = await req.json()

  const activitiesText = activities
    .map((act: any) => {
      let text = `${act.activity}`
      if (act.note) text += `: ${act.note}`
      if (act.timeSpent && act.timeSpent > 0) text += ` (${act.timeSpent}h)`
      return text
    })
    .join(", ")

  const totalHours = activities.reduce((sum: number, act: any) => sum + (act.timeSpent || 0), 0)

  const prompt = `You are a helpful assistant that writes professional daily reports for software developers. 
Based on the following activities, create a concise single-paragraph daily report (no bullet points, no lists) that a manager can quickly read and understand.

Total Time: ${totalHours > 0 ? `${totalHours} hours` : "Not specified"}
Activities: ${activitiesText}

${blockers ? `Blockers/Risks: ${blockers}` : ""}
${tomorrowPlan ? `Plan for Tomorrow: ${tomorrowPlan}` : ""}

Write as ONE CONTINUOUS PARAGRAPH - no date, no line breaks, no bullet points, no dashes. Include all activities and be professional and concise. Start directly with the content.`

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 1500,
        temperature: 0.7,
      },
    })

    const text = response.text || ""
    return Response.json({ report: text })
  } catch (error) {
    console.error("Error generating report:", error)
    return Response.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
