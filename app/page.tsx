"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Code2, Github } from "lucide-react"
import Link from "next/link"

const features = [
  {
    title: "AI-Powered Reports",
    description: "Generate professional daily reports with AI assistance",
  },
  {
    title: "PIN-Based Login",
    description: "Secure and simple authentication for your team",
  },
  {
    title: "Easy Management",
    description: "Admin dashboard for managing categories and activities",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">Daily Report AI</span>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center space-y-6">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Daily Reporting
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Daily Report
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Assistant
            </span>
          </h1>

          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Generate professional daily reports in seconds. Select activities, add notes, and let AI craft your summary.
          </p>

          <div className="pt-4">
            <Link href="/login">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-8 text-center">
            <Code2 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Built by AI</h2>
            <p className="text-gray-300 mb-4">
              Zero human code — 100% vibe coded with OpenCode + Antigravity Auth
            </p>
            <div className="flex justify-center gap-2 flex-wrap mb-4">
              <Badge className="bg-white/10 text-white border-white/20">
                <Github className="h-3 w-3 mr-1" />
                OpenCode
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20">
                Open Source
              </Badge>
            </div>
            <p className="text-blue-400 font-medium">
              Powered by Google Gemini 3 Flash free tier
            </p>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <p className="text-center text-sm text-gray-500">
            Made with zero human code using OpenCode + Antigravity Auth
          </p>
        </div>
      </footer>
    </div>
  )
}
